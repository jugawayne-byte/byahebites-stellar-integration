---
name: Publish context size
description: Prevent generated workspace data from making Replit publication images exceed the platform limit.
---

Use `.replitignore`, not only `.gitignore`, to exclude generated dependencies,
caches, build output, Git metadata, and Rust target directories from publishing.

**Why:** A locally healthy monorepo exceeded the publish image limit because
several gigabytes of ignored Rust targets, package data, caches, and repository
metadata were still included in the publication context.

**How to apply:** Keep recursive exclusions for `node_modules`, `.cache`,
`dist`, and `target`, plus top-level `.local` and `.git`. Build outputs and
dependencies must be recreated by the publication build instead of copied from
the development workspace.