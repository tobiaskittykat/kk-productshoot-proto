

# Fix Toe Post Color Rendering in Image Generation

## The Problem

The current approach adds toe post instructions as abstract **relationship rules** ("Note: the toe post strap matches the sole color"). The prompt agent (Gemini 2.5 Flash) has to interpret these rules, resolve the actual colors, and weave them into its evocative prose. It frequently fails to do this -- either dropping the instructions entirely or describing them vaguely.

The image generator then receives a prompt that says nothing specific about the toe post, and renders it however it likes.

## Root Cause

The toe post instructions flow through **two AI layers**, each of which can lose the signal:

1. **Creative Brief** --> Prompt Agent: Abstract rules like "toe post strap matches sole color" get buried as "Notes" at the bottom of the override section. The prompt agent often ignores or softens these.
2. **Prompt Agent output** --> Image Generator: Even if mentioned, vague phrasing like "the toe post in a matching tone" doesn't give the image model enough to work with.

## Solution: Pre-resolve Colors, Add as Explicit Components

Instead of asking the AI to figure out the relationship, we **pre-resolve the actual colors** and inject the toe post strap and pin as if they were explicit component overrides. This removes all ambiguity.

For example, instead of:
```
Note: On thong-style sandals, the toe post strap matches the sole color.
```

We inject:
```
TOE POST STRAP: must be White (same as sole)
TOE POST PIN/RIVET: must be Silver (same as buckle hardware)
```

This way, both the prompt agent and the image generator see concrete, unambiguous color instructions.

## Changes

### 1. `supabase/functions/generate-image/index.ts` -- Pre-resolve toe post colors

In the component overrides section (~line 580-600), replace the abstract "Note:" lines with concrete, resolved entries:

- When sole overrides exist, compute the sole's color and add: `TOE POST STRAP: [resolved sole color] (must match sole -- critical for thong-style sandals like Gizeh, Ramses, Mayari)`
- When buckle overrides exist, compute the buckle's color and add: `TOE POST PIN/RIVET: [resolved buckle color] (must match buckle hardware finish)`
- When both exist, add both entries
- Even when no overrides exist but original components have sole/buckle data, add a note about the default relationship so the prompt agent can describe it accurately

### 2. `supabase/functions/generate-image/index.ts` -- Add toe post to prompt agent system prompt

In the system prompt (~line 632-669), add a specific instruction about toe post rendering:

```
8. **TOE POST ACCURACY (THONG-STYLE SANDALS)** - When the brief includes 
   TOE POST STRAP or TOE POST PIN entries, you MUST describe these colors 
   explicitly in your prompt. The toe post is the vertical strap between 
   the big toe and second toe. Its color and the small pin at its base 
   are critical details that must be specified clearly.
```

### 3. `src/lib/birkenstockMaterials.ts` -- Pre-resolve in `buildComponentOverridePrompt`

Update `buildComponentOverridePrompt()` to also use the pre-resolved approach. Replace the "Note:" lines with explicit entries that include the resolved color values:

```typescript
// Instead of vague notes, add explicit resolved entries
if (overrides.sole) {
  const soleColor = getColorDescription(overrides.sole);
  lines.push(`TOE POST STRAP: ${soleColor} (must match sole color exactly)`);
}
if (overrides.buckles) {
  const buckleColor = getColorDescription(overrides.buckles);
  lines.push(`TOE POST PIN/RIVET: ${buckleColor} (must match buckle hardware finish)`);
}
```

### 4. `supabase/functions/generate-image/index.ts` -- Add toe post to fidelity instruction

In the COMPONENT OVERRIDE MODE section (~line 726-746), add toe post as an explicit example of contrast language:

```
- "White toe post strap (matching the White sole, instead of the original Black)"
- "Silver toe post pin (matching the Silver buckle hardware)"
```

This teaches the prompt agent how to phrase toe post changes clearly.

## What This Achieves

- The prompt agent receives **concrete colors** (e.g., "TOE POST STRAP: White") instead of abstract rules ("strap matches sole")
- The image generator's prompt will contain explicit descriptions like "white toe post strap between the toes matching the white sole" instead of nothing or vague references
- Both AI layers get unambiguous, specific instructions they can act on
- No UI changes needed -- this is purely a prompt engineering improvement

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-image/index.ts` | Replace abstract toe post "Notes" with pre-resolved color entries; add toe post instruction to system prompt; add toe post examples to fidelity instruction |
| `src/lib/birkenstockMaterials.ts` | Update `buildComponentOverridePrompt()` to use pre-resolved colors instead of abstract notes |

