/**
 * Canonical metadata payload for MSME Credentials
 */
export interface MSMECanonicalPayload {
  msmeWallet: string;
  businessName: string;
  psgcCode: string;
  circuitId: string;
  readinessLevel: string;
  registeredDate: string;
  verificationOfficer: string;
}

/**
 * Canonical metadata payload for Creator Contributions
 */
export interface CreatorCanonicalPayload {
  creatorWallet: string;
  msmeId: string;
  circuitId: string;
  publicationUrl: string;
  publicationDate: string;
  contributionType: 'Story' | 'PhotoSet' | 'Comic' | 'CulinaryReview';
  editorialSignoff: string;
}

export type CanonicalPayload = MSMECanonicalPayload | CreatorCanonicalPayload | Record<string, any>;
