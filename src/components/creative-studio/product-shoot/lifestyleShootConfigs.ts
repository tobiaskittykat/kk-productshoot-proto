// ============= LIFESTYLE SHOOT CONFIGURATIONS =============
// Shot types, advanced settings options, and Birkenstock-optimized defaults

import type { LifestyleShootShotType, LifestyleAdvancedSettings } from './types';

// ===== SHOT TYPE DEFINITIONS =====

export interface LifestyleShootType {
  id: LifestyleShootShotType;
  name: string;
  description: string;
  icon: string;
  framingDirective: string;
}

export const lifestyleShootTypes: LifestyleShootType[] = [
  {
    id: 'product-only',
    name: 'Styled Still Life',
    description: 'Editorial still life — pair of shoes styled in their world with props and natural light',
    icon: '🎯',
    framingDirective: `MANDATORY FRAMING: Editorial lifestyle still life. NO model, NO hands, NO feet visible.
Show a COMPLETE PAIR of shoes (2 shoes). Arrange them casually staggered or slightly overlapping — as if someone just stepped out of them. NEVER perfectly aligned or studio-arranged.
The shoes occupy roughly 30-40% of the frame. The surrounding environment tells the story — wider framing that establishes the world.
SURFACE: The shoes sit on a contextual surface that belongs to the moodboard's world — sun-warmed stone steps, weathered wooden floor, terrazzo, sandy terrain, linen fabric, marble counter. Never a flat studio backdrop.
PROPS: Include 1-2 small contextual objects nearby that suggest a lived moment — a coffee cup, open book, sunglasses, folded towel, dried botanicals, a straw hat, a magazine. These props feel naturally placed, not art-directed.
CAMERA: Three-quarter overhead (30-45° looking down) is the primary angle, showing the iconic footbed silhouette. Full overhead and low eye-level are secondary options.
LIGHT: Natural environmental light — dappled sunlight through foliage, window light with real shadows, golden hour warmth across the surface. Never flat or artificially even.
The background environment extends into soft focus, establishing depth and atmosphere. The overall feeling is effortless, lived-in, Mediterranean warmth.`,
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

// --- Camera Angle (10 options) ---
export const cameraAngleOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto', promptFragment: '' },
  { value: 'eye-level', label: 'Eye Level', promptFragment: 'shot at eye level, neutral perspective' },
  { value: 'low-angle', label: 'Low Angle', promptFragment: 'shot from a low angle looking up, dramatic perspective' },
  { value: 'high-angle', label: 'High Angle', promptFragment: 'shot from above at a high angle, looking down at the subject' },
  { value: 'dutch-angle', label: 'Dutch Angle', promptFragment: 'shot with a slight dutch angle tilt for dynamic tension' },
  { value: 'over-shoulder', label: 'Over-the-Shoulder', promptFragment: 'shot over-the-shoulder, intimate perspective' },
  { value: 'birds-eye', label: "Bird's Eye", promptFragment: "shot from directly above, bird's eye view looking straight down" },
  { value: 'worms-eye', label: "Worm's Eye", promptFragment: "shot from ground level looking up, worm's eye view, dramatic low perspective" },
  { value: 'three-quarter', label: 'Three-Quarter', promptFragment: 'shot at a three-quarter angle, 45-degree perspective combining frontal and side view' },
  { value: 'profile', label: 'Profile / Side', promptFragment: 'shot in strict profile, side-on perspective, clean silhouette' },
];

// --- Lighting (12 options) ---
export const lightingOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto', promptFragment: '' },
  { value: 'natural', label: 'Natural / Ambient', promptFragment: 'natural ambient lighting, soft and organic' },
  { value: 'golden-hour', label: 'Golden Hour', promptFragment: 'warm golden hour lighting, long shadows, honey-toned warmth' },
  { value: 'blue-hour', label: 'Blue Hour', promptFragment: 'cool blue hour twilight lighting, soft indigo tones, ethereal quality' },
  { value: 'diffused-overcast', label: 'Diffused Overcast', promptFragment: 'soft diffused overcast lighting, no harsh shadows, even tone' },
  { value: 'hard-direct', label: 'Hard Direct Sun', promptFragment: 'hard direct sunlight, sharp defined shadows, high contrast' },
  { value: 'studio-softbox', label: 'Studio Softbox', promptFragment: 'professional studio softbox lighting, even and controlled' },
  { value: 'rembrandt', label: 'Rembrandt', promptFragment: 'Rembrandt lighting, triangular highlight on shadowed cheek, dramatic painterly quality' },
  { value: 'split', label: 'Split Light', promptFragment: 'split lighting, half the subject illuminated half in shadow, dramatic contrast' },
  { value: 'rim', label: 'Rim / Edge Light', promptFragment: 'rim lighting from behind, glowing edges defining the silhouette, backlit halo effect' },
  { value: 'butterfly', label: 'Butterfly / Paramount', promptFragment: 'butterfly lighting from above and centered, sculpted shadows under nose and chin, glamorous' },
  { value: 'practical', label: 'Practical / Available', promptFragment: 'practical available light only, using existing scene light sources, authentic and naturalistic' },
];

// --- Camera Lens (10 options) ---
export const cameraLensOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto', promptFragment: '' },
  { value: '24mm', label: '24mm Wide', promptFragment: 'shot on 24mm wide-angle lens, expansive environmental context, slight barrel distortion' },
  { value: '28mm', label: '28mm', promptFragment: 'shot on 28mm lens, wide environmental framing, natural reportage feel' },
  { value: '35mm', label: '35mm', promptFragment: 'shot on 35mm lens, classic documentary perspective, natural field of view' },
  { value: '50mm', label: '50mm Standard', promptFragment: 'shot on 50mm lens, closest to human vision, minimal distortion, honest rendering' },
  { value: '85mm', label: '85mm Portrait', promptFragment: 'shot on 85mm lens, classic portrait compression, beautiful bokeh separation' },
  { value: '105mm', label: '105mm', promptFragment: 'shot on 105mm lens, flattering compression, smooth background separation' },
  { value: '135mm', label: '135mm Telephoto', promptFragment: 'shot on 135mm telephoto, compressed background planes, creamy bokeh, intimate framing' },
  { value: '200mm', label: '200mm Telephoto', promptFragment: 'shot on 200mm telephoto, heavily compressed perspective, extreme background blur, voyeuristic intimacy' },
  { value: 'macro-100', label: 'Macro 100mm', promptFragment: 'shot on 100mm macro lens, extreme close-up detail, razor-thin focus plane, revealing textures' },
];

// --- Camera Type (7 options) ---
export const cameraTypeOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto', promptFragment: '' },
  { value: 'digital-ff', label: 'Digital Full-Frame', promptFragment: 'shot on full-frame digital camera, crisp detail, accurate color, modern rendering' },
  { value: 'digital-mf', label: 'Digital Medium Format', promptFragment: 'shot on digital medium format, extraordinary tonal depth, ultra-high resolution, luxurious rendering' },
  { value: '35mm-film', label: '35mm Film', promptFragment: 'shot on 35mm film camera, authentic grain structure, analog warmth, organic tonal rolloff' },
  { value: 'mf-film-67', label: 'Medium Format Film (6×7)', promptFragment: 'shot on medium format 6x7 film, rich tonality, fine organic grain, luxurious depth and dimensionality' },
  { value: 'large-format', label: 'Large Format (4×5)', promptFragment: 'shot on large format 4x5 camera, extraordinary detail, tilt-shift selective focus, monumental clarity' },
  { value: 'polaroid', label: 'Polaroid / Instant', promptFragment: 'shot on Polaroid instant film, soft pastel color shifts, dreamy imperfections, white border framing' },
];

// --- Film Stock (12 options) ---
export const filmStockOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto / Digital', promptFragment: '' },
  { value: 'portra-160', label: 'Kodak Portra 160', promptFragment: 'Kodak Portra 160 rendition, ultra-fine grain, subtle pastel tones, pristine skin rendering' },
  { value: 'portra-400', label: 'Kodak Portra 400', promptFragment: 'Kodak Portra 400 rendition, warm skin tones, soft pastels, fine grain, editorial standard' },
  { value: 'portra-800', label: 'Kodak Portra 800', promptFragment: 'Kodak Portra 800 rendition, visible organic grain, warm tones pushed in low light, photojournalistic texture' },
  { value: 'ektar-100', label: 'Kodak Ektar 100', promptFragment: 'Kodak Ektar 100 rendition, vivid saturated colors, ultra-fine grain, punchy contrast, hyper-real color' },
  { value: 'fuji-400h', label: 'Fuji Pro 400H', promptFragment: 'Fuji Pro 400H rendition, muted greens, cool pastel highlights, delicate grain, ethereal quality' },
  { value: 'velvia-50', label: 'Fuji Velvia 50 (Slide)', promptFragment: 'Fuji Velvia 50 slide film, extreme color saturation, deep blacks, vivid reds and greens, dramatic transparency' },
  { value: 'tri-x-400', label: 'Kodak Tri-X 400 B&W', promptFragment: 'Kodak Tri-X 400 black and white, gritty classic grain, deep blacks, rich midtone contrast, iconic monochrome' },
  { value: 'hp5', label: 'Ilford HP5 Plus B&W', promptFragment: 'Ilford HP5 Plus black and white, smooth tonal range, moderate grain, versatile monochrome' },
  { value: 'delta-3200', label: 'Ilford Delta 3200 B&W', promptFragment: 'Ilford Delta 3200 black and white, heavy atmospheric grain, extreme low-light capability, raw moody monochrome' },
  { value: 'cinestill-800t', label: 'CineStill 800T', promptFragment: 'CineStill 800T, tungsten-balanced, halation glow around highlights, cinematic color cast, nighttime magic' },
  { value: 'lomo-800', label: 'Lomography 800', promptFragment: 'Lomography 800 color negative, oversaturated colors, heavy grain, experimental vignetting, lo-fi analog energy' },
];

// --- Depth of Field (6 options, NEW) ---
export const depthOfFieldOptions: AdvancedOption[] = [
  { value: 'auto', label: 'Auto', promptFragment: '' },
  { value: 'ultra-shallow', label: 'Ultra Shallow (f/1.2–1.4)', promptFragment: 'ultra-shallow depth of field at f/1.2-1.4, razor-thin focus plane, extreme bokeh, dreamlike separation' },
  { value: 'shallow', label: 'Shallow (f/1.8–2.8)', promptFragment: 'shallow depth of field at f/1.8-2.8, subject isolated from background, beautiful bokeh circles' },
  { value: 'moderate', label: 'Moderate (f/4–5.6)', promptFragment: 'moderate depth of field at f/4-5.6, subject sharp with gently softened background, balanced separation' },
  { value: 'deep', label: 'Deep (f/8–11)', promptFragment: 'deep depth of field at f/8-11, sharp from foreground to mid-ground, environmental context preserved' },
  { value: 'maximum', label: 'Maximum (f/16–22)', promptFragment: 'maximum depth of field at f/16-22, everything tack-sharp from near to infinity, architectural precision' },
];

// Get the prompt fragment for a given advanced setting
export function getAdvancedPromptFragments(settings: LifestyleAdvancedSettings): string[] {
  const fragments: string[] = [];
  
  const findFragment = (options: AdvancedOption[], value: string) => {
    const opt = options.find(o => o.value === value);
    if (opt && opt.promptFragment) fragments.push(opt.promptFragment);
  };

  findFragment(cameraAngleOptions, settings.cameraAngle);
  findFragment(lightingOptions, settings.lighting);
  findFragment(cameraLensOptions, settings.cameraLens);
  findFragment(cameraTypeOptions, settings.cameraType);
  findFragment(filmStockOptions, settings.filmStock);
  findFragment(depthOfFieldOptions, settings.depthOfField);
  
  return fragments;
}
