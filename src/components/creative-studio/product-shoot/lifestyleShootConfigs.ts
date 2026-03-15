// ============= LIFESTYLE SHOOT CONFIGURATIONS =============
// Shot types, advanced settings options, and Birkenstock-optimized defaults

import type { LifestyleShootShotType, LifestyleAdvancedSettings } from './types';

// ===== SHOT TYPE DEFINITIONS =====

export interface LifestyleShootType {
  id: LifestyleShootShotType;
  name: string;
  description: string;
  icon: string;
  framingDirective: string; // Mandatory framing rules for prompt
}

export const lifestyleShootTypes: LifestyleShootType[] = [
  {
    id: 'product-only',
    name: 'Product Only',
    description: 'Close-up hero shot, no model — styled within the moodboard world',
    icon: '🎯',
    framingDirective: `MANDATORY FRAMING: Product-only hero shot. NO model, NO hands, NO feet visible.
The product sits naturally within the scene — on a surface, ledge, step, or terrain that fits the moodboard's world.
Camera is close, filling 60-70% of the frame with the product. Shallow depth of field, background softly blurred.
The product's silhouette, materials, and construction details are the absolute hero.`,
  },
  {
    id: 'feet-focus',
    name: 'Feet Focus',
    description: 'On-foot, cropped mid-calf down — shoes as hero',
    icon: '👟',
    framingDirective: `MANDATORY FRAMING: On-foot shot, cropped from mid-calf down. NEVER show above the knee.
Exactly 2 shoes visible (one pair, worn on feet). The footwear fills most of the frame.
Camera angle is eye-level to slightly low, capturing the shoes in their environment.
Model legs are styled per the moodboard aesthetic — appropriate pants/bare ankles.
The head and torso are NEVER visible. This is a shoe-focused crop.`,
  },
  {
    id: 'model-no-head',
    name: 'Model — No Head',
    description: 'Full body, head always cropped above chin',
    icon: '🧍',
    framingDirective: `MANDATORY FRAMING: Full body shot with the head CROPPED OUT. The frame cuts off ABOVE THE CHIN — the model's face, eyes, and top of head are NEVER visible.
Show the model from roughly chin level down to feet. Full outfit visible, styled per the moodboard aesthetic.
The pose is natural, relaxed, and editorial — the model interacts with the scene environment.
The footwear must be clearly visible and sharp. The outfit supports but never competes with the product.`,
  },
  {
    id: 'full-model',
    name: 'Full Model',
    description: 'Full body, face visible, editorial lifestyle',
    icon: '🧑‍🎨',
    framingDirective: `MANDATORY FRAMING: Full body editorial lifestyle shot. The model's full body INCLUDING face is visible.
Can be shot from further away to include more environment. The model exists naturally within the moodboard's world.
Expression is natural, authentic — never forced or overly posed. The model LIVES in this scene.
The footwear must remain clearly visible and identifiable. The outfit and scene support the product story.
Camera can be slightly wider to capture environmental context and atmosphere.`,
  },
];

// ===== ADVANCED SETTINGS OPTIONS =====

export interface AdvancedOption {
  value: string;
  label: string;
  promptFragment: string;
}

export const cameraAngleOptions: AdvancedOption[] = [
  { value: 'eye-level', label: 'Eye Level', promptFragment: 'shot at eye level, neutral perspective' },
  { value: 'low-angle', label: 'Low Angle', promptFragment: 'shot from a low angle looking up, dramatic perspective' },
  { value: 'high-angle', label: 'High Angle', promptFragment: 'shot from above at a high angle, looking down at the subject' },
  { value: 'dutch-angle', label: 'Dutch Angle', promptFragment: 'shot with a slight dutch angle tilt for dynamic tension' },
  { value: 'over-shoulder', label: 'Over-the-Shoulder', promptFragment: 'shot over-the-shoulder, intimate perspective' },
  { value: 'birds-eye', label: "Bird's Eye", promptFragment: "shot from directly above, bird's eye view looking straight down" },
];

export const lightingOptions: AdvancedOption[] = [
  { value: 'natural', label: 'Natural / Ambient', promptFragment: 'natural ambient lighting, soft and organic' },
  { value: 'studio-softbox', label: 'Studio Softbox', promptFragment: 'professional studio softbox lighting, even and controlled' },
  { value: 'golden-hour', label: 'Golden Hour', promptFragment: 'warm golden hour lighting, long shadows, honey-toned warmth' },
  { value: 'dramatic-side', label: 'Dramatic Side Light', promptFragment: 'dramatic side lighting, strong shadows, chiaroscuro mood' },
  { value: 'backlit', label: 'Backlit', promptFragment: 'backlit with rim light, silhouette edges glowing' },
  { value: 'diffused-overcast', label: 'Diffused Overcast', promptFragment: 'soft diffused overcast lighting, no harsh shadows, even tone' },
];

export const cameraLensOptions: AdvancedOption[] = [
  { value: '85mm', label: '85mm Portrait', promptFragment: 'shot on 85mm lens, beautiful bokeh, natural compression' },
  { value: '50mm', label: '50mm Standard', promptFragment: 'shot on 50mm lens, natural field of view, minimal distortion' },
  { value: '35mm', label: '35mm Wide', promptFragment: 'shot on 35mm wide lens, environmental context visible' },
  { value: '135mm', label: '135mm Telephoto', promptFragment: 'shot on 135mm telephoto, compressed background, creamy bokeh' },
  { value: '24mm', label: '24mm Ultra-Wide', promptFragment: 'shot on 24mm ultra-wide, expansive environmental framing' },
  { value: 'macro', label: 'Macro', promptFragment: 'macro photography, extreme close-up detail, shallow depth of field' },
];

export const cameraTypeOptions: AdvancedOption[] = [
  { value: 'digital', label: 'Digital', promptFragment: 'shot on high-end digital camera, crisp detail, accurate color' },
  { value: 'medium-format', label: 'Medium Format Film', promptFragment: 'shot on medium format film, rich tonality, organic grain, luxurious depth' },
  { value: '35mm-film', label: '35mm Film', promptFragment: 'shot on 35mm film, authentic grain, analog warmth' },
];

export const filmStockOptions: AdvancedOption[] = [
  { value: 'none', label: 'None / Digital', promptFragment: '' },
  { value: 'portra-400', label: 'Kodak Portra 400', promptFragment: 'Kodak Portra 400 color rendition, warm skin tones, soft pastels, fine grain' },
  { value: 'fuji-400h', label: 'Fuji Pro 400H', promptFragment: 'Fuji Pro 400H look, muted greens, cool highlights, delicate grain' },
  { value: 'ektar-100', label: 'Kodak Ektar 100', promptFragment: 'Kodak Ektar 100 look, vivid saturated colors, ultra-fine grain, punchy contrast' },
  { value: 'hp5', label: 'Ilford HP5 B&W', promptFragment: 'Ilford HP5 black and white, rich tonal range, visible grain, timeless monochrome' },
  { value: 'cinestill-800t', label: 'CineStill 800T', promptFragment: 'CineStill 800T look, tungsten-balanced, halation glow around highlights, cinematic' },
];

// Get the prompt fragment for a given advanced setting
export function getAdvancedPromptFragments(settings: LifestyleAdvancedSettings): string[] {
  const fragments: string[] = [];
  
  const angle = cameraAngleOptions.find(o => o.value === settings.cameraAngle);
  if (angle) fragments.push(angle.promptFragment);
  
  const lighting = lightingOptions.find(o => o.value === settings.lighting);
  if (lighting) fragments.push(lighting.promptFragment);
  
  const lens = cameraLensOptions.find(o => o.value === settings.cameraLens);
  if (lens) fragments.push(lens.promptFragment);
  
  const camera = cameraTypeOptions.find(o => o.value === settings.cameraType);
  if (camera) fragments.push(camera.promptFragment);
  
  const film = filmStockOptions.find(o => o.value === settings.filmStock);
  if (film && film.promptFragment) fragments.push(film.promptFragment);
  
  return fragments.filter(Boolean);
}
