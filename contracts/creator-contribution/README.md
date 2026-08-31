# Creator Contribution Contract

Write-once Soroban contract for creator content proofs on Stellar Testnet.

## Behavior

- The creator wallet must authorize each write.
- A `(creator wallet, content hash)` pair can be recorded only once.
- Duplicate writes and malformed records are rejected.
- The contract stores the creator, MSME wallet, circuit identifier, schema version, timestamp, and 32-byte content commitment.
- Raw creator content and personal data remain off-chain.