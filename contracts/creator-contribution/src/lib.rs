#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Bytes, BytesN, Env};

#[contracttype]
#[derive(Clone)]
pub struct ContributionRecord {
    pub creator: Address,
    pub msme: Address,
    pub circuit_id: Bytes,
    pub content_hash: BytesN<32>,
    pub recorded_at: u64,
    pub version: u32,
}

#[contracttype]
enum DataKey {
    Contribution(Address, BytesN<32>),
}

#[contract]
pub struct CreatorContributionContract;

#[contractimpl]
impl CreatorContributionContract {
    pub fn record(
        env: Env,
        creator: Address,
        msme: Address,
        circuit_id: Bytes,
        content_hash: BytesN<32>,
        version: u32,
    ) {
        creator.require_auth();
        if circuit_id.len() == 0 || version == 0 {
            panic!("malformed contribution");
        }

        let key = DataKey::Contribution(creator.clone(), content_hash.clone());
        if env.storage().persistent().has(&key) {
            panic!("duplicate contribution");
        }

        let record = ContributionRecord {
            creator,
            msme,
            circuit_id,
            content_hash,
            recorded_at: env.ledger().timestamp(),
            version,
        };
        env.storage().persistent().set(&key, &record);
    }

    pub fn get(
        env: Env,
        creator: Address,
        content_hash: BytesN<32>,
    ) -> Option<ContributionRecord> {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(creator, content_hash))
    }

    pub fn has(env: Env, creator: Address, content_hash: BytesN<32>) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Contribution(creator, content_hash))
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Bytes, Env};

    #[test]
    fn records_and_reads_contribution() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        let creator = Address::generate(&env);
        let msme = Address::generate(&env);
        let hash = BytesN::from_array(&env, &[4; 32]);

        env.mock_all_auths();
        client.record(
            &creator,
            &msme,
            &Bytes::from_slice(&env, b"circuit-1"),
            &hash,
            &1,
        );

        assert!(client.has(&creator, &hash));
        assert_eq!(client.get(&creator, &hash).unwrap().version, 1);
    }

    #[test]
    #[should_panic(expected = "duplicate contribution")]
    fn rejects_duplicate_contribution() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        let creator = Address::generate(&env);
        let msme = Address::generate(&env);
        let hash = BytesN::from_array(&env, &[5; 32]);
        let circuit = Bytes::from_slice(&env, b"circuit-1");

        env.mock_all_auths();
        client.record(&creator, &msme, &circuit, &hash, &1);
        client.record(&creator, &msme, &circuit, &hash, &1);
    }

    #[test]
    #[should_panic(expected = "malformed contribution")]
    fn rejects_empty_circuit() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        let creator = Address::generate(&env);
        let msme = Address::generate(&env);

        env.mock_all_auths();
        client.record(
            &creator,
            &msme,
            &Bytes::new(&env),
            &BytesN::from_array(&env, &[6; 32]),
            &1,
        );
    }
}