

# Products Page: Tabs + Improved Search + Color Synonyms

## Changes

### 1. Products Page — Add Tabs (`src/pages/Products.tsx`)
- Add `Tabs` with two tabs: **My Products** (existing content) and **Catalog** (embed `CatalogBrowser`)
- `CatalogBrowser` gets an optional `hideBack` prop to suppress the back button when embedded inline
- When import completes via `onDone`, stay on the Catalog tab (no navigation away)

### 2. Tokenized AND-Search (`CatalogBrowser.tsx`)
Replace single-string `.includes(q)` with tokenized matching — split query into words, require ALL tokens to match across the combined `productName + color + model` haystack:
```ts
const tokens = search.toLowerCase().split(/\s+/).filter(Boolean);
result = result.filter(p => {
  const haystack = `${p.productName} ${p.color} ${p.model}`.toLowerCase();
  return tokens.every(t => haystack.includes(t));
});
```

### 3. Color Synonym Map (`CatalogBrowser.tsx`)
Add a color family lookup that expands search tokens matching a color family into all synonyms. For example, typing "red" also matches products with "crimson", "burgundy", "cherry", "scarlet", etc.

```ts
const COLOR_FAMILIES: Record<string, string[]> = {
  red: ['red', 'crimson', 'burgundy', 'cherry', 'scarlet', 'ruby', 'wine', 'garnet', 'brick', 'maroon'],
  pink: ['pink', 'rose', 'blush', 'fuchsia', 'magenta', 'coral', 'salmon', 'fondant'],
  blue: ['blue', 'navy', 'cobalt', 'azure', 'indigo', 'sky', 'denim', 'teal', 'sapphire'],
  green: ['green', 'olive', 'sage', 'forest', 'emerald', 'mint', 'thyme', 'khaki', 'moss'],
  brown: ['brown', 'tan', 'cognac', 'tobacco', 'mocha', 'chocolate', 'espresso', 'habana', 'sienna', 'cork', 'camel'],
  black: ['black', 'onyx', 'anthracite', 'charcoal', 'iron', 'jet', 'ebony'],
  white: ['white', 'cream', 'ivory', 'pearl', 'bone', 'snow', 'alabaster'],
  gray: ['gray', 'grey', 'silver', 'stone', 'slate', 'ash', 'pewter', 'mink'],
  yellow: ['yellow', 'gold', 'mustard', 'honey', 'amber', 'lemon', 'saffron'],
  orange: ['orange', 'tangerine', 'apricot', 'copper', 'peach', 'rust'],
  purple: ['purple', 'violet', 'plum', 'lavender', 'lilac', 'mauve', 'port', 'eggplant'],
  beige: ['beige', 'sand', 'taupe', 'nude', 'oat', 'latte', 'biscuit', 'desert'],
};
```

During token matching, if a token matches a color family key, expand it so the product matches if its haystack contains **any** synonym from that family. This way searching "red sandal" finds products with color "Crimson" or "Burgundy".

### 4. Files Changed
| File | Change |
|------|--------|
| `src/pages/Products.tsx` | Add Tabs component wrapping existing content + CatalogBrowser |
| `src/components/creative-studio/product-shoot/CatalogBrowser.tsx` | Add `hideBack` prop, tokenized AND-search, color synonym expansion |

