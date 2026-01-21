const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  name: string;
  imageUrl: string;
  category: string;
  color?: string;
  collection?: string;
}

interface FirecrawlResponse {
  success: boolean;
  data?: {
    extract?: {
      products?: ScrapedProduct[];
    };
  };
  error?: string;
}

// Validate that an image URL actually returns a valid image
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // Try HEAD first (faster), fall back to GET if HEAD isn't supported
    let response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
      },
    });
    
    // Some CDNs don't support HEAD, try GET with a range header
    if (!response.ok && response.status === 405) {
      response = await fetch(url, { 
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageValidator/1.0)',
          'Range': 'bytes=0-1023', // Only fetch first 1KB to verify
        },
      });
    }
    
    if (!response.ok) {
      console.log(`Image validation failed (${response.status}):`, url);
      return false;
    }
    
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.log(`Not an image (${contentType}):`, url);
      return false;
    }
    
    return true;
  } catch (error) {
    console.log(`Image validation error:`, url, error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    const targetUrl = url || 'https://www.bandolierstyle.com/collections/all';

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Scraping products from:', targetUrl);

    // Use Firecrawl's JSON extraction with LLM to get clean product data
    const productSchema = {
      type: "object",
      properties: {
        products: {
          type: "array",
          description: "List of actual product items for sale. DO NOT include logos, icons, banners, or non-product images.",
          items: {
            type: "object",
            properties: {
              name: { 
                type: "string", 
                description: "Clean product name without dimensions or codes (e.g., 'Hailey Crossbody', 'Lily Phone Case', 'Donna Strap')" 
              },
              imageUrl: { 
                type: "string", 
                description: "Main product image URL from Shopify CDN (cdn.shopify.com). Must be an actual product photo." 
              },
              category: { 
                type: "string", 
                enum: ["phone-case", "crossbody", "strap", "wallet", "bag", "accessory"],
                description: "Product category based on the type of item" 
              },
              color: { 
                type: "string", 
                description: "Product color and/or material finish (e.g., 'Black Gold', 'Cognac Chrome', 'Zebra Print')" 
              },
              collection: { 
                type: "string", 
                description: "Collection name if shown (e.g., 'New Arrivals', 'Best Sellers', 'iPhone 16')" 
              }
            },
            required: ["name", "imageUrl", "category"]
          }
        }
      },
      required: ["products"]
    };

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        formats: ['extract'],
        extract: {
          schema: productSchema,
          prompt: `Extract up to 50 actual product items from this e-commerce page. 
          
IMPORTANT RULES:
- Only extract real products for sale (phone cases, crossbody bags, straps, wallets, accessories)
- DO NOT include: logos, icons, banners, promotional graphics, Adobe files, or any non-product images
- Product image URLs must be from cdn.shopify.com and show actual product photos
- Clean up product names: remove file codes, dimensions, dates (e.g., "Hailey Big D Ring Gold 17 20250811 003" should become "Hailey D-Ring - Gold")
- Combine product name with color/finish in a clean format like "Product Name - Color"
- Assign accurate categories based on what the product actually is
- Skip duplicates - if same product appears in multiple colors, each color is a separate product`
        },
        waitFor: 5000,
      }),
    });

    const data: FirecrawlResponse = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || 'Failed to scrape products' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const extractedProducts = data.data?.extract?.products || [];
    console.log(`Firecrawl extracted ${extractedProducts.length} products`);

    // First pass: filter out obvious non-products
    const preFilteredProducts = extractedProducts
      .filter((product: ScrapedProduct) => {
        // Must have valid Shopify CDN image URL
        if (!product.imageUrl?.includes('cdn.shopify.com')) {
          console.log('Skipping non-Shopify image:', product.name);
          return false;
        }
        // Must have a meaningful name
        if (!product.name || product.name.length < 3) {
          console.log('Skipping product with invalid name:', product.name);
          return false;
        }
        // Skip obvious non-products
        const skipPatterns = ['logo', 'icon', 'banner', 'adobe', 'express', 'file'];
        if (skipPatterns.some(p => product.name.toLowerCase().includes(p))) {
          console.log('Skipping non-product:', product.name);
          return false;
        }
        return true;
      })
      .slice(0, 50); // Limit to 50 products

    console.log(`Pre-filter passed: ${preFilteredProducts.length} products`);

    // Second pass: validate that each image URL actually returns a valid image
    console.log('Validating image URLs (this may take a moment)...');
    const validationResults = await Promise.all(
      preFilteredProducts.map(async (product: ScrapedProduct) => {
        const isValid = await validateImageUrl(product.imageUrl);
        return { product, isValid };
      })
    );

    const validProducts = validationResults
      .filter(r => r.isValid)
      .map((r, index) => {
        const product = r.product;
        return {
          id: `bandolier-${index + 1}`,
          name: product.name,
          thumbnail: product.imageUrl.includes('?') 
            ? product.imageUrl 
            : `${product.imageUrl}?w=400&h=400&fit=crop`,
          url: product.imageUrl.includes('?') 
            ? product.imageUrl.replace(/\?.*$/, '?w=800') 
            : `${product.imageUrl}?w=800`,
          category: product.category || 'product',
          color: product.color,
          collection: product.collection,
        };
      });

    const droppedCount = preFilteredProducts.length - validProducts.length;
    console.log(`Validation complete: ${validProducts.length} valid, ${droppedCount} dropped (invalid/404)`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        products: validProducts,
        totalExtracted: extractedProducts.length,
        totalPreFiltered: preFilteredProducts.length,
        totalValidated: validProducts.length,
        totalDroppedInvalidImages: droppedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error scraping products:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to scrape products';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
