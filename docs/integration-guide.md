# Integration Guide

## Overview
This guide explains how LGUs and creators integrate with the ByahéBITES Soroban Credential Layer.

## Steps
1. **LGU Onboarding** — register issuer wallet and PSGC code.
2. **MSME Credential Issuance** — LGU verifies readiness and issues credential.
3. **Creator Contribution Proof** — creator submits content; contract writes proof.
4. **Verification** — stakeholders verify credentials via Stellar Expert (Testnet).

## API Endpoints
- `/issue-msme`
- `/issue-creator`
- `/lookup`
## Phase 3 — Contract ↔ Demo Linkage

### Backend → Contract Mapping
- POST /issue → calls CredentialContract::issue()
- POST /record → calls ContributionContract::record()

### Folder Mapping
contracts/
    msme-credential/        → CredentialContract
    creator-contribution/   → ContributionContract

demo/backend/routes/
    credential.rs           → issues MSME credential
    contribution.rs         → records creator contribution

### Frontend Trigger Flow
frontend/index.html
    - "Issue Credential" button → POST /issue
    - "Record Contribution" button → POST /record

### Network
Both routes connect to Soroban testnet RPC endpoint.
