import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalizeJson, computeCommitment, verifyCommitment } from '../src/hasher.js';

test('canonicalizeJson orders keys alphabetically regardless of insertion order', () => {
  const obj1 = { z: 1, a: 'hello', m: [3, 2, 1], b: { y: 20, x: 10 } };
  const obj2 = { a: 'hello', b: { x: 10, y: 20 }, m: [3, 2, 1], z: 1 };

  const canonical1 = canonicalizeJson(obj1);
  const canonical2 = canonicalizeJson(obj2);

  assert.equal(canonical1, canonical2);
  assert.equal(canonical1, '{"a":"hello","b":{"x":10,"y":20},"m":[3,2,1],"z":1}');
});

test('computeCommitment generates deterministic 32-byte hex hash with domain separation prefix', () => {
  const msmePayload = {
    businessName: 'Aling Nena Panciteria',
    circuitId: 'CIRCUIT-NCR-BINONDO-01',
    msmeWallet: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ',
    psgcCode: '133900000',
    readinessLevel: 'TourismCircuitReady',
    registeredDate: '2026-08-25',
    verificationOfficer: 'LGU-MANILA-042',
  };

  const { hex, bytes, preimage } = computeCommitment(msmePayload);

  assert.equal(bytes.length, 32);
  assert.equal(hex.length, 64);
  assert.ok(preimage.startsWith('byahebites-credential-v1:'));
  assert.ok(verifyCommitment(msmePayload, hex));

  // Modifying one field breaks verification
  const modifiedPayload = { ...msmePayload, readinessLevel: 'PendingVerification' };
  assert.equal(verifyCommitment(modifiedPayload, hex), false);
});

test('computeCommitment generates valid test vectors for Creator Contributions', () => {
  const creatorPayload = {
    circuitId: 'CIRCUIT-NCR-BINONDO-01',
    contributionType: 'Story',
    creatorWallet: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    editorialSignoff: 'LIT-ED-2026-08',
    msmeId: 'MSME-MNL-001',
    publicationDate: '2026-08-26',
    publicationUrl: 'https://LIT.komiksguild.com/stories/binondo-heritage-pancit',
  };

  const { hex } = computeCommitment(creatorPayload);
  assert.equal(typeof hex, 'string');
  assert.equal(hex.length, 64);
  assert.ok(verifyCommitment(creatorPayload, hex));
});
