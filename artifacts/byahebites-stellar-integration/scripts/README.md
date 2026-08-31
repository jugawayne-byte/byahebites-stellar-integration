# Scripts
Deployment and utility scripts for the Instaward demo.

The public Testnet evidence is checked from the repository root with:

```bash
pnpm run validate:testnet-evidence
```

Run this before publishing a new deployment. It keeps the reviewer README,
deployment index, and `deployments/testnet.json` aligned and prevents
non-Testnet links or secret/private-key fields from entering the public record.
