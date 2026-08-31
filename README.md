# ByahéBITES Soroban Credential Layer

[![Stellar Network](https://img.shields.io/badge/Stellar-Testnet-blue.svg)](https://stellar.expert/explorer/testnet)
[![Soroban Smart Contracts](https://img.shields.io/badge/Soroban-Rust%20SDK%20v22-orange.svg)](https://soroban.stellar.org)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Sprint](https://img.shields.io/badge/Instawards-30--Day%20Sprint-success.svg)](https://stellarphilippines.org)

> **30-Day Scoped Instaward Engagement:** Anchoring MSME & creator identity on Stellar testnet for Philippine culinary tourism circuits.

---

## 🌟 Executive Summary

**ByahéBITES Nearby** (*Hanapin ang kainan sa budget mo*) is a real-time MSME discovery engine used by Local Government Units (LGUs), creators, and the Tourism Promotions Board / Department of Tourism (TPB/DOT) for culinary tourism circuits.

This repository provides the **Stellar / Soroban Credential Layer**:
1. **MSME Credential Contract:** Issues LGU-verified, PSGC-coded tourism readiness credentials behind an issuer allowlist.
2. **Creator Contribution Contract:** Writes immutable, replay-guarded proof of published stories, photos, and comics on-chain (`byahebites-credential-v1` domain separation).
3. **Interactive Demo DApp & RPC Verifier:** Web application featuring Stellar wallet connection, credential issuance, creator submission, and a 5-state fail-closed Soroban RPC verifier.
4. **Validation & Evidence Package:** Seeded pilot cohort of 10 real MSMEs and 12 Kom8ks/LIT Creators (≥22 net-new Stellar wallets) with verifiable testnet transaction hashes.

### 🌟 Live Deployed Testnet Contracts
* **MSME Credential Contract:** [`CDYTXSDGNL37P54G7KX6WZE37W3SSQWLYDWDFQC63I2NMUKQI2MFZNYD`](https://stellar.expert/explorer/testnet/contract/CDYTXSDGNL37P54G7KX6WZE37W3SSQWLYDWDFQC63I2NMUKQI2MFZNYD)
* **Creator Contribution Contract:** [`CCNQUSKWKRRAJJ3WIUX4R5HLN7ZE2DLD4H7OZAKPGBTV54TNW7ZYN7H4`](https://stellar.expert/explorer/testnet/contract/CCNQUSKWKRRAJJ3WIUX4R5HLN7ZE2DLD4H7OZAKPGBTV54TNW7ZYN7H4)
* **Admin / Deployer:** [`GC3YGKCOI2ME4FKYU2JRIMTPY5ZIZVCWOKWFGXZ2D244CRXZVBKRUZZ7`](https://stellar.expert/explorer/testnet/account/GC3YGKCOI2ME4FKYU2JRIMTPY5ZIZVCWOKWFGXZ2D244CRXZVBKRUZZ7)

---

## 📦 Repository Structure

```text
byahe-bites/
├── contracts/                               # Soroban Rust Contracts
│   ├── Cargo.toml                           # Cargo workspace definition
│   ├── msme_credential/                    # Deliverable 1: MSME Credential Contract
│   │   ├── Cargo.toml
│   │   └── src/ (lib.rs, types.rs, error.rs, test.rs)
│   └── creator_contribution/               # Deliverable 2: Creator Contribution Contract
│       ├── Cargo.toml
│       └── src/ (lib.rs, types.rs, error.rs, test.rs)
├── packages/
│   └── canonical-hasher/                    # Deliverable 2/3: Canonical JSON & SHA-256 Hasher
│       ├── src/ (hasher.ts, types.ts, index.ts)
│       ├── tests/ (hasher.test.ts)
│       └── package.json
├── frontend/                                # Deliverable 3: Interactive Demo DApp
│   ├── src/
│   │   ├── components/ (Navbar, MSMEIssuanceCard, CreatorContributionCard, CredentialVerifier, ...)
│   │   ├── lib/ (stellar.ts, hasher.ts, mockData.ts)
│   │   ├── App.tsx & main.tsx
│   │   └── index.css (Tailwind & glassmorphism)
│   └── package.json
├── scripts/                                 # Deliverable 4: Seeding & Verification Scripts
│   ├── seed-pilot-cohort.ts
│   └── verify-records.ts
├── docs/                                    # Deliverable 4: Documentation Package
│   ├── SPECIFICATION.md                     # Domain-separated canonical hashing specification
│   ├── ARCHITECTURE.md                      # Three-layer architecture & trust boundaries
│   ├── INTEGRATION_GUIDE.md                 # Soroban RPC query & verification guide
│   └── TESTNET_EVIDENCE.md                  # Testnet transaction hash registry
└── README.md
```

---

## 🚀 Quickstart

### 1. Install & Build
```bash
# Install root & workspace dependencies
npm install

# Run canonical hasher tests
npm run test:hasher

# Start the interactive Demo DApp locally
npm run dev
```

### 2. Run Rust Contract Unit Tests
```bash
cd contracts
cargo test
```

### 3. Run Pilot Cohort Seeding Simulation
```bash
npm run seed
```

### 4. Run Fail-Closed Verifier CLI
```bash
npm run verify
```

---

## 🎯 Instaward 30-Day Acceptance Criteria Matrix

| Deliverable | Requirement | Implemented Outcome | Verification |
|-------------|-------------|---------------------|--------------|
| **Deliverable 1** | MSME Credential Contract | Issuer allowlist, PSGC-coded, in-place re-issuance, fail-closed queries | `contracts/msme_credential` |
| **Deliverable 2** | Creator Contribution Contract | Write-once replay guard on `(creator, content_hash)`, on-chain duplicate rejection | `contracts/creator_contribution` |
| **Deliverable 3** | Demo DApp & RPC Verifier | 5-state fail-closed verifier (`VALID`, `MISMATCH`, `UNKNOWN`, `UNAVAILABLE`, `WRONG_NETWORK`), StellarWalletsKit | `frontend/` |
| **Deliverable 4** | Evidence Package | 10 real MSMEs, 12 creators, ≥ 22 wallets, resolvable Stellar Expert links | `docs/TESTNET_EVIDENCE.md` |

---

## 👥 Project & Contact Information

* **Builder / Team:** ByahéBITES
* **Primary Contacts:** Joel Wayne Ganibe (`joelganibe@tapatgov.ph` / `jugawayne@gmail.com`)
* **Soroban / Web3 Engineer:** Janus Ladero
* **Ambassador Chapter:** Stellar Philippines (Lead: Armielyn Obinguar)
* **GitHub Repository:** [jugawayne-byte/byahebites-stellar-integration](https://github.com/jugawayne-byte/byahebites-stellar-integration.git)

---

## 📄 License
This project is open source and licensed under the [Apache-2.0 License](LICENSE).
