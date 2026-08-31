# ByahéBITES Integration & Reviewer Verification Guide

A guide for reviewers to build, test, deploy, and verify the Soroban smart contracts on the Stellar Testnet.

---

## 1. Quickstart & Local Testing

### Prerequisites
* Rust toolchain (with `wasm32-unknown-unknown` target)
* Stellar CLI / Soroban CLI (`cargo install --locked stellar-cli`)
* Node.js v18+ & npm

### 1.1 Run Rust Contract Unit Tests
```bash
cd contracts
cargo test
```

### 1.2 Run Cross-Language Canonical Hashing Test Suite
```bash
npm run test:hasher
```

---

## 2. Soroban CLI Deployment Commands

### 2.1 Build Contracts to WASM
```bash
stellar contract build
```

### 2.2 Deploy to Testnet
```bash
# 1. Deploy MSME Credential Contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/msme_credential_contract.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network testnet

# 2. Deploy Creator Contribution Contract
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/creator_contribution_contract.wasm \
  --source <ADMIN_SECRET_KEY> \
  --network testnet
```

### 2.3 Initialize & Allowlist Issuers
```bash
# Initialize with Admin address
stellar contract invoke \
  --id <MSME_CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- init \
  --admin <ADMIN_PUBLIC_KEY>

# Add LGU Issuer to allowlist
stellar contract invoke \
  --id <MSME_CONTRACT_ID> \
  --source <ADMIN_SECRET_KEY> \
  --network testnet \
  -- add_issuer \
  --admin <ADMIN_PUBLIC_KEY> \
  --issuer <LGU_ISSUER_PUBLIC_KEY>
```

---

## 3. Querying Contract State via Soroban RPC

### 3.1 Query MSME Credential by Wallet
```bash
stellar contract invoke \
  --id <MSME_CONTRACT_ID> \
  --network testnet \
  -- get_credential \
  --msme <MSME_WALLET_ADDRESS>
```

### 3.2 Query Creator Contribution Proof
```bash
stellar contract invoke \
  --id <CREATOR_CONTRACT_ID> \
  --network testnet \
  -- get_contribution \
  --creator <CREATOR_WALLET_ADDRESS> \
  --content_commitment <32_BYTE_HEX_COMMITMENT>
```

---

## 4. Running the Standalone Demo Application

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser:
1. Connect via testnet persona or Stellar Wallets Kit.
2. Select an MSME to issue or update a credential with domain-separated SHA-256 commitments.
3. Record a creator contribution and test the on-chain replay guard by attempting a duplicate submission.
4. Verify any record using the Fail-Closed Soroban RPC Verifier.
