# Test coverage

The Soroban contract tests live beside each contract source:

- `contracts/msme-credential/src/lib.rs`
- `contracts/creator-contribution/src/lib.rs`

Run them from the repository root with:

```bash
export RUSTUP_TOOLCHAIN=1.88.0
cargo test --workspace --locked
```

The current suites cover authorized writes, issuer authorization, malformed
fields, invalid readiness values, duplicate/overwrite protection, and public
record reads. The live demo separately handles wrong-network, unavailable RPC,
simulation, decoding, and unknown-record states fail-closed.