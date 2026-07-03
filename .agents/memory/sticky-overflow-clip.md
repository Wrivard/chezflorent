---
name: Sticky photo / overflow-x wrapper gotcha
description: Why the menu preview "Glissez sur un plat" sticky photo breaks, and the clip fix
---

Each public page in `chez-florent` wraps its content in a full-width
`<div className="overflow-x-...">` (to tame horizontal overflow from oversized
display headings / marquees). The menu sections (both `App.tsx` `<Menu />` on the
home page AND `MenuPage.tsx`) put the dish photo in a `lg:sticky lg:top-32` grid
column (`grid ... items-start`, `lg:grid-cols-[minmax(0,1fr)_400px]`).

**Rule:** those page wrappers must use `overflow-x-clip`, NOT `overflow-x-hidden`.

**Why:** setting one axis to `overflow: hidden` forces the other axis to
`overflow: auto`, which makes the wrapper a scroll container. A scroll-container
ancestor disables `position: sticky` for its descendants relative to the viewport,
so the photo scrolls away instead of following the list. `overflow: clip` clips
the same horizontal overflow but does NOT create a scroll container, so sticky
works. This bit twice — first only `MenuPage` was fixed, but the user was viewing
the home-page `<Menu />`, which had its own two `overflow-x-hidden` wrappers
(main render + admin single-section preview render).

**How to apply:** any time you add a `sticky` element inside these pages, verify no
ancestor uses `overflow-*-hidden`/`auto`/`scroll`. Prefer `overflow-x-clip` on the
horizontal-taming page wrappers. Note `.lg:sticky` only engages at ≥1024px, so the
sticky effect is desktop-only by design (mobile stacks single-column).
