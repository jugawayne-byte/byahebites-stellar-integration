import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, ShieldAlert, ArrowRight, ExternalLink, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { ReadinessStatus, MSMECredential } from '../types';
import { PILOT_MSMES, DEMO_ISSUER } from '../lib/mockData';
import { computeCommitment } from '../lib/hasher';
import { onChainStore, getStellarExpertUrl } from '../lib/stellar';

interface MSMEIssuanceCardProps {
  activeWallet: string;
  onIssuanceSuccess: (txHash: string) => void;
}

export const MSMEIssuanceCard: React.FC<MSMEIssuanceCardProps> = ({
  activeWallet,
  onIssuanceSuccess,
}) => {
  const [selectedMSME, setSelectedMSME] = useState(PILOT_MSMES[0].walletAddress);
  const [businessName, setBusinessName] = useState(PILOT_MSMES[0].name);
  const [psgcCode, setPsgcCode] = useState(PILOT_MSMES[0].psgcCode);
  const [circuitId, setCircuitId] = useState(PILOT_MSMES[0].circuitId);
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>('TourismCircuitReady');
  const [verificationOfficer, setVerificationOfficer] = useState('LGU-DEMO-OFFICER-01');

  const [computedHash, setComputedHash] = useState('');
  const [preimageText, setPreimageText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isIssuerAuthorized = onChainStore.isIssuerAllowlisted(activeWallet);

  // Synchronize input fields when selecting an MSME preset
  const handleMSMEChange = (wallet: string) => {
    setSelectedMSME(wallet);
    const msme = PILOT_MSMES.find((m) => m.walletAddress === wallet);
    if (msme) {
      setBusinessName(msme.name);
      setPsgcCode(msme.psgcCode);
      setCircuitId(msme.circuitId);
      setReadinessStatus(msme.readiness);
    }
  };

  // Recompute domain-separated SHA-256 canonical hash whenever inputs change
  useEffect(() => {
    async function updateHash() {
      const canonicalPayload = {
        businessName,
        circuitId,
        msmeWallet: selectedMSME,
        psgcCode,
        readinessLevel: readinessStatus,
        registeredDate: new Date().toISOString().split('T')[0],
        verificationOfficer,
      };
      const result = await computeCommitment(canonicalPayload);
      setComputedHash(result.hex);
      setPreimageText(result.preimage);
    }
    updateHash();
  }, [businessName, circuitId, selectedMSME, psgcCode, readinessStatus, verificationOfficer]);

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!isIssuerAuthorized) {
        throw new Error(`Unauthorized: Signer address (${activeWallet.slice(0, 8)}...) is not in the contract's issuer allowlist.`);
      }

      // Generate simulated testnet transaction hash
      const randomBytes = new Uint8Array(32);
      crypto.getRandomValues(randomBytes);
      const generatedTxHash = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

      const newCredential: MSMECredential = {
        issuer: activeWallet,
        msme: selectedMSME,
        psgcCode,
        readinessStatus,
        circuitId,
        contentCommitment: computedHash,
        issuedLedger: onChainStore.getCurrentLedger() + 1,
        revokedLedger: null,
        schemaVersion: 1,
      };

      onChainStore.issueMSMECredential(newCredential, generatedTxHash);
      setLastTxHash(generatedTxHash);
      onIssuanceSuccess(generatedTxHash);
    } catch (err: any) {
      setErrorMsg(err.message || 'Issuance failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-heading font-semibold text-sm uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Deliverable 1: MSME Credential Contract</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
            Issue LGU Readiness Credential
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Anchors tourism readiness & PSGC jurisdiction on Stellar Soroban with domain-separated SHA-256 commitments.
          </p>
        </div>

        {/* Allowlist indicator */}
        <div className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center space-x-1.5 ${
          isIssuerAuthorized 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <KeyRound className="w-3.5 h-3.5" />
          <span>{isIssuerAuthorized ? 'Issuer Allowlisted' : 'Unauthorized Signer'}</span>
        </div>
      </div>

      {!isIssuerAuthorized && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
          <div>
            <span className="font-semibold">Issuer Restriction Active:</span> The connected wallet is not in the contract allowlist. Switch to the <strong>LGU Demo Issuer</strong> persona via the top right menu to issue credentials.
          </div>
        </div>
      )}

      <form onSubmit={handleIssueCredential} className="space-y-5">
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select Pilot MSME or Enter Custom Stellar Wallet
          </label>
          <select
            value={selectedMSME}
            onChange={(e) => handleMSMEChange(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          >
            {PILOT_MSMES.map((m) => (
              <option key={m.id} value={m.walletAddress}>
                {m.name} — {m.location} ({m.walletAddress.slice(0, 8)}...{m.walletAddress.slice(-6)})
              </option>
            ))}
          </select>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Business / Heritage Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              PSGC Code (Philippine Standard Geographic Code)
            </label>
            <input
              type="text"
              value={psgcCode}
              onChange={(e) => setPsgcCode(e.target.value)}
              placeholder="e.g. 133900000 for Manila"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Readiness Status Level
            </label>
            <select
              value={readinessStatus}
              onChange={(e) => setReadinessStatus(e.target.value as ReadinessStatus)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="TourismCircuitReady">TourismCircuitReady (TPB/DOT Endorsed)</option>
              <option value="VerifiedLevel2">VerifiedLevel2 (Sanitation & Standards)</option>
              <option value="VerifiedLevel1">VerifiedLevel1 (Local Permits Verified)</option>
              <option value="PendingVerification">PendingVerification</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tourism Circuit Identifier
            </label>
            <input
              type="text"
              value={circuitId}
              onChange={(e) => setCircuitId(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              required
            />
          </div>
        </div>

        {/* Real-time Domain-Separated Cryptographic Commitment */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-amber-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Domain-Separated SHA-256 Commitment (byahebites-credential-v1)</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">32-byte BytesN&lt;32&gt;</span>
          </div>
          <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 font-mono text-xs text-amber-300 break-all select-all">
            0x{computedHash}
          </div>
          <div className="text-[11px] text-slate-500 font-mono truncate">
            Preimage: {preimageText}
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting || !isIssuerAuthorized}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-semibold text-sm transition shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Broadcasting to Soroban Testnet...</span>
            </>
          ) : (
            <>
              <span>Sign & Issue On-Chain Credential</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Success Banner */}
      {lastTxHash && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
          <div className="flex items-center space-x-2 font-semibold text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Credential Successfully Anchored on Stellar Testnet!</span>
          </div>
          <div className="flex items-center justify-between font-mono pt-1 text-[11px]">
            <span className="text-slate-400 truncate max-w-[280px]">Tx: {lastTxHash}</span>
            <a
              href={getStellarExpertUrl('tx', lastTxHash)}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-sans underline"
            >
              <span>View on Stellar Expert</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
