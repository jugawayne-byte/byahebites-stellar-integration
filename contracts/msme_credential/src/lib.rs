#![no_std]

mod error;
mod types;

#[cfg(test)]
mod test;

pub use error::MSMECredentialError;
pub use types::{DataKey, MSMECredential, ReadinessStatus};

use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, String, Symbol};

// Storage TTL extension constants (following official Soroban state archival guidelines)
const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers (assuming 5s ledgers)
const INSTANCE_LIFETIME_THRESHOLD: u32 = 100_000;

const PERSISTENT_BUMP_AMOUNT: u32 = 518_400;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 100_000;

#[contract]
pub struct MSMECredentialContract;

#[contractimpl]
impl MSMECredentialContract {
    /// Initialize the contract with an administrative address (ACTA / Soroban Examples pattern)
    pub fn init(env: Env, admin: Address) -> Result<(), MSMECredentialError> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(MSMECredentialError::AlreadyInitialized);
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);

        // Add admin as default bootstrap issuer
        env.storage().instance().set(&DataKey::Issuer(admin.clone()), &true);
        env.storage().instance().set(&DataKey::IssuerCount, &1u32);

        // Extend instance storage TTL
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Publish structured event matching soroban-examples/events standard
        env.events().publish(
            (symbol_short!("msme_cred"), symbol_short!("init")),
            admin,
        );

        Ok(())
    }

    /// Add an authorized issuer address to the allowlist (Admin only)
    pub fn add_issuer(env: Env, admin: Address, issuer: Address) -> Result<(), MSMECredentialError> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(MSMECredentialError::NotInitialized)?;

        if admin != stored_admin {
            return Err(MSMECredentialError::Unauthorized);
        }
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Issuer(issuer.clone())) {
            return Err(MSMECredentialError::IssuerAlreadyExists);
        }

        env.storage().instance().set(&DataKey::Issuer(issuer.clone()), &true);
        let count: u32 = env.storage().instance().get(&DataKey::IssuerCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::IssuerCount, &(count + 1));

        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("msme_cred"), Symbol::new(&env, "issuer_added")),
            issuer,
        );

        Ok(())
    }

    /// Remove an authorized issuer address from the allowlist (Admin only)
    pub fn remove_issuer(env: Env, admin: Address, issuer: Address) -> Result<(), MSMECredentialError> {
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(MSMECredentialError::NotInitialized)?;

        if admin != stored_admin {
            return Err(MSMECredentialError::Unauthorized);
        }
        admin.require_auth();

        if !env.storage().instance().has(&DataKey::Issuer(issuer.clone())) {
            return Err(MSMECredentialError::NotAnIssuer);
        }

        env.storage().instance().remove(&DataKey::Issuer(issuer.clone()));
        let count: u32 = env.storage().instance().get(&DataKey::IssuerCount).unwrap_or(1);
        if count > 0 {
            env.storage().instance().set(&DataKey::IssuerCount, &(count - 1));
        }

        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        env.events().publish(
            (symbol_short!("msme_cred"), Symbol::new(&env, "issuer_removed")),
            issuer,
        );

        Ok(())
    }

    /// Check if an address is an allowlisted issuer
    pub fn is_issuer(env: Env, issuer: Address) -> bool {
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        env.storage().instance().has(&DataKey::Issuer(issuer))
    }

    /// Issue or update an MSME readiness credential (Allowlisted Issuer only)
    /// Re-issuance updates the record in place per MSME wallet.
    pub fn issue_credential(
        env: Env,
        issuer: Address,
        msme: Address,
        psgc_code: String,
        readiness_status: ReadinessStatus,
        circuit_id: String,
        content_commitment: BytesN<32>,
    ) -> Result<MSMECredential, MSMECredentialError> {
        // Enforce cryptographic authorization of the issuer
        issuer.require_auth();

        // Enforce allowlist check
        if !Self::is_issuer(env.clone(), issuer.clone()) {
            return Err(MSMECredentialError::NotAnIssuer);
        }

        if psgc_code.len() == 0 {
            return Err(MSMECredentialError::InvalidPSGCCode);
        }

        let current_ledger = env.ledger().sequence();

        let credential = MSMECredential {
            issuer: issuer.clone(),
            msme: msme.clone(),
            psgc_code,
            readiness_status,
            circuit_id,
            content_commitment,
            issued_ledger: current_ledger,
            revoked_ledger: None, // Reserved placeholder
            schema_version: 1,
        };

        let key = DataKey::Credential(msme.clone());

        // Persist in persistent storage and extend TTL (state archival protection)
        env.storage().persistent().set(&key, &credential);
        env.storage().persistent().extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Publish structured on-chain event
        env.events().publish(
            (symbol_short!("msme_cred"), symbol_short!("issued")),
            msme,
        );

        Ok(credential)
    }

    /// Query the current credential for an MSME wallet (Fail-closed)
    pub fn get_credential(env: Env, msme: Address) -> Option<MSMECredential> {
        let key = DataKey::Credential(msme);
        if let Some(cred) = env.storage().persistent().get(&key) {
            env.storage().persistent().extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
            Some(cred)
        } else {
            None
        }
    }

    /// Get current Admin address
    pub fn get_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Admin)
    }

    /// Extend storage TTL manually for an MSME credential
    pub fn extend_credential_ttl(env: Env, msme: Address) -> Result<(), MSMECredentialError> {
        let key = DataKey::Credential(msme);
        if env.storage().persistent().has(&key) {
            env.storage().persistent().extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
            Ok(())
        } else {
            Err(MSMECredentialError::CredentialNotFound)
        }
    }
}
