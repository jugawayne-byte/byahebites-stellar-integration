# MSME Credential Contract

Soroban contract for LGU-issued MSME readiness credentials on Stellar Testnet.

## Behavior

- One allowlisted issuer is configured during initialization.
- The issuer can write one credential per subject wallet.
- Re-issuing for an existing subject is rejected; records are not silently overwritten.
- Reads compute `Expired` from `expires_at` at read time.
- Personal data and raw documents stay off-chain; the contract stores public identifiers and a 32-byte content commitment.

Status values are `1 = Issued`, `2 = Active`, and `3 = Expired`.