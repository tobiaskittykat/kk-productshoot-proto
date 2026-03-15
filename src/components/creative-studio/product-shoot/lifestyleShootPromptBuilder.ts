// ============= LIFESTYLE SHOOT PROMPT BUILDER =============
// Merges moodboard analysis + product identity + shot type + advanced settings into a prompt

import type { LifestyleShootConfig, LifestyleAdvancedSettings } from './types';
import { lifestyleShootTypes, getAdvancedPromptFragments } from './lifestyleShootConfigs';

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
  
  // 1. Shot type framing (MANDATORY)
  const shotType = lifestyleShootTypes.find(s => s.id === config.lifestyleShotType);
  if (shotType) {
    sections.push(shotType.framingDirective);
    sections.push('');
  }
  
  // 2. Moodboard aesthetic world (PRIMARY STYLE DRIVER)
  if (moodboardAnalysis) {
    sections.push('AESTHETIC WORLD (from moodboard — this defines the visual universe):');
    
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
    sections.push('Apply this aesthetic as a FILTER over the entire image — colors, lighting, textures, mood, and atmosphere must all be consistent with this world.');
    sections.push('');
  }
  
  // 3. Creative brief (user direction)
  const brief = creativeBrief || config.creativeBrief;
  if (brief?.trim()) {
    sections.push(`CREATIVE DIRECTION: ${brief.trim()}`);
    sections.push('');
  }
  
  // 4. Advanced camera/lighting/film settings
  const advancedFragments = getAdvancedPromptFragments(config.advancedSettings);
  if (advancedFragments.length > 0) {
    sections.push('TECHNICAL CAMERA DIRECTION:');
    advancedFragments.forEach(f => sections.push(`- ${f}`));
    sections.push('');
  }
  
  // 5. Product integrity lock
  sections.push(`FOOTWEAR — LOCKED (MUST NOT CHANGE)
The product shown must be EXACTLY as in the reference images.
Geometry, construction, silhouette, proportions, stitching, hardware placement,
and material behavior must remain identical. Do not redesign, stylize, or reinterpret.
Product identity and materials are provided in the PRODUCT IDENTITY section.`);
  sections.push('');
  
  // 6. Birkenstock brand DNA reminder
  sections.push(`BRAND TONE: Authentic, natural, understated luxury. Never flashy or overly styled.
The image should feel effortless, lived-in, and genuinely aspirational.
The final image must be indistinguishable from an official Birkenstock editorial campaign photograph.`);
  
  return sections.join('\n');
}
