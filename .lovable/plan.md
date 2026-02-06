

# Fix Image Generation Failures (Timeout Issue)

## Problem Identified

The `generate-image` edge function is failing with `TypeError: Load failed` before the request even reaches the server (no server logs exist). This is caused by:

1. **Function not in config.toml** - The `generate-image` function was missing from `supabase/config.toml`. I just deployed it manually, but it needs to be added to the config to ensure consistent deployment.

2. **Client-side timeout** - Gemini Pro image generation takes 30-60+ seconds. The browser or Supabase client is dropping the connection before the function can respond.

## Solution: Async Queue Pattern

Instead of waiting synchronously for image generation to complete, switch to an async pattern:

1. **Client calls edge function** → Function immediately returns a job ID
2. **Function generates image in background** using `EdgeRuntime.waitUntil()`
3. **Function saves result to database** when complete
4. **Client polls database** for the result (already partially implemented in `useImageGeneration.ts`)

---

## Changes Required

| File | Change |
|------|--------|
| `supabase/config.toml` | Add `[functions.generate-image]` with `verify_jwt = false` |
| `supabase/functions/generate-image/index.ts` | Refactor to return job ID immediately, use `EdgeRuntime.waitUntil()` for background processing |
| `src/hooks/useImageGeneration.ts` | Update to poll database for completed images instead of waiting for HTTP response |

---

## Implementation Details

### 1. Add to config.toml

```toml
[functions.generate-image]
verify_jwt = false
```

### 2. Refactor Edge Function to Async

```typescript
// Current flow (synchronous - times out):
// Client → Edge Function → Wait 60s for Gemini → Return image → Client

// New flow (async - no timeout):
// Client → Edge Function → Return job ID immediately → Client starts polling
//                       ↓
//                  waitUntil() continues in background
//                       ↓
//                  Generate image → Save to DB
//                       ↓
//                  Client poll finds completed image
```

Key changes:
- Create a `pending_generations` or use existing `generated_images` table with a status field
- Return a generation ID immediately (within 1-2 seconds)
- Use `EdgeRuntime.waitUntil(generateAndSave(generationId, request))` for background processing
- Update the database row when generation completes or fails

### 3. Update Frontend Polling

The recovery mechanism in `useImageGeneration.ts` (lines 575-587) already checks the database for images. Extend this to:
- Start polling immediately after receiving the job ID
- Poll every 5 seconds for up to 2 minutes
- Show progress indicator with estimated time remaining
- Handle both success and failure states

---

## Why This Works

- Edge function returns in ~1 second (no timeout)
- Background task can run for up to 2 minutes (edge function limit)
- Client is decoupled from the generation time
- Existing database storage is reused
- If the browser closes, the image still generates and saves

---

## Quick Fix (Immediate)

Before implementing the full async pattern, I can add the function to `config.toml` which ensures it's properly deployed and may resolve some issues. This is a quick fix that takes 1 minute.

Do you want me to:
1. **Quick fix only** - Add to config.toml (may still timeout on long generations)
2. **Full async pattern** - Implement the background queue (robust, no timeouts)

