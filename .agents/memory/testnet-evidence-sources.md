---
name: Testnet evidence sources
description: The public Testnet evidence is duplicated across two Markdown documents and one JSON record.
---

The reviewer README and deployment index intentionally publish the same contract
IDs, transaction hashes and links, WASM checksums, and deployment date. Their
section headings differ, so consistency tooling should validate the shared
evidence table and not depend on identical document structure.

**Why:** A redeployment can leave one public copy stale even when the canonical
JSON record is updated.

**How to apply:** Any release that changes `deployments/testnet.json` must run
the consistency check against both public Markdown documents before publishing.