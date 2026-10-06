---
name: Generated request validation
description: OpenAPI-to-Zod codegen does not enforce every declared request constraint.
---

Do not assume generated Zod schemas enforce OpenAPI `type: integer` or array `uniqueItems`. Inspect the generated validators and enforce missing constraints at the request boundary.

**Why:** Current Orval codegen generated ordinary number validators and no uniqueness checks for the full-menu ordering contract despite those constraints being present in OpenAPI. Fractional or duplicate IDs could otherwise reach a transactional mutation.

**How to apply:** When adding ID-list mutations, explicitly reject non-safe-integer and duplicate IDs before opening the transaction, and retain invalid-input regression tests. Recheck this limitation when upgrading codegen.
