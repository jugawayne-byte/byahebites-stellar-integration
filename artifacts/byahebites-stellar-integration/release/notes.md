# Release Notes

## 2026-08-31 — Stellar Testnet prototype

- Network: Stellar Testnet only.
- Soroban SDK: `25.0.0`.
- Rust toolchain: `1.88.0`.
- MSME Credential and Creator Contribution contracts were deployed and
  initialized on Testnet.
- Public contract IDs, deployment/initialization hashes, explorer links, and
  WASM SHA-256 checksums are recorded in `deployments/testnet.json`.
- The web demo uses Stellar Wallets Kit and Soroban RPC for Testnet wallet
  connection, reads, simulation, signing, submission, and finality polling.

## Verification status

- MSME contract tests: 5 passed.
- Creator contract tests: 4 passed.
- Evidence consistency validator: `pnpm run validate:testnet-evidence`.
- No external MSMEs or creators have been onboarded. Any QA records are
  synthetic Testnet fixtures controlled by the team and are not adoption
  evidence.

## Scope limits

This sprint does not include mainnet activity, tokens, payouts, custody,
revocation, multisignature issuer governance, or a third-party security audit.
