import { computeCommitment } from '../packages/canonical-hasher/src/hasher.js';

interface SeedMSME {
  id: string;
  name: string;
  location: string;
  psgcCode: string;
  circuitId: string;
  wallet: string;
  readiness: string;
}

interface SeedCreator {
  id: string;
  name: string;
  platform: string;
  wallet: string;
  featuredMSME: string;
  circuitId: string;
  type: string;
  url: string;
}

const MSMES: SeedMSME[] = [
  { id: 'MSME-MNL-001', name: 'Quik Snack Binondo', location: 'Manila', psgcCode: '133900000', circuitId: 'CIRCUIT-NCR-BINONDO-01', wallet: 'GDQUJ3N4P5E6R7T8Y9U0I1O2P3A4S5D6F7G8H9J0K1L2M3N4O5P6Q7R8', readiness: 'TourismCircuitReady' },
  { id: 'MSME-MNL-002', name: 'Dong Bei Dumplings', location: 'Manila', psgcCode: '133900000', circuitId: 'CIRCUIT-NCR-BINONDO-01', wallet: 'GBDONGBEI778899AABBCCDDEEFF00112233445566778899AABBCCDDEE', readiness: 'TourismCircuitReady' },
  { id: 'MSME-PAM-003', name: 'Aling Lucing Sisig', location: 'Angeles, Pampanga', psgcCode: '035401000', circuitId: 'CIRCUIT-R03-CULINARY-CAPITAL-01', wallet: 'GCALUCONG99887766554433221100FFEEDDCCBBAA9988776655443322', readiness: 'TourismCircuitReady' },
  { id: 'MSME-PAM-004', name: 'Everybody\'s Cafe', location: 'San Fernando, Pampanga', psgcCode: '035416000', circuitId: 'CIRCUIT-R03-CULINARY-CAPITAL-01', wallet: 'GCEVERYBODY112233445566778899AABBCCDDEEFF0011223344556677', readiness: 'TourismCircuitReady' },
  { id: 'MSME-LAG-005', name: 'Patis Bistro & Kape', location: 'San Pablo, Laguna', psgcCode: '043424000', circuitId: 'CIRCUIT-R04A-7LAKES-TRAIL-02', wallet: 'GCPATISBISTRO554433221100FFEEDDCCBBAA99887766554433221100', readiness: 'VerifiedLevel2' },
  { id: 'MSME-LAG-006', name: 'Victoria Duck Station', location: 'Victoria, Laguna', psgcCode: '043429000', circuitId: 'CIRCUIT-R04A-7LAKES-TRAIL-02', wallet: 'GCVICTORIADUCK6677889900112233445566778899AABBCCDDEEFF001', readiness: 'VerifiedLevel2' },
  { id: 'MSME-CEB-007', name: 'House of Lechon Carcar', location: 'Carcar, Cebu', psgcCode: '072214000', circuitId: 'CIRCUIT-R07-CEBU-SOUTH-HERITAGE-01', wallet: 'GCCARCARLECHON778899AABBCCDDEEFF00112233445566778899AABBCC', readiness: 'TourismCircuitReady' },
  { id: 'MSME-CEB-008', name: 'Shamrock Otap & Delicacies', location: 'Cebu City', psgcCode: '072217000', circuitId: 'CIRCUIT-R07-CEBU-SOUTH-HERITAGE-01', wallet: 'GCSHAMROCKOTAP889900112233445566778899AABBCCDDEEFF0011223', readiness: 'TourismCircuitReady' },
  { id: 'MSME-ILO-009', name: 'Netong\'s Special Batchoy', location: 'La Paz, Iloilo', psgcCode: '063022000', circuitId: 'CIRCUIT-R06-PANAY-GASTRONOMY-01', wallet: 'GCNETONGSBATCHOY9900112233445566778899AABBCCDDEEFF001122', readiness: 'TourismCircuitReady' },
  { id: 'MSME-ILO-010', name: 'Kap Ising\'s Molo Balls', location: 'Villa Arevalo, Iloilo', psgcCode: '063022000', circuitId: 'CIRCUIT-R06-PANAY-GASTRONOMY-01', wallet: 'GCKAPISINGMOLO00112233445566778899AABBCCDDEEFF0011223344', readiness: 'VerifiedLevel1' },
];

const CREATORS: SeedCreator[] = [
  { id: 'CREATOR-001', name: 'Kiko Ilustre', platform: 'Kom8ks', wallet: 'GAKIKOCOMICS11223344556677889900AABBCCDDEEFF112233445566', featuredMSME: 'MSME-MNL-001', circuitId: 'CIRCUIT-NCR-BINONDO-01', type: 'Comic', url: 'https://kom8ks.com/strips/binondo-chiek-noodles-ep1' },
  { id: 'CREATOR-002', name: 'Marites Santos', platform: 'LIT Magazine', wallet: 'GAMARITESSLENS223344556677889900AABBCCDDEEFF11223344556', featuredMSME: 'MSME-MNL-002', circuitId: 'CIRCUIT-NCR-BINONDO-01', type: 'PhotoSet', url: 'https://LIT.komiksguild.com/photos/dong-bei-morning-prep' },
  { id: 'CREATOR-003', name: 'Ramon Bautista Jr.', platform: 'LIT Magazine', wallet: 'GARAMONLORE3344556677889900AABBCCDDEEFF1122334455667788', featuredMSME: 'MSME-PAM-003', circuitId: 'CIRCUIT-R03-CULINARY-CAPITAL-01', type: 'Story', url: 'https://LIT.komiksguild.com/stories/smoke-and-pork-in-angeles' },
  { id: 'CREATOR-004', name: 'Bea Cruz', platform: 'Kom8ks', wallet: 'GABEACRUZ44556677889900AABBCCDDEEFF11223344556677889900', featuredMSME: 'MSME-PAM-004', circuitId: 'CIRCUIT-R03-CULINARY-CAPITAL-01', type: 'Comic', url: 'https://kom8ks.com/strips/san-fernando-feast-ep4' },
  { id: 'CREATOR-005', name: 'Paolo Reyes', platform: 'LIT Magazine', wallet: 'GAPAOLOREYES556677889900AABBCCDDEEFF1122334455667788990', featuredMSME: 'MSME-LAG-005', circuitId: 'CIRCUIT-R04A-7LAKES-TRAIL-02', type: 'Story', url: 'https://LIT.komiksguild.com/stories/san-pablo-coconut-trails' },
  { id: 'CREATOR-006', name: 'Clara Del Rosario', platform: 'Culinary Review', wallet: 'GACLARASNAPS6677889900AABBCCDDEEFF112233445566778899001', featuredMSME: 'MSME-LAG-006', circuitId: 'CIRCUIT-R04A-7LAKES-TRAIL-02', type: 'CulinaryReview', url: 'https://LIT.komiksguild.com/reviews/victoria-claypot-duck' },
  { id: 'CREATOR-007', name: 'Junjun Alcantara', platform: 'Kom8ks', wallet: 'GAJUNJUNCEBU77889900AABBCCDDEEFF11223344556677889900112', featuredMSME: 'MSME-CEB-007', circuitId: 'CIRCUIT-R07-CEBU-SOUTH-HERITAGE-01', type: 'Comic', url: 'https://kom8ks.com/strips/lechon-chronicles-carcar' },
  { id: 'CREATOR-008', name: 'Leah Tan', platform: 'LIT Magazine', wallet: 'GALEAHTAN889900AABBCCDDEEFF1122334455667788990011223344', featuredMSME: 'MSME-CEB-008', circuitId: 'CIRCUIT-R07-CEBU-SOUTH-HERITAGE-01', type: 'PhotoSet', url: 'https://LIT.komiksguild.com/photos/cebu-otap-baking-gold' },
  { id: 'CREATOR-009', name: 'Angelo Gomez', platform: 'LIT Magazine', wallet: 'GAANGELOGOMEZ9900AABBCCDDEEFF11223344556677889900112233', featuredMSME: 'MSME-ILO-009', circuitId: 'CIRCUIT-R06-PANAY-GASTRONOMY-01', type: 'Story', url: 'https://LIT.komiksguild.com/stories/lapaz-morning-rush' },
  { id: 'CREATOR-010', name: 'Trina Villalobos', platform: 'Kom8ks', wallet: 'GATRINAPANAY0011223344556677889900AABBCCDDEEFF112233445', featuredMSME: 'MSME-ILO-010', circuitId: 'CIRCUIT-R06-PANAY-GASTRONOMY-01', type: 'Comic', url: 'https://kom8ks.com/strips/villa-arevalo-molo-magic' },
  { id: 'CREATOR-011', name: 'Donna Mercado', platform: 'Culinary Review', wallet: 'GADONNAMERCADO11223344556677889900AABBCCDDEEFF11223344', featuredMSME: 'MSME-MNL-001', circuitId: 'CIRCUIT-NCR-BINONDO-01', type: 'CulinaryReview', url: 'https://LIT.komiksguild.com/reviews/binondo-culinary-map-v2' },
  { id: 'CREATOR-012', name: 'Mark Santiago', platform: 'LIT Magazine', wallet: 'GAMARKSANTIAGO223344556677889900AABBCCDDEEFF1122334455', featuredMSME: 'MSME-PAM-003', circuitId: 'CIRCUIT-R03-CULINARY-CAPITAL-01', type: 'PhotoSet', url: 'https://LIT.komiksguild.com/photos/flames-of-angeles-sisig' },
];

async function runSeed() {
  console.log('===============================================================');
  console.log('ByahéBITES Soroban Credential Layer - Testnet Pilot Cohort Seed');
  console.log('===============================================================');
  console.log(`\nSeeding 10 Real MSMEs with Domain-Separated Commitments...\n`);

  for (const m of MSMES) {
    const payload = {
      businessName: m.name,
      circuitId: m.circuitId,
      msmeWallet: m.wallet,
      psgcCode: m.psgcCode,
      readinessLevel: m.readiness,
      registeredDate: '2026-08-25',
      verificationOfficer: 'LGU-DEMO-ISSUER-01',
    };
    const { hex } = computeCommitment(payload);
    console.log(`✓ [MSME] ${m.id} (${m.name}) -> PSGC: ${m.psgcCode} | Hash: 0x${hex.slice(0, 16)}...`);
  }

  console.log(`\nSeeding 12 Kom8ks & LIT Creators with Write-Once Commitments...\n`);

  for (const c of CREATORS) {
    const payload = {
      circuitId: c.circuitId,
      contributionType: c.type,
      creatorWallet: c.wallet,
      editorialSignoff: 'LIT-KOM8KS-SIGNOFF-v1',
      msmeId: c.featuredMSME,
      publicationDate: '2026-08-26',
      publicationUrl: c.url,
    };
    const { hex } = computeCommitment(payload);
    console.log(`✓ [CREATOR] ${c.id} (${c.name}) -> [${c.type}] for ${c.featuredMSME} | Hash: 0x${hex.slice(0, 16)}...`);
  }

  console.log('\n===============================================================');
  console.log('✓ Successfully generated deterministic commitments for all 22 entities!');
  console.log('===============================================================\n');
}

runSeed();
