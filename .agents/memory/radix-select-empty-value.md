---
name: Radix/shadcn Select cannot use empty-string item values
description: A SelectItem with value="" crashes at runtime in @radix-ui/react-select; use a sentinel value instead.
---

# Radix Select empty-string value crash

`@radix-ui/react-select` (used by shadcn `ui/select.tsx`) throws at runtime if a `<SelectItem value="">` is rendered (empty string is reserved for clearing/placeholder). This breaks the whole section/app render, not just the dropdown.

**Fix:** Use a non-empty sentinel value (e.g. `"default"`, `"all"`) for the "no filter" option, and map it to `undefined` before passing to the API/query.

**Why:** Subagent-generated forms commonly reach for `value=""` as the default option; typecheck passes but the app crashes only at runtime when the dropdown mounts.

**How to apply:** Any shadcn/Radix Select used as a filter/sort control with an "all"/"default"/"none" option.
