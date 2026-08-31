# Verification scripts

Run the Testnet evidence consistency check from the repository root:

```bash
pnpm run validate:testnet-evidence
```

The validator compares `deployments/testnet.json` with the reviewer-facing
README and `deployments/README.md`. It checks public IDs, transaction hashes,
explorer links, WASM checksums, the Testnet network, and deployment date.

No private signing material or signed transaction envelopes belong in this
directory.