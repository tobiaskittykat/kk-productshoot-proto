

# Fix: Multi-Shoe Hallucination + Keep 6 Reference Images

## Summary

The shot type descriptions themselves are well-written and detailed. The issue is that:
- The Prompt Agent ignores shoe count from the shot direction and writes "a pair of..." for every shot
- The image generator (Gemini 3 Pro) receives up to 10 reference images of the same shoe and interprets them as separate shoes
- There is no explicit shoe-count enforcement at any layer

We keep **up to 6 reference images** for detail fidelity, but add strict shoe-count rules at every layer.

## Changes

### 1. Add `shoeCount` to Angle Configs + Inject Entity Count into Prompt Builders

**File:** `src/components/creative-studio/product-shoot/shotTypeConfigs.ts`

Add a `shoeCount: 1 | 2` property to each `productFocusAngleOptions` entry:
- `hero`: 1
- `side-profile`: 1
- `detail-closeup`: 1
- `top-down`: 2
- `sole-view`: 2
- `pair-shot`: 2
- `lifestyle`: 2

Update `buildProductFocusPrompt` to inject an explicit entity count line right after the opening line:
```
ENTITY COUNT (MANDATORY): Exactly [1/2] shoe(s) in the frame. Do NOT add extra shoes beyond this count.
```

Update `buildOnFootPrompt` to add:
```
ENTITY COUNT (MANDATORY): Exactly 2 shoes (one pair worn on feet). Do NOT add extra loose shoes.
```

Update `buildLifestylePrompt` to add:
```
ENTITY COUNT (MANDATORY): Exactly 2 shoes (one pair worn by the model). Do NOT add extra loose shoes.
```

### 2. Add Entity Count Rule to Prompt Agent System Prompt

**File:** `supabase/functions/generate-image/index.ts`

Add a new critical rule to the prompt agent's system prompt (after rule 9, around line 709):

```
**ENTITY COUNT (CRITICAL)**:
- The shot direction specifies how many shoes should appear. Respect this exactly.
- For SINGLE SHOE angles (hero, side profile, detail close-up): Write "a single [Brand] [Model]" — NOT "a pair of". Only ONE shoe in frame.
- For PAIR angles (top-down, sole-view, pair-shot, on-foot, full body): Write "a pair of [Brand] [Model]" — exactly TWO shoes.
- NEVER describe more shoes than the entity count specifies.
- If the brief says "ENTITY COUNT (MANDATORY): Exactly 1 shoe" — your prompt MUST describe a single shoe, singular language throughout.
```

### 3. Cap Reference Images to 6 for Image Generator + Add Clarifying Instruction

**File:** `supabase/functions/generate-image/index.ts`

In the `generateOne` function (line 1120), change the cap from 10 to 6:
```typescript
const attachCount = Math.min(productUrls.length, 6);
```

Update the fidelity instruction (line 1127-1130) to include entity-count awareness:
```
These [N] images show the SAME SINGLE product from different angles — they are NOT separate products. 
Generate ONLY the number of shoes specified in the prompt text (1 or 2). 
Do NOT interpret multiple reference angles as multiple separate shoes.
```

Keep prompt agent reference cap at 10 (it needs all angles for accurate material/detail description).

### 4. Keep Prompt Agent References at Up To 10

No change to the prompt agent section (line 740). The prompt agent (Gemini 2.5 Flash, text-only output) benefits from seeing all angles for accurate description. Only the image generator cap changes.

## Files Changed

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Add `shoeCount` to angle options; inject entity count constraint into all 3 prompt builders |
| `supabase/functions/generate-image/index.ts` | Add entity count rule to prompt agent; cap image generator refs to 6; add "same product, different angles" clarification with entity count |

## Expected Outcome

- Hero, side-profile, detail shots: exactly 1 shoe in frame
- Pair, sole, top-down, on-foot, full body shots: exactly 2 shoes
- No more 3+ shoe compositions
- Detail fidelity preserved with up to 6 reference images
- Prompt agent still sees all angles (up to 10) for accurate text descriptions
