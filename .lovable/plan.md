

# Rewrite Feet Focus, Model No Head, and Full Model Shot Types — Birkenstock Editorial DNA

## Research Summary

Birkenstock's lifestyle photography has a distinctive visual language across all shot types. Key findings from campaigns like "Come Back To You" (Dan Carter), "Any City Any Season" (SS25), Birkenstock x Jil Sander (Talia Chetrit), Birkenstock x Tekla (Ben Beagent), and the Dazed/Lucie Rox AW23 shoot:

**Feet Focus (On-Foot)**:
- Never a clinical product shot — always environmental. The ground surface tells a story: sun-warmed cobblestones, wet sand at the water's edge, worn wooden deck boards, terrazzo tiles, grass.
- Framing is wider than typical shoe photography — you see the ground, the environment, the light. Not a tight crop on just the shoes.
- Natural stance: feet slightly apart, one foot sometimes slightly forward or casually crossed at the ankle. Never stiff or posed.
- Skin is real — visible tan lines, freckles, natural imperfections. Bare ankles are standard for sandals; rolled-up linen or denim cuffs for closed-toe.
- Light hits the shoes and the ground equally — dappled sunlight, long afternoon shadows, window light falling across stone floors.
- The shoes look WORN and LOVED, not box-fresh. They belong to this person, in this moment.

**Model No Head (Chin-Down Crop)**:
- Birkenstock's "Personalities" campaign literally pioneered this — intimate portraits cropped to show the whole outfit with shoes as anchor, face optional or cropped.
- The outfit is always relaxed, layered, textured — linen, cotton, denim, soft knits. Never formal or corporate.
- Hands are visible and natural — holding a coffee cup, resting on a railing, tucking into pockets, touching a hat brim.
- The model's body language tells the story — leaning against a doorframe, mid-stride on a street, sitting on stone steps with legs extended.
- Environment is always present — architectural context (doorways, walls, staircases), natural context (gardens, pathways), or interior context (kitchens, studios).
- The crop feels intentional, not accidental — the model is in their world, and we're observing a quiet moment.

**Full Model (Face Visible)**:
- Birkenstock's "Come Back To You" campaign is the gold standard: authentic creative individuals photographed in their own spaces, doing their own things.
- Expression is never posed or "model-y" — the person is mid-thought, mid-conversation, or simply being still. Contemplative, genuine, warm.
- Environment dominates — the model often occupies only 30-50% of the frame. Wider environmental shots that establish place and mood.
- Styling is the protagonist's own: personal, eclectic, layered with meaning. Never catalog-styled.
- Birkenstock is present but not forced — the shoes are visible and identifiable but the composition doesn't scream "look at the shoes."
- Activities are authentic rituals: morning tea, reading, walking, sitting with friends, working in a studio.
- Diverse, authentic casting — real creatives, real body types, real personal style. Never generic models.

## Changes

### File: `lifestyleShootConfigs.ts` — lines 31-62

Rewrite all three `framingDirective` fields with rich, Birkenstock-specific editorial language:

**feet-focus** — Rename to "On Foot" with new directive:
- Wider environmental crop (mid-calf down but generous ground/surface area visible)
- Natural stance: feet slightly apart, one casually forward, ankle crosses allowed
- Ground surface is a character: cobblestones, wet sand, terrazzo, worn wood, wild grass
- Bare ankles for sandals; rolled linen/denim cuffs for closed-toe
- Light and shadow play across both shoes and ground equally
- Shoes look lived-in and belonging, not box-fresh
- Never clinical or isolated — always environmental

**model-no-head** — Rename to "Body & Style" with new directive:
- Crop above chin, intentional not accidental
- Outfit is relaxed, layered, textured — linen, cotton, denim, soft knits
- Hands visible doing something natural: holding a cup, resting on a surface, in pockets
- Body language tells a story: leaning, sitting, mid-stride, resting
- Architectural or natural environment frames the model
- Footwear is the anchor of the composition, clearly visible and sharp
- Mediterranean/European sensibility in styling and setting

**full-model** — Rename to "Portrait in Place" with new directive:
- Full body including face, wider environmental framing
- Model occupies 30-50% of frame — the place and mood dominate
- Expression is contemplative, genuine, mid-moment — never posed or performative
- Activities are authentic: morning rituals, creative work, quiet walks, reading
- Styling feels personal and eclectic, not catalog-arranged
- Birkenstock is present and identifiable but never forced or the sole focus
- Diverse, authentic casting direction — real people, real personal style
- The image should feel like a documentary portrait, not a fashion advertisement

### File: `LifestyleShootTypeSelector.tsx`
Update names/descriptions on cards to match new naming.

| Shot ID | Old Name | New Name | New Description |
|---------|----------|----------|-----------------|
| `feet-focus` | Feet Focus | On Foot | On-foot, environmental — shoes and the ground they walk on |
| `model-no-head` | Model — No Head | Body & Style | Chin-down crop — outfit, hands, posture, and shoes tell the story |
| `full-model` | Full Model | Portrait in Place | Full editorial portrait — a person in their world, Birkenstock at their feet |

