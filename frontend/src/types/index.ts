export type ReadinessStatus = 
  | 'PendingVerification'
  | 'VerifiedLevel1'
  | 'VerifiedLevel2'
  | 'TourismCircuitReady'
  | 'Suspended';

export type ContributionType = 
  | 'Story'
  | 'PhotoSet'
  | 'Comic'
  | 'CulinaryReview';

export interface MSMECredential {
  issuer: string;
  msme: string;
  psgcCode: string;
  readinessStatus: ReadinessStatus;
  circuitId: string;
  contentCommitment: string;
  issuedLedger: number;
  revokedLedger: number | null;
  schemaVersion: number;
}

export interface ContributionRecord {
  creator: string;
  msmeId: string;
  circuitId: string;
  contributionType: ContributionType;
  contentCommitment: string;
  recordedLedger: number;
  schemaVersion: number;
}

export type VerificationState = 
  | 'IDLE'
  | 'LOADING'
  | 'VALID_VERIFIED'          // Exact match and commitment matches on-chain
  | 'COMMITMENT_MISMATCH'      // On-chain record exists, but computed hash doesn't match canonical record
  | 'UNKNOWN_CREDENTIAL'      // Read succeeded, but no record exists for this wallet/commitment
  | 'UNAVAILABLE_STATE'       // RPC error, simulation failure, or unreachable host
  | 'WRONG_NETWORK';          // Mismatched Stellar network passphrase

export interface VerificationResult {
  state: VerificationState;
  record?: MSMECredential | ContributionRecord;
  diagnostics?: string;
  calculatedCommitment?: string;
  onChainCommitment?: string;
  ledgerSequence?: number;
  txHash?: string;
  verifiedAt?: string;
}

export interface PilotMSME {
  id: string;
  name: string;
  category: string;
  location: string;
  psgcCode: string;
  circuitId: string;
  walletAddress: string;
  secretKey?: string;
  readiness: ReadinessStatus;
  txHash?: string;
  storyTitle?: string;
}

export interface PilotCreator {
  id: string;
  name: string;
  handle: string;
  platform: 'LIT Magazine' | 'Kom8ks' | 'Culinary Review';
  walletAddress: string;
  secretKey?: string;
  featuredMSME: string;
  circuitId: string;
  contributionType: ContributionType;
  publicationUrl: string;
  commitment?: string;
  txHash?: string;
}

export interface TxLogEntry {
  id: string;
  txHash: string;
  type: 'MSME_ISSUANCE' | 'CREATOR_CONTRIBUTION' | 'ISSUER_ALLOWLIST';
  signer: string;
  target: string;
  status: 'SUCCESS' | 'REJECTED_DUPLICATE' | 'FAILED';
  ledgerSequence: number;
  timestamp: string;
  details: string;
}
