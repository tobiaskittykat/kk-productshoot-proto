

# Inject Editorial Edge into "Portrait in Place" — Birkenstock-Researched Revision

## Research Findings

Birkenstock's real campaign photography (Jack Davison's "Personality" series, "Come Back To You" 2025) has specific DNA that our current directive misses:

1. **No styling, no briefing** — people are shot in their own environment wearing their OWN well-worn Birkenstocks. The shoes bear "marks of intimacy and time."
2. **"In-between" moments** — Jack Davison is known for capturing people in transitional states, not settled poses. Reaching for something, mid-turn, looking away, caught between thoughts.
3. **Physical ease as philosophy** — the body language communicates gravity-awareness: weight surrendered into surfaces, limbs arranged by comfort not aesthetics. Slouching is a feature.
4. **Shoes are incidental, never featured** — in the Personality Campaign, "no current product is featured." The shoes are just part of who someone is. Our directive says this but the model still centers them.
5. **Environment as co-author** — the place shapes the person's posture. Someone on a stoop sits differently than someone in a field. The moodboard should drive this, not the variation.

## Critical Review of Original Plan

The original plan proposed 6 named pose variations like "Low & Grounded," "Sprawled Casual," "Walking Away." After research, I see two problems:

**Problem 1: Too prescriptive = same output.** If a variation says "sitting on a ledge, feet dangling," you'll get that exact image every time. Birkenstock's actual photography works because the photographer responds to the person and place — not a shot list. We need variations that describe **energy and relationship to environment** rather than exact body positions.

**Problem 2: The base directive needs more edge, not just variations.** The current directive's language ("contemplative," "simply being still," "quiet activity") reads as gentle and passive. Birkenstock campaigns have more **tension** — the subjects look like they have somewhere to be, or just came from somewhere. There's an alertness, not just calm.

## Revised Plan

### 1. Rewrite the base "Portrait in Place" framing directive (`lifestyleShootConfigs.ts`, lines 65-73)

Key changes to the directive language:
- Replace "contemplative, genuine, mid-moment" with **"caught between moments"** — transitional energy, not settled
- Add **anti-generic rules**: "NEVER standing straight facing camera. NEVER hands at sides. NEVER centered in frame."
- Add **physical ease language**: "The body has surrendered to gravity — weight given to whatever surface is available. Limbs arranged by comfort, not aesthetics."
- Add **worn-shoe mandate**: "The shoes look LIVED IN — molded to this person's feet, bearing the patina of real wear. Not box-fresh."
- Emphasize **environment shapes posture**: "The person's body language is a RESPONSE to their environment — how you sit on warm stone is different from how you lean against cold metal. The moodboard's world determines the physical vocabulary."

### 2. Add Portrait in Place variations — but as **energies**, not poses (`lifestyleShootConfigs.ts`)

Create 6 variations that describe a **mood/energy/relationship-to-space** rather than a specific body position. This gives the model creative latitude while pushing away from generic:

- **"Arrived & Settling"** — The person just got here. Bag still on shoulder, keys in hand, body not yet at rest. The transitional energy of arrival.
- **"Deep in Place"** — They've been here for hours. Fully absorbed — reading, working, staring at something. Body has melted into the environment. Limbs sprawled. Total comfort.
- **"About to Leave"** — Gathering energy to go. One hand on a surface, weight shifting forward, gaze directed elsewhere. The moment before motion.
- **"Caught Unaware"** — Photographed without cooperation. Looking away, mid-gesture, face partially obscured by hand or turned shoulder. The camera is an intruder.
- **"Borrowed Perch"** — Sitting somewhere not designed for sitting — a wall, a railing, a car hood, a table edge. The body has claimed an unconventional surface. Legs dangle or tuck.
- **"Stillness with Tension"** — Standing still but not relaxed. Arms crossed, or one hand gripping something, jaw set. There's an inner weather. The calm is charged.

Each variation provides a 3-4 line framing override (same format as still life variations) describing the energy, the body-environment relationship, and one anti-generic constraint. No specific body positions prescribed.

### 3. Wire into prompt builder (`lifestyleShootPromptBuilder.ts`, ~line 128)

Mirror the existing Styled Still Life pattern:
- When `lifestyleShotType === 'full-model'` AND all advanced settings are Auto → pick a random Portrait in Place variation
- Inject the variation's framing override + append the base directive's non-compositional rules (casting, styling, footwear presence)
- Add `pickRandomPortraitVariation()` export alongside existing `pickRandomStillLifeVariation()`

### Files Changed
- `src/components/creative-studio/product-shoot/lifestyleShootConfigs.ts` — rewrite directive + add variation array + picker function
- `src/components/creative-studio/product-shoot/lifestyleShootPromptBuilder.ts` — add `full-model` variation logic

