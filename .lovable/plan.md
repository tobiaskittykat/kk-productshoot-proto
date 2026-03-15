

# Advanced Settings: Auto Default + Expert Photography Options

## Changes

### 1. Add "Auto" as default for all settings

Every dropdown gets an `auto` option at position 0 with an empty `promptFragment` — meaning the Prompt Agent decides naturally based on the moodboard and shot type. All defaults change from specific values (e.g., `eye-level`, `85mm`) to `auto`.

### 2. Expand options to expert-level granularity

A real fashion/editorial photographer would want these:

**Camera Angle** (current: 6 options → 10):
- Auto, Eye Level, Low Angle, High Angle, Dutch Angle, Over-the-Shoulder, Bird's Eye, Worm's Eye (ground-level up), Three-Quarter, Profile/Side

**Lighting** (current: 6 → 12):
- Auto, Natural/Ambient, Golden Hour, Blue Hour, Diffused Overcast, Hard Direct Sun, Studio Softbox, Rembrandt, Split Light, Rim/Edge Light, Butterfly/Paramount, Practical/Available Light

**Camera Lens** (current: 6 → 10):
- Auto, 24mm, 28mm, 35mm, 50mm, 85mm, 105mm, 135mm, 200mm, Macro 100mm

**Camera Type** (current: 3 → 7):
- Auto, Digital Full-Frame, Digital Medium Format, 35mm Film, Medium Format Film (6x7), Large Format (4x5), Polaroid/Instant

**Film Stock** (current: 6 → 12):
- Auto/Digital, Kodak Portra 160, Kodak Portra 400, Kodak Portra 800, Kodak Ektar 100, Fuji Pro 400H, Fuji Velvia 50 (slide), Kodak Tri-X 400 B&W, Ilford HP5 Plus B&W, Ilford Delta 3200 B&W, CineStill 800T, Lomography 800

**New category — Depth of Field** (new):
- Auto, Ultra Shallow (f/1.2–1.4), Shallow (f/1.8–2.8), Moderate (f/4–5.6), Deep (f/8–11), Maximum (f/16–22)

### 3. Files to edit

| File | Change |
|------|--------|
| `types.ts` | Add `depthOfField` to `LifestyleAdvancedSettings`, set all defaults to `'auto'` |
| `lifestyleShootConfigs.ts` | Replace all option arrays with expanded expert lists + auto first; add `depthOfFieldOptions`; update `getAdvancedPromptFragments` |
| `LifestyleAdvancedPanel.tsx` | Add 6th dropdown for Depth of Field, update grid layout |
| `lifestyleShootPromptBuilder.ts` | No change needed (already uses `getAdvancedPromptFragments`) |

