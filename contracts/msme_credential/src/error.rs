use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum MSMECredentialError {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    NotAnIssuer = 4,
    CredentialNotFound = 5,
    InvalidPSGCCode = 6,
    InvalidCommitment = 7,
    IssuerAlreadyExists = 8,
}
