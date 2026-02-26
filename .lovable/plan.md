

# Refine Top-Down Camera Angle Prompt

## Problem
The current top-down prompt contains product-specific references ("straps", "buckles", "embossed branding") which violates the model-agnostic principle. Product details like these are already injected dynamically by the prompt builder via the `=== PRODUCT COMPONENTS ===` and `=== BRANDING DETAILS ===` sections. The prompt also lacks precise spatial instructions about shoe orientation and alignment.

## Changes

**File**: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 438-439)

**Current `prompt`**:
> "overhead top-down view of pair, both shoes visible side by side, footbed and straps fully visible from above, embossed branding readable"

**New `prompt`**:
> "direct overhead bird's-eye view of pair, both shoes vertically aligned pointing toward top of frame, symmetrical side-by-side with uniform gap, full interior footbed and top surface of uppers visible, outer sides and soles hidden"

**Current `narrative`**:
> "shot from directly overhead, looking straight down at both shoes placed side by side. The footbed, straps, buckles, and any embossed branding are fully visible and readable from this bird's-eye perspective. The symmetry of the pair creates a graphic, almost architectural composition."

**New `narrative`**:
> "a direct overhead, bird's-eye view looking straight down onto the pair. Both shoes are vertically aligned, pointing directly toward the top of the frame. They are arranged in a symmetrical, side-by-side composition, positioned parallel to one another with a small, uniform gap between them. This angle provides a complete view of the interior footbed and the top surface of the uppers, highlighting the internal contours and the overall top-down silhouette of the pair. The outer sides and soles are entirely hidden from this perspective."

## Key Improvements
- **Product-agnostic**: Removed "straps", "buckles", "embossed branding" -- these are injected dynamically by the prompt builder and don't belong here
- **Shoe orientation specified**: "vertically aligned, pointing toward top of frame" -- prevents random rotations
- **Gap defined**: "small, uniform gap between them" -- prevents inconsistent spacing
- **Parallel alignment**: "positioned parallel to one another" -- prevents angled/fanned arrangements
- **Visibility checklist**: Explicitly states what's visible (footbed, top of uppers) and what's hidden (outer sides, soles)

## Scope
Single file change, two fields updated (lines 438-439). `shoeCount` remains 2. No other files affected.

