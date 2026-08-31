import {
  BASE_FEE,
  Contract,
  Networks,
  rpc,
  scValToNative,
  StrKey,
  nativeToScVal,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  Networks as WalletNetworks,
  StellarWalletsKit,
  type ModuleInterface,
} from "@creit.tech/stellar-wallets-kit";
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils";

export type PublicConfig = {
  network: "TESTNET";
  networkPassphrase: string;
  rpcUrl: string;
  explorerUrl: string;
  msmeContractId: string;
  contributionContractId: string;
  issuerPublicKey: string;
};

export type CredentialRecord = {
  issuer: string;
  msmeWallet: string;
  msmeId: string;
  psgcCode: string;
  readinessStatus: number;
  circuitId: string;
  contentHash: string;
  issuedLedger: number;
  revokedLedger: number | null;
  schemaVersion: number;
};

export type ContributionRecord = {
  issuer: string;
  creatorWallet: string;
  msmeWallet: string;
  msmeId: string;
  circuitId: string;
  contentHash: string;
  recordedLedger: number;
  schemaVersion: number;
};

export type WalletState = {
  address: string;
  network: string;
  networkPassphrase: string;
  walletName: string;
};

export type TransactionResult = {
  hash: string;
  ledger: number;
  explorerUrl: string;
};

const DEFAULT_CONFIG_PATH = `${import.meta.env.BASE_URL}testnet.json`;
const DEFAULT_NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";

let walletInitialized = false;

function asString(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function asNumber(value: unknown): number {
  return typeof value === "bigint" ? Number(value) : Number(value ?? 0);
}

function bytesToHex(value: unknown): string {
  if (value instanceof Uint8Array) {
    return Array.from(value, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  if (Array.isArray(value)) {
    return value.map((byte) => Number(byte).toString(16).padStart(2, "0")).join("");
  }
  return asString(value);
}

function normalizeCredential(value: unknown): CredentialRecord {
  const record = value as Record<string, unknown>;
  return {
    issuer: asString(record.issuer),
    msmeWallet: asString(record.msme_wallet),
    msmeId: asString(record.msme_id),
    psgcCode: asString(record.psgc_code),
    readinessStatus: asNumber(record.readiness_status),
    circuitId: asString(record.circuit_id),
    contentHash: bytesToHex(record.content_hash),
    issuedLedger: asNumber(record.issued_ledger),
    revokedLedger: record.revoked_ledger == null ? null : asNumber(record.revoked_ledger),
    schemaVersion: asNumber(record.schema_version),
  };
}

function normalizeContribution(value: unknown): ContributionRecord {
  const record = value as Record<string, unknown>;
  return {
    issuer: asString(record.issuer),
    creatorWallet: asString(record.creator_wallet),
    msmeWallet: asString(record.msme_wallet),
    msmeId: asString(record.msme_id),
    circuitId: asString(record.circuit_id),
    contentHash: bytesToHex(record.content_hash),
    recordedLedger: asNumber(record.recorded_ledger),
    schemaVersion: asNumber(record.schema_version),
  };
}

export async function loadPublicConfig(): Promise<PublicConfig> {
  const response = await fetch(DEFAULT_CONFIG_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error(`Public Testnet configuration unavailable (${response.status})`);
  const value = (await response.json()) as Partial<PublicConfig>;
  const env = import.meta.env;
  const config: PublicConfig = {
    network: "TESTNET",
    networkPassphrase: value.networkPassphrase || DEFAULT_NETWORK_PASSPHRASE,
    rpcUrl: env.VITE_SOROBAN_RPC_URL || value.rpcUrl || "https://soroban-testnet.stellar.org",
    explorerUrl: env.VITE_STELLAR_EXPLORER_URL || value.explorerUrl || "https://stellar.expert/explorer/testnet",
    msmeContractId: env.VITE_MSME_CONTRACT_ID || value.msmeContractId || "",
    contributionContractId: env.VITE_CONTRIBUTION_CONTRACT_ID || value.contributionContractId || "",
    issuerPublicKey: env.VITE_ISSUER_PUBLIC_KEY || value.issuerPublicKey || "",
  };
  if (
    config.network !== "TESTNET" ||
    !config.rpcUrl.startsWith("https://") ||
    !StrKey.isValidEd25519PublicKey(config.issuerPublicKey) ||
    !StrKey.isValidContract(config.msmeContractId) ||
    !StrKey.isValidContract(config.contributionContractId)
  ) {
    throw new Error("Public configuration is invalid or is not Stellar Testnet configuration.");
  }
  return config;
}

export function initializeWalletKit() {
  if (walletInitialized) return;
  const modules = defaultModules({
    filterBy: (module: ModuleInterface) =>
      ["freighter", "xbull", "albedo", "lobstr", "hana"].includes(module.productId),
  });
  StellarWalletsKit.init({
    modules,
    network: WalletNetworks.TESTNET,
    authModal: { showInstallLabel: true, hideUnsupportedWallets: false },
  });
  walletInitialized = true;
}

export async function connectWallet(): Promise<WalletState> {
  initializeWalletKit();
  const { address } = await StellarWalletsKit.authModal();
  const network = await StellarWalletsKit.getNetwork();
  if (network.networkPassphrase !== Networks.TESTNET) {
    await StellarWalletsKit.disconnect();
    throw new Error("Wrong network: switch the selected wallet to Stellar Testnet and try again.");
  }
  return {
    address,
    network: network.network,
    networkPassphrase: network.networkPassphrase,
    walletName: StellarWalletsKit.selectedModule.productName,
  };
}

export async function disconnectWallet() {
  initializeWalletKit();
  await StellarWalletsKit.disconnect();
}

function assertPublicKey(value: string, label: string) {
  if (!StrKey.isValidEd25519PublicKey(value.trim())) {
    throw new Error(`${label} must be a valid Stellar public address.`);
  }
}

function assertHash(value: string) {
  if (!/^[0-9a-f]{64}$/i.test(value.trim())) {
    throw new Error("Content commitment must be exactly 64 hexadecimal characters.");
  }
}

function hashBytes(value: string) {
  const normalized = value.trim();
  assertHash(normalized);
  return Uint8Array.from(normalized.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
}

function serverFor(config: PublicConfig) {
  return new rpc.Server(config.rpcUrl, { allowHttp: false, timeout: 20_000 });
}

async function buildInvocation(config: PublicConfig, sourceAddress: string, contractId: string, method: string, args: ReturnType<typeof nativeToScVal>[]) {
  assertPublicKey(sourceAddress, "Connected wallet");
  const server = serverFor(config);
  const sourceAccount = await server.getAccount(sourceAddress);
  return new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(60)
    .build();
}

async function simulateRead(config: PublicConfig, contractId: string, method: string, args: ReturnType<typeof nativeToScVal>[]) {
  const transaction = await buildInvocation(config, config.issuerPublicKey, contractId, method, args);
  const simulation = await serverFor(config).simulateTransaction(transaction);
  if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result) {
    throw new Error(rpc.Api.isSimulationError(simulation) ? simulation.error : "Soroban RPC could not decode this public record.");
  }
  return scValToNative(simulation.result.retval);
}

export async function readCredential(config: PublicConfig, msmeWallet: string): Promise<CredentialRecord | null> {
  assertPublicKey(msmeWallet, "MSME wallet");
  const value = await simulateRead(config, config.msmeContractId, "get_credential", [
    nativeToScVal(msmeWallet.trim(), { type: "address" }),
  ]);
  return value == null ? null : normalizeCredential(value);
}

export async function readContribution(config: PublicConfig, creatorWallet: string, contentHash: string): Promise<ContributionRecord | null> {
  assertPublicKey(creatorWallet, "Creator wallet");
  assertHash(contentHash);
  const value = await simulateRead(config, config.contributionContractId, "get_contribution", [
    nativeToScVal(creatorWallet.trim(), { type: "address" }),
    nativeToScVal(hashBytes(contentHash)),
  ]);
  return value == null ? null : normalizeContribution(value);
}

async function submitInvocation(
  config: PublicConfig,
  sourceAddress: string,
  contractId: string,
  method: string,
  args: ReturnType<typeof nativeToScVal>[],
): Promise<TransactionResult> {
  initializeWalletKit();
  const server = serverFor(config);
  const transaction = await buildInvocation(config, sourceAddress, contractId, method, args);
  const simulation = await server.simulateTransaction(transaction);
  if (!rpc.Api.isSimulationSuccess(simulation)) {
    throw new Error(rpc.Api.isSimulationError(simulation) ? simulation.error : "Soroban simulation did not complete.");
  }
  const prepared = await server.prepareTransaction(transaction);
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(prepared.toXDR(), {
    networkPassphrase: Networks.TESTNET,
    address: sourceAddress,
  });
  const sent = await server.sendTransaction(TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET));
  if (sent.status !== "PENDING") {
    throw new Error(`Soroban rejected the transaction before submission (${sent.status}).`);
  }
  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const result = await server.getTransaction(sent.hash);
    if (result.status === "SUCCESS") {
      return {
        hash: sent.hash,
        ledger: result.ledger,
        explorerUrl: `${config.explorerUrl}/tx/${sent.hash}`,
      };
    }
    if (result.status === "FAILED") {
      throw new Error("The submitted transaction failed on Stellar Testnet.");
    }
  }
  throw new Error(`Transaction ${sent.hash} is still pending. Open it on Stellar Expert to follow finality.`);
}

export async function issueCredential(
  config: PublicConfig,
  sourceAddress: string,
  input: {
    msmeWallet: string;
    msmeId: string;
    psgcCode: string;
    readinessStatus: number;
    circuitId: string;
    contentHash: string;
  },
) {
  assertPublicKey(sourceAddress, "Connected wallet");
  assertPublicKey(input.msmeWallet, "MSME wallet");
  assertHash(input.contentHash);
  if (sourceAddress !== config.issuerPublicKey) {
    throw new Error("This deployed contract only accepts the configured public issuer wallet for issuance.");
  }
  return submitInvocation(config, sourceAddress, config.msmeContractId, "issue_credential", [
    nativeToScVal(sourceAddress, { type: "address" }),
    nativeToScVal(input.msmeWallet.trim(), { type: "address" }),
    nativeToScVal(input.msmeId.trim(), { type: "string" }),
    nativeToScVal(input.psgcCode.trim(), { type: "string" }),
    nativeToScVal(input.readinessStatus, { type: "u32" }),
    nativeToScVal(input.circuitId.trim(), { type: "string" }),
    nativeToScVal(hashBytes(input.contentHash)),
  ]);
}

export async function recordContribution(
  config: PublicConfig,
  sourceAddress: string,
  input: { creatorWallet: string; msmeWallet: string; msmeId: string; circuitId: string; contentHash: string },
) {
  assertPublicKey(sourceAddress, "Connected wallet");
  assertPublicKey(input.creatorWallet, "Creator wallet");
  assertPublicKey(input.msmeWallet, "MSME wallet");
  assertHash(input.contentHash);
  if (sourceAddress !== config.issuerPublicKey) {
    throw new Error("This deployed contract only accepts the configured public issuer wallet for the issuer signature.");
  }
  if (sourceAddress !== input.creatorWallet.trim()) {
    throw new Error("The connected wallet must match the creator wallet so it can authorize this contribution.");
  }
  return submitInvocation(config, sourceAddress, config.contributionContractId, "record_contribution", [
    nativeToScVal(sourceAddress, { type: "address" }),
    nativeToScVal(input.creatorWallet.trim(), { type: "address" }),
    nativeToScVal(input.msmeWallet.trim(), { type: "address" }),
    nativeToScVal(input.msmeId.trim(), { type: "string" }),
    nativeToScVal(input.circuitId.trim(), { type: "string" }),
    nativeToScVal(hashBytes(input.contentHash)),
  ]);
}

export function readinessLabel(value: number) {
  return ["Not ready", "In progress", "Ready"][value] || "Unknown";
}

export function shorten(value: string) {
  return value.length > 18 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
}