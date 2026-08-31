---
name: Standalone API packaging
description: Constraints for compiling and running a workspace API as an isolated deployment artifact.
---

When an API is compiled into a self-contained bundle, workspace-only imports
should be bundled or removed from its runtime boundary. Its package manifest
must not require `workspace:*` or `catalog:` resolution for an isolated
`pnpm install --prod`; pnpm can still parse development entries while pruning
them, so standalone package manifests need concrete specs too.

Keep the deployment liveness path dependency-free and separate from integration
configuration or external-service checks. A supervisor may probe the liveness
path before the service is ready and should receive 200 without Stellar
credentials.

**Why:** The monorepo install hid workspace/catalog assumptions, while the
deployment environment installs and starts the API artifact independently.
The deployment supervisor also probes `/api` during startup, so an external
check there caused false startup failures.

**How to apply:** Bundle local workspace code, remove unused workspace
dependencies, use concrete versions in standalone manifests, keep `/api` and
`/api/healthz` lightweight, and expose configuration diagnostics separately
with an explicit degraded response when configuration is absent.