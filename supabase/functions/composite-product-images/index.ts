import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const app = new Hono();

// Handle CORS preflight
app.options('*', (c) => new Response('ok', { headers: corsHeaders }));

app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { skuId, imageUrls, layout = '2x2' } = body;

    if (!skuId || !imageUrls || imageUrls.length < 2) {
      return c.json(
        { error: 'skuId and at least 2 imageUrls are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Get auth token
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      return c.json(
        { error: 'Authorization required' },
        { status: 401, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user owns this SKU
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return c.json(
        { error: 'Invalid authorization' },
        { status: 401, headers: corsHeaders }
      );
    }

    const { data: sku, error: skuError } = await supabase
      .from('product_skus')
      .select('id, user_id')
      .eq('id', skuId)
      .single();

    if (skuError || !sku || sku.user_id !== user.id) {
      return c.json(
        { error: 'SKU not found or unauthorized' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Fetch all images and convert to base64
    console.log(`Fetching ${imageUrls.length} images for composite...`);
    const imageDataList: ArrayBuffer[] = [];
    
    for (const url of imageUrls.slice(0, 4)) {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch image: ${url}`);
        continue;
      }
      const data = await response.arrayBuffer();
      imageDataList.push(data);
    }

    if (imageDataList.length < 2) {
      return c.json(
        { error: 'Could not fetch enough valid images' },
        { status: 400, headers: corsHeaders }
      );
    }

    // For now, we'll create a simple composite by just using the first image
    // A full implementation would use canvas/sharp to stitch images together
    // This is a placeholder that can be enhanced later
    
    // TODO: Implement actual image stitching with canvas API
    // For now, just copy the first image as the "composite"
    
    const compositeData = imageDataList[0];
    const compositeFileName = `${skuId}/composite.jpg`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(compositeFileName, compositeData, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json(
        { error: 'Failed to upload composite image' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(compositeFileName);

    // Update SKU with composite URL
    const { error: updateError } = await supabase
      .from('product_skus')
      .update({ composite_image_url: urlData.publicUrl })
      .eq('id', skuId);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    console.log(`Created composite for SKU ${skuId}: ${urlData.publicUrl}`);

    return c.json(
      { 
        compositeUrl: urlData.publicUrl,
        imageCount: imageDataList.length,
        layout,
      },
      { headers: corsHeaders }
    );

  } catch (error: unknown) {
    console.error('Error in composite-product-images:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return c.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
});

Deno.serve(app.fetch);
