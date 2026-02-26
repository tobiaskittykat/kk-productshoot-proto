

# Fix Sole View Shot Prompt

## Problem
The current sole view narrative is vague ("artfully arranged", "dual-perspective product story") and doesn't specify camera angle, shoe orientations, or spatial directions. This leads to wrong angles, extra shoes, and inconsistent compositions.

## Solution
Replace both the `prompt` and `narrative` fields for the `sole-view` angle in `shotTypeConfigs.ts` with your clearer, spatially precise description.

## Change

**File:** `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 446-447)

**Current:**
```
prompt: 'one shoe flipped to show sole tread pattern and outsole construction, second shoe showing footbed, artfully arranged to show both surfaces'
narrative: 'one shoe flipped upside down to reveal the outsole tread pattern and construction, while the second shoe sits right-side-up showing the footbed. The two are artfully arranged to present both the walking surface and the wearing surface in a single composition — a dual-perspective product story.'
```

**New:**
```
prompt: 'two shoes in a dynamic cross-composition, front shoe angled diagonally showing footbed, rear shoe resting on its side revealing textured sole, high-angle three-quarter hero shot'
narrative: 'a high-angle, three-quarter hero shot. The camera is positioned slightly above the shoes looking down. The foreground shoe is placed at a 45-degree diagonal with the toe pointing toward the bottom-left and heel toward the top-right, sitting flat and showcasing the interior footbed and top straps. The background shoe is positioned behind, tilted on its side so the textured outsole tread faces the viewer, angled on the opposite diagonal with the toe pointing toward the bottom-right. The two shoes form a cross-composition — the heel of the foreground shoe partially overlaps the middle section of the background shoe, creating depth.'
```

## Why This Is Better
- **Camera position defined**: "high-angle, three-quarter" with "slightly above looking down" instead of no camera direction at all
- **Each shoe described independently**: foreground vs background, with specific toe-pointing directions
- **Spatial relationship explicit**: "cross-composition", "partially overlaps the middle section"
- **No flowery filler**: removed "artfully arranged", "dual-perspective product story"
- **Concise enough**: the narrative is detailed but not overloaded -- each sentence adds a concrete spatial instruction

