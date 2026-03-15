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
    framingDirective: `MANDATORY FRAMING: Environmental on-foot shot. Crop isolates feet and lower legs — exact framing adapts to the pose (standing, seated, dangling, resting). NEVER show above the knee.
Exactly 2 shoes visible (one pair, worn on feet). The framing is WIDER than typical shoe photography — generous environmental context present. The shoes occupy roughly 40-50% of the frame.
POSE: The pose is caught mid-life. The person may be standing, seated, dangling feet off a ledge, resting with feet propped, or tucked on the ground. The feet are doing what feet do when no one's watching — weight distributed unevenly, naturally. The person is mid-moment, not posing for a shoe photograph.
ANTI-GENERIC: NEVER two feet parallel facing camera. NEVER symmetrical framing. NEVER a clean, centered, catalog-style shoe crop.
SURFACE AS CO-CHARACTER: The surface the feet relate to — ground, ledge edge, railing, dashboard, air beneath dangling feet — has its own story, its own texture. It's not a backdrop — it's a co-protagonist. The moodboard defines what that surface looks like and what world it belongs to. The camera respects the surface as much as the shoes.
SKIN & STYLING: Real skin — visible tan lines, freckles, natural imperfections. For sandals: bare ankles. For closed-toe: rolled-up trousers or raw-hem cuffs. Styling details (fabric, color) must match the moodboard.
LIGHT: Natural environmental light hits the shoes AND the surface equally. Shadow patterns are part of the composition. The quality of light must match the moodboard's mood.
FOOTWEAR — LIVED IN: The shoes look WORN and BELONGING — molded to this person's feet, bearing the patina of real wear. They are this person's shoes, in this person's life. Not box-fresh. Not pristine.
ALL AESTHETIC CHOICES — surfaces, environmental context, lighting quality, color palette — come from the moodboard. The shot type defines only the compositional crop and energy.`,
  },
  {
    id: 'model-no-head',
    name: 'Body & Style',
    description: 'Chin-down crop — outfit, hands, posture, and shoes tell the story',
    icon: '🧍',
    framingDirective: `MANDATORY FRAMING: Full body shot with the head CROPPED OUT. The frame cuts off ABOVE THE CHIN — the model's face, eyes, and top of head are NEVER visible. This crop must feel like a deliberate FRAGMENT — as if the photographer aimed higher but the subject shifted, or the crop was chosen in the edit to isolate gesture over face.
Show the model from roughly chin level down to feet. The model occupies 50-70% of the frame — environment is always present and contextual.
ANTI-GENERIC: NEVER a clean symmetrical outfit shot. NEVER hands hidden or out of frame. NEVER the model standing straight and centered. NEVER catalog-fresh clothing.
HANDS AS SECOND PROTAGONIST: Hands reveal habit and personality — the unconscious gestures people make when they're absorbed in something. The hands are doing something REAL: fidgeting, gripping, holding, adjusting, resting with weight. What they do must feel contextual to the moodboard's world. Hands are NEVER hidden.
CLOTHING HAS HISTORY: Clothing is relaxed, layered, and LIVED IN — stretched collars, rolled sleeves that stay rolled, fabrics that have been washed and softened. The outfit belongs to THIS person. Never catalog-styled, never coordinated, never pristine. The specific outfit style, colors, and fabrics must reflect the moodboard's aesthetic world.
BODY LANGUAGE: The model's posture tells the story — leaning, mid-stride, sitting, weight off-center. Always natural, always asymmetric. The body has found its own arrangement based on comfort and context, not direction.
ENVIRONMENT: Architectural or natural context frames the model. The setting must match the moodboard's world and have texture, depth, and character.
FOOTWEAR — INCIDENTAL ANCHOR: The shoes are visible at the bottom of the frame but are NOT the compositional hero. The eye is drawn to hands, texture, posture FIRST — then travels down to discover the footwear. The shoes look lived-in and belonging. Never the focal point, always contextually present.
ALL AESTHETIC CHOICES — outfit styling, environment, color palette, lighting — must reflect the moodboard's world. Do NOT default to any specific cultural or geographic look.`,
  },
  {
    id: 'full-model',
    name: 'Portrait in Place',
    description: 'Full editorial portrait — a person in their world, footwear at their feet',
    icon: '🧑‍🎨',
    framingDirective: `MANDATORY FRAMING: Full body editorial portrait. The model's full body INCLUDING face is visible. This is a DOCUMENTARY PORTRAIT — caught, not directed. Think Jack Davison, not catalog.
ENVIRONMENTAL DOMINANCE: The model occupies only 30-50% of the frame. The place, the mood, the light — these dominate. Wider framing that establishes a complete world.
CAUGHT BETWEEN MOMENTS: The model is in a TRANSITIONAL STATE — arriving, leaving, pausing mid-task, turning toward something. There is movement-energy even in stillness. NEVER settled, NEVER performative, NEVER "modeling." The person has somewhere to be, or just came from somewhere. The camera caught them, not the other way around.
ANTI-GENERIC RULES: NEVER standing straight facing camera. NEVER hands at sides. NEVER centered symmetrically in frame. NEVER a neutral expression looking into lens.
PHYSICAL EASE: The body has surrendered to gravity — weight given to whatever surface is available. Limbs arranged by comfort, not aesthetics. Slouching, leaning, folding into the environment. The person's posture is a RESPONSE to their specific environment — how you sit on warm stone is different from how you lean against cold metal. The moodboard's world determines the physical vocabulary.
STYLING AS IDENTITY: Clothing feels personal, eclectic, layered with meaning. The outfit belongs to THIS person — lived-in, not styled. Never catalog-coordinated. Colors and textures must match the moodboard's palette.
CASTING DIRECTION: Real people with real personal style — diverse body types, ages, ethnicities. Natural beauty, visible character, authentic presence.
FOOTWEAR — INCIDENTAL, NEVER FEATURED: The shoes are visible but NEVER the focal point. They look LIVED IN — molded to this person's feet, bearing the patina of real wear. Not box-fresh. The shoes belong to this person as naturally as their watch or their haircut.
The entire scene — setting, activity, styling, light, color, atmosphere — is defined by the moodboard. The shot type defines only the compositional structure (full body, face visible, environmental portrait).`,
  },
  {
    id: 'group-scene',
    name: 'Group Scene',
    description: '2-3 people together — your product is the hero shoe',
    icon: '👥',
    framingDirective: `MANDATORY FRAMING: Candid editorial group shot with 2-3 people. This is a DOCUMENTARY GROUP MOMENT — caught between interactions, never posed.

HERO SHOE RULE (CRITICAL):
- Exactly ONE person wears the selected/hero product (EXACT match to reference images — locked geometry, materials, color).
- The other 1-2 people each wear a DIFFERENT named Birkenstock model (specified in the companion section below). Each companion shoe is a real, recognizable Birkenstock silhouette — naturally worn, lived-in, not box-fresh.
- ALL shoes (hero + companions) must be VISIBLE in the frame. They are discovered naturally, never spotlighted.

GROUP DYNAMIC: The people are MID-INTERACTION — sharing a surface, overlapping personal spaces, caught in conversation or shared activity. Bodies create asymmetric, layered compositions. Each person occupies space differently — one sits, another stands, one leans. The group has genuine ease and familiarity.

ANTI-GENERIC:
- NEVER lined up facing camera.
- NEVER matching outfits or coordinated styling.
- NEVER catalog group shot with equal spacing.
- NEVER everyone looking at camera simultaneously.
- NEVER identical body language or mirrored poses.

INDIVIDUAL IDENTITY: Each person has distinct personal style — different silhouettes, different textures, different color palettes. Clothing is lived-in, personal, eclectic. Age, body type, and ethnicity should feel diverse and authentic. Nobody looks "styled" — they look like themselves.

FOOTWEAR — INCIDENTAL ANCHOR: All shoes are visible but the composition is about the GROUP MOMENT, not the footwear. The eye travels through faces, hands, body language, and then discovers the shoes naturally. The hero shoe is not compositionally privileged — it's just one pair among friends.

ENVIRONMENT: The group exists in a real place defined by the moodboard. They've claimed this space together — their bodies and belongings have shaped it. The environment tells part of the story.`,
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

// ===== PORTRAIT IN PLACE ENERGY VARIATIONS =====
// Randomly selected when advanced settings are all on "Auto" to inject editorial variety
// These describe ENERGY and RELATIONSHIP TO ENVIRONMENT — not specific poses

export interface PortraitEnergyVariation {
  id: string;
  name: string;
  framingOverride: string;
}

export const portraitInPlaceVariations: PortraitEnergyVariation[] = [
  {
    id: 'arrived-settling',
    name: 'Arrived & Settling',
    framingOverride: `ENERGY — Arrived & Settling:
The person JUST GOT HERE. The body hasn't found its resting state yet — bag still on shoulder, a hand reaching to set something down, weight still shifting. There's transitional energy: the space is new to them, or they're reclaiming it after being away. Possessions are mid-placement. The environment shows the traces of arrival — a door ajar, shoes not yet fully settled. The camera caught the first 30 seconds.
NEVER fully settled or comfortable. The body is still negotiating with the space.`,
  },
  {
    id: 'deep-in-place',
    name: 'Deep in Place',
    framingOverride: `ENERGY — Deep in Place:
The person has been here for HOURS. They've completely melted into the environment — body sprawled, limbs heavy, totally absorbed in something (reading, working, staring, dozing). The shoes have been on these feet all day. There's no self-consciousness, no awareness of being watched. Limbs are arranged by gravity, not intention. Objects around them show the accumulation of time spent — a half-empty glass, pages turned, a phone face-down.
NEVER upright or alert. The body has fully surrendered to the surface beneath it.`,
  },
  {
    id: 'about-to-leave',
    name: 'About to Leave',
    framingOverride: `ENERGY — About to Leave:
The person is gathering energy to GO. One hand on a surface pushing up, or reaching for keys, or mid-stand. Gaze directed elsewhere — toward a door, a horizon, a companion off-frame. Weight shifting forward. The moment is charged with imminent motion. The environment they're leaving still holds their warmth — an impression on a seat, belongings being collected. This is the last frame before the scene empties.
NEVER fully standing or already walking. Capture the THRESHOLD between staying and going.`,
  },
  {
    id: 'caught-unaware',
    name: 'Caught Unaware',
    framingOverride: `ENERGY — Caught Unaware:
The camera is an INTRUDER. The person hasn't cooperated with this photograph — they're looking away, mid-gesture, face partially obscured by a hand or turned shoulder. Maybe they're calling out to someone, or reacting to something off-frame, or lost in thought with eyes unfocused. There's no fourth-wall awareness. The framing itself might feel slightly off — as if the photographer had to be quick. Raw, unrehearsed, stolen.
NEVER looking at camera. NEVER posed. The person doesn't know or doesn't care that they're being photographed.`,
  },
  {
    id: 'borrowed-perch',
    name: 'Borrowed Perch',
    framingOverride: `ENERGY — Borrowed Perch:
The person is sitting somewhere NOT DESIGNED FOR SITTING — a wall, a railing, a truck tailgate, a table edge, a staircase landing, a window ledge. The body has claimed an unconventional surface and made it theirs. Legs dangle, tuck, or extend in whatever way the surface demands. There's mild defiance in the choice — ignoring the proper furniture, finding the interesting spot. The perch gives them a different vantage point on their world.
NEVER on proper furniture. The surface they've claimed should feel specific to the moodboard's environment.`,
  },
  {
    id: 'stillness-with-tension',
    name: 'Stillness with Tension',
    framingOverride: `ENERGY — Stillness with Tension:
The person is STILL but not relaxed. Arms crossed, or one hand gripping a railing, or jaw set while staring at something with intent. There's an inner weather — anticipation, resolve, quiet defiance, or deep focus. The calm is CHARGED. The body is coiled, not collapsed. Even in stillness, there's a sense that this person is about to act, or has just decided something. The environment amplifies the tension — shadows, angles, isolated framing.
NEVER serene or dreamy. The stillness has an edge, an alertness, an intensity.`,
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

/**
 * Randomly select a portrait in place energy variation from the pool.
 */
export function pickRandomPortraitVariation(): PortraitEnergyVariation {
  const idx = Math.floor(Math.random() * portraitInPlaceVariations.length);
  return portraitInPlaceVariations[idx];
}

// ===== ON FOOT ENERGY VARIATIONS =====
// Randomly selected when advanced settings are all on "Auto" to inject editorial variety
// These describe ENERGY and RELATIONSHIP TO GROUND — never name specific surfaces or textures

export const onFootVariations: PortraitEnergyVariation[] = [
  {
    id: 'paused-mid-errand',
    name: 'Paused Mid-Errand',
    framingOverride: `ENERGY — Paused Mid-Errand:
One foot bearing weight, the other lifted slightly or dragging. The person STOPPED for a moment — to check something, glance at something, wait for someone. This is a TRANSITIONAL stance: not settled, not walking, caught between. The weight distribution tells the story of interruption. The ground beneath shows the context of where the errand happens.
NEVER both feet flat and settled. The body's weight is still deciding where to go.`,
  },
  {
    id: 'grounded-still',
    name: 'Grounded & Still',
    framingOverride: `ENERGY — Grounded & Still:
Weight fully surrendered into BOTH feet. This person has been standing here for a while — watching something, waiting, lost in thought. The feet have SETTLED into the surface beneath them. There's heaviness in the stance, rootedness. The shoes show the compression and wear of sustained standing. The ground and feet have developed a relationship — the stance has shaped itself to the surface.
NEVER transitional or mid-step. This is stillness with duration.`,
  },
  {
    id: 'one-in-one-out',
    name: 'One In, One Out',
    framingOverride: `ENERGY — One In, One Out:
ASYMMETRIC CROP: one foot sharp and fully in frame, the other PARTIALLY CUT OFF at the edge. The person is entering or leaving the frame — the camera caught a FRAGMENT of their movement. The composition is deliberately unbalanced. The visible foot is grounded and detailed; the exiting foot is in motion or cropped. This framing breaks the "two shoes centered" convention.
NEVER both feet fully in frame. The crop must feel like the person is passing THROUGH the photograph.`,
  },
  {
    id: 'feet-talking',
    name: 'Feet Talking',
    framingOverride: `ENERGY — Feet Talking:
One foot doing something to the OTHER — scratching an ankle, nudging, resting on top, toe poking at the other shoe's strap. The unconscious choreography of IDLE FEET. People's feet have conversations when the person isn't paying attention — restless micro-movements, self-soothing gestures, playful fidgets. The stance reveals personality through these small involuntary movements.
NEVER both feet planted flat and still. The feet must be interacting with each other.`,
  },
  {
    id: 'shadow-ground',
    name: 'Shadow & Ground',
    framingOverride: `ENERGY — Shadow & Ground:
The SHADOW is as important as the feet. Strong directional light casts shadow patterns across the ground and shoes — the shadow of the person, or surrounding architecture, or foliage creates GRAPHIC COMPOSITION across the surface. The interplay of light and dark is the co-star. The shadow shapes become abstract design elements. Light direction defines the entire mood.
NEVER flat, even lighting. The shadow patterns must be bold and compositionally significant.`,
  },
  {
    id: 'surface-dialogue',
    name: 'Surface Dialogue',
    framingOverride: `ENERGY — Surface Dialogue:
The GROUND dominates 60%+ of the frame. The feet and shoes are secondary to the surface story — the visual world of the ground (defined entirely by the moodboard) becomes the canvas on which the shoes simply exist. The camera lingers on the surface, giving it space and attention. The shoes are discovered within the landscape of ground-level detail, not spotlighted above it.
NEVER shoes dominating the frame. The surface IS the subject; the shoes are visitors within it.`,
  },
  {
    id: 'dangling',
    name: 'Dangling',
    framingOverride: `ENERGY — Dangling:
Feet hanging off a LEDGE — a wall, dock, tailgate, table edge, rooftop parapet, bridge railing. Gravity pulls the sandals slightly — straps shift under the shoe's own weight, the sole becomes visible from below. The EDGE they dangle from is the compositional anchor, cutting horizontally across the frame. Below the feet: air, water, ground far below, nothing. The dangle reveals the shoe's relationship to gravity differently than standing ever could. One foot might swing slightly, the other still. The moodboard defines WHAT they're dangling from.
NEVER feet on solid ground. NEVER standing. The feet must be suspended, gravity-affected.`,
  },
  {
    id: 'feet-up',
    name: 'Feet Up',
    framingOverride: `ENERGY — Feet Up:
Feet PROPPED on something — a railing, a low wall, a dashboard, a chair opposite, a table edge. Casual territorial claiming. The soles become partially visible. The shoe is seen from an ANGLE that standing never provides — from below, from the side, foreshortened. The prop surface comes from the moodboard's world. The energy is leisure, ownership, ease. The person has claimed this space and is using it on their terms.
NEVER feet on the ground. The feet must be elevated, resting ON something.`,
  },
  {
    id: 'crossed-seated',
    name: 'Crossed & Seated',
    framingOverride: `ENERGY — Crossed & Seated:
Close crop of CROSSED LEGS or ANKLES while seated. One ankle resting on the opposite knee, or ankles crossed and extended, or legs folded with feet tucked beside. The seated position changes shoe geometry — straps pull differently, the foot's arch becomes visible, buckles catch light from unusual angles. The seat surface (bench, step, curb, ground) frames the bottom of the image. The pose is relaxed, habitual — how this person always sits.
NEVER standing. The crossing or folding of legs must create distinctive shoe angles.`,
  },
  {
    id: 'tucked-grounded',
    name: 'Tucked & Grounded',
    framingOverride: `ENERGY — Tucked & Grounded:
Sitting on the GROUND, feet tucked under or pulled close to the body. Cross-legged with shoes peeking out, knees up with feet flat and close, or one leg extended while the other tucks. The shoes are seen from ABOVE or at GROUND LEVEL in intimate proximity. The ground surface and the body create a contained, domestic composition. The shoes feel personal, close, lived-with. The camera is LOW — nearly at ground level — creating an intimate, private perspective. The moodboard defines the ground surface.
NEVER standing or elevated. The body and feet must be DOWN on the ground, creating intimacy.`,
  },
];

// ===== BODY & STYLE ENERGY VARIATIONS =====
// Randomly selected when advanced settings are all on "Auto" to inject editorial variety
// These describe ENERGY and BODY FRAGMENT MOOD — never name specific outfits or activities

export const bodyStyleVariations: PortraitEnergyVariation[] = [
  {
    id: 'hands-at-work',
    name: 'Hands at Work',
    framingOverride: `ENERGY — Hands at Work:
The hands are doing something SPECIFIC and absorbing — a real activity that demands attention. The body arranges itself around the task: shoulders hunched or turned, arms active, fingers engaged. The activity is drawn from the moodboard's world. The entire body composition is DICTATED by what the hands are doing. Shoes are incidental ground-level context — visible but discovered, not featured.
NEVER idle hands. NEVER hands posed for camera. The task must feel genuine and absorbing.`,
  },
  {
    id: 'mid-gesture',
    name: 'Mid-Gesture',
    framingOverride: `ENERGY — Mid-Gesture:
Caught MID-MOVEMENT: reaching up, pulling something, adjusting, turning, mid-laugh with hands rising. The body is IN MOTION and the crop freezes a fragment of it. Nothing is posed — the frame captures a split-second of genuine physical expression. Clothing moves with the body. The gesture is SPECIFIC and contextual to the world the moodboard defines.
NEVER static or settled. The body must be between positions, caught in transit.`,
  },
  {
    id: 'leaning-fragment',
    name: 'Leaning Fragment',
    framingOverride: `ENERGY — Leaning Fragment:
The model LEANS against something — a wall, a railing, a counter, a vehicle — and the crop captures the body at an ANGLE. The lean creates DIAGONAL ENERGY across the frame. One hip pushed out, arms crossed or braced. Weight is decisively OFF-CENTER, given to the surface behind. The lean feels habitual, not posed — this is how this person always waits, always rests. The surface they lean against comes from the moodboard's world.
NEVER upright or free-standing. The body must be using something else for support.`,
  },
  {
    id: 'pockets-fidgets',
    name: 'Pockets & Fidgets',
    framingOverride: `ENERGY — Pockets & Fidgets:
Hands in pockets, thumbs hooked in belt loops, fingers worrying a seam, playing with a ring, tugging a sleeve. The SMALL UNCONSCIOUS MOVEMENTS that reveal personality. The outfit reads as armor or comfort — how this person USES clothing, not just wears it. The fidgets are specific and feel involuntary. The body stance is casual, weight shifted, one shoulder dropped. These micro-gestures tell more about the person than any pose could.
NEVER hands still or deliberately placed. The fidgeting must feel unconscious and habitual.`,
  },
  {
    id: 'seated-crop',
    name: 'Seated Crop',
    framingOverride: `ENERGY — Seated Crop:
Chin-down crop of a SEATED figure. Crossed legs, hands on knees, shoes flat or dangling. The seated position creates interesting CLOTHING GEOMETRY: fabric bunches, pulls, drapes differently than when standing. The crop reveals how someone SITS when they're not performing — the unselfconscious arrangement of limbs and fabric. The seat itself comes from the moodboard's environment.
NEVER standing. The seated posture must create distinctive fabric and body shapes.`,
  },
  {
    id: 'walking-fragment',
    name: 'Walking Fragment',
    framingOverride: `ENERGY — Walking Fragment:
MID-STRIDE, body in motion, clothing catching air. One arm swinging, fabric responding to movement. The crop is slightly OFF-CENTER or tilted — the photographer is trying to keep up. There's forward momentum in every element: the stride, the fabric flutter, the slight blur at the edges. This is DYNAMIC, not posed — the camera is chasing a moment. The environment blurs or streams in the direction of motion.
NEVER static or planted. The body must be moving THROUGH the frame with visible momentum.`,
  },
];

// ===== GROUP SCENE ENERGY VARIATIONS =====
// Randomly selected when advanced settings are all on "Auto" to inject editorial variety

export const groupSceneVariations: PortraitEnergyVariation[] = [
  {
    id: 'shared-surface',
    name: 'Shared Surface',
    framingOverride: `ENERGY — Shared Surface:
All 2-3 people seated on the SAME SURFACE — a bench, wall, steps, a low wall, a curb. Bodies overlap, lean, crowd together or spread along the surface with uneven spacing. Someone's knee touches someone's elbow. Personal spaces merge. The shared surface creates a horizontal compositional anchor while the bodies break the line at different heights and angles. All shoes visible at ground level.
NEVER standing. NEVER evenly spaced. The surface creates intimacy through shared territory.`,
  },
  {
    id: 'walking-together',
    name: 'Walking Together',
    framingOverride: `ENERGY — Walking Together:
The group is MID-STRIDE, staggered, slightly out of sync — one half a step ahead, another turning to speak. Walking pace, not marching. The camera catches them from a three-quarter angle as they move through space. Clothing responds to motion. Strides are different lengths — each person's walk is their own. The path they walk on is defined by the moodboard's world.
NEVER marching in unison. NEVER shoulder-to-shoulder. The stagger and desynchronization create naturalism.`,
  },
  {
    id: 'gathered-around',
    name: 'Gathered Around',
    framingOverride: `ENERGY — Gathered Around:
The group is standing or leaning AROUND something — a table, a railing, a car hood, a doorway, a counter. Each person distributes weight differently: one leans, one stands back with arms crossed, one perches on the edge. The central object creates a gravitational point. Bodies face inward at different angles, creating a LOOSE CIRCLE with gaps and asymmetry. The gathering feels spontaneous, not arranged.
NEVER a tight circle. NEVER all facing the same direction. The gathering has natural gaps and angles.`,
  },
  {
    id: 'two-and-one',
    name: 'Two & One',
    framingOverride: `ENERGY — Two & One:
Two people are ENGAGED with each other — talking, sharing something, leaning close. The third person is slightly APART — arriving, scrolling a phone, looking elsewhere, or observing the pair from a step away. This creates a compositional TENSION between the pair and the individual. The dynamic tells a micro-story: connection and solitude coexisting. The spatial gap between the pair and the individual creates the narrative.
NEVER all three equally engaged. The 2+1 split must be clear and create visual storytelling.`,
  },
  {
    id: 'stacked-levels',
    name: 'Stacked Levels',
    framingOverride: `ENERGY — Stacked Levels:
People at DIFFERENT HEIGHTS — one on steps, one on the ground, one on a ledge; or one standing, one sitting, one crouching. The vertical staggering creates LAYERED COMPOSITION — heads, hands, and feet at different levels in the frame. The height differences are determined by the environment's architecture. This creates dynamic visual rhythm and prevents the flatness of everyone at eye level.
NEVER all at the same height. The environment's surfaces dictate who is where.`,
  },
  {
    id: 'caught-laughing',
    name: 'Caught Laughing',
    framingOverride: `ENERGY — Caught Laughing:
A MID-REACTION MOMENT — someone said something and the group is responding. Bodies TURNING toward each other, shoulders shaking, heads thrown back or ducked forward. The laughter is at different stages: one person mid-laugh, another just starting, the third recovering. Hands fly up or clutch something. The energy is KINETIC and warm. Nothing is posed — this is a stolen moment of genuine human connection.
NEVER everyone smiling at camera. NEVER controlled expressions. The reaction must feel spontaneous and mid-burst.`,
  },
  {
    id: 'backs-and-profiles',
    name: 'Backs & Profiles',
    framingOverride: `ENERGY — Backs & Profiles:
The camera sees the group from BEHIND or BESIDE — backs, profiles, three-quarter turns. No one faces the camera directly. The group looks outward at something — a view, a street, a sunset, each other. The viewer is an outsider witnessing a private moment. This unconventional angle shows the BACK of clothing, the nape of necks, shoes from behind. The composition is voyeuristic and intimate.
NEVER anyone facing camera. The group's attention is directed AWAY from the viewer.`,
  },
];

/**
 * Randomly select an on-foot energy variation from the pool.
 */
export function pickRandomOnFootVariation(): PortraitEnergyVariation {
  const idx = Math.floor(Math.random() * onFootVariations.length);
  return onFootVariations[idx];
}

/**
 * Randomly select a body & style energy variation from the pool.
 */
export function pickRandomBodyStyleVariation(): PortraitEnergyVariation {
  const idx = Math.floor(Math.random() * bodyStyleVariations.length);
  return bodyStyleVariations[idx];
}

/**
 * Randomly select a group scene energy variation from the pool.
 */
export function pickRandomGroupSceneVariation(): PortraitEnergyVariation {
  const idx = Math.floor(Math.random() * groupSceneVariations.length);
  return groupSceneVariations[idx];
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
