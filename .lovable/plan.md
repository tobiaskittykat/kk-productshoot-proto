

# Editorial Edge for "On Foot" and "Body & Style" — Moodboard-First Revision

## Your feedback applied

You're right: lines like "Cracks, stains, moss, wear patterns" are prescriptive aesthetics that will override the moodboard every time. The fix: describe the **relationship** (the ground matters, it has texture, it's a co-character) but **never name specific textures**. All visual specifics come from the moodboard. This principle is applied throughout.

## Changes

### 1. Rewrite "On Foot" base directive (lines 37-44)

Current problems:
- Names 3 specific stances ("feet slightly apart, one foot casually forward, ankles loosely crossed") that cycle repetitively
- "Ground surface is a character" is good but needs more energy

Rewrite keeps: mid-calf crop, 2 shoes, 40-50% frame, worn-shoe mandate, moodboard-defers-all-aesthetics.
Rewrite changes:
- Replace named stances with energy: "The stance is caught mid-life — mid-shift, mid-scratch, mid-step-back. The feet are doing what feet do when no one's watching."
- Push ground relationship without naming materials: "The ground isn't a backdrop — it has its own story, its own texture, its own wear. The moodboard defines what that surface looks like."
- Add anti-generic: "NEVER two feet parallel facing camera. NEVER symmetrical framing."

### 2. Add 6 On Foot energy variations

Same pattern as Portrait in Place — energy/relationship descriptions, zero hardcoded aesthetics:

- **"Paused Mid-Errand"** — One foot bearing weight, the other lifted or dragging. Transitional stance — the person stopped for a moment. Not settled.
- **"Grounded & Still"** — Weight surrendered into both feet. Standing in one place for a while. Feet have settled into the surface beneath them.
- **"One In, One Out"** — Asymmetric crop: one foot sharp and fully in frame, the other partially cut off at the edge. The person is entering or leaving the frame.
- **"Feet Talking"** — One foot doing something to the other — scratching an ankle, nudging, one on top of the other. The unconscious choreography of idle feet.
- **"Shadow & Ground"** — The shadow is as important as the feet. Shadow patterns create graphic composition across the ground and shoes. Light direction is the co-star.
- **"Surface Dialogue"** — The ground dominates 60%+ of the frame. Feet are secondary to the surface story. The shoes exist within a landscape of ground-level detail defined entirely by the moodboard.

### 3. Rewrite "Body & Style" base directive (lines 51-58)

Current problems:
- "FOOTWEAR ANCHOR — clearly visible, sharp, grounding" sounds like catalog/Nordstrom
- Names 3 hand activities that cycle
- Missing the "accidental fragment" energy

Rewrite keeps: chin-down crop, 50-70% model, moodboard-defers-all-aesthetics.
Rewrite changes:
- Replace "footwear anchor" with incidental: "Shoes visible at the bottom of the frame but NOT the compositional anchor. The eye is drawn to hands, texture, posture first."
- Push fragment energy: "This frame feels like a CROP from a larger moment — the photographer aimed higher but the subject shifted."
- Replace named hand activities with energy: "Hands reveal habit and personality — the unconscious gestures people make when they're absorbed in something."
- Add anti-generic: "NEVER a clean symmetrical outfit shot. NEVER hands hidden."
- Styling: "Clothing has HISTORY — stretched, rolled, worn into shape. Never catalog-fresh."

### 4. Add 6 Body & Style energy variations

- **"Hands at Work"** — Hands doing something specific and absorbing. The activity is real and the body arranges itself around the task. Shoes are incidental ground-level context.
- **"Mid-Gesture"** — Caught mid-movement: reaching, pulling, adjusting. The body is in motion and the crop freezes a fragment of it.
- **"Leaning Fragment"** — The model leans against something and the crop captures the body at an angle. The lean creates diagonal energy. Weight is off-center.
- **"Pockets & Fidgets"** — Hands in pockets, thumbs hooked, fingers worrying a seam. The small unconscious movements that reveal personality.
- **"Seated Crop"** — Chin-down crop of a seated figure. The seated position creates interesting clothing geometry: fabric bunches, pulls, drapes differently.
- **"Walking Fragment"** — Mid-stride, body in motion, clothing catching air. The crop is slightly off-center — the photographer is trying to keep up.

### 5. Wire into prompt builder (lines 128-156)

Add two new branches mirroring the existing pattern:
- `feet-focus` + all Auto → `pickRandomOnFootVariation()` + append base On Foot rules
- `model-no-head` + all Auto → `pickRandomBodyStyleVariation()` + append base Body & Style rules

### Files changed
- `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts` — rewrite 2 directives + add 2 variation arrays + 2 picker functions
- `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts` — add 2 new variation branches

