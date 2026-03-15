

# Fix Over-Prescriptive Shot Type Directives — Let Moodboards Drive Variety

## Problem

The framing directives hardcode too many aesthetic specifics — "Mediterranean warmth," "sun-warmed stone steps," "coffee cup, sunglasses, straw hat," "dappled sunlight through foliage," "cobblestones," "terracotta tiles." These read like a complete creative brief on their own, so the moodboard analysis (which should be the PRIMARY style driver) gets drowned out. Result: every output looks like the same warm-toned Mediterranean editorial regardless of moodboard.

## Solution

Split each directive into two concerns:
1. **Structural rules** (KEEP) — crop, framing %, product visibility, number of shoes, body language rules. These are compositional and shot-type-specific.
2. **Aesthetic suggestions** (REMOVE from directives) — specific surfaces, props, lighting moods, color tones, geographic vibes. These should come ONLY from the moodboard.

Then strengthen the moodboard section in the prompt builder so it clearly overrides any residual aesthetic defaults.

## Changes

### 1. `lifestyleShootConfigs.ts` — Rewrite all 4 `framingDirective` strings

Strip aesthetic specifics, keep structural composition only. Example of what changes for each:

**Styled Still Life** — Keep: "pair of shoes, 30-40% of frame, no model/hands/feet, staggered arrangement, 1-2 contextual props." Remove: specific prop examples (coffee cup, sunglasses, straw hat), specific surfaces (stone steps, terrazzo, marble), "Mediterranean warmth," specific lighting descriptions. Replace with: "Surface, props, and atmosphere must be derived from the moodboard's world — do NOT default to generic warm/Mediterranean."

**On Foot** — Keep: "mid-calf crop, 2 shoes on feet, 40-50% of frame, natural unstudied stance, real skin." Remove: specific surface examples (cobblestones, wet sand, terrazzo), "Mediterranean warmth," specific lighting. Replace with: "The ground surface and environmental context must match the moodboard — could be urban concrete, forest floor, kitchen tiles, beach sand — whatever the moodboard's world demands."

**Body & Style** — Keep: "chin-down crop, 50-70% model, hands visible and natural, body language tells story, footwear as anchor." Remove: specific outfit materials (linen, cotton, denim), "Mediterranean/European sensibility," specific environments (European street, market stall), specific hand activities. Replace with: "Outfit styling, environment, and color palette must reflect the moodboard's aesthetic world, not a default Mediterranean look."

**Portrait in Place** — Keep: "full body with face, 30-50% of frame, contemplative/genuine expression, authentic activities, diverse casting, shoes visible but not forced." Remove: specific activities (morning tea on terrace, reading in courtyard), specific styling references, "Juergen Teller or Talia Chetrit" reference. Replace with: "The entire scene — setting, activity, styling, light, color — is defined by the moodboard. The shot type only defines the compositional structure."

### 2. `lifestyleShootPromptBuilder.ts` — Strengthen moodboard priority

- Move the moodboard section BEFORE the shot type framing in the prompt, or add an explicit priority instruction: "PRIORITY: The moodboard defines the VISUAL WORLD (colors, textures, surfaces, lighting, mood, geography). The shot type defines only the COMPOSITIONAL STRUCTURE (crop, framing, product visibility). When the moodboard and shot type suggest different aesthetics, the MOODBOARD WINS."
- Remove the hardcoded "Birkenstock brand DNA" section at the end that re-injects "Mediterranean warmth" defaults. Replace with a lighter touch: "BRAND QUALITY: The image must feel editorially polished, authentic, and never overly commercial. Maintain the quality standard of a premium lifestyle brand campaign."
- Add a fallback note: "If no moodboard is provided, default to a warm, natural, understated aesthetic."

### Files to edit

| File | Change |
|------|--------|
| `lifestyleShootConfigs.ts` | Rewrite 4 framingDirectives: keep structural rules, remove aesthetic prescriptions, add "defer to moodboard" language |
| `lifestyleShootPromptBuilder.ts` | Add priority hierarchy instruction, soften brand DNA section, add no-moodboard fallback |

