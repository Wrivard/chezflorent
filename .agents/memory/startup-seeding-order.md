---
name: Startup seeding order (api-server)
description: Why extra startup photo seeders must gate on importContentSnapshot's success boolean.
---

# Startup seeding order

Any startup seeder that writes to `site_photos` (or another table the content
snapshot guards on "table empty") and runs alongside `importContentSnapshot()`
must run ONLY after that import reports success. `importContentSnapshot()`
returns `Promise<boolean>`: `true` = DB is consistently seeded (committed, or
no-op because already populated), `false` = import failed and rolled back.

```
void importContentSnapshot().then((ready) => { if (ready) void ensureGalleryPhotos(); });
```

**Why:** `importContentSnapshot()` runs its whole seed inside one transaction and
**catches its own errors, then resolves** (never rejects). So `.then()` and
`.finally()` both fire even on failure. Its photo step is gated on
`site_photos` being empty. If a later seeder inserts rows while the snapshot is
still pending a retry (it failed and rolled back to empty), the next boot sees
`site_photos` non-empty and permanently skips the original photo slots.

**How to apply:** Gate every such seeder on the returned `ready` flag. Do not use
`.finally()` and do not fire the seeder unconditionally. Keep the seeder itself
idempotent (insert-missing + `onConflictDoNothing` on the unique `slot`).
