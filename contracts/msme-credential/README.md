# MSME Credential Contract

An issuer-allowlisted Soroban contract for write-once, PSGC-coded MSME
readiness credentials.

## Build and test

From the repository root:

```bash
cargo test -p msme-credential --locked
stellar contract build --package msme-credential --out-dir target/deploy
```

The Testnet contract ID, deployment transaction, initialization transaction,
and WASM checksum are recorded in [`deployments/testnet.json`](../../deployments/testnet.json).

## Behavior

- One allowlisted issuer is configured during initialization.
- The issuer can write one credential per subject wallet.
- Re-issuing for an existing subject is rejected; records are not silently overwritten.
- Reads compute `Expired` from `expires_at` at read time.
- Personal data and raw documents stay off-chain; the contract stores public identifiers and a 32-byte content commitment.

Status values are `1 = Issued`, `2 = Active`, and `3 = Expired`.

## Public interface

- `initialize(admin)` — one-time setup; the admin is added as the first issuer.
- `add_issuer(issuer)` / `remove_issuer(issuer)` — admin-only allowlist changes.
- `issue_credential(...)` — issuer-authenticated, write-once credential issuance.
- `get_credential(msme_wallet)` — returns the credential or `None`.
- `is_issuer(issuer)` — checks issuer authorization.

The contract stores public verification fields only. Raw business documents and
personal data remain off-chain; `content_hash` is a SHA-256 commitment.