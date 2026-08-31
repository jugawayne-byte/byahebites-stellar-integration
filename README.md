# ByahéBITES Soroban Credential Layer

**Soroban-based credential layer for MSMEs and creators, powering ByahéBITES tourism identity on Stellar Testnet.**

> **Instaward scope:** a standalone, testnet-only 30-day sprint. This repository contains the public demo shell and reviewer documentation. Contract IDs, transaction hashes, and live wallet/RPC evidence must be added after the Soroban contracts are deployed.

[![Network: Stellar Testnet](https://img.shields.io/badge/network-Stellar%20Testnet-0b6b63)](https://stellar.expert/explorer/testnet)

## Live demo

**Published demo:** [github-import-jugaway.replit.app](https://github-import-jugaway.replit.app/)

The demo is intentionally labeled as a demonstration until real contract IDs and wallet wiring are configured. Do not describe browser-local records as on-chain records.

![ByahéBITES live demo preview](docs/images/demo.jpg)

## Why this matters

ByahéBITES Nearby — “Hanapin ang kainan sa budget mo” — helps pilot LGUs, creators, and tourism stakeholders discover and promote local MSMEs. This sprint adds a public proof layer for the trust signals that currently live in private systems:

- LGU-issued MSME readiness
- Creator contribution proofs
- PSGC-coded tourism jurisdiction
- Circuit participation
- Publicly inspectable verification

The intended result is portable, machine-readable evidence that TPB/DOT, LGUs, creators, and the public can verify without relying on a private platform database, paper certificate, or platform lock-in.

## Sprint deliverables

1. **MSME Credential Contract** — an issuer-allowlisted Soroban contract for PSGC-coded readiness credentials.
2. **Creator Contribution Contract** — a write-once, replay-guarded contract linking creator work to an MSME and circuit by SHA-256 commitment.
3. **Standalone demo** — StellarWalletsKit wallet connection, XDR build/submit endpoints, credential/contribution flows, and Soroban RPC lookup.
4. **Validation package** — tests, contract IDs, deployment and record transaction hashes, verification guide, screenshots, and a 3–5 minute walkthrough.

## Architecture

![ByahéBITES three-layer architecture](docs/images/architecture.svg)

This Instaward builds only the Stellar layer and a minimal standalone demo. The ByahéBITES platform, LIT/Kom8ks editorial systems, LGU console, and TPB/DOT dashboards are existing or future systems and are outside this sprint.

## How the proof flow works

1. An allowlisted issuer signs an MSME credential for a wallet, PSGC jurisdiction, readiness status, and circuit.
2. A creator signs a contribution record for a qualifying story, photo set, or comic.
3. The contract stores only the public proof fields and a SHA-256 commitment to the canonical off-chain record.
4. A reviewer reads contract state through Soroban RPC and follows transaction hashes on Stellar Expert Testnet.
5. A repeated `(creator_wallet, content_hash)` write is rejected; uncertain lookups fail closed.

## Public data and trust boundaries

### Written on-chain

- Issuer address
- MSME or creator wallet address
- PSGC jurisdiction code
- Readiness-status enum
- MSME ID and circuit ID where applicable
- SHA-256 content commitment
- Issued or recorded ledger sequence
- Schema version
- Reserved revocation placeholder

### Kept off-chain

- Personal data
- Raw creator submissions
- Unpublished editorial content
- Private LGU assessments
- Business details
- Platform records

A commitment proves that a canonical record matches its recorded hash. It does not by itself prove authorship, copyright ownership, factual accuracy, publication status, or official LGU approval.

### Explicit testnet limitation

For this prototype, the LGU role is represented by a disclosed demo issuer key and an on-chain issuer allowlist. Multisignature LGU governance, issuer rotation, revocation, and dispute processes are future scope. There is no mainnet deployment, token, payout, or custody model in this sprint.

## Quickstart

```bash
pnpm install
pnpm --filter @workspace/byahebites-stellar-integration run dev
```

Open the local URL printed by Vite. The Replit workflow supplies the required port and base path automatically.

When the contracts are available, add the pinned Rust/Soroban toolchain and run:

```bash
stellar contract build
stellar contract deploy --network testnet
```

See [the deployment guide](docs/deployment-guide.md) and [the verification guide](docs/verification-guide.md).

## Reviewer evidence checklist

- [ ] MSME contract source, tests, contract ID, and deployment transaction hash
- [ ] Contribution contract source, tests, contract ID, and deployment transaction hash
- [ ] Live demo URL and screenshots
- [ ] Freighter plus one additional Stellar wallet tested
- [ ] Soroban RPC lookup documented with expected output
- [ ] Unauthorized, malformed, invalid-enum, duplicate, overwrite, wrong-network, unavailable-state, and unknown-record tests
- [ ] Complete transaction hash list in CSV and JSON
- [ ] Stellar Expert Testnet link for every listed hash
- [ ] 3–5 minute screen-captured walkthrough
- [ ] Participant records where consent and onboarding succeed: target 10 MSMEs, 12 creators, 22 unique wallets

## Known limitations and out-of-scope work

- No mainnet activity
- No token sale, native token, or transferable contribution token
- No creator compensation or settlement
- No credential revocation or dispute workflow
- No LGU multisig console or issuer rotation
- No full ByahéBITES registry, circuit builder, editorial engine, or TPB/DOT dashboard
- No mobile application
- No third-party security audit or formal verification

## Repository map

```text
README.md                         # reviewer-facing source of truth
contracts/                         # Soroban contract sources and contract READMEs
demo/frontend/                     # standalone demo frontend
demo/backend/                      # XDR and lookup backend
docs/images/architecture.svg     # architecture visual
docs/images/demo.jpg             # demo screenshot
docs/deployment-guide.md          # Testnet deployment and release steps
docs/verification-guide.md       # non-technical reviewer walkthrough
docs/SOW.md                       # imported scope of work
docs/integration-guide.md        # imported integration notes
scripts/                          # deployment and lifecycle scripts
release/                          # imported release notes
src/                              # Replit preview frontend shell
```

## Team and next step

**TAPATGOV / ByahéBITES**

- Joel Wayne Ganibe — System Architect
- Janus Ladero — Soroban / Web3 Engineer
- Ronnie Vivar — Editorial Metadata Lead
- Stellar Philippines — Ambassador Chapter

The next approval-critical step is to replace the documented placeholders with deployed Testnet contract IDs, real transaction hashes, a published demo URL, and the completed evidence package.