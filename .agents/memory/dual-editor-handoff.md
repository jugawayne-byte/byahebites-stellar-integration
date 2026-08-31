---
name: Dual-editor handoff
description: Collaboration convention for parallel work in Replit and another editor.
---

Use the shared GitHub repository as the handoff point between parallel editors. Push a stable revision before the other editor pulls or edits, and keep local build output, CLI installations, and credentials out of the repository.

The Replit workspace and public GitHub repository may have unrelated Git histories. Never force-push the workspace branch over GitHub. Base synchronization on the latest remote `main`, apply only the intended source and lockfile changes, then fast-forward the remote with an expected-head guard.

**Why:** Parallel edits against separate local workspaces can otherwise cause one editor to test or overwrite a stale revision. An unrelated-history merge or force push can also publish generated workspace files or erase partner commits.

**How to apply:** Before switching workspaces or asking the partner to validate, sync the intended source and lockfile changes from a temporary tree based on current GitHub `main`. Refuse the update if the remote head moved, and have the partner pull the resulting stable revision before making further changes.