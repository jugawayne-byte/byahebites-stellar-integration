#![no_std]

#[cfg(test)]
extern crate std;

use soroban_sdk::{contract, contractimpl, contracttype, Address, BytesN, Env, String};

const MAX_TEXT_LEN: u32 = 256;
const MAX_MSME_ID_LEN: u32 = 128;

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct Credential {
    pub issuer: Address,
    pub msme_wallet: Address,
    pub msme_id: String,
    pub psgc_code: String,
    pub readiness_status: u32,
    pub circuit_id: String,
    pub content_hash: BytesN<32>,
    pub issued_ledger: u32,
    pub revoked_ledger: Option<u32>,
    pub schema_version: u32,
}
#[derive(Clone)]
#[contracttype]
enum DataKey {
    Admin,
    Issuer(Address),
    Credential(Address),
}

#[contract]
pub struct MsmeCredentialContract;

#[contractimpl]
impl MsmeCredentialContract {
    /// Initializes the contract and allowlists the admin as the first issuer.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }

        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Issuer(admin), &true);
    }

    /// Adds an issuer. Only the contract admin can change the allowlist.
    pub fn add_issuer(env: Env, issuer: Address) {
        let admin = Self::get_admin(&env);
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Issuer(issuer), &true);
    }

    /// Removes an issuer. The admin remains able to restore it later.
    pub fn remove_issuer(env: Env, issuer: Address) {
        let admin = Self::get_admin(&env);
        admin.require_auth();
        env.storage()
            .instance()
            .set(&DataKey::Issuer(issuer), &false);
    }

    /// Issues one credential for an MSME wallet. Credentials are write-once.
    pub fn issue_credential(
        env: Env,
        issuer: Address,
        msme_wallet: Address,
        msme_id: String,
        psgc_code: String,
        readiness_status: u32,
        circuit_id: String,
        content_hash: BytesN<32>,
    ) -> Credential {
        if !Self::issuer_is_allowed(&env, &issuer) {
            panic!("unauthorized issuer");
        }
        issuer.require_auth();

        if msme_id.len() == 0 || msme_id.len() > MAX_MSME_ID_LEN {
            panic!("malformed msme id");
        }
        if psgc_code.len() == 0 || psgc_code.len() > MAX_TEXT_LEN {
            panic!("malformed psgc code");
        }
        if circuit_id.len() == 0 || circuit_id.len() > MAX_TEXT_LEN {
            panic!("malformed circuit id");
        }
        if readiness_status > 2 {
            panic!("invalid readiness status");
        }
        if env
            .storage()
            .instance()
            .has(&DataKey::Credential(msme_wallet.clone()))
        {
            panic!("credential already exists");
        }

        let credential = Credential {
            issuer,
            msme_wallet: msme_wallet.clone(),
            msme_id,
            psgc_code,
            readiness_status,
            circuit_id,
            content_hash,
            issued_ledger: env.ledger().sequence(),
            revoked_ledger: None,
            schema_version: 1,
        };
        env.storage()
            .instance()
            .set(&DataKey::Credential(msme_wallet), &credential);
        credential
    }

    pub fn get_credential(env: Env, msme_wallet: Address) -> Option<Credential> {
        env.storage()
            .instance()
            .get(&DataKey::Credential(msme_wallet))
    }

    pub fn is_issuer(env: Env, issuer: Address) -> bool {
        Self::issuer_is_allowed(&env, &issuer)
    }
}

impl MsmeCredentialContract {
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
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        Env,
    };

    fn setup() -> (Env, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        let admin = Address::generate(&env);
        let wallet = Address::generate(&env);
        (env, admin, wallet)
    }

    fn hash(env: &Env) -> BytesN<32> {
        BytesN::from_array(env, &[7; 32])
    }

    #[test]
    fn authorized_issue_and_lookup() {
        let (env, issuer, wallet) = setup();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        env.ledger().set_sequence_number(42);
        let result = client.issue_credential(
            &issuer,
            &wallet,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, "PH-1374"),
            &1,
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
        assert_eq!(result.msme_wallet, wallet);
        assert_eq!(result.issued_ledger, 42);
        assert_eq!(client.get_credential(&wallet), Some(result));
    }

    #[test]
    #[should_panic(expected = "unauthorized issuer")]
    fn rejects_unauthorized_issuer() {
        let (env, issuer, wallet) = setup();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        let outsider = Address::generate(&env);
        client.issue_credential(
            &outsider,
            &wallet,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, "PH-1374"),
            &1,
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
    }

    #[test]
    #[should_panic(expected = "malformed psgc code")]
    fn rejects_malformed_fields() {
        let (env, issuer, wallet) = setup();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        client.issue_credential(
            &issuer,
            &wallet,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, ""),
            &1,
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
    }

    #[test]
    #[should_panic(expected = "invalid readiness status")]
    fn rejects_invalid_readiness_enum() {
        let (env, issuer, wallet) = setup();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        client.issue_credential(
            &issuer,
            &wallet,
            &String::from_str(&env, "msme-001"),
            &String::from_str(&env, "PH-1374"),
            &3,
            &String::from_str(&env, "circuit-1"),
            &hash(&env),
        );
    }

    #[test]
    #[should_panic(expected = "credential already exists")]
    fn rejects_overwrite() {
        let (env, issuer, wallet) = setup();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        client.initialize(&issuer);
        let msme_id = String::from_str(&env, "msme-001");
        let psgc = String::from_str(&env, "PH-1374");
        let circuit = String::from_str(&env, "circuit-1");
        let value = hash(&env);
        client.issue_credential(&issuer, &wallet, &msme_id, &psgc, &1, &circuit, &value);
        client.issue_credential(&issuer, &wallet, &msme_id, &psgc, &2, &circuit, &value);
    }
}
