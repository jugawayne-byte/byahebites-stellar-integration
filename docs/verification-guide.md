# Reviewer Verification Guide

This guide is written for a reviewer who does not need to understand the full ByahéBITES platform.

## 1. Confirm the network

Check that the demo, contract IDs, RPC URL, and explorer links all say **Stellar Testnet**. This Instaward does not use mainnet.

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

The final package should also include the passing test report, screenshots, walkthrough video, contract IDs, deployment hashes, and participant totals where onboarding succeeded.