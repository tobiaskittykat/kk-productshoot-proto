

# Update Materials Library: Add Birko-Flor Variants & Translucent Buckles

## Overview

Updating `src/lib/birkenstockMaterials.ts` to add missing materials and buckle finishes based on actual Birkenstock catalog.

---

## Changes to `src/lib/birkenstockMaterials.ts`

### 1. Update Upper Materials (add Birko-Flor variants, organize with clearer labels)

```typescript
upper: [
  // Natural Leathers
  { value: 'Oiled Leather', label: 'Oiled Leather' },
  { value: 'Smooth Leather', label: 'Smooth Leather' },
  { value: 'Nubuck', label: 'Nubuck (Leather)' },        // Clarified
  { value: 'Suede', label: 'Suede' },
  { value: 'Patent Leather', label: 'Patent Leather' },
  { value: 'Shearling', label: 'Shearling' },
  
  // Birkenstock Synthetics
  { value: 'Birko-Flor', label: 'Birko-Flor (Smooth)' },      // Clarified
  { value: 'Birko-Flor Nubuck', label: 'Birko-Flor Nubuck' }, // NEW
  { value: 'Birko-Flor Patent', label: 'Birko-Flor Patent' }, // NEW
  { value: 'Birkibuc', label: 'Birkibuc' },
  { value: 'EVA', label: 'EVA (Molded)' },                    // Clarified
  
  // Textiles
  { value: 'Wool Felt', label: 'Wool Felt' },
  { value: 'Canvas', label: 'Canvas' },
  { value: 'Fabric', label: 'Fabric (Woven)' },
  { value: 'Mesh', label: 'Mesh (Breathable)' },
  { value: 'Recycled PET', label: 'Recycled PET (Eco)' },
],
```

### 2. Add New Buckle Finishes (Translucent, Metallic Rose Gold, Big Buckle)

```typescript
buckles: [
  // Metal finishes
  { value: 'Metal (Brass)', label: 'Metal (Brass/Gold)' },
  { value: 'Metal (Silver)', label: 'Metal (Silver)' },
  { value: 'Metal (Copper)', label: 'Metal (Copper)' },
  { value: 'Metal (Rose Gold)', label: 'Metal (Rose Gold)' },  // NEW
  { value: 'Antique Brass', label: 'Antique Brass' },
  
  // Plastic finishes
  { value: 'Matte Plastic', label: 'Matte Plastic' },
  { value: 'Matte Plastic (Coordinated)', label: 'Matte Plastic (Color-Matched)' },
  
  // Translucent/Big Buckle options  
  { value: 'Translucent', label: 'Translucent (Clear)' },              // NEW
  { value: 'Translucent Rose Gold', label: 'Translucent (Rose Gold)' }, // NEW
  { value: 'Metallic Rose Gold', label: 'Metallic (Rose Gold Big Buckle)' }, // NEW
],
```

### 3. Update Heelstrap (add Birko-Flor Nubuck)

```typescript
heelstrap: [
  { value: 'Suede', label: 'Suede' },
  { value: 'Oiled Leather', label: 'Oiled Leather' },
  { value: 'Smooth Leather', label: 'Smooth Leather' },
  { value: 'Nubuck', label: 'Nubuck' },
  { value: 'Birko-Flor', label: 'Birko-Flor' },
  { value: 'Birko-Flor Nubuck', label: 'Birko-Flor Nubuck' },  // NEW
],
```

### 4. Add Rose Gold to Color Presets

```typescript
// Add to COLOR_PRESETS array
{ name: 'Rose Gold', hex: '#B76E79', category: 'metallic' },
{ name: 'Blush', hex: '#DE98AB', category: 'color' },  // For the pink EVA
```

---

## Summary of Additions

| Category | New Options |
|----------|-------------|
| **Upper** | `Birko-Flor Nubuck`, `Birko-Flor Patent` |
| **Buckles** | `Metal (Rose Gold)`, `Translucent`, `Translucent Rose Gold`, `Metallic Rose Gold Big Buckle` |
| **Heelstrap** | `Birko-Flor Nubuck` |
| **Colors** | `Rose Gold`, `Blush` |

---

## Labels Clarified

| Before | After |
|--------|-------|
| `Nubuck` | `Nubuck (Leather)` |
| `Birko-Flor` | `Birko-Flor (Smooth)` |
| `EVA` | `EVA (Molded)` |

---

## File to Modify

| File | Changes |
|------|---------|
| `src/lib/birkenstockMaterials.ts` | Add new materials, buckle finishes, colors; clarify labels |

