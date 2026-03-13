import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ── Angle detection from Birkenstock CDN URL patterns ──────────────────
const ANGLE_PATTERNS: [RegExp, string][] = [
  [/_top\./i,           'top-down'],
  [/_side\./i,          'side'],
  [/_sole\./i,          'sole'],
  [/_pair\./i,          'pair'],
  [/_detail\./i,        'detail'],
  [/_f_look_f\./i,      'lifestyle'],
  [/_f_closeup_f\./i,   'close-up'],
  [/_back\./i,          'back'],
];

function detectAngle(url: string): string {
  const filename = url.split('/').pop()?.split('?')[0] || '';
  for (const [pattern, angle] of ANGLE_PATTERNS) {
    if (pattern.test(filename)) return angle;
  }
  return 'hero';
}

// ── Deterministic external_id from product + color ─────────────────────
function makeExternalId(productName: string, color: string): string {
  return `${productName}::${color}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function makeSkuCode(productName: string, color: string): string {
  const model = productName.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  const col = color.split(' ').slice(0, 2).join('-').toUpperCase().replace(/[^A-Z0-9-]/g, '');
  return `BIRK-${model}-${col}`.slice(0, 40);
}

// ── Download image with retry ──────────────────────────────────────────
async function downloadImage(url: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const resp = await fetch(url);
      if (!resp.ok) { await resp.text(); continue; }
      const data = await resp.arrayBuffer();
      const contentType = resp.headers.get('content-type') || 'image/jpeg';
      return { data, contentType };
    } catch (e) {
      console.warn(`Download attempt ${attempt + 1} failed for ${url}: ${e}`);
    }
  }
  return null;
}

// ── Deduplicate images: keep only highest-res version per angle ────────
function deduplicateByAngle(imageUrls: string[]): { url: string; angle: string }[] {
  const byAngle = new Map<string, string>();
  for (const url of imageUrls) {
    const angle = detectAngle(url);
    const existing = byAngle.get(angle);
    if (!existing) {
      byAngle.set(angle, url);
    } else {
      // Prefer URLs with ?sw= (high-res) over bare URLs
      const hasParams = url.includes('?sw=');
      const existingHasParams = existing.includes('?sw=');
      if (hasParams && !existingHasParams) {
        byAngle.set(angle, url);
      }
    }
  }
  return Array.from(byAngle.entries()).map(([angle, url]) => ({ url, angle }));
}

// ── Process one product ────────────────────────────────────────────────
interface ProductInput {
  model: string;
  productName: string;
  color: string;
  title?: string;
  sourceUrl?: string;
  imageUrls: string[];
  extractedAt?: string;
}

interface ProcessResult {
  productName: string;
  color: string;
  skuId: string;
  imagesUploaded: number;
  imagesSkipped: number;
  errors: string[];
}

async function processProduct(
  product: ProductInput,
  userId: string,
  brandId: string,
  supabase: ReturnType<typeof createClient>,
): Promise<ProcessResult> {
  const externalId = makeExternalId(product.productName, product.color);
  const skuCode = makeSkuCode(product.productName, product.color);
  const fullName = `${product.productName} — ${product.color}`;
  const result: ProcessResult = {
    productName: product.productName,
    color: product.color,
    skuId: '',
    imagesUploaded: 0,
    imagesSkipped: 0,
    errors: [],
  };

  try {
    // 1. Upsert product_skus
    const { data: skuData, error: skuError } = await supabase
      .from('product_skus')
      .upsert(
        {
          user_id: userId,
          brand_id: brandId,
          name: fullName,
          sku_code: skuCode,
          category: 'sandal',
          description: {
            model: product.model,
            productName: product.productName,
            color: product.color,
            sourceUrl: product.sourceUrl || null,
            title: product.title || null,
            extractedAt: product.extractedAt || null,
          },
        },
        { onConflict: 'sku_code', ignoreDuplicates: false }
      )
      .select('id')
      .single();

    if (skuError) {
      // sku_code might not have a unique constraint yet — try insert then select
      const { data: existingSku } = await supabase
        .from('product_skus')
        .select('id')
        .eq('user_id', userId)
        .eq('sku_code', skuCode)
        .maybeSingle();

      if (existingSku) {
        result.skuId = existingSku.id;
        // Update metadata
        await supabase.from('product_skus').update({
          name: fullName,
          brand_id: brandId,
          description: {
            model: product.model,
            productName: product.productName,
            color: product.color,
            sourceUrl: product.sourceUrl || null,
            title: product.title || null,
            extractedAt: product.extractedAt || null,
          },
        }).eq('id', existingSku.id);
      } else {
        // Fresh insert
        const { data: newSku, error: insertErr } = await supabase
          .from('product_skus')
          .insert({
            user_id: userId,
            brand_id: brandId,
            name: fullName,
            sku_code: skuCode,
            category: 'sandal',
            description: {
              model: product.model,
              productName: product.productName,
              color: product.color,
              sourceUrl: product.sourceUrl || null,
              title: product.title || null,
              extractedAt: product.extractedAt || null,
            },
          })
          .select('id')
          .single();

        if (insertErr || !newSku) {
          result.errors.push(`SKU creation failed: ${insertErr?.message}`);
          return result;
        }
        result.skuId = newSku.id;
      }
    } else {
      result.skuId = skuData.id;
    }

    // 2. Deduplicate images by angle
    const images = deduplicateByAngle(product.imageUrls);
    console.log(`  ${fullName}: ${images.length} unique angles from ${product.imageUrls.length} URLs`);

    // 3. Process images (parallel batch of 5)
    const BATCH_SIZE = 5;
    for (let i = 0; i < images.length; i += BATCH_SIZE) {
      const batch = images.slice(i, i + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map(async (img) => {
          const imgExternalId = `${externalId}::${img.angle}`;

          // Check if already exists
          const { data: existing } = await supabase
            .from('scraped_products')
            .select('id')
            .eq('external_id', imgExternalId)
            .eq('user_id', userId)
            .maybeSingle();

          if (existing) {
            result.imagesSkipped++;
            return;
          }

          // Download
          const downloaded = await downloadImage(img.url);
          if (!downloaded) {
            result.errors.push(`Failed to download ${img.angle}: ${img.url.slice(-60)}`);
            return;
          }

          // Upload to storage
          const ext = downloaded.contentType.includes('png') ? 'png' : 'jpg';
          const storagePath = `${userId}/${result.skuId}/${img.angle}.${ext}`;

          const { error: uploadErr } = await supabase.storage
            .from('product-images')
            .upload(storagePath, downloaded.data, {
              contentType: downloaded.contentType,
              upsert: true,
            });

          if (uploadErr) {
            result.errors.push(`Upload failed ${img.angle}: ${uploadErr.message}`);
            return;
          }

          // Get public URL
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(storagePath);

          // Insert scraped_products row
          const { error: insertErr } = await supabase
            .from('scraped_products')
            .insert({
              user_id: userId,
              brand_id: brandId,
              sku_id: result.skuId,
              external_id: imgExternalId,
              name: fullName,
              thumbnail_url: urlData.publicUrl,
              full_url: urlData.publicUrl,
              storage_path: storagePath,
              angle: img.angle,
              category: 'sandal',
              collection: product.model,
              description: {
                originalUrl: img.url,
                angle: img.angle,
                color: product.color,
              },
            });

          if (insertErr) {
            result.errors.push(`DB insert ${img.angle}: ${insertErr.message}`);
            return;
          }

          result.imagesUploaded++;
        })
      );

      // Log any rejected promises
      for (const r of results) {
        if (r.status === 'rejected') {
          result.errors.push(`Batch error: ${r.reason}`);
        }
      }
    }

    // 4. Set first image as composite thumbnail if none exists
    if (result.imagesUploaded > 0) {
      const { data: firstImg } = await supabase
        .from('scraped_products')
        .select('full_url')
        .eq('sku_id', result.skuId)
        .eq('angle', 'hero')
        .maybeSingle();

      if (firstImg) {
        await supabase
          .from('product_skus')
          .update({ composite_image_url: firstImg.full_url })
          .eq('id', result.skuId);
      }
    }
  } catch (e) {
    result.errors.push(`Unexpected: ${e instanceof Error ? e.message : String(e)}`);
  }

  return result;
}

// ── Main handler ───────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { apiKey, brandId, products } = body;

    if (!apiKey || !brandId || !products || !Array.isArray(products)) {
      return new Response(
        JSON.stringify({ error: 'Required: apiKey, brandId, products[]' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (products.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Max 20 products per batch. Send multiple requests.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate user from apiKey (JWT)
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

    // Use service role for storage + DB operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify brand belongs to user
    const { data: brand, error: brandErr } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brandId)
      .eq('user_id', userId)
      .maybeSingle();

    if (brandErr || !brand) {
      return new Response(
        JSON.stringify({ error: 'Brand not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[BULK-IMPORT] User ${userId}, brand ${brandId}, ${products.length} products`);

    // Process products sequentially
    const results: ProcessResult[] = [];
    for (const product of products) {
      const r = await processProduct(product, userId, brandId, supabase);
      results.push(r);
      console.log(`  ✓ ${r.productName} — ${r.color}: ${r.imagesUploaded} uploaded, ${r.imagesSkipped} skipped, ${r.errors.length} errors`);
    }

    const totalUploaded = results.reduce((sum, r) => sum + r.imagesUploaded, 0);
    const totalSkipped = results.reduce((sum, r) => sum + r.imagesSkipped, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    const storageBase = `${supabaseUrl}/storage/v1/object/public/product-images`;

    return new Response(
      JSON.stringify({
        success: true,
        storageBase,
        pathPattern: '{user_id}/{sku_id}/{angle}.{ext}',
        summary: {
          productsProcessed: products.length,
          imagesUploaded: totalUploaded,
          imagesSkipped: totalSkipped,
          errors: totalErrors,
        },
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[BULK-IMPORT] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
