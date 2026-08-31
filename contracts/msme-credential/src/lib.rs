#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Bytes, BytesN, Env, Vec,
};

const STATUS_ISSUED: u32 = 1;
const STATUS_ACTIVE: u32 = 2;
const STATUS_EXPIRED: u32 = 3;

#[contracttype]
#[derive(Clone)]
pub struct CredentialRecord {
    pub issuer: Address,
    pub subject: Address,
    pub msme_id: u32,
    pub psgc_code: Bytes,
    pub status: u32,
    pub circuit_id: Bytes,
    pub content_hash: BytesN<32>,
    pub issued_at: u64,
    pub expires_at: u64,
    pub version: u32,
}

#[contracttype]
enum DataKey {
    Issuer,
    Credential(Address),
}

#[contract]
pub struct MsmeCredentialContract;

#[contractimpl]
impl MsmeCredentialContract {
    pub fn initialize(env: Env, issuer: Address) {
        if env.storage().instance().has(&DataKey::Issuer) {
            panic!("already initialized");
        }
        issuer.require_auth();
        env.storage().instance().set(&DataKey::Issuer, &issuer);
    }

    pub fn issue(
        env: Env,
        issuer: Address,
        subject: Address,
        msme_id: u32,
        psgc_code: Bytes,
        status: u32,
        circuit_id: Bytes,
        content_hash: BytesN<32>,
        expires_at: u64,
        version: u32,
    ) {
        issuer.require_auth();
        Self::assert_issuer(&env, &issuer);

        if psgc_code.len() == 0 || circuit_id.len() == 0 || version == 0 {
            panic!("malformed credential");
        }
        if status != STATUS_ISSUED && status != STATUS_ACTIVE {
            panic!("invalid status");
        }

        let key = DataKey::Credential(subject.clone());
        if env.storage().persistent().has(&key) {
            panic!("credential already exists");
        }

        let record = CredentialRecord {
            issuer,
            subject,
            msme_id,
            psgc_code,
            status,
            circuit_id,
            content_hash,
            issued_at: env.ledger().timestamp(),
            expires_at,
            version,
        };
        env.storage().persistent().set(&key, &record);
    }

    pub fn get(env: Env, subject: Address) -> Option<CredentialRecord> {
        let key = DataKey::Credential(subject);
        let mut record: CredentialRecord = env.storage().persistent().get(&key)?;
        if record.expires_at > 0 && env.ledger().timestamp() >= record.expires_at {
            record.status = STATUS_EXPIRED;
        }
        Some(record)
    }

    pub fn has(env: Env, subject: Address) -> bool {
        env.storage()
            .persistent()
            .has(&DataKey::Credential(subject))
    }

    pub fn issuer(env: Env) -> Option<Address> {
        env.storage().instance().get(&DataKey::Issuer)
    }

    pub fn status_values(_env: Env) -> Vec<u32> {
        let mut values = Vec::new(&_env);
        values.push_back(STATUS_ISSUED);
        values.push_back(STATUS_ACTIVE);
        values.push_back(STATUS_EXPIRED);
        values
    }

    fn assert_issuer(env: &Env, issuer: &Address) {
        let configured: Address = env
            .storage()
            .instance()
            .get(&DataKey::Issuer)
            .unwrap_or_else(|| panic!("not initialized"));
        if configured != *issuer {
            panic!("unauthorized issuer");
        }
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Bytes, Env};

    #[test]
    fn issues_and_reads_credential() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        let issuer = Address::generate(&env);
        let subject = Address::generate(&env);

        env.mock_all_auths();
        client.initialize(&issuer);
        client.issue(
            &issuer,
            &subject,
            &1001,
            &Bytes::from_slice(&env, b"PH-045"),
            &STATUS_ACTIVE,
            &Bytes::from_slice(&env, b"circuit-1"),
            &BytesN::from_array(&env, &[7; 32]),
            &0,
            &1,
        );

        let record = client.get(&subject).unwrap();
        assert_eq!(record.msme_id, 1001);
        assert_eq!(record.status, STATUS_ACTIVE);
        assert!(client.has(&subject));
    }

    #[test]
    #[should_panic(expected = "credential already exists")]
    fn rejects_overwrite() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        let issuer = Address::generate(&env);
        let subject = Address::generate(&env);

        env.mock_all_auths();
        client.initialize(&issuer);
        let hash = BytesN::from_array(&env, &[8; 32]);
        let psgc = Bytes::from_slice(&env, b"PH-045");
        let circuit = Bytes::from_slice(&env, b"circuit-1");
        client.issue(&issuer, &subject, &1, &psgc, &STATUS_ISSUED, &circuit, &hash, &0, &1);
        client.issue(&issuer, &subject, &2, &psgc, &STATUS_ISSUED, &circuit, &hash, &0, &1);
    }

    #[test]
    #[should_panic(expected = "unauthorized issuer")]
    fn rejects_non_allowlisted_issuer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, MsmeCredentialContract);
        let client = MsmeCredentialContractClient::new(&env, &contract_id);
        let issuer = Address::generate(&env);
        let attacker = Address::generate(&env);
        let subject = Address::generate(&env);

        env.mock_all_auths();
        client.initialize(&issuer);
        client.issue(
            &attacker,
            &subject,
            &1,
            &Bytes::from_slice(&env, b"PH-045"),
            &STATUS_ISSUED,
            &Bytes::from_slice(&env, b"circuit-1"),
            &BytesN::from_array(&env, &[9; 32]),
            &0,
            &1,
        );
    }
}