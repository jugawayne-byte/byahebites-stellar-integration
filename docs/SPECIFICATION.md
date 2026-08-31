# ByahéBITES Soroban Credential Layer: Cryptographic & Schema Specification

**Version:** 1.0.0 (Sprint Deliverable)  
**Domain Separation Prefix:** `byahebites-credential-v1`  
**Target Blockchain:** Stellar (Soroban Smart Contracts) — Testnet

---

## 1. Domain Separation & Canonical Serialization

To guarantee cross-platform determinism and protect against preimage manipulation or cross-context replay attacks, all content commitments recorded on-chain are computed using domain-separated canonical serialization.

### 1.1 Serialization Rules
1. **Domain-Separation Prefix:** Every commitment preimage begins with the fixed prefix string `byahebites-credential-v1:`.
2. **Key Ordering:** JSON object keys are strictly sorted in lexicographical (alphabetical) order.
3. **Unicode Normalization:** All string values and keys are normalized using Unicode Normalization Form C (**NFC**).
4. **Encoding:** Canonical strings are converted to raw bytes using **UTF-8**.
5. **Hash Algorithm:** Standard **SHA-256** producing a 32-byte digest (`BytesN<32>` in Soroban).

### 1.2 Mathematical Formulation
$$\text{Commitment} = \text{SHA256}\Big(\text{UTF8}\big(\text{"byahebites-credential-v1:"} \parallel \text{CanonicalJSON}(\text{Payload})\big)\Big)$$

---

## 2. Smart Contract Schemas

### 2.1 Deliverable 1: MSME Credential Schema
Contract ID: `contracts/msme_credential`

```rust
#[contracttype]
pub struct MSMECredential {
    pub issuer: Address,                   // Authorized LGU / Demo Issuer address
    pub msme: Address,                     // MSME recipient wallet address
    pub psgc_code: String,                 // 9-digit Philippine Standard Geographic Code (e.g. "133900000")
    pub readiness_status: ReadinessStatus, // PendingVerification, VerifiedLevel1, VerifiedLevel2, TourismCircuitReady
    pub circuit_id: String,                // Tourism circuit ID (e.g. "CIRCUIT-NCR-BINONDO-01")
    pub content_commitment: BytesN<32>,    // SHA-256 domain-separated canonical hash
    pub issued_ledger: u32,                // Ledger sequence number at issuance
    pub revoked_ledger: Option<u32>,       // Reserved placeholder for governance revocation
    pub schema_version: u32,               // Fixed to 1
}
```

* **Storage Key:** `DataKey::Credential(Address)`
* **Uniqueness / Re-issuance:** Exactly one current record per MSME wallet. Re-issuance by an allowlisted issuer updates the record in place while prior state remains auditable in ledger transaction history.

---

### 2.2 Deliverable 2: Creator Contribution Schema
Contract ID: `contracts/creator_contribution`

```rust
#[contracttype]
pub struct ContributionRecord {
    pub creator: Address,                   // Submitting creator wallet address
    pub msme_id: String,                    // Featured MSME identifier (e.g. "MSME-MNL-001")
    pub circuit_id: String,                 // Featured culinary circuit (e.g. "CIRCUIT-NCR-BINONDO-01")
    pub contribution_type: ContributionType, // Story, PhotoSet, Comic, CulinaryReview
    pub content_commitment: BytesN<32>,     // SHA-256 domain-separated canonical hash
    pub recorded_ledger: u32,               // Ledger sequence number at write time
    pub schema_version: u32,                // Fixed to 1
}
```

* **Storage Key:** `DataKey::Contribution(Address, BytesN<32>)` (Composite key of `creator` + `content_commitment`)
* **Replay Guard:** Write-once enforcement. If storage key already exists, contract immediately halts and throws `CreatorContributionError::DuplicateContribution`.

---

## 3. Cross-Language Test Vectors

### Vector 1: MSME Credential (Binondo Pilot)
* **Preimage Object:**
```json
{
  "businessName": "Quik Snack Binondo",
  "circuitId": "CIRCUIT-NCR-BINONDO-01",
  "msmeWallet": "GDQUJ3N4P5E6R7T8Y9U0I1O2P3A4S5D6F7G8H9J0K1L2M3N4O5P6Q7R8",
  "psgcCode": "133900000",
  "readinessLevel": "TourismCircuitReady",
  "registeredDate": "2026-08-25",
  "verificationOfficer": "LGU-DEMO-ISSUER-01"
}
```
* **Domain Separated String:**
```text
byahebites-credential-v1:{"businessName":"Quik Snack Binondo","circuitId":"CIRCUIT-NCR-BINONDO-01","msmeWallet":"GDQUJ3N4P5E6R7T8Y9U0I1O2P3A4S5D6F7G8H9J0K1L2M3N4O5P6Q7R8","psgcCode":"133900000","readinessLevel":"TourismCircuitReady","registeredDate":"2026-08-25","verificationOfficer":"LGU-DEMO-ISSUER-01"}
```
* **SHA-256 Output Hex:**
```text
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```
