

# Inject Creative Variety into Styled Still Life

## Problem

The Styled Still Life framing directive is a single, static block of text. Every generation gets the exact same compositional instructions: "three-quarter overhead (30-45°)", "casually staggered", "30-40% of frame", "1-2 small contextual objects." There is no randomization or variety — unlike the Product Shoot flow which randomly selects from concrete pose/styling options when set to "Auto."

The result: every Styled Still Life looks structurally identical regardless of moodboard. The moodboard changes colors and textures, but the camera angle, composition, spatial arrangement, and editorial energy are always the same.

## Approach

Add a **randomized creative direction pool** to the Styled Still Life shot type. When advanced settings are on "Auto," the system randomly selects from a curated pool of distinct compositional treatments — each inspired by real Birkenstock editorial photography and high-end footwear campaigns.

### File: `lifestyleShootConfigs.ts`

Create a new `styledStillLifeVariations` array with 8-10 distinct compositional recipes. Each variation defines a unique combination of:

- **Camera angle & height** (ground-level hero, steep overhead, eye-level frontal, dutch tilt)
- **Spatial arrangement** (one shoe on its side revealing footbed, overlapping pair, single shoe hero with second shoe soft-focus, shoes at edge of frame with environment dominating)
- **Depth of field treatment** (razor-thin focus on buckle hardware, deep focus environmental, split focus)
- **Editorial energy** (quiet contemplative, caught mid-moment, morning-after, end-of-day exhaustion, mid-adventure)
- **Prop philosophy** (no props / surface-only, one dominant object, scattered small objects, environmental integration where the "prop" is the ground itself)

Example variations:
1. **Ground-Level Hero**: Camera at ground level, one shoe sharp foreground, second shoe soft behind. Shallow DoF. Intimate, voyeuristic.
2. **Steep Overhead Flat Lay**: Near-vertical bird's-eye. Shoes arranged asymmetrically with negative space. Deep focus. Graphic, editorial.
3. **Environmental Wide**: Shoes small in frame (15-20%), environment dominates. 35mm wide lens feel. The place is the story.
4. **Footbed Reveal**: One shoe on its side exposing the cork footbed, other upright. Three-quarter angle. Material texture is the hero.
5. **Edge Composition**: Shoes placed at the extreme edge or corner of frame. Unconventional, fashion-forward negative space.
6. **Morning Light Drama**: Low raking light, long shadows that become compositional elements. Shoes catch light on buckle hardware.
7. **Macro Detail in Context**: Tight crop on one shoe's details (stitching, buckle, suede texture) with the second shoe and environment in soft bokeh behind.
8. **Deconstructed Pair**: One shoe casually tipped or fallen, laces/straps loose. Lived-in, anti-catalog energy.

### File: `lifestyleShootPromptBuilder.ts`

When building the prompt for `product-only` shot type and advanced settings are all on "Auto":
- Randomly select one variation from the pool
- Inject it as the framing directive instead of (or layered on top of) the static default
- Log which variation was selected for debugging

When any advanced setting is manually set, skip the randomization and use the current static directive + manual overrides as today.

### File: `craft-image-prompt/index.ts`

Update the system prompt to include a directive about **compositional boldness** — tell the prompt agent that for still life shots, it should lean into unconventional angles and editorial risk rather than defaulting to safe, centered compositions.

## What stays the same

- The priority hierarchy (moodboard > shot type) is unchanged
- Product integrity lock is unchanged
- Advanced manual overrides still work exactly as before
- Other shot types (On Foot, Body & Style, Portrait) are not affected

