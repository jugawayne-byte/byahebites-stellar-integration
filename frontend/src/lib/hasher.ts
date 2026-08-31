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
 * Compute SHA-256 in browser using SubtleCrypto
 */
async function sha256Browser(str: string): Promise<string> {
  const utf8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compute the 32-byte domain-separated SHA-256 cryptographic commitment
 */
export async function computeCommitment(payload: any): Promise<{
  hex: string;
  canonicalString: string;
  preimage: string;
}> {
  const canonicalString = canonicalizeJson(payload);
  const preimage = `${DOMAIN_SEPARATION_PREFIX}:${canonicalString}`;
  const hex = await sha256Browser(preimage);

  return {
    hex,
    canonicalString,
    preimage,
  };
}

/**
 * Verify commitment against expected hash
 */
export async function verifyCommitment(payload: any, expectedHex: string): Promise<boolean> {
  const { hex } = await computeCommitment(payload);
  const normalizedExpected = expectedHex.toLowerCase().replace(/^0x/, '');
  return hex.toLowerCase() === normalizedExpected;
}
