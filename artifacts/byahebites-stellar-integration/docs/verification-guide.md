# Reviewer Verification Guide

This guide is written for a reviewer who does not need to understand the full ByahéBITES platform.

## 1. Confirm the network

Check that the demo, contract IDs, RPC URL, and explorer links all say
**Stellar Testnet**. This Instaward does not use mainnet. The two deployed
contract IDs are:

- MSME Credential:
  [`CBFGWVFTPC5L3NEEZ3XMO6W3MR3X5OKVSYZ5QVL7D5VT4EYZKHBBNSQ3`](https://stellar.expert/explorer/testnet/contract/CBFGWVFTPC5L3NEEZ3XMO6W3MR3X5OKVSYZ5QVL7D5VT4EYZKHBBNSQ3)
- Creator Contribution:
  [`CDP3RVMNYOQV4II3SGRCZHSO7DSH57QIDDR3BSYOJ5VMVXOJBR5PV2KP`](https://stellar.expert/explorer/testnet/contract/CDP3RVMNYOQV4II3SGRCZHSO7DSH57QIDDR3BSYOJ5VMVXOJBR5PV2KP)

The deployment date recorded for both contracts is **2026-08-31 (UTC)**.
The Soroban RPC endpoint is
`https://soroban-testnet.stellar.org`.

## 2. Open the live demo

Use the published URL in the repository README. The demo should clearly identify itself as the ByahéBITES Soroban Credential Layer and disclose any demo-only configuration.

## 3. Verify an MSME credential

1. Connect a supported Stellar wallet.
2. Select the MSME credential flow.
3. Submit a PSGC code, readiness status, circuit, wallet, and canonical-record commitment.
4. Approve the transaction in the wallet.
5. Copy the resulting transaction hash.
6. Read the credential by MSME wallet through the lookup flow.
7. Open the transaction hash in Stellar Expert Testnet.

The result should show the issuer, subject wallet, readiness information, commitment, ledger sequence, and schema version.

## 4. Verify a creator contribution

1. Select the contribution flow.
2. Submit the creator wallet, MSME ID, circuit ID, publication metadata, and canonical content commitment.
3. Approve the transaction.
4. Read the contribution back by its creator and content hash.
5. Submit the exact same contribution a second time.

The second write must be rejected on-chain and the rejection transaction or simulation result must be included in the evidence package.

## 5. Test fail-closed behavior

Each case must display a distinct non-valid result:

- Malformed wallet or commitment input
- Commitment does not match the canonical record
- Wrong network
- Unknown credential or contribution
- RPC unavailable
- Simulation or decoding failure

An unavailable or uncertain state must never be displayed as verified.

## 6. Verify the evidence package

For every listed record, confirm that:

- The transaction hash resolves on Stellar Expert Testnet.
- The transaction corresponds to the stated credential or contribution.
- The contract state can be read through the documented Soroban RPC query.
- The CSV and JSON transaction lists agree.

For the deployment and initialization evidence currently recorded in
`deployments/testnet.json`, a reviewer can verify all four hashes without a
wallet by running:

```bash
RPC_URL=https://soroban-testnet.stellar.org
for TX_HASH in \
  21382e968dfee7a1c1bc0ad5d427e9ecc7ab52f44e6a199b44e7de4aaf379919 \
  972080874e2d51ba467f5c02e725079d5db7c31531bce688df089731b769424f \
  da42bf2c1f0f832fd83f98c96d1dff753e4a822ec74e3a0ebca6a6aecf9c855e \
  cf0e87e16b9ede2b21614ea1e2e917a2a802d717d12fe50205692cb6c54d5014
do
  curl --fail-with-body -sS "$RPC_URL" \
    -H 'content-type: application/json' \
    --data "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getTransaction\",\"params\":{\"hash\":\"$TX_HASH\"}}"
  printf '\n'
done
```

Each response should report `"status":"SUCCESS"` and a ledger number. The
corresponding Stellar Expert links are in the README and the JSON record. The
final package should also include the passing test report, screenshots,
walkthrough video, and participant totals where onboarding succeeds; those
separate demo and participant artifacts are not represented as completed by
the deployment record.