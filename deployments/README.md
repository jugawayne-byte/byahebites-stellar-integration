# Stellar Testnet deployments

These are the public deployment records for the two Soroban contracts. The
evidence snapshot was recorded on **2026-08-31 (UTC)** on **Stellar Testnet**.
The private signing identity remains in the local deployment configuration and
is not part of this repository.

| Contract | Public contract ID | Deployment transaction | Initialization transaction | WASM SHA-256 |
| --- | --- | --- | --- | --- |
| MSME Credential | [`CBFGWVFTPC5L3NEEZ3XMO6W3MR3X5OKVSYZ5QVL7D5VT4EYZKHBBNSQ3`](https://stellar.expert/explorer/testnet/contract/CBFGWVFTPC5L3NEEZ3XMO6W3MR3X5OKVSYZ5QVL7D5VT4EYZKHBBNSQ3) | [`21382e968dfee7a1c1bc0ad5d427e9ecc7ab52f44e6a199b44e7de4aaf379919`](https://stellar.expert/explorer/testnet/tx/21382e968dfee7a1c1bc0ad5d427e9ecc7ab52f44e6a199b44e7de4aaf379919) | [`972080874e2d51ba467f5c02e725079d5db7c31531bce688df089731b769424f`](https://stellar.expert/explorer/testnet/tx/972080874e2d51ba467f5c02e725079d5db7c31531bce688df089731b769424f) | `8d8ee9aa5c7ecd6f835d9a146d19ab3f04be482b68ffa063e4b486085c74b23d` |
| Creator Contribution | [`CDP3RVMNYOQV4II3SGRCZHSO7DSH57QIDDR3BSYOJ5VMVXOJBR5PV2KP`](https://stellar.expert/explorer/testnet/contract/CDP3RVMNYOQV4II3SGRCZHSO7DSH57QIDDR3BSYOJ5VMVXOJBR5PV2KP) | [`da42bf2c1f0f832fd83f98c96d1dff753e4a822ec74e3a0ebca6a6aecf9c855e`](https://stellar.expert/explorer/testnet/tx/da42bf2c1f0f832fd83f98c96d1dff753e4a822ec74e3a0ebca6a6aecf9c855e) | [`cf0e87e16b9ede2b21614ea1e2e917a2a802d717d12fe50205692cb6c54d5014`](https://stellar.expert/explorer/testnet/tx/cf0e87e16b9ede2b21614ea1e2e917a2a802d717d12fe50205692cb6c54d5014) | `3bba988a5d48aa13c0fe7895f71c8ffb4b0790148e18af4429dc719b3bfb6f15` |

Both instances were initialized with the public issuer address
`GDW4QFO6CWJWM5LDBWGSIA2I26AB33MNRD22UGNV2RKWMU7JVFYOGWPD`. The complete
machine-readable record, including all four transaction links, is
[`testnet.json`](testnet.json).

## Reproduce the checks

```bash
export PATH="$HOME/.local/bin:$PATH"
export RUSTUP_TOOLCHAIN=1.88.0
cargo test --workspace --locked
stellar contract build --package msme-credential --out-dir target/deploy
stellar contract build --package creator-contribution --out-dir target/deploy
```

The deployed WASM checksums in this table must match the hashes printed by the
build command before a release is redeployed.

Before publishing or redeploying, run the release evidence consistency check from
the repository root. It compares this index and the reviewer README with the
machine-readable record, including all public IDs, hashes, links, checksums, and
the deployment date:

```bash
pnpm run validate:testnet-evidence
```

## Contract behavior covered by tests

- Only an allowlisted issuer can issue or attest.
- Empty or oversized text fields are rejected.
- Readiness values outside the supported enum are rejected.
- A credential cannot be overwritten for an MSME wallet.
- A contribution cannot be written twice for the same creator and content
  commitment.