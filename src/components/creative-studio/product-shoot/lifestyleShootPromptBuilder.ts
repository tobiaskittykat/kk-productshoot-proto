// ============= LIFESTYLE SHOOT PROMPT BUILDER =============
// Merges moodboard analysis + product identity + shot type + advanced settings into a prompt

import type { LifestyleShootConfig, LifestyleAdvancedSettings } from './types';
import { lifestyleShootTypes, getAdvancedPromptFragments, areAllSettingsAuto, pickRandomStillLifeVariation, pickRandomPortraitVariation } from './lifestyleShootConfigs';

interface MoodboardAnalysis {
  title?: string;
  description?: string;
  overallLookAndFeel?: string;
  keyMotifs?: string[];
  textureAndMaterials?: string;
  lightingAndMood?: string;
  productBehavior?: string;
  cameraFraming?: string;
  colorPalette?: string[];
  keywords?: string[];
  // Legacy flat format
  dominant_colors?: string[];
  color_mood?: string;
  key_elements?: string[];
  composition_style?: string;
  lighting_quality?: string;
  textures?: string[];
  emotional_tone?: string;
}

interface ProductIdentity {
  brandName?: string;
  modelName?: string;
  material?: string;
  color?: string;
  productType?: string;
  summary?: string;
}

interface PromptBuilderInput {
  config: LifestyleShootConfig;
  moodboardAnalysis?: MoodboardAnalysis | null;
  moodboardName?: string;
  productIdentity?: ProductIdentity;
  brandBrain?: Record<string, any>;
  creativeBrief?: string;
}

/**
 * Build the complete lifestyle shoot prompt combining all inputs.
 * This is used as the shotTypePrompt — the prompt agent receives it 
 * alongside brand context, product identity, and reference images.
 */
export function buildLifestyleShootPrompt(input: PromptBuilderInput): string {
  const { config, moodboardAnalysis, moodboardName, productIdentity, creativeBrief } = input;
  
  const sections: string[] = [];
  
  // 1. PRIORITY HIERARCHY (always first)
  sections.push(`PROMPT PRIORITY HIERARCHY:
The MOODBOARD defines the VISUAL WORLD — colors, textures, surfaces, lighting, mood, geography, atmosphere.
The SHOT TYPE defines only the COMPOSITIONAL STRUCTURE — crop, framing, product visibility, body positioning.
When the moodboard and shot type could suggest different aesthetics, the MOODBOARD WINS.`);
  sections.push('');
  
  // 2. Moodboard aesthetic world (PRIMARY STYLE DRIVER — before shot type)
  if (moodboardAnalysis) {
    sections.push('AESTHETIC WORLD (from moodboard — this is the PRIMARY style authority):');
    
    // Deep analysis format
    if (moodboardAnalysis.overallLookAndFeel) {
      sections.push(`Look & Feel: ${moodboardAnalysis.overallLookAndFeel}`);
    }
    if (moodboardAnalysis.lightingAndMood) {
      sections.push(`Lighting & Mood: ${moodboardAnalysis.lightingAndMood}`);
    }
    if (moodboardAnalysis.textureAndMaterials) {
      sections.push(`Textures & Materials: ${moodboardAnalysis.textureAndMaterials}`);
    }
    if (moodboardAnalysis.colorPalette?.length) {
      sections.push(`Color Palette: ${moodboardAnalysis.colorPalette.join(', ')}`);
    }
    if (moodboardAnalysis.keyMotifs?.length) {
      sections.push(`Key Motifs: ${moodboardAnalysis.keyMotifs.join(', ')}`);
    }
    if (moodboardAnalysis.cameraFraming) {
      sections.push(`Camera Framing Reference: ${moodboardAnalysis.cameraFraming}`);
    }
    if (moodboardAnalysis.productBehavior) {
      sections.push(`Product Behavior: ${moodboardAnalysis.productBehavior}`);
    }
    
    // Legacy flat format fallback
    if (!moodboardAnalysis.overallLookAndFeel) {
      if (moodboardAnalysis.dominant_colors?.length) {
        sections.push(`Colors: ${moodboardAnalysis.dominant_colors.join(', ')}`);
      }
      if (moodboardAnalysis.color_mood) {
        sections.push(`Color Mood: ${moodboardAnalysis.color_mood}`);
      }
      if (moodboardAnalysis.lighting_quality) {
        sections.push(`Lighting: ${moodboardAnalysis.lighting_quality}`);
      }
      if (moodboardAnalysis.emotional_tone) {
        sections.push(`Emotional Tone: ${moodboardAnalysis.emotional_tone}`);
      }
      if (moodboardAnalysis.textures?.length) {
        sections.push(`Textures: ${moodboardAnalysis.textures.join(', ')}`);
      }
      if (moodboardAnalysis.key_elements?.length) {
        sections.push(`Key Elements: ${moodboardAnalysis.key_elements.join(', ')}`);
      }
    }
    
    if (moodboardName) {
      sections.push(`Moodboard: "${moodboardName}"`);
    }
    sections.push('');
    sections.push('Every aesthetic decision — surfaces, props, color temperature, atmosphere, styling — MUST be derived from this moodboard. Do NOT introduce elements that contradict or ignore this world.');
    sections.push('');
  } else {
    // No moodboard fallback
    sections.push('NO MOODBOARD PROVIDED — default to a warm, natural, understated aesthetic with soft natural light. Keep it neutral and let the product and creative brief drive the mood.');
    sections.push('');
  }
  
  // 3. Shot type framing (COMPOSITIONAL STRUCTURE)
  // For Styled Still Life with all-auto settings, inject a random compositional variation
  const shotType = lifestyleShootTypes.find(s => s.id === config.lifestyleShotType);
  if (shotType) {
    if (config.lifestyleShotType === 'product-only' && areAllSettingsAuto(config.advancedSettings)) {
      const variation = pickRandomStillLifeVariation();
      console.log(`[LifestylePromptBuilder] Random still life variation: ${variation.id} — ${variation.name}`);
      // Use the variation's framing override instead of the static default
      sections.push(variation.framingOverride);
      sections.push('');
      // Still include the base directive's non-compositional rules (no model, pair of shoes, etc.)
      sections.push(`ADDITIONAL RULES FROM SHOT TYPE:
NO model, NO hands, NO feet visible. Show a COMPLETE PAIR of shoes (2 shoes).
SURFACE: The shoes sit on a contextual surface from the moodboard's world with visible texture.
LIGHT: Natural environmental light with real shadows. Quality must match the moodboard.
ALL AESTHETIC CHOICES — surface material, prop selection, color temperature, atmosphere — must be derived from the moodboard.`);
    } else {
      sections.push(shotType.framingDirective);
    }
    sections.push('');
  }
  
  // 4. Creative brief (user direction)
  const brief = creativeBrief || config.creativeBrief;
  if (brief?.trim()) {
    sections.push(`CREATIVE DIRECTION: ${brief.trim()}`);
    sections.push('');
  }
  
  // 5. Advanced camera/lighting/film settings
  const advancedFragments = getAdvancedPromptFragments(config.advancedSettings);
  if (advancedFragments.length > 0) {
    sections.push('TECHNICAL CAMERA DIRECTION:');
    advancedFragments.forEach(f => sections.push(`- ${f}`));
    sections.push('');
  }
  
  // 6. Product integrity lock
  sections.push(`FOOTWEAR — LOCKED (MUST NOT CHANGE)
The product shown must be EXACTLY as in the reference images.
Geometry, construction, silhouette, proportions, stitching, hardware placement,
and material behavior must remain identical. Do not redesign, stylize, or reinterpret.
Product identity and materials are provided in the PRODUCT IDENTITY section.`);
  sections.push('');
  
  // 7. Brand quality (light touch — no prescriptive aesthetics)
  sections.push(`BRAND QUALITY: The image must feel editorially polished, authentic, and never overly commercial. Maintain the quality standard of a premium lifestyle brand campaign. Never flashy, never generic stock photography.`);
  
  return sections.join('\n');
}
