

# Refine Side Profile Camera Angle Prompt

## Problem
The current side profile prompt says "product facing left" which contradicts the Gemini analysis (toe to the right, heel to the left). It also lacks specifics about camera height, what should/shouldn't be visible, and vertical centering.

## Changes

**File**: `src/components/creative-studio/product-shoot/shotTypeConfigs.ts` (lines 430-431)

**Current `prompt`**:
> "pure lateral side profile view, single shoe centered, showing full silhouette from true side angle, product facing left"

**New `prompt`**:
> "precise eye-level side profile, shoe perfectly horizontal with toe pointing right and heel pointing left, flat lateral silhouette emphasizing full length of sole and upper contour, interior hidden"

**Current `narrative`**:
> "a pure lateral view capturing the full silhouette. A single shoe centered in frame, photographed from a true side angle with the product facing left. The entire profile line -- from heel counter through the arch to the toe -- reads as one clean, uninterrupted silhouette against the background."

**New `narrative`**:
> "a precise, eye-level side profile perspective. The camera is positioned directly perpendicular to the side of the shoe, perfectly level with it. The shoe is oriented perfectly horizontal, with the toe pointing directly to the right edge of the frame and the heel aligned toward the left. The shoe sits flat on its sole, centered vertically in the frame to emphasize its silhouette and proportions. This composition captures a flat, two-dimensional lateral silhouette, showcasing the full length and contour of both the sole and the upper while the interior footbed remains obscured from view."

## Key Improvements
- **Camera position**: "directly perpendicular to the side" and "eye-level" -- removes ambiguity
- **Toe direction corrected**: "toe right, heel left" matches the reference thumbnail (was incorrectly "facing left")
- **Vertical centering**: "centered vertically in the frame" -- ensures balanced composition
- **Flat on sole**: Specifies the shoe sits flat, not tilted
- **Interior hidden**: Explicitly states the footbed is obscured from this angle
- **2D silhouette emphasis**: "flat, two-dimensional lateral silhouette" tells the AI exactly what visual quality to achieve

## Scope
Single file change, two fields updated. No other files affected.

