#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Events, Ledger}, vec, BytesN, Env, IntoVal, String, Symbol};

#[test]
fn test_full_msme_credential_lifecycle() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_sequence_number(12345);

    let contract_id = env.register_contract(None, MSMECredentialContract);
    let client = MSMECredentialContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let lgu_issuer = Address::generate(&env);
    let msme_wallet = Address::generate(&env);
    let rogue_issuer = Address::generate(&env);

    // 1. Initialize
    client.init(&admin);
    assert_eq!(client.get_admin(), Some(admin.clone()));
    assert!(client.is_issuer(&admin)); // Admin is default issuer

    // 2. Add LGU Issuer
    client.add_issuer(&admin, &lgu_issuer);
    assert!(client.is_issuer(&lgu_issuer));
    assert!(!client.is_issuer(&rogue_issuer));

    // 3. Rogue Issuer attempt should fail with NotAnIssuer
    let psgc_manila = String::from_str(&env, "133900000");
    let circuit_id = String::from_str(&env, "CIRCUIT-NCR-BINONDO-01");
    let commitment = BytesN::from_array(&env, &[7u8; 32]);

    let rogue_res = client.try_issue_credential(
        &rogue_issuer,
        &msme_wallet,
        &psgc_manila,
        &ReadinessStatus::VerifiedLevel1,
        &circuit_id,
        &commitment,
    );
    assert_eq!(
        rogue_res.unwrap_err().unwrap(),
        MSMECredentialError::NotAnIssuer.into()
    );

    // 4. Query before issuance -> fail-closed (returns None)
    assert_eq!(client.get_credential(&msme_wallet), None);

    // 5. Authorized LGU Issuer issues credential
    let credential = client.issue_credential(
        &lgu_issuer,
        &msme_wallet,
        &psgc_manila,
        &ReadinessStatus::TourismCircuitReady,
        &circuit_id,
        &commitment,
    );

    assert_eq!(credential.issuer, lgu_issuer);
    assert_eq!(credential.msme, msme_wallet);
    assert_eq!(credential.psgc_code, psgc_manila);
    assert_eq!(credential.readiness_status, ReadinessStatus::TourismCircuitReady);
    assert_eq!(credential.circuit_id, circuit_id);
    assert_eq!(credential.content_commitment, commitment);
    assert_eq!(credential.issued_ledger, 12345);
    assert_eq!(credential.revoked_ledger, None);
    assert_eq!(credential.schema_version, 1);

    // 6. Query returns credential
    let queried = client.get_credential(&msme_wallet).unwrap();
    assert_eq!(queried, credential);

    // 7. Re-issuance updates record in place
    env.ledger().set_sequence_number(12400);
    let updated_commitment = BytesN::from_array(&env, &[8u8; 32]);
    let updated_cred = client.issue_credential(
        &lgu_issuer,
        &msme_wallet,
        &psgc_manila,
        &ReadinessStatus::TourismCircuitReady,
        &circuit_id,
        &updated_commitment,
    );

    assert_eq!(updated_cred.issued_ledger, 12400);
    assert_eq!(updated_cred.content_commitment, updated_commitment);

    let queried_updated = client.get_credential(&msme_wallet).unwrap();
    assert_eq!(queried_updated.content_commitment, updated_commitment);
    assert_eq!(queried_updated.issued_ledger, 12400);

    // 8. Admin removes issuer
    client.remove_issuer(&admin, &lgu_issuer);
    assert!(!client.is_issuer(&lgu_issuer));

    // Now previous issuer cannot issue anymore
    let after_remove_res = client.try_issue_credential(
        &lgu_issuer,
        &msme_wallet,
        &psgc_manila,
        &ReadinessStatus::VerifiedLevel2,
        &circuit_id,
        &commitment,
    );
    assert_eq!(
        after_remove_res.unwrap_err().unwrap(),
        MSMECredentialError::NotAnIssuer.into()
    );
}
