---
name: GitHub atomic sync
description: Reliable public-repository handoff when GitHub REST Git Data writes are blocked by the connector proxy.
---

Use the connected GitHub client's `createCommitOnBranch` GraphQL mutation with
`expectedHeadOid` for atomic public-repository syncs. Do not force-push.

**Why:** Read access worked, but both shell-proxy and connected-client REST Git
Data writes were blocked by the connector's Cloudflare layer. The GraphQL
commit mutation succeeded and preserved the remote branch history.

**How to apply:** Confirm the exact remote head first, encode file additions as
base64, include explicit deletions, and pass the confirmed SHA as
`expectedHeadOid`. Abort if the branch moved.