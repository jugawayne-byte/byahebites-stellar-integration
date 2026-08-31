---
name: Soroban SDK build
description: Environment-specific dependency constraint for compiling and testing the Soroban contracts.
---

The Soroban SDK release used by these contracts can resolve an incompatible
`ed25519-dalek`/`rand_core` combination when Cargo refreshes dependencies.
Keeping the committed lockfile and using locked builds avoids that upstream
resolver break.

**Why:** A fresh dependency resolution selected `ed25519-dalek` 3.x alongside
the SDK's older `rand_chacha`, preventing the SDK test host from compiling.

**How to apply:** Run contract tests with `cargo test --workspace --locked`;
in this environment, export `RUSTUP_TOOLCHAIN=1.88.0` first so Cargo's
compiler subprocesses use the pinned toolchain. If dependencies are
intentionally upgraded, verify the SDK host testutils compile before changing
the lockfile.