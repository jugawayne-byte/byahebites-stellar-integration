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

## Published demo smoke check

Recorded on **2026-08-31 (UTC)** against the public release at
https://github-import-jugawayne.replit.app/.

- The production build responds with HTTP 200 and serves the current wallet/RPC
  implementation, including the Stellar Testnet label, wallet connection entry
  point, Testnet verification action, and fail-closed no-record state. Legacy
  demo-wallet and credential-ID markers are absent.
- The live `testnet.json` matches the configured Soroban Testnet RPC endpoint,
  issuer public key, and both contract IDs in the repository evidence record.
- Soroban Testnet RPC was reachable. The four recorded deployment and
  initialization transactions all returned `status: SUCCESS` with ledger
  sequences.
- A direct read using the configured issuer public key completed successfully
  and returned no credential record; no committed on-chain record fixture
  exists to claim as a successful configured lookup.
- A syntactically valid unknown public key returned an empty result, which the
  UI represents as an explicit no-record state rather than verified.
- The unavailable-RPC path produced a caught client error and is rendered by
  the UI as verification unavailable. No write transaction was submitted
  during this smoke check.
- A browser wallet extension was not available in the validation environment,
  so wallet signing and a real write were not attempted. The app is configured
  for Freighter, xBull, Albedo, LOBSTR, and Hana through Stellar Wallets Kit.

## Scope limits

This sprint does not include mainnet activity, tokens, payouts, custody,
revocation, multisignature issuer governance, or a third-party security audit.
