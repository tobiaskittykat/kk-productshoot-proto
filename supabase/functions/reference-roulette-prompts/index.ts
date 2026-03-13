/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />
// Reference Roulette — Two-phase scene analysis + asset integration pipeline
// Outputs natural language "Edit this image:" prompts (not JSON)

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

// ========== System Prompts — Natural Language Output ==========

function buildFaithfulPrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive a single scene reference image. Analyze it with forensic precision.

YOUR TASK: Write a rich, detailed "Edit this image:" prompt that RECREATES THIS EXACT SHOT.

RULES:
- Start your output with "Edit this image:"
- Describe EXACTLY what you see in rich, sensory prose — the model's pose, expression, clothing, the environment, the light, the mood, the grain/texture of the image
- Include camera/lens/film stock details naturally woven into the prose (e.g. "shot on 85mm at f/1.4, with the warm grain of Kodak Portra 400")
- Describe the color grade, any film grain, vintage processing, lens characteristics — these are the VISUAL DNA that must be preserved
- For footwear, write: [PRODUCT_PLACEHOLDER — will be replaced in Phase B]
- The result should be INDISTINGUISHABLE from the original — same pose, same angle, same framing, same light, same grain, same color grade
- This is a FAITHFUL recreation — the only thing that changes is the footwear

OUTPUT: A single cohesive natural language "Edit this image:" prompt. No JSON, no headers, no explanation. Just the prompt.`;
}

function buildModeratePrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive a single scene reference image. Analyze it with forensic precision.

YOUR TASK: Write a rich "Edit this image:" prompt for a DIFFERENT MOMENT from the SAME photo session.

RULES:
- Start your output with "Edit this image:"
- Describe the scene in rich, sensory prose
- KEEP IDENTICAL: the model's appearance, clothing, location, lighting setup, film stock/grain, color grade, mood, atmosphere — the visual DNA
- CHANGE SUBTLY: pose (shift weight, alter hand placement, redirect gaze), camera angle (slightly different height or perspective), framing (tighter or wider crop)
- Include camera/lens/film stock details naturally (e.g. "maintaining the shallow depth of field from the 85mm prime")
- Describe the color grade, grain texture, and processing style — these MUST match the original
- For footwear, write: [PRODUCT_PLACEHOLDER — will be replaced in Phase B]
- The result should look like a different frame from the SAME roll of film, the SAME session — unmistakably part of the same shoot

OUTPUT: A single cohesive natural language "Edit this image:" prompt. No JSON, no headers, no explanation. Just the prompt.`;
}

function buildCreativePrompt(customPrompt?: string): string {
  return customPrompt || `You are a world-class creative director and fashion photographer with 20 years of luxury footwear campaign experience.

You will receive a single scene reference image. Analyze it with forensic precision.

YOUR TASK: Write a rich "Edit this image:" prompt for a BOLD EDITORIAL SHOT from the SAME campaign session.

RULES:
- Start your output with "Edit this image:"
- Describe the scene in rich, evocative prose
- KEEP: the model's identity, the location's DNA, the lighting rig, the film stock, the grain texture, the color rendering — the campaign's visual signature
- CHANGE BOLDLY: dramatically different pose (more editorial, more campaign-worthy), bolder camera angle, more artistic framing or composition
- The grain, color grade, film stock, and atmospheric quality MUST still feel like the same shoot — same roll of film, same photographer, same session
- Include camera/lens details naturally but you may suggest a bolder lens choice (e.g. switching from 85mm to 35mm for a wider environmental shot)
- For footwear, write: [PRODUCT_PLACEHOLDER — will be replaced in Phase B]
- The result should feel like the most daring shot from the same session — the one the art director chose for the campaign hero

OUTPUT: A single cohesive natural language "Edit this image:" prompt. No JSON, no headers, no explanation. Just the prompt.`;
}

function buildPhaseBPrompt(customPrompt?: string): string {
  return customPrompt || `You are a prompt editor specializing in luxury footwear campaign imagery.

You receive:
1. A natural language "Edit this image:" prompt with a [PRODUCT_PLACEHOLDER] for the footwear
2. Product details (brand, model, material, color, components)
3. Brand identity guidelines

YOUR TASK: Rewrite the prompt with the product seamlessly integrated.

RULES:
- Replace [PRODUCT_PLACEHOLDER] with a rich, visual description of the actual product — weave in the brand name, model name, material, color, and any hardware/details
- If there are component overrides, describe the customized version (not the original)
- Keep EVERYTHING else in the prompt IDENTICAL — same prose, same mood, same camera details, same grain/color grade descriptions
- Respect brand guidelines: never include elements from "AVOID" lists
- Do NOT add any new elements, instructions, or changes beyond integrating the product
- If a brief is provided, you may make minimal adjustments to reflect it, but preserve the core prompt

OUTPUT: The complete, final "Edit this image:" prompt with the product integrated. No JSON, no headers, no explanation. Just the prompt.`;
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
  maxTokens = 4096,
  maxRetries = 3,
  forceJsonResponse = false
): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const requestBody: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: maxTokens,
    };
    // Only use json_object response format when we need structured output
    if (forceJsonResponse) {
      requestBody.response_format = { type: "json_object" };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.ok) {
      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("No content from AI");
      return content;
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

    // ========== PHASE A: Scene Analysis → 3 Natural Language Prompts ==========
    console.log("[ROULETTE] Phase A — 3 parallel scene analysis calls (natural language)...");
    
    const sceneContent: Array<{ type: string; image_url?: { url: string }; text?: string }> = [
      { type: "image_url", image_url: { url: body.sceneReferenceUrl } },
      { type: "text", text: "Analyze this scene reference image. Write a detailed natural language editing prompt for the specified tier. Start with 'Edit this image:'" },
    ];

    const customPrompts = body.customPrompts || {};

    const [faithfulNL, moderateNL, creativeNL] = await Promise.all([
      callAI(apiKey, buildFaithfulPrompt(customPrompts.rouletteFaithful), sceneContent),
      callAI(apiKey, buildModeratePrompt(customPrompts.rouletteModerate), sceneContent),
      callAI(apiKey, buildCreativePrompt(customPrompts.rouletteCreative), sceneContent),
    ]);

    console.log("[ROULETTE] Phase A complete — got 3 natural language prompts");
    console.log("[ROULETTE] Faithful preview:", faithfulNL.substring(0, 120));
    console.log("[ROULETTE] Moderate preview:", moderateNL.substring(0, 120));
    console.log("[ROULETTE] Creative preview:", creativeNL.substring(0, 120));

    // ========== PHASE B: Product Integration → 3 Final Prompts ==========
    console.log("[ROULETTE] Phase B — 3 parallel product integration calls...");
    
    const brandBlock = buildBrandBlock(body);
    const productBlock = buildProductBlock(body);
    const briefBlock = body.brief ? `\n\nCAMPAIGN BRIEF:\n${body.brief}` : '';
    const removeTextBlock = body.remixRemoveText ? '\n\nADDITIONAL INSTRUCTION TO APPEND: "Remove any text, logos, watermarks, or ad copy overlaid on the image. Inpaint seamlessly."' : '';

    const phaseAResults = [
      { tier: 'faithful', label: 'Close Recreation', prompt: faithfulNL },
      { tier: 'moderate', label: 'Subtle Variation', prompt: moderateNL },
      { tier: 'creative', label: 'Creative Reimagining', prompt: creativeNL },
    ];

    const phaseBSystemPrompt = buildPhaseBPrompt(customPrompts.roulettePhaseB);

    const phaseBResults = await Promise.all(
      phaseAResults.map((pa) => {
        const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
          {
            type: "text",
            text: `EDITING PROMPT TO INTEGRATE PRODUCT INTO (tier: ${pa.tier}):\n\n${pa.prompt}\n\nPRODUCT DETAILS TO INTEGRATE:\n${productBlock}\n\nBRAND IDENTITY:\n${brandBlock}${briefBlock}${removeTextBlock}\n\nRewrite the prompt with the product integrated in place of [PRODUCT_PLACEHOLDER]. Output only the final prompt.`,
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
          content.push({ type: "text", text: `These ${Math.min(productUrls.length, 4)} images show the product. Describe its visual details accurately when integrating it into the prompt.` });
        }

        return callAI(apiKey, phaseBSystemPrompt, content);
      })
    );

    console.log("[ROULETTE] Phase B complete — got 3 final prompts with product integrated");

    // ========== Assemble Response ==========
    // Generate short descriptions for each tier
    const tierDescriptions = [
      'Forensic recreation — same pose, angle, grain, light. Only footwear changes.',
      'Same session, different moment — subtle pose shift, slightly different angle.',
      'Same campaign DNA — bolder pose, dramatic angle, editorial framing.',
    ];

    const finalPrompts = phaseAResults.map((pa, i) => ({
      tier: pa.tier,
      label: pa.label,
      description: tierDescriptions[i],
      naturalPrompt: phaseBResults[i],
    }));

    return new Response(JSON.stringify({
      success: true,
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
