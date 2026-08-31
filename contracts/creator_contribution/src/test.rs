#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::{Address as _, Events, Ledger}, vec, BytesN, Env, IntoVal, String, Symbol};

#[test]
fn test_creator_contribution_lifecycle_and_duplicate_rejection() {
    let env = Env::default();
    env.mock_all_auths();
    env.ledger().set_sequence_number(54321);

    let contract_id = env.register_contract(None, CreatorContributionContract);
    let client = CreatorContributionContractClient::new(&env, &contract_id);

    let creator1 = Address::generate(&env);
    let creator2 = Address::generate(&env);

    let msme_id = String::from_str(&env, "MSME-MNL-001");
    let circuit_id = String::from_str(&env, "CIRCUIT-NCR-BINONDO-01");
    let commitment1 = BytesN::from_array(&env, &[42u8; 32]);
    let commitment2 = BytesN::from_array(&env, &[99u8; 32]);

    // Query before record -> fail-closed (returns None / false)
    assert_eq!(client.get_contribution(&creator1, &commitment1), None);
    assert!(!client.has_contribution(&creator1, &commitment1));
    assert_eq!(client.get_total_contributions(), 0);

    // 1. Record first contribution (Story)
    let record1 = client.record_contribution(
        &creator1,
        &msme_id,
        &circuit_id,
        &ContributionType::Story,
        &commitment1,
    );

    assert_eq!(record1.creator, creator1);
    assert_eq!(record1.msme_id, msme_id);
    assert_eq!(record1.circuit_id, circuit_id);
    assert_eq!(record1.contribution_type, ContributionType::Story);
    assert_eq!(record1.content_commitment, commitment1);
    assert_eq!(record1.recorded_ledger, 54321);
    assert_eq!(record1.schema_version, 1);

    assert!(client.has_contribution(&creator1, &commitment1));
    assert_eq!(client.get_total_contributions(), 1);
    assert_eq!(client.get_creator_contribution_count(&creator1), 1);

    // 2. CRITICAL SOW REQUIREMENT: Duplicate write attempt MUST be strictly rejected on-chain
    let duplicate_res = client.try_record_contribution(
        &creator1,
        &msme_id,
        &circuit_id,
        &ContributionType::Story,
        &commitment1,
    );

    assert_eq!(
        duplicate_res.unwrap_err().unwrap(),
        CreatorContributionError::DuplicateContribution.into()
    );

    // Total count remains 1
    assert_eq!(client.get_total_contributions(), 1);

    // 3. Same creator can record a different distinct content commitment
    env.ledger().set_sequence_number(54350);
    let record2 = client.record_contribution(
        &creator1,
        &msme_id,
        &circuit_id,
        &ContributionType::Comic,
        &commitment2,
    );
    assert_eq!(record2.contribution_type, ContributionType::Comic);
    assert_eq!(client.get_total_contributions(), 2);
    assert_eq!(client.get_creator_contribution_count(&creator1), 2);

    // 4. Different creator can record without conflict
    let record3 = client.record_contribution(
        &creator2,
        &msme_id,
        &circuit_id,
        &ContributionType::PhotoSet,
        &commitment1, // same content hash, different creator key
    );
    assert_eq!(record3.creator, creator2);
    assert_eq!(client.get_total_contributions(), 3);
    assert_eq!(client.get_creator_contribution_count(&creator2), 1);
}
