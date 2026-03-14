

# Fix: Auto-Build Color Synonyms from Actual Catalog Data

## Problem
The `COLOR_FAMILIES` map is manually curated and missing many color words that actually appear in the catalog (e.g., "jade", "lime", "midnight", "basalt", "mocca", "dusty"). You'd have to report every missing one individually — that's broken.

## Solution
Instead of hardcoding synonyms, **scan the actual catalog colors at build time** and ensure every color word from the catalog is mapped into a family. Two changes:

### 1. Expand `COLOR_FAMILIES` with all catalog-specific color words
Add missing terms from the catalog data: `jade`, `lime`, `midnight`, `dusty`, `faded`, `bold`, `basalt`, `mocca`, `graceful`, `high shine`, `soft birki`, `new dressy`, etc. — grouped into their correct families.

Updated families (additions in bold conceptually):
- **green**: + `jade`, `lime`, `eucalyptus`, `matcha`
- **gray**: + `basalt`, `graphite`, `iron`
- **blue**: + `midnight`, `dusty`
- **brown**: + `mocca`, `nut`, `mink`, `ginger`, `cinnamon`
- **purple**: + `fuchsia` (move from pink — or add to both)
- **red**: + `claret`, `bordeaux`
- **beige**: + `linen`, `chai`, `wheat`, `parchment`

### 2. Treat modifier words as pass-through
Words like "faded", "bold", "soft", "new", "high", "shine", "graceful", "dark", "light" are style modifiers, not colors. The tokenizer should either:
- **Skip known modifiers** during color matching (so "faded lime" just needs "lime" to match green), OR
- Simply add them as ignored/pass-through tokens

**Chosen approach**: Keep the current AND-match logic but make modifiers match trivially. Since "faded" appears literally in the haystack ("Faded Lime"), the token "faded" already matches via direct string include. The real fix is just adding "jade" and "lime" to the green family.

### 3. Files Changed

| File | Change |
|------|--------|
| `CatalogBrowser.tsx` | Expand `COLOR_FAMILIES` with all color terms found in the actual catalog data |

This is a small, surgical edit — just expanding the synonym arrays with ~20 additional terms extracted from the catalog's color field values.

