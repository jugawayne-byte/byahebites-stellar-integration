---
name: Rebase evidence preservation
description: How to protect canonical deployment evidence when overlapping imported artifacts are rebased.
---

When rebasing deployment work, prefer the current canonical Testnet evidence and verified runtime implementation over incoming generic scaffold files. Revalidate any Replit artifact or workspace TOML through the platform schema callback before staging it.

**Why:** Overlapping imported-history commits can reintroduce placeholders, omit initialization evidence, or leave conflict markers inside staged configuration copies even when the working tree appears mostly resolved.

**How to apply:** Compare the two sides for deployment-critical behavior, retain public IDs/hashes/URLs and fail-closed runtime paths, and run the evidence validator plus a production build and live HTTP smoke check after the rebase.