import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

interface BatchSummary {
  batchId: string;
  brandId: string;
  products: {
    productName: string;
    color: string;
    model: string;
    imageCount: number;
    heroUrl: string | null;
    alreadyRegistered: boolean;
  }[];
  totalImages: number;
  newProducts: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: require user JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate JWT
    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsErr } = await authClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userId = claimsData.claims.sub as string;

    const supabase = createClient(supabaseUrl, serviceKey);
    const storageBaseUrl = `${supabaseUrl}/storage/v1/object/public/product-images`;

    // List folders under imports/
    const { data: folders, error: listErr } = await supabase.storage
      .from('product-images')
      .list('imports', { limit: 100, sortBy: { column: 'name', order: 'desc' } });

    if (listErr) {
      return new Response(JSON.stringify({ error: `Storage list failed: ${listErr.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter to folders only (no metadata means it's a folder in Supabase storage)
    const batchFolders = (folders || []).filter(f => f.id === null || f.metadata === null);

    // Get already-registered storage paths for this user
    const { data: registeredProducts } = await supabase
      .from('scraped_products')
      .select('storage_path')
      .eq('user_id', userId)
      .not('storage_path', 'is', null);

    const registeredPaths = new Set((registeredProducts || []).map(r => r.storage_path));

    const batches: BatchSummary[] = [];

    for (const folder of batchFolders) {
      const batchId = folder.name;
      const manifestPath = `imports/${batchId}/manifest.json`;

      // Download manifest
      const { data: manifestFile, error: dlErr } = await supabase.storage
        .from('product-images')
        .download(manifestPath);

      if (dlErr || !manifestFile) {
        console.log(`Skipping ${batchId}: no manifest`);
        continue;
      }

      let manifest: Manifest;
      try {
        manifest = JSON.parse(await manifestFile.text());
      } catch {
        console.log(`Skipping ${batchId}: invalid manifest JSON`);
        continue;
      }

      if (!manifest.products?.length) continue;

      // Check which products are already registered
      const products = manifest.products.map(p => {
        const heroImg = p.images.find(i => i.angle === 'hero') || p.images[0];
        const heroPath = heroImg ? `imports/${batchId}/${heroImg.path}` : null;
        const heroUrl = heroPath ? `${storageBaseUrl}/${heroPath}` : null;

        // Check if ANY image from this product is already registered
        const alreadyRegistered = p.images.some(img => 
          registeredPaths.has(`imports/${batchId}/${img.path}`)
        );

        return {
          productName: p.productName,
          color: p.color,
          model: p.model,
          imageCount: p.images.length,
          heroUrl,
          alreadyRegistered,
        };
      });

      batches.push({
        batchId,
        brandId: manifest.brandId,
        products,
        totalImages: manifest.products.reduce((s, p) => s + p.images.length, 0),
        newProducts: products.filter(p => !p.alreadyRegistered).length,
      });
    }

    return new Response(JSON.stringify({ batches }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[LIST-BATCHES] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Internal error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
