---
name: Dependency security updates
description: Compatibility traps when applying pnpm audit fixes in this workspace.
---

Treat audit-generated overrides as proposed fixes, not a finished dependency upgrade. Consolidate overlapping selectors and bound replacement versions to a compatible major (or minor for pre-1.0 packages). Upgrade Vitest as a unit rather than independently overriding its mocker internals.

**Why:** pnpm's auto-fix generated overlapping, unbounded lower-bound overrides, including independently replacing Vitest internals across major versions. Updating the frontend's Vite catalog alone also left Vitest's separately resolved Vite vulnerable.

**How to apply:** After security updates, regenerate the shared lockfile, audit the resolved dependency graph, and exercise tests and builds. Check both frontend and test-tool Vite resolutions rather than assuming catalog changes cover transitive copies.
