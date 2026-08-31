use soroban_sdk::{contracttype, Address, BytesN, String};

/// Format category for published creator contribution
#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum ContributionType {
    Story = 1,          // Editorial article or food travel story (LIT Magazine)
    PhotoSet = 2,       // Curated photography series
    Comic = 3,          // Visual narrative / comic strip (Kom8ks)
    CulinaryReview = 4, // In-depth culinary & heritage review
}

/// Internal storage key for the Creator Contribution Contract
/// Composite key: (creator_wallet, content_commitment)
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Contribution(Address, BytesN<32>),
    TotalCount,
    CreatorCount(Address),
}

/// On-chain minimal public record for Creator Contribution
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContributionRecord {
    /// Wallet address of the submitting creator
    pub creator: Address,
    /// Identifier of the featured MSME (e.g. "MSME-MNL-001")
    pub msme_id: String,
    /// Identifier of the featured culinary circuit (e.g. "CIRCUIT-NCR-BINONDO-01")
    pub circuit_id: String,
    /// Format category (Story, PhotoSet, Comic, CulinaryReview)
    pub contribution_type: ContributionType,
    /// SHA-256 digest over domain-separated canonical record ("byahebites-credential-v1")
    pub content_commitment: BytesN<32>,
    /// Ledger sequence number at recording
    pub recorded_ledger: u32,
    /// Schema version (v1)
    pub schema_version: u32,
}
