# Testnet Deployment Guide

This guide is the release checklist for the two Soroban contracts and the standalone demo. All commands and records in this Instaward are Testnet-only. The current public deployment record is [`../../deployments/testnet.json`](../../deployments/testnet.json).

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
export RUSTUP_TOOLCHAIN=1.88.0
cargo test --workspace --locked
stellar contract build --package msme-credential --out-dir target/deploy
stellar contract build --package creator-contribution --out-dir target/deploy
find target/deploy -type f -name '*.wasm' -exec sha256sum {} +
```

The resulting WASM SHA-256 values must match the checksums in
`deployments/testnet.json`. The pinned Rust toolchain is `1.88.0` in
`rust-toolchain.toml`. The negative-path suite covers unauthorized issuers,
malformed fields, invalid readiness values, duplicate contribution writes, and
overwrite attempts.

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

The deployment evidence recorded on 2026-08-31 (UTC) is complete in the main
README and `deployments/testnet.json`. For any new deployment, update both
records with:

1. Both contract IDs
2. Both deployment transaction hashes
3. Both initialization transaction hashes
4. A live demo URL, if the demo is wired to the deployed contracts
5. A complete record transaction list in CSV and JSON, when record transactions exist
6. One Stellar Expert Testnet link per listed transaction
7. Expected Soroban RPC query output
8. WASM checksums, deployment date, and pinned toolchain versions

Run the evidence consistency check from the repository root after updating the
public records and before publishing:

```bash
pnpm run validate:testnet-evidence
```

The check rejects malformed records, links that do not match their transaction
hashes, non-Testnet explorer URLs, and secret/private-key fields in the
machine-readable record. Do not publish until it passes.

## Final release check

- [ ] No mainnet URLs or commands appear in the submission-facing docs
- [ ] No secrets appear in Git history
- [x] The two deployed contracts, initialization hashes, checksums, date, and Testnet network are public
- [x] A reviewer can verify each deployment and initialization hash through Stellar Expert Testnet
- [ ] `pnpm run validate:testnet-evidence` passes after the public evidence is updated
- [x] The README links to the contracts, deployment record, and verification guide
- [ ] The live demo is wired to the deployed contracts
- [ ] A reviewer can reproduce a contract-state read without a wallet