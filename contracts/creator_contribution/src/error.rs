use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum CreatorContributionError {
    DuplicateContribution = 1, // Replay guard: same (creator, content_commitment) already recorded
    Unauthorized = 2,
    InvalidCommitment = 3,
    InvalidIdentifier = 4,
}
