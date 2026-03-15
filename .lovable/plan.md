

# Update "Product Only" Shot Type to Match Birkenstock Editorial Still Life Style

## Research Findings

Birkenstock's official editorial product photography (shot by Dan Tobin Smith and others) has a very specific visual language for product-only lifestyle shots that is distinctly different from close-up e-commerce product photography:

1. **Wider environmental framing** — the product occupies roughly 30-40% of the frame, not 60-70%. The surrounding environment tells the story.
2. **Pairs are standard** — Birkenstock almost always shows two shoes (a complete pair), often arranged in a staggered or slightly overlapping composition. Sometimes even two different colorways side by side.
3. **Natural surfaces as stage** — shoes sit on stone steps, wooden floors, sun-warmed terrazzo, sandy terrain, linen fabric, marble counters — always contextual surfaces that belong to the moodboard's world.
4. **Props and context objects** — editorial still life includes environmental props: a coffee cup, magazine, sunglasses, a towel, dried flowers — objects that suggest a lived moment without any human present.
5. **Overhead and three-quarter angles** — not always eye-level close-ups. Often shot from above at 30-45° or directly overhead, showing the iconic footbed silhouette.
6. **Natural light with environmental shadows** — dappled light through trees, window shadows, golden hour rays across the surface. Never flat studio lighting.
7. **The design speaks for itself** — Birkenstock's own creative director noted they could omit the logo from ads because "the German shoe's emblematic design speaks for itself."

## Changes

### File: `lifestyleShootConfigs.ts`
Update the `product-only` shot type entry:
- **Name**: "Styled Still Life" (more editorial)
- **Description**: "Editorial still life — pair of shoes styled in their world with props and natural light"
- **framingDirective**: Complete rewrite to match Birkenstock's actual editorial language:
  - Wider environmental framing (product 30-40% of frame)
  - Always show a complete pair (2 shoes), staggered or slightly overlapping
  - Surface must belong to the moodboard world (stone, wood, terrazzo, sand, linen)
  - Include 1-2 small contextual props (coffee cup, book, sunglasses, dried botanicals) that suggest a lived moment
  - Camera angle: three-quarter overhead (30-45°) or full overhead, occasionally eye-level
  - Natural environmental light with real shadows (dappled, window, golden hour)
  - Shoes should look casually placed, as if someone just stepped out of them — never perfectly aligned or studio-arranged
  - Background environment extends into soft focus, establishing the world

### File: `LifestyleShootTypeSelector.tsx`
Update the description text for the product-only card to match the new editorial framing.

### File: `lifestyleShootPromptBuilder.ts`
No changes needed — it already pulls the `framingDirective` from the config.

