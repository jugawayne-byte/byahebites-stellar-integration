import { createHash } from 'crypto';
import { CanonicalPayload } from './types.js';

export const DOMAIN_SEPARATION_PREFIX = 'byahebites-credential-v1';

/**
 * Deterministically sort object keys recursively and serialize into canonical JSON
 */
export function canonicalizeJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return JSON.stringify(obj.normalize('NFC'));
    }
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    const serializedElements = obj.map((item) => canonicalizeJson(item));
    return `[${serializedElements.join(',')}]`;
  }

  const sortedKeys = Object.keys(obj).sort();
  const serializedPairs = sortedKeys.map((key) => {
    const normalizedKey = key.normalize('NFC');
    const val = obj[key];
    return `${JSON.stringify(normalizedKey)}:${canonicalizeJson(val)}`;
  });

  return `{${serializedPairs.join(',')}}`;
}

/**
 * Compute the 32-byte domain-separated SHA-256 cryptographic commitment
 *
 * Hash formula: SHA256( UTF8("byahebites-credential-v1:" + canonicalizeJson(payload)) )
 */
export function computeCommitment(payload: CanonicalPayload): {
  hex: string;
  bytes: Uint8Array;
  canonicalString: string;
  preimage: string;
} {
  const canonicalString = canonicalizeJson(payload);
  const preimage = `${DOMAIN_SEPARATION_PREFIX}:${canonicalString}`;

  const hash = createHash('sha256').update(preimage, 'utf8').digest();
  const hex = hash.toString('hex');
  const bytes = new Uint8Array(hash);

  return {
    hex,
    bytes,
    canonicalString,
    preimage,
  };
}

/**
 * Verify if a given preimage payload matches an on-chain 32-byte hex commitment
 */
export function verifyCommitment(payload: CanonicalPayload, expectedHex: string): boolean {
  const { hex } = computeCommitment(payload);
  const normalizedExpected = expectedHex.toLowerCase().replace(/^0x/, '');
  return hex.toLowerCase() === normalizedExpected;
}
