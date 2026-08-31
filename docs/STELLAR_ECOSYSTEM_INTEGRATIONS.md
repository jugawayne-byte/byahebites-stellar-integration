# Stellar & Soroban Ecosystem Integrations Reference

This document maps how the ByahéBITES Soroban Credential Layer integrates standard patterns, SDKs, and tooling from official Stellar repositories.

---

## 1. Soroban Smart Contract Architecture (`stellar/soroban-examples`)

Integrated patterns from [stellar/soroban-examples](https://github.com/stellar/soroban-examples):
* **Cryptographic Authorization (`require_auth`):** Enforces caller authorization without trusting client-passed address parameters.
* **State Archival & TTL Extension (`extend_ttl`):** Implements Soroban v22+ instance and persistent storage TTL extensions (`PERSISTENT_LIFETIME_THRESHOLD`, `PERSISTENT_BUMP_AMOUNT`) to ensure credentials remain queryable indefinitely without archival degradation.
* **Deterministic Event Topics (`env.events().publish`):** Structured short symbol topics `(symbol_short!("msme_cred"), symbol_short!("issued"))` enabling indexers and Horzion/Soroban RPC event subscription.
* **Explicit Error Enums (`#[contracterror]`):** Distinct error codes (`DuplicateContribution`, `NotAnIssuer`, `Unauthorized`, `InvalidPSGCCode`) for unambiguous on-chain simulation and error reporting.

---

## 2. Attestation & Credential Registry Patterns (`ACTA-Team/contracts-acta`)

Integrated patterns from [ACTA-Team/contracts-acta](https://github.com/ACTA-Team/contracts-acta):
* **Issuer Allowlist Registry:** Administrator-managed allowlist authorizing specific LGU/officer keys to issue credentials.
* **Verifiable Off-Chain Commitments:** Linking extensive off-chain metadata (business records, inspection checklists, GPS circuits) via immutable 32-byte domain-separated cryptographic hashes (`BytesN<32>`).
* **In-Place Re-issuance with Auditability:** Allows authorized issuers to update readiness status levels (e.g. `VerifiedLevel1` -> `TourismCircuitReady`) while prior state remains auditable in transaction history.

---

## 3. Client-Side Wallet Integration (`stellar-wallets-kit`)

Integrated patterns from [stellar/ecosystem-resources/wallet-integration/stellar-wallets-kit.md](https://github.com/stellar/ecosystem-resources/blob/main/wallet-integration/stellar-wallets-kit.md):
* **Multi-Wallet Support:** Framework ready for Freighter, xBull, Albedo, LOBSTR, and Hana wallets via standard adapter interfaces.
* **Non-Custodial Client Signing:** Private keys never enter the web application. Transactions are assembled as XDR, simulated via RPC, and presented to user-approved wallet extensions for signing.
* **Built-in Developer Testnet Persona Provider:** Allows instant zero-friction switching between Issuer, Creator, and Reviewer roles with automated Friendbot testnet XLM funding.

---

## 4. JS Stellar SDK & Soroban RPC (`stellar/js-stellar-sdk` & `stellar/stellar-rpc`)

Integrated patterns from [stellar/js-stellar-sdk](https://github.com/stellar/js-stellar-sdk) and [stellar/stellar-rpc](https://github.com/stellar/stellar-rpc):
* **Soroban RPC Server Queries:** Querying ledger entries and simulating contract invocations via `rpc.Server('https://soroban-testnet.stellar.org')`.
* **Fail-Closed Verification Engine:** Categorizes RPC read results into 5 strict states (`VALID_VERIFIED`, `COMMITMENT_MISMATCH`, `UNKNOWN_CREDENTIAL`, `UNAVAILABLE_STATE`, `WRONG_NETWORK`).
* **Stellar Expert Deep Linking:** Direct URL generation linking every testnet transaction hash and account public key directly to Stellar Expert testnet explorer.

---

## 5. Stellar Developer Best Practices (`stellar/stellar-dev-skill`)

Integrated best practices from [stellar/stellar-dev-skill](https://github.com/stellar/stellar-dev-skill):
* Multi-package repository structure separating contracts, shared cryptographic hashing libraries, demo frontend, and deployment automation scripts.
* Automated Friendbot testnet account funding and pilot participant cohort seeding.
* Standalone verification test harnesses and comprehensive markdown evidence packages.
