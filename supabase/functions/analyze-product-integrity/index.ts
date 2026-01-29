import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface IntegrityRequest {
  imageId: string;
  generatedImageUrl: string;
  productReferenceUrls: string[];
  productName?: string;
}

interface IntegrityDetails {
  colorMatch: { score: number; notes: string };
  silhouetteMatch: { score: number; notes: string };
  featureMatch: { score: number; notes: string };
  materialMatch: { score: number; notes: string };
}

interface IntegrityResult {
  score: number;
  issues: string[];
  passesCheck: boolean;
  analyzedAt: string;
  details: IntegrityDetails;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageId, generatedImageUrl, productReferenceUrls, productName }: IntegrityRequest = await req.json();

    // Validate input
    if (!imageId || !generatedImageUrl || !productReferenceUrls?.length) {
      console.log("[analyze-product-integrity] Missing required fields:", { imageId, generatedImageUrl, productReferenceUrls: productReferenceUrls?.length });
      return new Response(
        JSON.stringify({ error: "Missing required fields: imageId, generatedImageUrl, and productReferenceUrls" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[analyze-product-integrity] Starting analysis for image ${imageId}`);
    console.log(`[analyze-product-integrity] Comparing against ${productReferenceUrls.length} reference images`);
    if (productName) {
      console.log(`[analyze-product-integrity] Product: ${productName}`);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Limit reference images to avoid token overflow (max 5)
    const limitedRefUrls = productReferenceUrls.slice(0, 5);
    const refCount = limitedRefUrls.length;

    // Build multimodal content with reference images first, then generated image
    const imageContent: Array<{ type: string; image_url?: { url: string }; text?: string }> = [];

    // Add reference images
    for (const url of limitedRefUrls) {
      imageContent.push({
        type: "image_url",
        image_url: { url }
      });
    }

    // Add the generated image last
    imageContent.push({
      type: "image_url",
      image_url: { url: generatedImageUrl }
    });

    // Build the analysis prompt
    const analysisPrompt = `You are a product integrity analyst for e-commerce photography.

The first ${refCount} image(s) are PRODUCT REFERENCE photos showing the actual physical product.
The LAST image is an AI-GENERATED image that should contain this exact product.
${productName ? `Product being analyzed: ${productName}` : ""}

Your task is to compare the product in the generated image against the reference images and evaluate fidelity.

Analyze and score each category from 0-100:

1. **COLOR ACCURACY**: Does the product color in the generated image match the reference EXACTLY?
   - Check main color (suede, leather, fabric tone)
   - Check accent colors (stitching, lining, trim)
   - Check hardware colors (buckles, rivets, zippers)
   - Deduct points for any color drift or incorrect shades

2. **SILHOUETTE MATCH**: Does the shape/form match the reference?
   - Check overall proportions and curves
   - Check toe shape, heel height, sole thickness
   - Check strap placement and width
   - Verify the product outline matches

3. **FEATURE PRESENCE**: Are ALL distinctive features present and correct?
   - Check for straps, buckles, hardware in correct positions
   - Check for logos, brand marks, embossing
   - Check for stitching patterns, decorative elements
   - Check for lining visibility (e.g., shearling, wool)
   - Deduct heavily if any feature is MISSING

4. **MATERIAL ACCURACY**: Do materials look correct?
   - Suede should look matte and fibrous, not shiny
   - Leather should have appropriate grain
   - Cork should have characteristic texture
   - Metal hardware should have correct finish (matte, brushed, polished)

Call the extract_integrity_analysis function with your findings.
Be strict - any noticeable discrepancy should reduce the score.
List specific issues that would cause a customer to notice the product looks different.`;

    imageContent.push({
      type: "text",
      text: analysisPrompt
    });

    // Define the structured output tool
    const tools = [{
      type: "function",
      function: {
        name: "extract_integrity_analysis",
        description: "Extract structured product integrity analysis results",
        parameters: {
          type: "object",
          properties: {
            overall_score: {
              type: "number",
              description: "Overall integrity score from 0-100, weighted average of all categories"
            },
            color_match: {
              type: "object",
              properties: {
                score: { type: "number", description: "Score 0-100" },
                notes: { type: "string", description: "Brief explanation of color accuracy" }
              },
              required: ["score", "notes"]
            },
            silhouette_match: {
              type: "object",
              properties: {
                score: { type: "number", description: "Score 0-100" },
                notes: { type: "string", description: "Brief explanation of shape/form accuracy" }
              },
              required: ["score", "notes"]
            },
            feature_match: {
              type: "object",
              properties: {
                score: { type: "number", description: "Score 0-100" },
                notes: { type: "string", description: "Brief explanation of feature presence" }
              },
              required: ["score", "notes"]
            },
            material_match: {
              type: "object",
              properties: {
                score: { type: "number", description: "Score 0-100" },
                notes: { type: "string", description: "Brief explanation of material accuracy" }
              },
              required: ["score", "notes"]
            },
            issues: {
              type: "array",
              items: { type: "string" },
              description: "List of specific issues detected, e.g. 'Heel strap missing', 'Color too dark'"
            }
          },
          required: ["overall_score", "color_match", "silhouette_match", "feature_match", "material_match", "issues"]
        }
      }
    }];

    // Call Gemini Vision via Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: imageContent
          }
        ],
        tools,
        tool_choice: { type: "function", function: { name: "extract_integrity_analysis" } },
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[analyze-product-integrity] AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached, please add credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    console.log("[analyze-product-integrity] AI response received");

    // Extract the function call result
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_integrity_analysis") {
      console.error("[analyze-product-integrity] No tool call in response:", aiResponse);
      throw new Error("AI did not return expected analysis structure");
    }

    const analysisResult = JSON.parse(toolCall.function.arguments);
    console.log("[analyze-product-integrity] Analysis result:", {
      score: analysisResult.overall_score,
      issueCount: analysisResult.issues?.length || 0
    });

    // Build the integrity result
    const integrityResult: IntegrityResult = {
      score: Math.round(analysisResult.overall_score),
      issues: analysisResult.issues || [],
      passesCheck: analysisResult.overall_score >= 70,
      analyzedAt: new Date().toISOString(),
      details: {
        colorMatch: analysisResult.color_match,
        silhouetteMatch: analysisResult.silhouette_match,
        featureMatch: analysisResult.feature_match,
        materialMatch: analysisResult.material_match
      }
    };

    // Update the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("generated_images")
      .update({ integrity_analysis: integrityResult })
      .eq("id", imageId);

    if (updateError) {
      console.error("[analyze-product-integrity] Failed to update database:", updateError);
      // Don't throw - return the result anyway, client can retry
    } else {
      console.log(`[analyze-product-integrity] Updated image ${imageId} with integrity score: ${integrityResult.score}`);
    }

    return new Response(
      JSON.stringify({ success: true, result: integrityResult }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[analyze-product-integrity] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
