

# Fix "No Changes Needed" False Negative

## Problem

The edge function logs prove the AI model (Gemini 2.5 Flash) sometimes returns ALL null overrides despite explicit prompt rules saying "NEVER return all nulls." The current code has zero resilience against this -- it just shows the toast and gives up.

**Evidence from logs (your request at 11:43:04Z):**
```text
Parsed overrides: {
  "heelstrap": null,
  "sole": null,
  "footbed": null,
  "lining": null,
  "buckles": null,
  "upper": null
}
```

Compare with a test 5 minutes earlier (11:37:47Z) that returned the correct 4 overrides for the same type of request.

## Root Causes

### 1. No Retry Logic
When the AI returns all nulls (which violates Rule 8 in the prompt), the frontend just accepts it and shows "No changes needed." There's no retry mechanism.

### 2. React Hooks Violation (Secondary)
In `ShoeComponentsPanel.tsx`, the `useQuickCustomization` hook is called at line 187 -- AFTER early returns on lines 128 (loading), 143 (analyzing), and 156 (no components). This violates React's Rules of Hooks and can corrupt the hook's internal state across renders.

## Solution

### Fix 1: Add Retry Logic in the Hook

**File:** `src/hooks/useQuickCustomization.ts`

When the edge function returns empty overrides, automatically retry the request once before showing the "no changes" toast. The AI model is probabilistic -- a second attempt with the same prompt almost always succeeds.

```text
Flow:
1. User types "neon green all eva version" and clicks Apply
2. Edge function returns all nulls (AI fluke)
3. Instead of showing toast, log a warning and retry the SAME request
4. Second attempt succeeds -> apply overrides normally
5. If second attempt also returns empty -> THEN show the toast
```

Also add console.log statements to trace what's being sent and received, making future debugging easier.

### Fix 2: Move Hook Before Early Returns

**File:** `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx`

Move the `useQuickCustomization` hook call and `existingComponents` computation to before the early returns. The hook already handles `null` components gracefully (returns early from `applyWithAI` if `!currentComponents`).

```text
Before (buggy order):
  if (isLoading) return ...;       // line 128
  if (isAnalyzing) return ...;     // line 143
  if (!components) return ...;     // line 156
  const existingComponents = ...;  // line 181
  const { ... } = useQuickCustomization(...);  // line 187 - HOOK AFTER RETURNS!

After (correct order):
  const existingComponents = ...;  // moved up
  const { ... } = useQuickCustomization(...);  // HOOK ALWAYS RUNS
  if (isLoading) return ...;
  if (isAnalyzing) return ...;
  if (!components) return ...;
```

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useQuickCustomization.ts` | Add retry loop (1 retry on empty overrides), add console.log for debugging |
| `src/components/creative-studio/product-shoot/ShoeComponentsPanel.tsx` | Move `useQuickCustomization` hook and `existingComponents` before early returns |

## Expected Result

- If AI returns all nulls on first try, it automatically retries once
- Second attempt should succeed (AI non-determinism means it rarely fails twice in a row)
- If both attempts return empty, THEN the "no changes needed" toast appears (genuine case)
- React hook state is stable across all render paths
- Console logs provide visibility for future debugging

