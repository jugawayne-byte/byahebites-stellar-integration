import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

type JsonObject = { [key: string]: unknown };

type ContractName = "msme_credential" | "creator_contribution";

type PublishedContract = {
  label: string;
  contractId: string;
  contractUrl: string;
  deploymentTransaction: string;
  deploymentTransactionUrl: string;
  initializationTransaction: string;
  initializationTransactionUrl: string;
  wasmSha256: string;
};

type PublishedEvidence = {
  date: string;
  issuerPublicKey?: string;
  contracts: Record<ContractName, PublishedContract>;
};

const CONTRACT_NAMES: readonly ContractName[] = [
  "msme_credential",
  "creator_contribution",
];
const CONTRACT_LABELS: Record<ContractName, string> = {
  msme_credential: "MSME Credential",
  creator_contribution: "Creator Contribution",
};
const RECORD_KEYS = [
  "network",
  "deployment_date",
  "rpc_url",
  "explorer",
  "issuer_public_key",
  "verification_commands",
  "contracts",
];
const CONTRACT_KEYS = [
  "contract_id",
  "wasm_sha256",
  "deployment_transaction",
  "initialization_transaction",
  "explorer_url",
  "deployment_transaction_url",
  "initialization_transaction_url",
];
const TESTNET_EXPLORER_ORIGIN = "https://stellar.expert";
const TESTNET_EXPLORER_PREFIX = "/explorer/testnet";
const TESTNET_RPC_URL = "https://soroban-testnet.stellar.org";
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PUBLIC_KEY_PATTERN = /^G[A-Z2-7]{55}$/;
const CONTRACT_ID_PATTERN = /^C[A-Z2-7]{55}$/;
const HASH_PATTERN = /^[0-9a-f]{64}$/;
const SENSITIVE_KEY_PATTERN =
  /(?:secret|private|seed|mnemonic|signed[_-]?xdr)/i;

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "../..");

function fail(message: string): never {
  throw new Error(message);
}

function asObject(value: unknown, path: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    fail(`${path} must be an object`);
  }
  return value as JsonObject;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.length === 0) {
    fail(`${path} must be a non-empty string`);
  }
  return value;
}

function requireExactKeys(
  object: JsonObject,
  expectedKeys: readonly string[],
  path: string,
): void {
  const expected = new Set(expectedKeys);
  for (const key of Object.keys(object)) {
    if (!expected.has(key)) {
      fail(`${path} contains unexpected field "${key}"`);
    }
  }
  for (const key of expectedKeys) {
    if (!(key in object)) {
      fail(`${path} is missing required field "${key}"`);
    }
  }
}

function assertMatches(value: string, pattern: RegExp, path: string): void {
  if (!pattern.test(value)) {
    fail(`${path} has an invalid format`);
  }
}

function assertTestnetUrl(value: string, path: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    fail(`${path} must be an absolute URL`);
  }

  if (url.protocol !== "https:") {
    fail(`${path} must use HTTPS`);
  }
  if (
    url.origin !== TESTNET_EXPLORER_ORIGIN ||
    !url.pathname.startsWith(`${TESTNET_EXPLORER_PREFIX}/`)
  ) {
    fail(`${path} must be a Stellar Expert Testnet URL`);
  }
  if (url.search || url.hash) {
    fail(`${path} must not contain a query string or fragment`);
  }
  return url;
}

function assertNoSensitiveFields(value: unknown, path: string): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) =>
      assertNoSensitiveFields(entry, `${path}[${index}]`),
    );
    return;
  }
  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      fail(`${path}.${key} is not allowed in a public deployment record`);
    }
    assertNoSensitiveFields(child, `${path}.${key}`);
  }
}

function parseRecord(recordPath: string): {
  record: JsonObject;
  contracts: Record<ContractName, JsonObject>;
} {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(recordPath, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    fail(`could not read valid JSON from ${recordPath}: ${reason}`);
  }

  assertNoSensitiveFields(parsed, "record");
  const record = asObject(parsed, "record");
  requireExactKeys(record, RECORD_KEYS, "record");

  if (record.network !== "Stellar Testnet") {
    fail('record.network must be exactly "Stellar Testnet"');
  }

  const deploymentDate = asString(record.deployment_date, "record.deployment_date");
  if (!ISO_DATE_PATTERN.test(deploymentDate)) {
    fail("record.deployment_date must use YYYY-MM-DD format");
  }
  const parsedDate = new Date(`${deploymentDate}T00:00:00.000Z`);
  if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== deploymentDate) {
    fail("record.deployment_date must be a real calendar date");
  }

  const rpcUrl = asString(record.rpc_url, "record.rpc_url");
  if (rpcUrl !== TESTNET_RPC_URL) {
    fail(`record.rpc_url must be exactly ${TESTNET_RPC_URL}`);
  }
  const rpc = new URL(rpcUrl);
  if (rpc.protocol !== "https:" || rpc.search || rpc.hash) {
    fail("record.rpc_url must use HTTPS without a query string or fragment");
  }

  const explorer = asString(record.explorer, "record.explorer");
  if (explorer !== `${TESTNET_EXPLORER_ORIGIN}${TESTNET_EXPLORER_PREFIX}`) {
    fail("record.explorer must be the Stellar Expert Testnet explorer");
  }

  const issuerPublicKey = asString(
    record.issuer_public_key,
    "record.issuer_public_key",
  );
  assertMatches(issuerPublicKey, PUBLIC_KEY_PATTERN, "record.issuer_public_key");

  if (
    !Array.isArray(record.verification_commands) ||
    record.verification_commands.length === 0 ||
    record.verification_commands.some((command) => typeof command !== "string" || command.length === 0)
  ) {
    fail("record.verification_commands must be a non-empty array of strings");
  }

  const contractRecord = asObject(record.contracts, "record.contracts");
  requireExactKeys(
    contractRecord,
    CONTRACT_NAMES,
    "record.contracts",
  );

  const contracts = {} as Record<ContractName, JsonObject>;
  for (const name of CONTRACT_NAMES) {
    const contract = asObject(contractRecord[name], `record.contracts.${name}`);
    requireExactKeys(contract, CONTRACT_KEYS, `record.contracts.${name}`);

    const contractId = asString(
      contract.contract_id,
      `record.contracts.${name}.contract_id`,
    );
    assertMatches(
      contractId,
      CONTRACT_ID_PATTERN,
      `record.contracts.${name}.contract_id`,
    );

    for (const field of [
      "wasm_sha256",
      "deployment_transaction",
      "initialization_transaction",
    ] as const) {
      const value = asString(contract[field], `record.contracts.${name}.${field}`);
      assertMatches(value, HASH_PATTERN, `record.contracts.${name}.${field}`);
    }

    const explorerUrl = asString(
      contract.explorer_url,
      `record.contracts.${name}.explorer_url`,
    );
    const deploymentUrl = asString(
      contract.deployment_transaction_url,
      `record.contracts.${name}.deployment_transaction_url`,
    );
    const initializationUrl = asString(
      contract.initialization_transaction_url,
      `record.contracts.${name}.initialization_transaction_url`,
    );
    const expectedExplorerUrl = `${TESTNET_EXPLORER_ORIGIN}${TESTNET_EXPLORER_PREFIX}/contract/${contractId}`;
    if (explorerUrl !== expectedExplorerUrl) {
      fail(`record.contracts.${name}.explorer_url does not match contract_id`);
    }
    const deploymentUrlObject = assertTestnetUrl(
      deploymentUrl,
      `record.contracts.${name}.deployment_transaction_url`,
    );
    const initializationUrlObject = assertTestnetUrl(
      initializationUrl,
      `record.contracts.${name}.initialization_transaction_url`,
    );
    if (
      deploymentUrlObject.pathname !==
      `${TESTNET_EXPLORER_PREFIX}/tx/${contract.deployment_transaction}` ||
      initializationUrlObject.pathname !==
      `${TESTNET_EXPLORER_PREFIX}/tx/${contract.initialization_transaction}`
    ) {
      fail(`record.contracts.${name} transaction URL does not match its hash`);
    }
    assertTestnetUrl(explorerUrl, `record.contracts.${name}.explorer_url`);
    contracts[name] = contract;
  }

  return { record, contracts };
}

function parseMarkdownTable(documentPath: string): {
  date: string;
  issuerPublicKey?: string;
  contracts: Record<ContractName, PublishedContract>;
} {
  const document = readFileSync(documentPath, "utf8");
  const dateMatch = document.match(
    /evidence snapshot was recorded on\s+\*\*(\d{4}-\d{2}-\d{2})\s+\(UTC\)\*\*/i,
  );
  if (!dateMatch) {
    fail(`${documentPath} is missing the dated Testnet evidence snapshot`);
  }

  const sectionStart = document.search(/^## Testnet deployment evidence\s*$/im);
  const section = sectionStart >= 0 ? document.slice(sectionStart) : document;
  const nextHeading = section.search(/^## (?!#)/m);
  const evidenceSection = nextHeading > 0 ? section.slice(0, nextHeading) : section;

  const rowPattern =
    /^\|\s*([^|]+?)\s*\|\s*\[`?([A-Z2-7]{56})`?\]\(([^)]+)\)\s*\|\s*\[`?([0-9a-f]{64})`?\]\(([^)]+)\)\s*\|\s*\[`?([0-9a-f]{64})`?\]\(([^)]+)\)\s*\|\s*`([0-9a-f]{64})`\s*\|\s*$/gim;
  const rows = [...evidenceSection.matchAll(rowPattern)];
  if (rows.length !== CONTRACT_NAMES.length) {
    fail(
      `${documentPath} must contain exactly ${CONTRACT_NAMES.length} evidence table rows`,
    );
  }

  const contracts = {} as Record<ContractName, PublishedContract>;
  for (const row of rows) {
    const label = row[1].trim();
    const name = CONTRACT_NAMES.find(
      (candidate) => CONTRACT_LABELS[candidate].toLowerCase() === label.toLowerCase(),
    );
    if (!name) {
      fail(`${documentPath} contains an unknown contract label "${label}"`);
    }
    if (name in contracts) {
      fail(`${documentPath} repeats the "${label}" evidence row`);
    }
    contracts[name] = {
      label,
      contractId: row[2],
      contractUrl: row[3],
      deploymentTransaction: row[4],
      deploymentTransactionUrl: row[5],
      initializationTransaction: row[6],
      initializationTransactionUrl: row[7],
      wasmSha256: row[8],
    };
  }

  if (CONTRACT_NAMES.some((name) => !(name in contracts))) {
    fail(`${documentPath} is missing an evidence row`);
  }

  const issuerMatch = document.match(
    /initialized with the public issuer address\s+`([^`]+)`/i,
  );
  return {
    date: dateMatch[1],
    ...(issuerMatch ? { issuerPublicKey: issuerMatch[1] } : {}),
    contracts,
  };
}

function compareEvidence(
  sourceName: string,
  published: PublishedEvidence,
  record: JsonObject,
  contracts: Record<ContractName, JsonObject>,
): void {
  const recordDate = asString(record.deployment_date, "record.deployment_date");
  if (published.date !== recordDate) {
    fail(`${sourceName} date does not match deployments/testnet.json`);
  }
  if (published.issuerPublicKey !== undefined) {
    const issuer = asString(record.issuer_public_key, "record.issuer_public_key");
    if (published.issuerPublicKey !== issuer) {
      fail(`${sourceName} issuer public key does not match deployments/testnet.json`);
    }
  }

  for (const name of CONTRACT_NAMES) {
    const contract = contracts[name];
    const row = published.contracts[name];
    const expected: PublishedContract = {
      label: CONTRACT_LABELS[name],
      contractId: asString(contract.contract_id, `record.contracts.${name}.contract_id`),
      contractUrl: asString(contract.explorer_url, `record.contracts.${name}.explorer_url`),
      deploymentTransaction: asString(
        contract.deployment_transaction,
        `record.contracts.${name}.deployment_transaction`,
      ),
      deploymentTransactionUrl: asString(
        contract.deployment_transaction_url,
        `record.contracts.${name}.deployment_transaction_url`,
      ),
      initializationTransaction: asString(
        contract.initialization_transaction,
        `record.contracts.${name}.initialization_transaction`,
      ),
      initializationTransactionUrl: asString(
        contract.initialization_transaction_url,
        `record.contracts.${name}.initialization_transaction_url`,
      ),
      wasmSha256: asString(
        contract.wasm_sha256,
        `record.contracts.${name}.wasm_sha256`,
      ),
    };
    for (const field of Object.keys(expected) as Array<keyof PublishedContract>) {
      if (row[field] !== expected[field]) {
        fail(`${sourceName} ${name}.${field} does not match deployments/testnet.json`);
      }
    }
  }
}

function parseArguments(args: string[]): {
  recordPath: string;
  readmePath: string;
  indexPath: string;
} {
  type PathKey = "recordPath" | "readmePath" | "indexPath";
  const paths = {
    recordPath: resolve(repositoryRoot, "deployments/testnet.json"),
    readmePath: resolve(
      repositoryRoot,
      "artifacts/byahebites-stellar-integration/README.md",
    ),
    indexPath: resolve(repositoryRoot, "deployments/README.md"),
  };
  const optionToPath = new Map<string, PathKey>([
    ["--record", "recordPath"],
    ["--readme", "readmePath"],
    ["--index", "indexPath"],
  ]);

  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    const pathKey = optionToPath.get(option);
    if (!pathKey) {
      fail(`unknown option "${option}" (use --record, --readme, or --index)`);
    }
    const path = args[index + 1];
    if (!path || path.startsWith("--")) {
      fail(`${option} requires a file path`);
    }
    paths[pathKey] = resolve(process.cwd(), path);
    index += 1;
  }
  return paths;
}

function validate(): void {
  const { recordPath, readmePath, indexPath } = parseArguments(process.argv.slice(2));
  const { record, contracts } = parseRecord(recordPath);
  const readme = parseMarkdownTable(readmePath);
  const index = parseMarkdownTable(indexPath);

  compareEvidence("README.md", readme, record, contracts);
  compareEvidence("deployments/README.md", index, record, contracts);

  if (readme.issuerPublicKey !== undefined) {
    const issuer = asString(record.issuer_public_key, "record.issuer_public_key");
    if (readme.issuerPublicKey !== issuer) {
      fail("README.md issuer public key does not match deployments/testnet.json");
    }
  }

  console.log(
    `Testnet evidence is consistent: ${CONTRACT_NAMES.length} contracts, ${record.deployment_date}, ${record.network}.`,
  );
}

try {
  validate();
} catch (error) {
  console.error(
    `Testnet evidence validation failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exitCode = 1;
}