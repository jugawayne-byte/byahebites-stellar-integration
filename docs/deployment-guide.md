# Testnet Deployment Guide

This guide is the release checklist for the two Soroban contracts and the standalone demo. All commands and records in this Instaward are Testnet-only.

## Prerequisites

- Rust and the pinned Soroban SDK
- Stellar CLI at the pinned version
- Node.js and pnpm
- A funded Stellar Testnet deployer account
- A separate allowlisted issuer account
- Testnet secrets supplied through a local secret manager or environment variables

Never commit secret keys, `.env` files, wallet seed phrases, or signed XDR to the repository.

## Build and test contracts

```bash
stellar contract build
stellar contract test
```

Record the toolchain versions and test output in the release notes. The negative-path suite must cover unauthorized issuers, malformed fields, invalid readiness values, duplicate contribution writes, and overwrite attempts.

## Deploy to Testnet

Deploy each contract using the pinned CLI and the Testnet network configuration:

```bash
stellar contract deploy --network testnet
```

After deployment, record:

- Contract name
- Contract ID
- Deployment transaction hash
- WASM SHA-256
- Network: Stellar Testnet
- Deployer and issuer public addresses

Only public addresses, contract IDs, hashes, and explorer links belong in the README. Never publish the issuer secret.

## Configure the demo

Update the demo backend/frontend configuration with:

- Testnet Soroban RPC URL
- MSME Credential Contract ID
- Creator Contribution Contract ID
- Public issuer address
- Explorer network setting

Run the demo locally and confirm that configuration errors are shown as unavailable state, never as a successful verification.

## Release evidence

Before submission, update the main README and the evidence package with:

1. Both contract IDs
2. Both deployment transaction hashes
3. A live demo URL
4. A complete record transaction list in CSV and JSON
5. One Stellar Expert Testnet link per transaction
6. Expected Soroban RPC query output
7. WASM checksums and pinned toolchain versions

## Final release check

- [ ] No mainnet URLs or commands appear in the submission-facing docs
- [ ] No secrets appear in Git history
- [ ] The live demo is reachable
- [ ] A reviewer can reproduce a read without a wallet
- [ ] The README links to the demo, contracts, evidence, and verification guide