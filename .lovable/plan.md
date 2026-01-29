

# Add Aspect Ratio and Resolution to Generation Info

## Summary

Add two new metadata rows to the "Generation Info" section in the Image Detail Modal:
1. **Aspect Ratio** - Display the selected ratio (e.g., "1:1", "16:9", "4:5")
2. **Resolution** - Display the pixel size (e.g., "1024px", "2048px")

---

## Current State

The Generation Info section currently shows:
- Model (e.g., "Gemini 3 Pro")
- Status (e.g., "Completed")
- Image ID (truncated UUID)

The data is already available in `image.settings.aspectRatio` and `image.settings.resolution` - it just needs to be displayed.

---

## Technical Changes

### File: `src/components/creative-studio/ImageDetailModal.tsx`

Add two new rows after the "Model" row (around line 392):

**After this block (lines 387-392):**
```typescript
{/* AI Model */}
{image.settings?.aiModel && (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
    <span className="text-muted-foreground">Model</span>
    <span className="text-xs font-medium">{formatModelName(image.settings.aiModel)}</span>
  </div>
)}
```

**Add:**
```typescript
{/* Aspect Ratio */}
{image.settings?.aspectRatio && (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
    <span className="text-muted-foreground">Aspect Ratio</span>
    <span className="text-xs font-medium">{image.settings.aspectRatio}</span>
  </div>
)}

{/* Resolution */}
{image.settings?.resolution && (
  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
    <span className="text-muted-foreground">Resolution</span>
    <span className="text-xs font-medium">{image.settings.resolution}px</span>
  </div>
)}
```

---

## Expected Result

```text
┌─────────────────────────────────────────┐
│ 🎨 Generation Info                      │
├─────────────────────────────────────────┤
│ Model                      Gemini 3 Pro │
│ ─────────────────────────────────────── │
│ Aspect Ratio                       4:5  │  ← NEW
│ ─────────────────────────────────────── │
│ Resolution                      1024px  │  ← NEW
│ ─────────────────────────────────────── │
│ Status                       Completed  │
│ ─────────────────────────────────────── │
│ Image ID                    d673f29f... │
└─────────────────────────────────────────┘
```

---

## File Changes

| File | Changes |
|------|---------|
| `ImageDetailModal.tsx` | Add Aspect Ratio and Resolution rows to Generation Info section |

