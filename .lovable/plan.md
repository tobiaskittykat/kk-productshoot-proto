

# Add "Auto" Aspect Ratio Option

## What
Add an "Auto" option to the aspect ratio selector so the AI model chooses the best aspect ratio for each shot automatically.

## How

### 1. `src/components/creative-studio/types.ts`
Add `'auto'` as the first item in the `aspectRatios` array:
```ts
export const aspectRatios = ['auto', '1:1', '16:9', '9:16', '4:3', '3:4'];
```

### 2. `supabase/functions/generate-image/index.ts`
- When `aspectRatio === 'auto'`, omit the `aspect_ratio` field from `image_config` (let the model decide), OR default to `1:1` — need to check if the AI gateway accepts missing aspect_ratio.
- Also skip the "Aspect Ratio: X format" prompt injection when value is `'auto'`.
- Add a prompt fragment like: `"Choose the aspect ratio that best suits this composition."` so the model actively decides.

### 3. Display labels (UI)
In the three Step2 components (`LifestyleShootStep2.tsx`, `ProductShootStep2.tsx`, `RemixStep2.tsx`), update the `SelectItem` rendering to show "Auto" instead of "auto" — e.g.:
```tsx
{aspectRatios.map(a => (
  <SelectItem key={a} value={a}>{a === 'auto' ? 'Auto' : a}</SelectItem>
))}
```

### Files Changed
- `src/components/creative-studio/types.ts` — add `'auto'` to array
- `supabase/functions/generate-image/index.ts` — handle `'auto'` aspect ratio
- `src/components/creative-studio/product-shoot/LifestyleShootStep2.tsx` — display label
- `src/components/creative-studio/product-shoot/ProductShootStep2.tsx` — display label
- `src/components/creative-studio/product-shoot/RemixStep2.tsx` — display label

