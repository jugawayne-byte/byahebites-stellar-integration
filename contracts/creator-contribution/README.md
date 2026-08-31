# Creator Contribution Contract

A write-once Soroban contribution proof contract. Each
`(creator_wallet, content_hash)` pair can be recorded only once, preventing
duplicate writes and overwrite attempts.

## Build and test

From the repository root:

```bash
cargo test -p creator-contribution --locked
stellar contract build --package creator-contribution --out-dir target/deploy
```

The Testnet contract ID, deployment transaction, initialization transaction,
and WASM checksum are recorded in [`deployments/testnet.json`](../../deployments/testnet.json).

## Behavior

- The creator wallet must authorize each write.
- A `(creator wallet, content hash)` pair can be recorded only once.
- Duplicate writes and malformed records are rejected.
- The contract stores the creator, MSME wallet, circuit identifier, schema version, timestamp, and 32-byte content commitment.
- Raw creator content and personal data remain off-chain.

## Public interface

- `initialize(admin)` — one-time setup; the admin is added as the first issuer.
- `add_issuer(issuer)` / `remove_issuer(issuer)` — admin-only allowlist changes.
- `record_contribution(...)` — requires both an allowlisted issuer and the
  creator wallet, then writes the proof once.
- `get_contribution(creator_wallet, content_hash)` — returns the proof or
  `None`.
- `is_issuer(issuer)` — checks issuer authorization.