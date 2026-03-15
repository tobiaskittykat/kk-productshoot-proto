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
SURFACE: The shoes sit on a contextual surface that belongs to the moodboard's world. The surface must have visible texture and character.
PROPS: Include 1-2 small contextual objects nearby that suggest a lived moment. These props must be drawn from the moodboard's aesthetic — do NOT default to generic items. Props feel naturally placed, not art-directed.
CAMERA: Three-quarter overhead (30-45° looking down) is the primary angle, showing the iconic footbed silhouette. Full overhead and low eye-level are secondary options.
LIGHT: Natural environmental light with real shadows and depth. The specific quality of light (warm, cool, hard, soft, dappled, flat) must match the moodboard's world.
The background environment extends into soft focus, establishing depth and atmosphere.
ALL AESTHETIC CHOICES — surface material, prop selection, color temperature, atmosphere — must be derived from the moodboard. Do NOT default to any specific geographic or cultural look.`,
  },
  {
    id: 'feet-focus',
    name: 'On Foot',
    description: 'On-foot, environmental — shoes and the ground they walk on',
    icon: '👟',
    framingDirective: `MANDATORY FRAMING: Environmental on-foot shot, cropped from mid-calf down. NEVER show above the knee.
Exactly 2 shoes visible (one pair, worn on feet). The framing is WIDER than typical shoe photography — generous ground/surface area visible, environmental context present. The shoes occupy roughly 40-50% of the frame.
STANCE: Natural and unstudied — feet slightly apart, one foot casually forward, or ankles loosely crossed. Weight shifted to one side. Never stiff, symmetrical, or posed. The person is mid-moment.
GROUND SURFACE IS A CHARACTER: The surface beneath the shoes tells its own story and must be drawn entirely from the moodboard's world. It must have visible texture and character — never a flat or generic surface.
SKIN & STYLING: Real skin — visible tan lines, freckles, natural imperfections. For sandals: bare ankles. For closed-toe: rolled-up trousers or raw-hem cuffs. Styling details (fabric, color) must match the moodboard.
LIGHT: Natural environmental light hits the shoes AND the ground equally. Shadow patterns are part of the composition. The quality of light must match the moodboard's mood.
The shoes look WORN and BELONGING — they are this person's shoes, in this person's life. Not box-fresh.
ALL AESTHETIC CHOICES — ground surface, environmental context, lighting quality, color palette — come from the moodboard. The shot type defines only the compositional crop and stance.`,
  },
  {
    id: 'model-no-head',
    name: 'Body & Style',
    description: 'Chin-down crop — outfit, hands, posture, and shoes tell the story',
    icon: '🧍',
    framingDirective: `MANDATORY FRAMING: Full body shot with the head CROPPED OUT. The frame cuts off ABOVE THE CHIN — the model's face, eyes, and top of head are NEVER visible. This crop must feel INTENTIONAL and compositionally elegant, not accidental.
Show the model from roughly chin level down to feet. The model occupies 50-70% of the frame — environment is always present and contextual.
OUTFIT & TEXTURE: Clothing is relaxed, layered, and richly textured. Fabrics have visible weave and movement. NEVER formal, corporate, or catalog-stiff. The specific outfit style, colors, and fabrics must reflect the moodboard's aesthetic world.
HANDS ARE STORYTELLERS: Hands must be visible and doing something natural — holding an object, resting on a surface, tucked into pockets, adjusting clothing. Hands are never hidden or awkwardly cropped. The activity must feel contextual to the moodboard's world.
BODY LANGUAGE: The model's posture tells the story — leaning, mid-stride, sitting, standing with weight shifted. Always natural, never symmetrical or posed.
ENVIRONMENT: Architectural or natural context frames the model. The setting must match the moodboard's world and have texture, depth, and character.
FOOTWEAR ANCHOR: The shoes are the compositional anchor — clearly visible, sharp, and grounding the entire image. The eye travels from outfit down to footwear naturally.
ALL AESTHETIC CHOICES — outfit styling, environment, color palette, lighting — must reflect the moodboard's world. Do NOT default to any specific cultural or geographic look.`,
  },
  {
    id: 'full-model',
    name: 'Portrait in Place',
    description: 'Full editorial portrait — a person in their world, footwear at their feet',
    icon: '🧑‍🎨',
    framingDirective: `MANDATORY FRAMING: Full body editorial portrait. The model's full body INCLUDING face is visible. This is a DOCUMENTARY PORTRAIT, not a fashion advertisement.
ENVIRONMENTAL DOMINANCE: The model occupies only 30-50% of the frame. The place, the mood, the light — these dominate. Wider framing that establishes a complete world.
EXPRESSION & PRESENCE: The model's expression is contemplative, genuine, mid-moment — caught in thought, mid-conversation, simply being still. NEVER performative, never "modeling." The person is unaware of or unbothered by the camera.
AUTHENTIC ACTIVITIES: The model is engaged in a real, quiet activity that feels caught rather than staged. The specific activity must be contextual to the moodboard's world.
STYLING AS IDENTITY: Clothing feels personal, eclectic, layered with meaning. The outfit belongs to THIS person. Never catalog-styled or overly coordinated. Colors and textures must match the moodboard's palette.
CASTING DIRECTION: Real people with real personal style — diverse body types, ages, ethnicities. Natural beauty, visible character, authentic presence.
FOOTWEAR PRESENCE: The footwear is visible and identifiable but NEVER the forced focal point. The shoes belong to this person as naturally as their favorite jacket.
The entire scene — setting, activity, styling, light, color, atmosphere — is defined by the moodboard. The shot type defines only the compositional structure (full body, face visible, environmental portrait).`,
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

// ===== STYLED STILL LIFE COMPOSITIONAL VARIATIONS =====
// Randomly selected when advanced settings are all on "Auto" to inject editorial variety

export interface StillLifeVariation {
  id: string;
  name: string;
  framingOverride: string;
}

export const styledStillLifeVariations: StillLifeVariation[] = [
  {
    id: 'ground-level-hero',
    name: 'Ground-Level Hero',
    framingOverride: `COMPOSITIONAL RECIPE — Ground-Level Hero:
Camera at GROUND LEVEL, lens nearly touching the surface. One shoe razor-sharp in the foreground, the second shoe behind it in soft focus. Ultra-shallow depth of field (f/1.4–2.0). The perspective is intimate and voyeuristic — as if discovered rather than arranged. The surface texture dominates the lower third of the frame. Light rakes across the ground, catching material texture and buckle hardware.`,
  },
  {
    id: 'steep-overhead-flat-lay',
    name: 'Steep Overhead Flat Lay',
    framingOverride: `COMPOSITIONAL RECIPE — Steep Overhead Flat Lay:
Camera DIRECTLY ABOVE, near-vertical bird's-eye view. Shoes arranged ASYMMETRICALLY — one rotated 30°, the other at 90° — with bold negative space between them. Deep focus (f/8–11) so everything reads as a graphic composition. The arrangement feels like an editorial flat lay in a design magazine — deliberate but not fussy. Surface pattern and texture become the background. Props (if any) placed with graphic intent.`,
  },
  {
    id: 'environmental-wide',
    name: 'Environmental Wide',
    framingOverride: `COMPOSITIONAL RECIPE — Environmental Wide:
The shoes are SMALL in the frame — occupying only 15–20% of the image. The ENVIRONMENT is the hero. Shot on a wide lens (28–35mm feel), the scene stretches out to reveal the full world the shoes inhabit. Deep focus. The shoes sit naturally within a larger landscape or interior — on a step, beside a doorway, at the edge of a path. The viewer's eye finds them within the scene. This is storytelling through place.`,
  },
  {
    id: 'footbed-reveal',
    name: 'Footbed Reveal',
    framingOverride: `COMPOSITIONAL RECIPE — Footbed Reveal:
One shoe is deliberately placed ON ITS SIDE, exposing the iconic cork-latex anatomical footbed. The other shoe sits upright beside or behind it. Three-quarter angle (40–50°). The focus is on MATERIAL TEXTURE — the grain of the cork, the suede nap, the stitching detail. Moderate depth of field (f/4–5.6). This is a material study: the craft and construction are the story. Light falls to emphasize surface relief and depth.`,
  },
  {
    id: 'edge-composition',
    name: 'Edge Composition',
    framingOverride: `COMPOSITIONAL RECIPE — Edge Composition:
The shoes are placed at the EXTREME EDGE or CORNER of the frame — 70%+ of the image is environment and negative space. This is unconventional, fashion-forward framing. The shoes anchor one edge while the moodboard's world fills the rest. Eye-level or slightly low angle. The tension between subject and space creates editorial energy. The composition would feel at home in a gallery or an avant-garde fashion spread.`,
  },
  {
    id: 'morning-light-drama',
    name: 'Morning Light Drama',
    framingOverride: `COMPOSITIONAL RECIPE — Morning Light Drama:
Low RAKING LIGHT streams in from the side, casting LONG dramatic shadows that become compositional elements in their own right. The shadows of the shoes stretch across the surface, creating abstract shapes. The light catches buckle hardware, creating small bright highlights. Three-quarter angle. The interplay of light and shadow is the co-star — the shoes exist in a moment of specific, transient light. Early morning or late afternoon quality.`,
  },
  {
    id: 'macro-detail-in-context',
    name: 'Macro Detail in Context',
    framingOverride: `COMPOSITIONAL RECIPE — Macro Detail in Context:
TIGHT CROP on one shoe's details — the buckle mechanism, stitching pattern, suede texture, or the branded logo stamp. Ultra-shallow depth of field (f/1.4–2.0). The second shoe and surrounding environment exist as soft bokeh shapes in the background, providing context without competing for attention. Shot on a macro or 85mm+ lens. This is the editorial insert shot — the detail that makes the viewer lean in. The texture must be tactile and almost touchable.`,
  },
  {
    id: 'deconstructed-pair',
    name: 'Deconstructed Pair',
    framingOverride: `COMPOSITIONAL RECIPE — Deconstructed Pair:
One shoe is casually TIPPED ON ITS SIDE or FALLEN — straps relaxed, buckle unlatched. The other sits upright but at an angle, as if both were just kicked off mid-moment. The arrangement is deliberately ANTI-CATALOG — messy, human, real. Moderate depth of field. The energy is "end of day" or "just arrived" — the shoes tell the story of someone who was just here. Nothing is art-directed; everything looks naturally abandoned.`,
  },
  {
    id: 'layered-depth',
    name: 'Layered Depth',
    framingOverride: `COMPOSITIONAL RECIPE — Layered Depth:
Three distinct DEPTH PLANES: a foreground element (prop, surface edge, fabric fold) slightly out of focus, the shoes tack-sharp in the mid-ground, and the environment falling away into soft bokeh in the background. Shot on 85–135mm lens feel, compressing the planes together. The layered depth creates dimensionality and atmosphere. The shoes are sandwiched between context layers — embedded in their world, not isolated from it.`,
  },
  {
    id: 'shadow-play',
    name: 'Shadow Play',
    framingOverride: `COMPOSITIONAL RECIPE — Shadow Play:
Strong directional light creates a PATTERN of shadows across the scene — from window blinds, foliage, architectural elements, or fabric. The shadow pattern falls across both the shoes and the surface, unifying them into a single graphic composition. The shadows become a design element as important as the shoes themselves. High contrast. The interplay of light and dark creates visual rhythm and editorial sophistication.`,
  },
];

/**
 * Returns true if all advanced settings are on "Auto" (no manual overrides).
 */
export function areAllSettingsAuto(settings: LifestyleAdvancedSettings): boolean {
  return (
    settings.cameraAngle === 'auto' &&
    settings.lighting === 'auto' &&
    settings.cameraLens === 'auto' &&
    settings.cameraType === 'auto' &&
    settings.filmStock === 'auto' &&
    settings.depthOfField === 'auto'
  );
}

/**
 * Randomly select a still life variation from the pool.
 */
export function pickRandomStillLifeVariation(): StillLifeVariation {
  const idx = Math.floor(Math.random() * styledStillLifeVariations.length);
  return styledStillLifeVariations[idx];
}

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
