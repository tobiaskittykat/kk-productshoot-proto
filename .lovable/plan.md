
# Fix Ethnicity Not Being Applied to Generated Images

## Problem Identified

The user selected "African / Black" model ethnicity in the Lifestyle shot configurator, but the generated image did not reflect this selection.

**Root Cause**: The `buildLifestylePrompt()` and `buildOnFootPrompt()` functions in `shotTypeConfigs.ts` completely ignore the `ethnicity` field from the config. Only `gender` is injected into the prompt.

---

## Evidence from Logs

**Config sent to edge function:**
```json
"lifestyleConfig": {
  "gender": "male",
  "ethnicity": "african",  // <-- Sent but never used!
  "pose": "three-quarter",
  "trouserStyle": "straight",
  "topStyle": "knitwear",
  "outfitColor": "contrast-neutral"
}
```

**Resulting prompt (ethnicity missing):**
```
"The male model is photographed..."
```

**Expected:**
```
"An African male model is photographed..." 
```

---

## Solution

Update both prompt builder functions to include ethnicity in the model description.

### Files to Modify

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` | Add ethnicity to both `buildOnFootPrompt()` and `buildLifestylePrompt()` |

---

## Technical Changes

### 1. Add Ethnicity Mapping Helper

Create a helper to convert ethnicity values to natural language:

```typescript
function getEthnicityDescription(ethnicity: string): string {
  const map: Record<string, string> = {
    'auto': '',  // Let AI decide
    'caucasian': 'Caucasian',
    'african': 'African',
    'asian': 'Asian',
    'hispanic': 'Hispanic',
    'middle-eastern': 'Middle Eastern',
    'south-asian': 'South Asian',
    'mixed': 'mixed-race',
  };
  return map[ethnicity] || '';
}
```

### 2. Update buildLifestylePrompt()

**Current (line ~628-630):**
```typescript
const genderStr = config.gender === 'auto' 
  ? ['female', 'male'][Math.floor(Math.random() * 2)]
  : config.gender;
```

**Updated:**
```typescript
// Determine gender string
const genderStr = config.gender === 'auto' 
  ? ['female', 'male'][Math.floor(Math.random() * 2)]
  : config.gender;

// Determine ethnicity string
const ethnicityStr = config.ethnicity === 'auto'
  ? ''  // Let AI choose naturally
  : getEthnicityDescription(config.ethnicity);

// Build model description
const modelDesc = ethnicityStr 
  ? `${ethnicityStr} ${genderStr}` 
  : genderStr;
```

**Then update the prompt (line ~667):**
```typescript
// Before:
The ${genderStr} model is photographed...

// After:
The ${modelDesc} model is photographed...
```

### 3. Update buildOnFootPrompt()

Apply the same pattern to the On-Foot shot builder (line ~301):

```typescript
// Before:
A close-up on-model product shot of a ${genderStr} model wearing Birkenstock footwear...

// After:
A close-up on-model product shot of a ${modelDesc} model wearing Birkenstock footwear...
```

---

## Resulting Prompt Examples

| Ethnicity | Gender | Output |
|-----------|--------|--------|
| african | male | "An African male model is photographed..." |
| asian | female | "An Asian female model is photographed..." |
| auto | male | "A male model is photographed..." (AI decides ethnicity) |
| caucasian | auto | "A Caucasian female model..." (random gender) |

---

## Product Reference Images

**Confirmed:** All 6 product reference images ARE being sent correctly. The logs show:
```
"Adding 6 product images to prompt agent for visual analysis"
```

This is working as expected.

---

## Summary

The fix is straightforward: inject the `ethnicity` value into the prompt text, similar to how `gender` is already handled. This ensures the AI model receives explicit instructions about the model's appearance.
