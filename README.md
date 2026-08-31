# ByahéBITES Stellar Testnet Integration

ByahéBITES is a standalone Stellar Testnet proof layer for MSME readiness and
creator contribution records.

## Reviewer links

- [Published demo](https://github-import-jugaway.replit.app/)
- [Reviewer README and walkthrough](artifacts/byahebites-stellar-integration/README.md)
- [Deployment evidence JSON](deployments/testnet.json)
- [Deployment evidence index](deployments/README.md)
- [Verification guide](artifacts/byahebites-stellar-integration/docs/verification-guide.md)

## Current sprint state

- Two Soroban contracts are deployed and initialized on Stellar Testnet.
- The repository includes the contract sources, pinned lockfiles, deployment
  IDs, transaction links, and WASM checksums.
- The web demo uses Stellar Wallets Kit, Testnet network validation, Soroban
  RPC reads, transaction simulation, wallet signing, submission, and finality
  polling.
- No external MSMEs or creators have been onboarded yet. Any sample records
  used for QA are synthetic Testnet fixtures controlled by the team and do not
  represent participant adoption.

## Verify locally

```bash
export RUSTUP_TOOLCHAIN=1.88.0
cargo test --workspace --locked
pnpm install --frozen-lockfile
pnpm run validate:testnet-evidence
```

The app can be started with:

```bash
pnpm --filter @workspace/byahebites-stellar-integration run dev
```

This sprint is Testnet-only. It does not include mainnet activity, tokens,
payouts, custody, revocation, multisignature issuer governance, or a third-party
security audit. See the reviewer README for the full trust boundary and
limitations.