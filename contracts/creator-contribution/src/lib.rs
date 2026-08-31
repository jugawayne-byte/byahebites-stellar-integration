#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String};

const MAX_TEXT_LEN: u32 = 256;
const MAX_MSME_ID_LEN: u32 = 128;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Contribution {
    pub issuer: Address,
    pub creator_wallet: Address,
    pub msme_id: String,
    pub circuit_id: String,
    pub content_hash: BytesN<32>,
    pub recorded_ledger: u32,
    pub schema_version: u32,
}
#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Issuer(Address),
    Contribution(Address, BytesN<32>),
}

#[contract]
pub struct CreatorContributionContract;

#[contractimpl]
impl CreatorContributionContract {
    /// Initializes the contract and allowlists the admin as the first issuer.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Issuer(admin), &true);
    }

    pub fn add_issuer(env: Env, issuer: Address) {
        let admin = Self::get_admin(&env);
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Issuer(issuer), &true);
    }

    pub fn remove_issuer(env: Env, issuer: Address) {
        let admin = Self::get_admin(&env);
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Issuer(issuer), &false);
    }

    /// Records one creator contribution. The creator signs the contribution,
    /// while an allowlisted issuer attests to the MSME/circuit association.
    /// The (creator, content hash) pair is permanently write-once.
    pub fn record_contribution(
        env: Env,
        issuer: Address,
        creator_wallet: Address,
        msme_id: String,
        circuit_id: String,
        content_hash: BytesN<32>,
    ) -> Contribution {
        if !Self::issuer_is_allowed(&env, &issuer) {
            panic!("unauthorized issuer");
        }
        issuer.require_auth();
        creator_wallet.require_auth();

        if msme_id.len() == 0 || msme_id.len() > MAX_MSME_ID_LEN {
            panic!("malformed msme id");
        }
        if circuit_id.len() == 0 || circuit_id.len() > MAX_TEXT_LEN {
            panic!("malformed circuit id");
        }

        let key = DataKey::Contribution(creator_wallet.clone(), content_hash.clone());
        if env.storage().instance().has(&key) {
            panic!("contribution already exists");
        }

        let contribution = Contribution {
            issuer,
            creator_wallet,
            msme_id,
            circuit_id,
            content_hash,
            recorded_ledger: env.ledger().sequence(),
            schema_version: 1,
        };
        env.storage().instance().set(&key, &contribution);
        contribution
    }

    pub fn get_contribution(
        env: Env,
        creator_wallet: Address,
        content_hash: BytesN<32>,
    ) -> Option<Contribution> {
        env.storage()
            .instance()
            .get(&DataKey::Contribution(creator_wallet, content_hash))
    }

    pub fn is_issuer(env: Env, issuer: Address) -> bool {
        Self::issuer_is_allowed(&env, &issuer)
    }
}

impl CreatorContributionContract {
    fn get_admin(env: &Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"))
    }

    fn issuer_is_allowed(env: &Env, issuer: &Address) -> bool {
        env.storage()
            .instance()
            .get(&DataKey::Issuer(issuer.clone()))
            .unwrap_or(false)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let creator = Address::generate(&env);
        (env, admin, creator)
    }

    fn hash(env: &Env) -> BytesN<32> {
        BytesN::from_array(env, &[9; 32])
    }

    #[test]
    fn records_and_reads_contribution() {
        let (env, issuer, creator) = setup();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        let result = client.record_contribution(
            &issuer,
            &creator,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
        assert_eq!(result.creator_wallet, creator);
        assert_eq!(client.get_contribution(&creator, &hash(&env)), Some(result));
    }

    #[test]
    #[should_panic(expected = "unauthorized issuer")]
    fn rejects_unauthorized_issuer() {
        let (env, issuer, creator) = setup();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        let outsider = Address::generate(&env);
        client.record_contribution(
            &outsider,
            &creator,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
    }

    #[test]
    #[should_panic(expected = "malformed circuit id")]
    fn rejects_malformed_fields() {
        let (env, issuer, creator) = setup();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        client.record_contribution(
            &issuer,
            &creator,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, ""),
            &hash(&env),
        );
    }

    #[test]
    #[should_panic(expected = "contribution already exists")]
    fn rejects_duplicate_and_overwrite() {
        let (env, issuer, creator) = setup();
        let contract_id = env.register_contract(None, CreatorContributionContract);
        let client = CreatorContributionContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        let msme_id = String::from_str(&env, "msme-001");
        let circuit = String::from_str(&env, "circuit-1");
        let value = hash(&env);
        client.record_contribution(&issuer, &creator, &msme_id, &circuit, &value);
        client.record_contribution(&issuer, &creator, &msme_id, &circuit, &value);
    }
}
