/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualAnalysis {
  dominant_colors: string[];
  color_mood: string;
  key_elements: string[];
  composition_style: string;
  lighting_quality: string;
  textures: string[];
  emotional_tone: string;
  suggested_props: string[];
  best_for: string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    // Get auth header for user identification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { moodboardId, imageUrl, batchAnalyze } = body;

    // Handle batch analysis of all unanalyzed moodboards
    if (batchAnalyze) {
      const { data: unanalyzedMoodboards, error: fetchError } = await supabase
        .from('custom_moodboards')
        .select('id, thumbnail_url, name')
        .eq('user_id', user.id)
        .is('visual_analysis', null);

      if (fetchError) {
        throw new Error(`Failed to fetch moodboards: ${fetchError.message}`);
      }

      console.log(`Found ${unanalyzedMoodboards?.length || 0} moodboards to analyze`);
      
      const results = [];
      for (const moodboard of unanalyzedMoodboards || []) {
        try {
          const analysis = await analyzeMoodboardImage(moodboard.thumbnail_url, LOVABLE_API_KEY);
          
          const { error: updateError } = await supabase
            .from('custom_moodboards')
            .update({ visual_analysis: analysis })
            .eq('id', moodboard.id);

          if (updateError) {
            console.error(`Failed to update moodboard ${moodboard.id}:`, updateError);
            results.push({ id: moodboard.id, name: moodboard.name, status: 'error', error: updateError.message });
          } else {
            results.push({ id: moodboard.id, name: moodboard.name, status: 'success' });
          }
        } catch (err) {
          console.error(`Failed to analyze moodboard ${moodboard.id}:`, err);
          results.push({ id: moodboard.id, name: moodboard.name, status: 'error', error: String(err) });
        }
      }

      return new Response(
        JSON.stringify({ success: true, analyzed: results.length, results }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Single moodboard analysis
    if (!moodboardId && !imageUrl) {
      return new Response(
        JSON.stringify({ error: "moodboardId or imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetImageUrl = imageUrl;
    
    // If moodboardId provided, fetch the moodboard
    if (moodboardId) {
      const { data: moodboard, error: moodboardError } = await supabase
        .from('custom_moodboards')
        .select('*')
        .eq('id', moodboardId)
        .eq('user_id', user.id)
        .single();

      if (moodboardError || !moodboard) {
        return new Response(
          JSON.stringify({ error: "Moodboard not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      targetImageUrl = moodboard.thumbnail_url;
    }

    console.log(`Analyzing moodboard image: ${targetImageUrl}`);

    // Analyze the moodboard image
    const analysis = await analyzeMoodboardImage(targetImageUrl, LOVABLE_API_KEY);
    
    // Update the database if moodboardId was provided
    if (moodboardId) {
      const { error: updateError } = await supabase
        .from('custom_moodboards')
        .update({ visual_analysis: analysis })
        .eq('id', moodboardId);

      if (updateError) {
        console.error("Failed to update moodboard with analysis:", updateError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-moodboard:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze moodboard";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeMoodboardImage(imageUrl: string, apiKey: string): Promise<VisualAnalysis> {
  const systemPrompt = `You are an expert visual analyst specializing in mood boards and brand aesthetics. 
Analyze the provided moodboard image and extract detailed visual elements that can inform creative direction.

You MUST call the extract_visual_analysis function with your findings.`;

  const userPrompt = `Analyze this moodboard image comprehensively. Extract:
- Dominant colors (specific color names like "cobalt blue", "warm terracotta", "dusty rose")
- Overall color mood (the emotional feeling the color palette creates)
- Key visual elements (objects, textures, scenes you see)
- Composition style (how elements are arranged)
- Lighting quality (natural, dramatic, soft, golden hour, etc.)
- Textures present (smooth, rough, organic, metallic, etc.)
- Emotional tone (the feeling/vibe this moodboard conveys)
- Suggested props that would fit this aesthetic
- What campaigns or content this moodboard would work best for`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            { type: "image_url", image_url: { url: imageUrl } },
            { type: "text", text: userPrompt }
          ]
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "extract_visual_analysis",
            description: "Extract structured visual analysis from a moodboard image",
            parameters: {
              type: "object",
              properties: {
                dominant_colors: {
                  type: "array",
                  items: { type: "string" },
                  description: "List of 4-6 dominant colors with specific names (e.g., 'cobalt blue', 'warm terracotta')"
                },
                color_mood: {
                  type: "string",
                  description: "Overall emotional feeling created by the color palette (e.g., 'Warm Mediterranean luxury with cool ocean accents')"
                },
                key_elements: {
                  type: "array",
                  items: { type: "string" },
                  description: "Key visual elements, objects, or scenes visible (e.g., 'whitewashed architecture', 'blue domes', 'golden hour light')"
                },
                composition_style: {
                  type: "string",
                  description: "How visual elements are arranged (e.g., 'Open, airy framing with strong horizon lines')"
                },
                lighting_quality: {
                  type: "string",
                  description: "Description of lighting (e.g., 'Soft, diffused golden hour with warm shadows')"
                },
                textures: {
                  type: "array",
                  items: { type: "string" },
                  description: "Textures visible in the moodboard (e.g., 'smooth stucco', 'weathered wood', 'polished stone')"
                },
                emotional_tone: {
                  type: "string",
                  description: "The feeling/vibe this moodboard conveys (e.g., 'Serene wanderlust, aspirational travel luxury')"
                },
                suggested_props: {
                  type: "array",
                  items: { type: "string" },
                  description: "Props that would complement this aesthetic (e.g., 'linen fabrics', 'ceramic dishes', 'olive branches')"
                },
                best_for: {
                  type: "array",
                  items: { type: "string" },
                  description: "Campaign types or content this moodboard works best for (e.g., 'summer campaigns', 'vacation lifestyle', 'Mediterranean collection')"
                }
              },
              required: ["dominant_colors", "color_mood", "key_elements", "composition_style", "lighting_quality", "textures", "emotional_tone", "suggested_props", "best_for"],
              additionalProperties: false
            }
          }
        }
      ],
      tool_choice: { type: "function", function: { name: "extract_visual_analysis" } }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AI analysis failed:", response.status, errorText);
    throw new Error(`AI analysis failed: ${response.status}`);
  }

  const aiResponse = await response.json();
  console.log("AI response:", JSON.stringify(aiResponse).slice(0, 500));

  // Extract the tool call arguments
  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall || toolCall.function.name !== "extract_visual_analysis") {
    console.error("No valid tool call in response");
    throw new Error("Failed to extract analysis from AI response");
  }

  try {
    const analysis = JSON.parse(toolCall.function.arguments) as VisualAnalysis;
    console.log("Extracted analysis:", analysis);
    return analysis;
  } catch (parseError) {
    console.error("Failed to parse tool call arguments:", parseError);
    throw new Error("Failed to parse analysis response");
  }
}
