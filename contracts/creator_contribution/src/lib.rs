#![no_std]

mod error;
mod types;

#[cfg(test)]
mod test;

pub use error::CreatorContributionError;
pub use types::{ContributionRecord, ContributionType, DataKey};

use soroban_sdk::{contract, contractimpl, symbol_short, Address, BytesN, Env, String, Symbol};

// Storage TTL extension constants (Soroban State Archival Guidelines)
const INSTANCE_BUMP_AMOUNT: u32 = 518_400; // ~30 days in ledgers
const INSTANCE_LIFETIME_THRESHOLD: u32 = 100_000;

const PERSISTENT_BUMP_AMOUNT: u32 = 518_400;
const PERSISTENT_LIFETIME_THRESHOLD: u32 = 100_000;

#[contract]
pub struct CreatorContributionContract;

#[contractimpl]
impl CreatorContributionContract {
    /// Record a creator contribution write-once on-chain.
    /// Replay-guarded by composite key (creator, content_commitment).
    /// Duplicate attempts with identical key are strictly rejected.
    pub fn record_contribution(
        env: Env,
        creator: Address,
        msme_id: String,
        circuit_id: String,
        contribution_type: ContributionType,
        content_commitment: BytesN<32>,
    ) -> Result<ContributionRecord, CreatorContributionError> {
        // Enforce cryptographic authorization of the submitting creator
        creator.require_auth();

        if msme_id.len() == 0 || circuit_id.len() == 0 {
            return Err(CreatorContributionError::InvalidIdentifier);
        }

        let key = DataKey::Contribution(creator.clone(), content_commitment.clone());

        // Replay guard & write-once enforcement
        if env.storage().persistent().has(&key) {
            return Err(CreatorContributionError::DuplicateContribution);
        }

        let current_ledger = env.ledger().sequence();

        let record = ContributionRecord {
            creator: creator.clone(),
            msme_id,
            circuit_id,
            contribution_type,
            content_commitment: content_commitment.clone(),
            recorded_ledger: current_ledger,
            schema_version: 1,
        };

        // Persist write-once record and extend persistent storage TTL
        env.storage().persistent().set(&key, &record);
        env.storage().persistent().extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);

        // Update counters & instance storage TTL
        let total_count: u32 = env.storage().instance().get(&DataKey::TotalCount).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalCount, &(total_count + 1));

        let creator_key = DataKey::CreatorCount(creator.clone());
        let creator_count: u32 = env.storage().persistent().get(&creator_key).unwrap_or(0);
        env.storage().persistent().set(&creator_key, &(creator_count + 1));
        env.storage().persistent().extend_ttl(&creator_key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);

        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);

        // Publish structured on-chain event
        env.events().publish(
            (symbol_short!("creator"), Symbol::new(&env, "recorded")),
            (creator, content_commitment),
        );

        Ok(record)
    }

    /// Query a contribution record by composite key (creator, content_commitment) (Fail-closed)
    pub fn get_contribution(
        env: Env,
        creator: Address,
        content_commitment: BytesN<32>,
    ) -> Option<ContributionRecord> {
        let key = DataKey::Contribution(creator, content_commitment);
        if let Some(record) = env.storage().persistent().get(&key) {
            env.storage().persistent().extend_ttl(&key, PERSISTENT_LIFETIME_THRESHOLD, PERSISTENT_BUMP_AMOUNT);
            Some(record)
        } else {
            None
        }
    }

    /// Check if a contribution commitment is already registered by creator
    pub fn has_contribution(
        env: Env,
        creator: Address,
        content_commitment: BytesN<32>,
    ) -> bool {
        let key = DataKey::Contribution(creator, content_commitment);
        env.storage().persistent().has(&key)
    }

    /// Get total number of contributions recorded across the contract
    pub fn get_total_contributions(env: Env) -> u32 {
        env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
        env.storage().instance().get(&DataKey::TotalCount).unwrap_or(0)
    }

    /// Get total number of contributions recorded by a specific creator
    pub fn get_creator_contribution_count(env: Env, creator: Address) -> u32 {
        let creator_key = DataKey::CreatorCount(creator);
        env.storage().persistent().get(&creator_key).unwrap_or(0)
    }
}
