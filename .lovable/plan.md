

# Fix: Prefix Matching for Partial Search Tokens

## Problem
Typing "eva gre" finds nothing because "gre" doesn't exactly match "green" or any synonym. Users expect live filtering as they type.

## Solution
Change `tokenMatchesHaystack` to use **prefix matching** instead of exact substring matching for color synonyms. A token like "gre" should match any synonym that **starts with** "gre" (e.g., "green", "grey").

### Change in `CatalogBrowser.tsx`

Update `tokenMatchesHaystack`:
- Direct haystack check: split haystack into words, check if any word **starts with** the token (instead of `haystack.includes(token)`)
- Color synonym check: check if any synonym **starts with** the token, then check if any word in the haystack starts with any synonym from that family

This means "gre" matches both "green" family and "grey" family, showing all green and grey EVA products — which narrows as the user keeps typing "gree" → "green".

### File
| File | Change |
|------|--------|
| `CatalogBrowser.tsx` | Update `tokenMatchesHaystack` to use prefix/startsWith matching |

