# ByahéBITES Architecture & Trust Model

## 1. Three-Layer System Architecture

```text
+-------------------------------------------------------------------------------+
|                             1. CONTENT LAYER                                  |
|   • LIT Magazine (https://LIT.komiksguild.com) — 10,171+ verified readers     |
|   • Kom8ks (https://kom8ks.com) — 120 registered creators                    |
|   • Editorial metadata pipeline (Original stories, photo sets, comic strips)  |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                            2. PLATFORM LAYER                                  |
|   • ByahéBITES Nearby MSME discovery & culinary circuits                      |
|   • LGU Verification Console & Tourism Promotion Board (TPB/DOT) views        |
|   • Canonical serialization & domain-separated hashing pipeline               |
+-------------------------------------------------------------------------------+
                                      │
                                      ▼
+-------------------------------------------------------------------------------+
|                         3. STELLAR / SOROBAN LAYER                            |
|                       (SCOPE OF THIS 30-DAY SPRINT)                           |
|   • MSME Credential Contract (Issuer allowlist, PSGC coded, fail-closed read) |
|   • Creator Contribution Contract (Write-once, replay-guarded proofs)         |
|   • Soroban RPC Client + Stellar Wallets Kit + Stellar Expert Explorer       |
+-------------------------------------------------------------------------------+
```

---

## 2. Trust Model & Disclosed Boundaries

### 2.1 Demo Issuer Key
* In this 30-day prototype sprint, the LGU verification authority is represented by a demo issuer key held by the deployment team, controlled by an allowlist in the Soroban contract.
* **Roadmap Note (SCF Build Award):** Multi-signature LGU issuance governance, issuer rotation mechanics, and decentralized revocation councils are planned for the follow-on SCF Build phase.

### 2.2 Privacy & On-Chain Schema Boundary
* **Stored On-Chain:** Minimal public identifiers only (Issuer address, MSME/Creator wallet address, PSGC jurisdiction code, Readiness enum, SHA-256 content commitment, ledger sequence, schema version).
* **Kept Off-Chain:** Business registrations, personal identities, unpublished drafts, full comic panels, private LGU inspectorial scores.

### 2.3 Fail-Closed Verification States
The Soroban RPC verification engine is designed to **fail closed** across five distinct states:
1. `VALID_VERIFIED`: Ledger query succeeded and canonical payload SHA-256 matches on-chain commitment byte-for-byte.
2. `COMMITMENT_MISMATCH`: Record found on-chain, but computed payload hash differs (data tampered or corrupted).
3. `UNKNOWN_CREDENTIAL`: Query completed successfully, but no credential/contribution is registered for the given wallet.
4. `UNAVAILABLE_STATE`: Soroban RPC timeout, simulation failure, or unreachable host.
5. `WRONG_NETWORK`: Network passphrase mismatch (e.g. attempting to verify Testnet contracts on Mainnet or custom network).
