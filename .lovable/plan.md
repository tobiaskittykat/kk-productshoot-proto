

# Fix: Save Button Greyed Out After Custom Background Analysis

## Root Cause
After clicking "Analyze with AI", the prompt field gets auto-filled but the **Name** field stays empty. Since the Save button requires both `name` and `prompt` to be non-empty (`const canSave = name.trim() && prompt.trim() && !isSaving`), it remains disabled.

The Name field is easy to overlook after analysis because your attention moves to the Analyze button and the generated prompt.

## Solution
Auto-generate a sensible name from the AI analysis results so the Save button becomes enabled immediately after analysis completes. The user can still edit the name if they want.

## Changes

### File: `src/components/creative-studio/product-shoot/CreateCustomBackgroundModal.tsx`

1. In `handleAnalyze`, after receiving the AI response, auto-fill the name if it's still empty:
   - Use the `mood` field from the analysis (e.g., "serene and natural winter" becomes "Serene And Natural Winter")
   - Fallback to "Custom Background" if mood is unavailable

2. Also disable Save during analysis (`isAnalyzing`) to prevent edge cases:
   - Update `canSave` to: `name.trim() && prompt.trim() && !isSaving && !isAnalyzing`

### Code Change (in `handleAnalyze`, after `setAiAnalysis`):

```text
// Auto-fill name if empty
if (!name.trim() && data.analysis?.mood) {
  const autoName = data.analysis.mood
    .split(/[\s,]+/)
    .slice(0, 4)
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  setName(autoName);
} else if (!name.trim()) {
  setName("Custom Background");
}
```

### Updated canSave:
```text
const canSave = name.trim() && prompt.trim() && !isSaving && !isAnalyzing;
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/CreateCustomBackgroundModal.tsx` | Auto-fill name from AI mood after analysis; disable save during analysis |

No database or backend changes needed.
