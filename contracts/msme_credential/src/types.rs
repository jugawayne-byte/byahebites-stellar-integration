use soroban_sdk::{contracttype, Address, BytesN, String};

/// Readiness status levels for tourism & culinary MSMEs
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ReadinessStatus {
    PendingVerification = 0,
    VerifiedLevel1 = 1,       // Basic local permits verified
    VerifiedLevel2 = 2,       // Sanitation & quality standards certified
    TourismCircuitReady = 3,  // Endorsed for official TPB/DOT culinary tourism circuits
    Suspended = 4,
}

/// Internal storage keys for the MSME Credential Contract
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Issuer(Address),
    Credential(Address),
    IssuerCount,
}

/// On-chain minimal public schema for MSME Credential
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MSMECredential {
    /// Address of authorized LGU/Demo Issuer
    pub issuer: Address,
    /// Wallet address of the MSME
    pub msme: Address,
    /// 9-digit Philippine Standard Geographic Code (e.g., "133900000" for Manila)
    pub psgc_code: String,
    /// MSME Readiness Status
    pub readiness_status: ReadinessStatus,
    /// Tourism circuit identifier (e.g., "CIRCUIT-NCR-BINONDO-01")
    pub circuit_id: String,
    /// SHA-256 digest over domain-separated canonical off-chain record ("byahebites-credential-v1")
    pub content_commitment: BytesN<32>,
    /// Ledger sequence number at issuance
    pub issued_ledger: u32,
    /// Reserved placeholder for future governance revocation ledger
    pub revoked_ledger: Option<u32>,
    /// Schema version (v1)
    pub schema_version: u32,
}
