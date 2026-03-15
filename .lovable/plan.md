

# On Foot Shot Type: Beyond Standing — Seated, Dangling, Resting

## Problem

All 6 current On Foot energy variations assume the person is **standing**. The base directive reinforces this with "mid-calf down" crop and "ground as co-character" language. But Birkenstock's editorial photography frequently features feet in non-standing positions: dangling from a ledge, crossed while seated, propped up on a railing, tucked under while sitting on the ground. These angles show the shoe's relationship to the foot differently — straps shift under gravity, the sole becomes visible, the buckle catches light from unexpected directions. The current pool produces walking/standing monotony.

## What Changes

### 1. Soften the base directive's standing assumptions (`lifestyleShootConfigs.ts`, lines 37-45)

The current directive hardcodes "ground as co-character" and "mid-calf down" which implicitly forces standing. Rewrite to:
- Keep the mid-calf crop as a **guideline** but allow the crop to adapt when seated/dangling (e.g., "cropped to isolate feet and lower legs — the exact crop adapts to the pose")
- Reframe "ground as co-character" to "the surface the feet relate to" — which could be ground, a ledge edge, air (dangling), a dashboard, etc.
- Keep all existing anti-generic rules, lived-in mandate, moodboard-defers-everything

### 2. Add 4 new non-standing variations to the pool (expand from 6 to 10)

Keep all 6 existing standing variations (they're good), add:

- **"Dangling"** — Feet hanging off a ledge, wall, dock, tailgate, table edge. Gravity pulls the sandals slightly — straps shift, the shoe's weight becomes visible. The edge they're dangling from is the compositional anchor. Below the feet: air, water, ground far below. The dangle reveals the shoe's relationship to gravity differently than standing ever could.

- **"Feet Up"** — Feet propped on something — a railing, a low wall, a dashboard, a chair opposite. Casual territorial claiming. The soles become partially visible. The shoe is seen from an angle that standing never provides. The prop surface comes from the moodboard's world.

- **"Crossed & Seated"** — Close crop of crossed legs/ankles while seated. One ankle resting on the opposite knee, or ankles crossed and extended. The seated position changes shoe geometry — straps pull differently, the foot's arch becomes visible, buckles catch light from unusual angles. The seat surface (bench, step, ground) frames the bottom of the image.

- **"Tucked & Grounded"** — Sitting on the ground, feet tucked under or pulled close to the body. Cross-legged, knees up with feet flat, or one leg extended. The shoes are seen from above or at ground level in intimate proximity. The ground surface and the body create a contained composition. The shoes feel domestic, personal, close.

### 3. Update the prompt builder's additional rules (`lifestyleShootPromptBuilder.ts`, line 146)

Soften the "ADDITIONAL RULES" block to match. Change:
- "Environmental on-foot shot, cropped from mid-calf down" → "Environmental on-foot shot. Crop isolates feet and lower legs — exact framing adapts to the pose (standing, seated, dangling, resting)."
- "NEVER show above the knee" → "NEVER show above the knee. The pose may be standing, seated, dangling, or resting — the crop adapts accordingly."
- Keep all other rules (anti-generic, ground/surface, skin, lived-in footwear, moodboard)

### Files changed
- `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts` — soften base directive + add 4 variations (6→10)
- `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts` — update additional rules to allow non-standing poses

