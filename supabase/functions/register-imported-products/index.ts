import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function makeSkuCode(productName: string, color: string): string {
  const model = productName.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const col = color.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return `BIRK-${model}-${col}`.slice(0, 40);
}

function makeExternalId(productName: string, color: string, angle: string): string {
  return `${productName}::${color}::${angle}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

interface ManifestProduct {
  model: string;
  productName: string;
  color: string;
  sourceUrl?: string;
  title?: string;
  images: { path: string; angle: string }[];
}

interface Manifest {
  brandId: string;
  products: ManifestProduct[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { batchId, manifestPath, apiKey } = body;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'apiKey required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!batchId && !manifestPath) {
      return new Response(
        JSON.stringify({ error: 'batchId or manifestPath required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate user from apiKey
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${apiKey}` } },
    });
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(apiKey);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key / JWT' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const userId = claimsData.claims.sub as string;

    // Service role client for DB + storage
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Resolve manifest path
    const mPath = manifestPath || `imports/${batchId}/manifest.json`;

    // Download manifest from storage
    const { data: manifestFile, error: downloadErr } = await supabase.storage
      .from('product-images')
      .download(mPath);

    if (downloadErr || !manifestFile) {
      return new Response(
        JSON.stringify({ error: `Could not read manifest at ${mPath}: ${downloadErr?.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const manifest: Manifest = JSON.parse(await manifestFile.text());

    if (!manifest.brandId || !manifest.products?.length) {
      return new Response(
        JSON.stringify({ error: 'Manifest must contain brandId and products[]' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify brand belongs to user
    const { data: brand } = await supabase
      .from('brands')
      .select('id')
      .eq('id', manifest.brandId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!brand) {
      return new Response(
        JSON.stringify({ error: 'Brand not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const basePath = batchId ? `imports/${batchId}` : mPath.replace(/\/manifest\.json$/, '');
    const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/product-images`;

    console.log(`[REGISTER] User ${userId}, brand ${manifest.brandId}, ${manifest.products.length} products, base: ${basePath}`);

    const results: { productName: string; color: string; skuId: string; images: number; errors: string[] }[] = [];

    for (const product of manifest.products) {
      const skuCode = makeSkuCode(product.productName, product.color);
      const fullName = `${product.productName} — ${product.color}`;
      const entry = { productName: product.productName, color: product.color, skuId: '', images: 0, errors: [] as string[] };

      try {
        // Upsert SKU
        let skuId: string | null = null;

        const { data: existingSku } = await supabase
          .from('product_skus')
          .select('id')
          .eq('user_id', userId)
          .eq('sku_code', skuCode)
          .maybeSingle();

        if (existingSku) {
          skuId = existingSku.id;
          await supabase.from('product_skus').update({
            name: fullName,
            brand_id: manifest.brandId,
            description: {
              model: product.model,
              productName: product.productName,
              color: product.color,
              sourceUrl: product.sourceUrl || null,
              title: product.title || null,
            },
          }).eq('id', skuId);
        } else {
          const { data: newSku, error: insertErr } = await supabase
            .from('product_skus')
            .insert({
              user_id: userId,
              brand_id: manifest.brandId,
              name: fullName,
              sku_code: skuCode,
              category: 'sandal',
              description: {
                model: product.model,
                productName: product.productName,
                color: product.color,
                sourceUrl: product.sourceUrl || null,
                title: product.title || null,
              },
            })
            .select('id')
            .single();

          if (insertErr || !newSku) {
            entry.errors.push(`SKU insert failed: ${insertErr?.message}`);
            results.push(entry);
            continue;
          }
          skuId = newSku.id;
        }

        entry.skuId = skuId!;

        // Register each image
        for (const img of product.images) {
          const externalId = makeExternalId(product.productName, product.color, img.angle);
          const storagePath = `${basePath}/${img.path}`;
          const publicUrl = `${storageBaseUrl}/${storagePath}`;

          // Check if already registered
          const { data: existing } = await supabase
            .from('scraped_products')
            .select('id')
            .eq('external_id', externalId)
            .eq('user_id', userId)
            .maybeSingle();

          if (existing) {
            continue; // already registered, skip
          }

          const { error: insertErr } = await supabase
            .from('scraped_products')
            .insert({
              user_id: userId,
              brand_id: manifest.brandId,
              sku_id: skuId,
              external_id: externalId,
              name: fullName,
              thumbnail_url: publicUrl,
              full_url: publicUrl,
              storage_path: storagePath,
              angle: img.angle,
              category: 'sandal',
              collection: product.model,
              description: {
                color: product.color,
                angle: img.angle,
                sourceUrl: product.sourceUrl || null,
              },
            });

          if (insertErr) {
            entry.errors.push(`Image ${img.angle}: ${insertErr.message}`);
          } else {
            entry.images++;
          }
        }

        // Set hero as composite thumbnail
        if (entry.images > 0) {
          const heroImg = product.images.find(i => i.angle === 'hero');
          if (heroImg) {
            const heroUrl = `${storageBaseUrl}/${basePath}/${heroImg.path}`;
            await supabase.from('product_skus').update({ composite_image_url: heroUrl }).eq('id', skuId);
          }
        }
      } catch (e) {
        entry.errors.push(`Unexpected: ${e instanceof Error ? e.message : String(e)}`);
      }

      results.push(entry);
      console.log(`  ✓ ${fullName}: ${entry.images} registered, ${entry.errors.length} errors`);
    }

    const totalImages = results.reduce((s, r) => s + r.images, 0);
    const totalErrors = results.reduce((s, r) => s + r.errors.length, 0);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          productsProcessed: manifest.products.length,
          imagesRegistered: totalImages,
          errors: totalErrors,
        },
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
