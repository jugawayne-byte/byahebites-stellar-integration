## 🔗 Public Demo & Evidence

**Live Verifier & Demo Site**  
https://github-import-jugawayne.replit.app/

**Evidence Bundle Includes:**
- Contract ID: *(to be added after deployment)*
- WASM checksum: *(to be added after build)*
- Soroban Explorer link: *(to be added after deployment)*
- Test vectors: `/evidence/test-vectors/`
- Rejected-call evidence: `/evidence/rejected/`
- Verifier source: `/verifier/`
- Lifecycle scripts: `/scripts/`
- Acceptance-to-evidence manifest: `/docs/manifest.md`


# ByahéBITES Soroban Credential Layer  
Anchoring MSME & creator identity on Stellar testnet

## Problem
Tourism MSMEs, creators, and LGUs rely on trust signals that are off‑chain, private, paper‑based, or platform‑locked.  
LGU readiness certifications are PDFs; creator contributions live inside private databases; TPB/DOT cannot independently verify MSME readiness or creator output.  
This prevents ByahéBITES from being used as national tourism infrastructure because verification signals are not publicly auditable.

## Solution
A 30‑day Instaward sprint delivering a **Soroban credential layer** on Stellar testnet:
- MSME Credential Contract (LGU‑verified readiness, PSGC‑coded)
- Creator Contribution Contract (write‑once contribution proofs)
- Wallet onboarding flows for MSMEs and creators
- Public demo showing issuance + lookup
- All records verifiable on Stellar Expert (Testnet)

By the end of the sprint, ≥10 MSMEs and 12 creators will have real testnet credentials, with ≥22 net‑new wallets.

## Features
### **1. MSME Credential Contract**
- Issuer‑allowlisted LGU verification  
- PSGC jurisdiction code  
- Readiness‑status enum  
- Circuit participation  
- SHA‑256 content commitment  
- Queryable by MSME wallet on Stellar Expert (Testnet)

### **2. Creator Contribution Contract**
- Write‑once contribution proofs  
- Replay‑guarded duplicate rejection  
- Links creator → MSME → circuit  
- SHA‑256 content commitment  
- Publicly visible rejection of duplicate writes

### **3. Demo Frontend + Backend**
- Wallet connect via StellarWalletsKit (Freighter + one more wallet)  
- Credential issuance UI  
- Contribution issuance UI  
- Horizon API lookup  
- Distinct failure modes (malformed input, mismatch, wrong network, unknown credential)

### **4. Ecosystem Validation**
- ≥10 MSMEs credentialed  
- 12 creator wallets awarded  
- Complete tx hash list  
- 3–5 minute demo video  
- All records verifiable by non‑technical reviewers

## How We Use Stellar
- **Soroban smart contracts** for credentialing and contribution proofs  
- **StellarWalletsKit** for wallet connect + signing  
- **Horizon API** for lookup and verification  
- **Stellar Expert (Testnet)** for public auditability  
- **Near‑zero fees** (<$0.01 per credential)  
- **Sub‑5‑second finality** for instant verification  
- **Testnet‑only** (no mainnet, no tokens, no payouts)

## Architecture (Sprint Scope Only)
This Instaward builds only the **Stellar Layer**:
- MSME Credential Contract  
- Creator Contribution Contract  
- Minimal standalone demo  
All ByahéBITES platform components (registry, LGU console, TPB/DOT dashboards, editorial systems) are **out of scope**.

## Snippets / Screenshots / Videos
*(Placeholders — to be replaced during Week 3–4)*

- `docs/images/demo.png`  
- Demo video link (to be added)  
- Contract IDs + deployment tx hashes (to be added)  
- Tx hash list (to be added)

## Team
**TAPATGOV / ByahéBITES**
- **Joel Wayne Ganibe** — System Architect  
- **Janus Ladero** — Soroban / Web3 Engineer  
- **Ronnie Vivar** — Editorial Metadata Lead  
Ambassador Chapter: **Stellar Philippines**  
Chapter Lead: **Armielyn Obinguar**

## Live Demo
*(To be added after deployment)*  
`https://<demo-url>.vercel.app`

## Repository Structure
