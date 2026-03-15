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
    name: 'On Foot',
    description: 'On-foot, environmental — shoes and the ground they walk on',
    icon: '👟',
    framingDirective: `MANDATORY FRAMING: Environmental on-foot shot, cropped from mid-calf down. NEVER show above the knee.
Exactly 2 shoes visible (one pair, worn on feet). But this is NOT a clinical product crop — the framing is WIDER than typical shoe photography. You see generous ground/surface area, the environment, the light. The shoes occupy roughly 40-50% of the frame.
STANCE: Natural and unstudied — feet slightly apart, one foot casually forward, or ankles loosely crossed. Weight shifted to one side. Never stiff, symmetrical, or posed. The person is mid-moment: standing in conversation, pausing on a walk, waiting at a doorway.
GROUND SURFACE IS A CHARACTER: The surface beneath the shoes tells its own story — sun-warmed cobblestones, wet sand at the water's edge, worn wooden deck boards, terrazzo tiles, wild grass, cracked stone steps, terracotta tiles, gravel paths. The surface must belong to the moodboard's world and have visible texture and character.
SKIN & STYLING: Real skin — visible tan lines, freckles, natural imperfections. For sandals: bare ankles are standard. For closed-toe styles: rolled-up linen trousers or raw-hem denim cuffs. Never formal pants or pristine styling.
LIGHT: Natural environmental light hits the shoes AND the ground equally — dappled sunlight through foliage, long afternoon shadows stretching across stone, window light falling across interior floors. Shadow patterns are part of the composition.
The shoes look WORN and BELONGING — they are this person's shoes, in this person's life. Not box-fresh, not a product shot. The overall feeling is intimate, grounded, Mediterranean warmth.`,
  },
  {
    id: 'model-no-head',
    name: 'Body & Style',
    description: 'Chin-down crop — outfit, hands, posture, and shoes tell the story',
    icon: '🧍',
    framingDirective: `MANDATORY FRAMING: Full body shot with the head CROPPED OUT. The frame cuts off ABOVE THE CHIN — the model's face, eyes, and top of head are NEVER visible. This crop must feel INTENTIONAL and compositionally elegant, not accidental.
Show the model from roughly chin level down to feet. The model occupies 50-70% of the frame — environment is always present and contextual.
OUTFIT & TEXTURE: Clothing is relaxed, layered, and richly textured — linen shirts, cotton dresses, soft knits, denim, draped scarves, wool coats. Fabrics have visible weave and movement. NEVER formal, corporate, or catalog-stiff. Mediterranean/European sensibility in styling.
HANDS ARE STORYTELLERS: Hands must be visible and doing something natural — holding a ceramic coffee cup, resting on a weathered railing, tucked into trouser pockets, adjusting a hat brim, carrying a linen tote, touching a stone wall. Hands are never hidden or awkwardly cropped.
BODY LANGUAGE: The model's posture tells the story — leaning against a sun-warmed doorframe, mid-stride on a narrow European street, sitting on stone steps with legs casually extended, standing at a market stall, resting against a wall with one knee bent. Weight is always shifted naturally, never symmetrical.
ENVIRONMENT: Architectural or natural context frames the model — doorways, arched passages, staircases, garden walls, café terraces, studio interiors, kitchen counters. The setting has texture, age, and character.
FOOTWEAR ANCHOR: The shoes are the compositional anchor — clearly visible, sharp, and grounding the entire image. The eye travels from outfit down to footwear naturally. The shoes must be identifiable and precisely rendered.`,
  },
  {
    id: 'full-model',
    name: 'Portrait in Place',
    description: 'Full editorial portrait — a person in their world, Birkenstock at their feet',
    icon: '🧑‍🎨',
    framingDirective: `MANDATORY FRAMING: Full body editorial portrait. The model's full body INCLUDING face is visible. This is a DOCUMENTARY PORTRAIT, not a fashion advertisement.
ENVIRONMENTAL DOMINANCE: The model occupies only 30-50% of the frame. The place, the mood, the light — these dominate. Wider framing that establishes a complete world. The viewer should feel they could step into this scene.
EXPRESSION & PRESENCE: The model's expression is contemplative, genuine, mid-moment — caught in thought, mid-conversation, simply being still. A half-smile, a distant gaze, eyes closed in sunlight. NEVER performative, never "modeling." The person is unaware of or unbothered by the camera.
AUTHENTIC ACTIVITIES: The model is engaged in real rituals — morning tea on a terrace, reading in a courtyard, walking a coastal path, working at a studio table, arranging flowers, cooking, sitting with friends. These moments feel caught, not staged.
STYLING AS IDENTITY: Clothing feels personal, eclectic, layered with meaning — a vintage jacket over a simple dress, mismatched textures, lived-in denim, a meaningful accessory. The outfit belongs to THIS person. Never catalog-styled or overly coordinated.
CASTING DIRECTION: Real people with real personal style — creatives, artisans, thinkers. Diverse body types, ages, ethnicities. Natural beauty, visible character, authentic presence. Never generic commercial models.
BIRKENSTOCK PRESENCE: The footwear is visible and identifiable but NEVER the forced focal point. The shoes belong to this person as naturally as their favorite sweater. They're part of the story, not the headline.
The final image should feel like a portrait by Juergen Teller or Talia Chetrit — intimate, warm, slightly imperfect, deeply human. A documentary moment, not a campaign pose.`,
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
