/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// Reference Roulette — Two-phase scene analysis + asset integration pipeline

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RouletteRequest {
  sceneReferenceUrl: string;
  productReferences: { name: string; imageUrl: string; description?: Record<string, unknown> }[];
  componentOverrides?: Record<string, { material: string; color: string }>;
  originalComponents?: Record<string, { material: string; color: string } | null>;
  productIdentity?: {
    brandName?: string;
    modelName?: string;
    material?: string;
    color?: string;
    productType?: string;
    fullName?: string;
    summary?: string;
  };
  brandName?: string;
  brandPersonality?: string;
  brandContext?: Record<string, unknown>;
  brandBrain?: Record<string, unknown>;
  brief?: string;
  remixRemoveText?: boolean;
  customPrompts?: {
    rouletteFaithful?: string;
    rouletteModerate?: string;
    rouletteCreative?: string;
    roulettePhaseB?: string;
  };
}

// ========== NB2 JSON Schema definition ==========
const NB2_SCHEMA = `{
  "tier": "faithful | moderate | creative",
  "label": "Close Recreation | Subtle Variation | Creative Reimagining",
  "description": "Brief 1-line summary of what this variation does differently",
  "structured": {
    "meta": {
      "aspect_ratio": "1:1",
      "quality_mode": "photorealistic",
      "negative_prompt": ["blurry", "distorted", "watermark", "text artifacts", "oversaturated", "low resolution", "cartoon", "illustration"]
    },
    "subject": [
      {
        "type": "person | object | product",
        "description": "40% of detail budget — skin tone, build, hair, features",
        "physical_traits": { "hair": "", "skin": "", "build": "", "age": "" },
        "clothing": { "top": "", "bottom": "", "footwear": "LOCKED — described separately via product_fidelity", "material": "" },
        "accessories": ["Each with placement, material, color"],
        "expression": "Facial expression and emotional quality",
        "pose": "Exact stance, weight, hand placement, gaze direction"
      }
    ],
    "scene": {
      "location": "Specific environment",
      "time_of_day": "Time and light conditions",
      "weather": "Weather if outdoor",
      "lighting": { "type": "", "direction": "", "color_temperature": "", "intensity": "" },
      "background_elements": []
    },
    "camera": {
      "model": "Sony A7III",
      "lens": "85mm prime",
      "aperture": "f/1.4",
      "film_stock": "digital clean"
    },
    "composition": {
      "framing": "medium-close-up",
      "angle": "eye-level",
      "focus_point": "What is sharpest",
      "depth_of_field": "shallow"
    },
    "product_fidelity": "Ensure product dimensions are realistic. No distortion. Accurate material, color, hardware. Ultra-high resolution, photorealistic."
  }
}`;

// ========== System Prompts ==========

function buildFaithfulPrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive ONLY a single scene reference image. Analyze it with forensic precision.
Describe what you SEE, not what you imagine. Be SPECIFIC with every field.

YOUR TASK: FAITHFUL (Close Recreation) — forensic recreation of the scene.

FIELD STRATEGY:
- subject: Describe EXACTLY what you see — same pose, same clothing, same expression, same physical traits (40% detail)
- scene: Identical location, background, props, weather, time of day
- scene.lighting: Same type, direction, color temperature, intensity
- camera: Match the apparent lens, aperture, angle — infer if unsure
- composition: Same framing, angle, focus point, depth of field
- camera.film_stock: Match the color rendering style
- meta: Set quality_mode and aspect_ratio to match what you see
- clothing.footwear: Set to "LOCKED — will be integrated in Phase B"

Return valid JSON matching this schema:
${NB2_SCHEMA}

Set tier to "faithful" and label to "Close Recreation".
Return ONLY valid JSON, no markdown, no explanation.`;
}

function buildModeratePrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive ONLY a single scene reference image. Analyze it with forensic precision.
Describe what you SEE, then create a SUBTLE VARIATION — same DNA, different execution.

FIELD STRATEGY:
- subject[].pose: CHANGE — shift weight, alter hand placement, redirect gaze
- subject[].expression: Can shift subtly
- subject[].clothing + subject[].physical_traits: KEEP identical to what you see
- scene.location + scene.background_elements: KEEP identical
- scene.lighting: Allow slight shifts in direction or intensity, keep same type and color_temperature
- camera.lens: Can vary focal length slightly
- composition.angle: CHANGE — different height or perspective
- composition.framing: CHANGE — tighter or wider crop
- camera.film_stock: KEEP identical
- meta: KEEP identical
- clothing.footwear: Set to "LOCKED — will be integrated in Phase B"

Return valid JSON matching this schema:
${NB2_SCHEMA}

Set tier to "moderate" and label to "Subtle Variation".
Return ONLY valid JSON, no markdown, no explanation.`;
}

function buildCreativePrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive ONLY a single scene reference image. Analyze it with forensic precision.
Then create a BOLD CAMPAIGN REIMAGINING using the scene's visual DNA.

FIELD STRATEGY:
- subject[].pose: REIMAGINE — more dramatic, editorial, campaign-worthy
- subject[].expression: REIMAGINE — bolder, more evocative
- subject[].clothing + subject[].physical_traits: KEEP the same person/subject identity
- scene: REIMAGINE — use the scene's aesthetic DNA but create a more dramatic environment
- scene.lighting: REIMAGINE — more dramatic, cinematic, fashion-forward
- camera: REIMAGINE — bolder camera choice, artistic lens, dramatic aperture
- composition: REIMAGINE — bolder angle, more artistic framing
- camera.film_stock: EVOLVE — consider CineStill 800T for night, Kodak Portra for warmth
- meta: Can adjust aspect_ratio for more cinematic framing
- clothing.footwear: Set to "LOCKED — will be integrated in Phase B"

Return valid JSON matching this schema:
${NB2_SCHEMA}

Set tier to "creative" and label to "Creative Reimagining".
Return ONLY valid JSON, no markdown, no explanation.`;
}

function buildPhaseBPrompt(customPrompt?: string): string {
  return customPrompt || `You are a prompt editor for footwear campaign image generation. You receive a structured JSON prompt and product/asset details. Perform SURGICAL JSON field edits to integrate the assets.

WHAT TO EDIT:

a) PRODUCT (required):
   - Update "subject[].clothing.footwear" — describe the product visually: brand, model, material, color, hardware finish, silhouette
   - Update "product_fidelity" — include specific material, color, hardware details
   - If the product has component overrides, reflect those changes

b) BRIEF (only if provided):
   - Adjust scene, lighting, or subject fields as needed — minimal changes only

WHAT TO PRESERVE (do NOT modify unless directly affected):
- "scene.lighting" — all fields
- "camera" — all fields
- "composition" — all fields
- "meta" — all fields
- "subject[].pose" and "subject[].expression" — keep as-is
- "subject[].physical_traits" — keep as-is

BRAND CONTEXT: Respect any brand guidelines. Never include elements from "AVOID" lists.

OUTPUT — strict JSON matching the same schema as input:
{
  "tier": "the tier value",
  "label": "the label",
  "description": "Brief 1-line summary",
  "structured": { ...the edited structured prompt object... }
}

Return ONLY valid JSON, no markdown, no explanation.`;
}

// ========== Helper Functions ==========

function buildBrandBlock(body: RouletteRequest): string {
  const sections: string[] = [];
  if (body.brandName) sections.push(`Brand: ${body.brandName}`);
  if (body.brandPersonality) sections.push(`Personality: ${body.brandPersonality}`);

  if (body.brandBrain) {
    const bb = body.brandBrain as any;
    if (bb.visualDNA?.photographyStyle) sections.push(`Photography Style: ${bb.visualDNA.photographyStyle}`);
    if (bb.visualDNA?.colorPalette?.foundation?.length) sections.push(`Brand Palette: ${bb.visualDNA.colorPalette.foundation.join(', ')}`);
    if (bb.visualDNA?.avoidElements?.length) sections.push(`STRICTLY AVOID: ${bb.visualDNA.avoidElements.join(', ')}`);
    if (bb.visualDNA?.lightingStyle) sections.push(`Lighting Style: ${bb.visualDNA.lightingStyle}`);
    if (bb.visualDNA?.compositionStyle) sections.push(`Composition Style: ${bb.visualDNA.compositionStyle}`);
    if (bb.visualDNA?.modelStyling) {
      const ms = bb.visualDNA.modelStyling;
      const parts: string[] = [];
      if (ms.demographics) parts.push(`Demographics: ${ms.demographics}`);
      if (ms.expression) parts.push(`Expression: ${ms.expression}`);
      if (ms.poseStyle) parts.push(`Pose: ${ms.poseStyle}`);
      if (ms.stylingAesthetic) parts.push(`Aesthetic: ${ms.stylingAesthetic}`);
      if (parts.length) sections.push(`Model Styling:\n  ${parts.join('\n  ')}`);
    }
  }

  if (body.brandContext) {
    const bc = body.brandContext as any;
    if (bc.visual_style?.avoid?.length) sections.push(`AVOID: ${bc.visual_style.avoid.join(', ')}`);
    if (bc.visual_style?.photography_style) sections.push(`Photography: ${bc.visual_style.photography_style}`);
  }

  return sections.length > 0 ? sections.join('\n') : 'No brand context provided';
}

function buildProductBlock(body: RouletteRequest): string {
  const sections: string[] = [];

  // Product identity
  if (body.productIdentity) {
    const pi = body.productIdentity;
    let color = pi.color;
    let material = pi.material;
    if (body.componentOverrides?.upper) {
      color = body.componentOverrides.upper.color;
      material = body.componentOverrides.upper.material;
    }
    sections.push(`Product: ${pi.brandName || ''} ${pi.modelName || ''} — ${material || ''} in ${color || ''}`.trim());
    if (pi.productType) sections.push(`Type: ${pi.productType}`);
    if (pi.summary) sections.push(`Description: ${pi.summary}`);
  }

  // Product references
  for (const p of body.productReferences) {
    const desc = p.description as any;
    if (!desc) continue;
    const details: string[] = [`Reference: ${p.name}`];
    if (desc.primary_colors?.length) details.push(`  Colors: ${desc.primary_colors.join(', ')}`);
    if (desc.materials?.length) details.push(`  Materials: ${desc.materials.join(', ')}`);
    if (desc.product_type) details.push(`  Type: ${desc.product_type}`);
    sections.push(details.join('\n'));
  }

  // Component overrides
  if (body.componentOverrides && body.originalComponents) {
    const types = ['upper', 'footbed', 'sole', 'buckles', 'heelstrap', 'lining'] as const;
    const changes: string[] = [];
    for (const type of types) {
      const override = (body.componentOverrides as any)[type];
      const orig = (body.originalComponents as any)[type];
      if (override && orig && (override.material !== orig.material || override.color !== orig.color)) {
        changes.push(`${type}: ${override.material} in ${override.color} (was: ${orig.material} in ${orig.color})`);
      }
    }
    if (changes.length > 0) {
      sections.push('\nCOMPONENT CHANGES:');
      changes.forEach(c => sections.push(c));
    }
  }

  // Branding
  const branding = (body.originalComponents as any)?.branding;
  if (branding) {
    sections.push('\nBRANDING:');
    if (branding.buckleEngravings) {
      for (const e of branding.buckleEngravings) {
        sections.push(`Buckle (${e.location}): "${e.text}" in ${e.style}`);
      }
    }
    if (branding.footbedText) sections.push(`Footbed stamp: "${branding.footbedText}"`);
  }

  return sections.join('\n');
}

async function callAI(
  apiKey: string,
  systemPrompt: string,
  userContent: Array<{ type: string; image_url?: { url: string }; text?: string }>,
  maxTokens = 8192,
  maxRetries = 3
): Promise<any> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
        max_tokens: maxTokens,
      }),
    });

    if (response.ok) {
      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("No content from AI");
      // Strip markdown code fences if present
      const cleaned = content.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      return JSON.parse(cleaned);
    }

    if (response.status === 429 && attempt < maxRetries - 1) {
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      lastError = new Error(`Rate limited (attempt ${attempt + 1})`);
      continue;
    }

    const errorText = await response.text();
    lastError = new Error(`AI call failed: ${response.status} — ${errorText}`);
    
    if (response.status === 402) {
      throw new Error("Payment required — please add credits to your workspace");
    }
    
    throw lastError;
  }
  throw lastError || new Error("AI call failed after retries");
}

// ========== Main Handler ==========

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RouletteRequest = await req.json();
    console.log("[ROULETTE] Starting analysis for scene:", body.sceneReferenceUrl?.substring(0, 80));

    if (!body.sceneReferenceUrl) {
      return new Response(JSON.stringify({ error: "sceneReferenceUrl is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ========== PHASE A: Scene Analysis (3 parallel calls) ==========
    console.log("[ROULETTE] Phase A — 3 parallel scene analysis calls...");
    
    const sceneContent: Array<{ type: string; image_url?: { url: string }; text?: string }> = [
      { type: "image_url", image_url: { url: body.sceneReferenceUrl } },
      { type: "text", text: "Analyze this scene reference image and generate 1 complete structured JSON prompt for the specified tier. Return valid JSON only." },
    ];

    const customPrompts = body.customPrompts || {};

    const [faithful, moderate, creative] = await Promise.all([
      callAI(apiKey, buildFaithfulPrompt(customPrompts.rouletteFaithful), sceneContent, 4096),
      callAI(apiKey, buildModeratePrompt(customPrompts.rouletteModerate), sceneContent, 4096),
      callAI(apiKey, buildCreativePrompt(customPrompts.rouletteCreative), sceneContent, 4096),
    ]);

    console.log("[ROULETTE] Phase A complete — got 3 tier analyses");

    // ========== PHASE B: Asset Integration (3 parallel calls) ==========
    console.log("[ROULETTE] Phase B — 3 parallel asset integration calls...");
    
    const brandBlock = buildBrandBlock(body);
    const productBlock = buildProductBlock(body);
    const briefBlock = body.brief ? `\n\nCAMPAIGN BRIEF:\n${body.brief}` : '';
    const removeTextBlock = body.remixRemoveText ? '\n\nTEXT REMOVAL: Remove any text/logos/watermarks from the scene. Inpaint seamlessly.' : '';

    const basePrompts = [faithful, moderate, creative];
    const phaseBSystemPrompt = buildPhaseBPrompt(customPrompts.roulettePhaseB);

    const phaseBResults = await Promise.all(
      basePrompts.map((bp) => {
        const structuredJson = JSON.stringify(bp.structured || bp, null, 2);
        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          {
            type: "text",
            text: `BASE STRUCTURED PROMPT (tier: ${bp.tier}, label: ${bp.label}):\n${structuredJson}\n\nPRODUCT DETAILS TO INTEGRATE (required):\n${productBlock}\n\nBRAND IDENTITY:\n${brandBlock}${briefBlock}${removeTextBlock}\n\nEdit the structured JSON prompt to integrate the product. Return valid JSON only.`,
          },
        ];

        // Attach product reference images so Phase B can see them
        const productUrls = (body.productReferences || [])
          .map(p => p.imageUrl)
          .filter(url => url && url.startsWith('http'));
        for (const url of productUrls.slice(0, 4)) {
          content.push({ type: "image_url", image_url: { url } });
        }
        if (productUrls.length > 0) {
          content.push({ type: "text", text: `These ${Math.min(productUrls.length, 4)} images show the product. Describe its visual details accurately in the footwear and product_fidelity fields.` });
        }

        return callAI(apiKey, phaseBSystemPrompt, content, 4096);
      })
    );

    console.log("[ROULETTE] Phase B complete — got 3 final prompts");

    // ========== Assemble Response ==========
    const finalPrompts = phaseBResults.map((result) => ({
      tier: result.tier,
      label: result.label,
      description: result.description || '',
      prompt: JSON.stringify(result.structured || result, null, 2),
      structured: result.structured || result,
    }));

    return new Response(JSON.stringify({
      success: true,
      sceneDescription: JSON.stringify(faithful.structured || faithful, null, 2),
      prompts: finalPrompts,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[ROULETTE] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Payment required") ? 402 : message.includes("Rate limit") ? 429 : 500;
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
