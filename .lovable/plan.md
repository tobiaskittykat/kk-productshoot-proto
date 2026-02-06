
# Fix Color Picker in Nested Dialog/Popover

## Problem Identified

The color picker in `ComponentOverridePopover` is not working because it's rendered inside a nested modal structure:

```text
ProductPickerModal (Dialog)
  └── ShoeComponentsPanel
       └── ComponentRow
            └── ComponentOverridePopover (Popover inside Dialog)
                 └── Color Swatches (click events not working)
```

When a Popover is inside a Dialog in Radix UI, the Popover's content is portaled outside the Dialog's DOM tree. However, the Dialog's modal behavior traps pointer events, preventing clicks from reaching the Popover content.

## Solution

Add `pointer-events-auto` to the PopoverContent to ensure interactive elements work properly inside the nested modal context. This is the same pattern used for datepickers inside dialogs (documented in shadcn's datepicker pattern).

---

## Technical Changes

### File: `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx`

Add `pointer-events-auto` class to the PopoverContent wrapper:

```typescript
<PopoverContent 
  className="w-80 p-4 pointer-events-auto" 
  align="end"
>
```

This ensures that even when the popover is portaled outside a Dialog, the interactive elements (color swatches, buttons, inputs) will correctly receive click events.

---

## Alternative (if above doesn't work)

If the `pointer-events-auto` fix isn't sufficient, we may need to set `modal={false}` on the Popover to disable its modal behavior entirely:

```typescript
<Popover open={open} onOpenChange={setOpen} modal={false}>
```

This tells Radix not to trap focus or pointer events, which allows it to work properly inside another modal component.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/creative-studio/product-shoot/ComponentOverridePopover.tsx` | Add `pointer-events-auto` to PopoverContent className; optionally add `modal={false}` to Popover |
