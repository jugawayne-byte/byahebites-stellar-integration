import React, { useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, AlertCircle, CheckCircle2, XCircle, ExternalLink, RefreshCw, Cpu, Layers } from 'lucide-react';
import { VerificationResult, VerificationState, MSMECredential, ContributionRecord } from '../types';
import { PILOT_MSMES, PILOT_CREATORS } from '../lib/mockData';
import { verifyMSMEOnChain, verifyCreatorOnChain, getStellarExpertUrl, DEFAULT_MSME_CONTRACT_ID, DEFAULT_CREATOR_CONTRACT_ID } from '../lib/stellar';

export const CredentialVerifier: React.FC = () => {
  const [lookupType, setLookupType] = useState<'MSME' | 'CREATOR'>('MSME');
  const [targetAddress, setTargetAddress] = useState(PILOT_MSMES[0].walletAddress);
  const [creatorCommitment, setCreatorCommitment] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('TESTNET');

  // Test vector tampering for verification checks
  const [simulateTamperedPayload, setSimulateTamperedPayload] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      if (lookupType === 'MSME') {
        const msme = PILOT_MSMES.find((m) => m.walletAddress === targetAddress);
        let payload: any = undefined;

        if (msme) {
          payload = {
            businessName: msme.name,
            circuitId: msme.circuitId,
            msmeWallet: msme.walletAddress,
            psgcCode: msme.psgcCode,
            readinessLevel: simulateTamperedPayload ? 'PendingVerification (TAMPERED)' : msme.readiness,
            registeredDate: '2026-08-25',
            verificationOfficer: 'LGU-DEMO-ISSUER-01',
          };
        }

        const res = await verifyMSMEOnChain(targetAddress, payload, selectedNetwork);
        setResult(res);
      } else {
        const res = await verifyCreatorOnChain(targetAddress, creatorCommitment, selectedNetwork);
        setResult(res);
      }
    } catch (err: any) {
      setResult({
        state: 'UNAVAILABLE_STATE',
        diagnostics: err.message || 'RPC Query failure',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (state: VerificationState) => {
    switch (state) {
      case 'VALID_VERIFIED':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>1. VALID_VERIFIED (On-Chain Match)</span>
          </div>
        );
      case 'COMMITMENT_MISMATCH':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>2. COMMITMENT_MISMATCH (Altered Data)</span>
          </div>
        );
      case 'UNKNOWN_CREDENTIAL':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>3. UNKNOWN_CREDENTIAL (Not Found)</span>
          </div>
        );
      case 'WRONG_NETWORK':
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>4. WRONG_NETWORK (Passphrase Mismatch)</span>
          </div>
        );
      case 'UNAVAILABLE_STATE':
      default:
        return (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 text-xs font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-slate-400" />
            <span>5. UNAVAILABLE_STATE (Simulation/RPC Error)</span>
          </div>
        );
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-heading font-semibold text-sm uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Deliverable 3: Fail-Closed Soroban RPC Verifier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
            On-Chain Trust Signal & Commitment Verifier
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Independently audit MSME credentials and creator proofs directly against Soroban RPC state with fail-closed cryptographic guarantees.
          </p>
        </div>
      </div>

      {/* Mode Selector */}
      <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-6">
        <button
          type="button"
          onClick={() => {
            setLookupType('MSME');
            setTargetAddress(PILOT_MSMES[0].walletAddress);
            setResult(null);
          }}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
            lookupType === 'MSME'
              ? 'bg-amber-500 text-black font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Verify MSME Credential (by Wallet)
        </button>
        <button
          type="button"
          onClick={() => {
            setLookupType('CREATOR');
            setTargetAddress(PILOT_CREATORS[0].walletAddress);
            setCreatorCommitment(PILOT_CREATORS[0].commitment || '');
            setResult(null);
          }}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition ${
            lookupType === 'CREATOR'
              ? 'bg-blue-600 text-white font-semibold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Verify Creator Contribution (Composite Key)
        </button>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {/* Quick presets */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Select Testnet Pilot Target or Input Address
          </label>
          <div className="flex space-x-2">
            <select
              value={targetAddress}
              onChange={(e) => {
                const val = e.target.value;
                setTargetAddress(val);
                if (lookupType === 'CREATOR') {
                  const creator = PILOT_CREATORS.find((c) => c.walletAddress === val);
                  if (creator && creator.commitment) {
                    setCreatorCommitment(creator.commitment);
                  }
                }
              }}
              className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {lookupType === 'MSME' ? (
                <>
                  {PILOT_MSMES.map((m) => (
                    <option key={m.id} value={m.walletAddress}>
                      {m.name} ({m.location})
                    </option>
                  ))}
                  <option value="GUNREGISTERED999999999999999999999999999999999999999999999">
                    [Simulate Unknown MSME] G-UNREGISTERED...
                  </option>
                </>
              ) : (
                <>
                  {PILOT_CREATORS.map((c) => (
                    <option key={c.id} value={c.walletAddress}>
                      {c.name} ({c.handle}) — {c.contributionType}
                    </option>
                  ))}
                  <option value="GUNREGISTEREDCREATOR999999999999999999999999999999999999">
                    [Simulate Unknown Creator] G-UNREGISTERED...
                  </option>
                </>
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Stellar Wallet Address
          </label>
          <input
            type="text"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
            className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {lookupType === 'CREATOR' && (
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Content Commitment SHA-256 (32 Bytes Hex)
            </label>
            <input
              type="text"
              value={creatorCommitment}
              onChange={(e) => setCreatorCommitment(e.target.value)}
              placeholder="e.g. 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>
        )}

        {/* Fail-closed testing options */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium">Network:</span>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="bg-black/50 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs"
            >
              <option value="TESTNET">Test SDF Network (Testnet)</option>
              <option value="MAINNET">Public Global Stellar (Simulate Network Mismatch)</option>
            </select>
          </div>

          {lookupType === 'MSME' && (
            <label className="flex items-center space-x-2 cursor-pointer text-slate-400 hover:text-slate-300">
              <input
                type="checkbox"
                checked={simulateTamperedPayload}
                onChange={(e) => setSimulateTamperedPayload(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-0"
              />
              <span>Simulate Off-Chain Data Tampering</span>
            </label>
          )}
        </div>

        {/* Query button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
              <span>Simulating & Reading Soroban RPC State...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Query Soroban RPC Contract State</span>
            </>
          )}
        </button>
      </form>

      {/* Result Display Box */}
      {result && (
        <div className="mt-6 rounded-2xl bg-slate-900 border border-slate-700 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Verification State
            </span>
            {getStatusBadge(result.state)}
          </div>

          {/* Diagnostic Details */}
          <div className="text-xs text-slate-300 leading-relaxed font-mono bg-black/40 p-3 rounded-xl border border-slate-800">
            {result.diagnostics}
          </div>

          {/* If valid MSME record */}
          {result.record && 'psgcCode' in result.record && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">PSGC Jurisdiction</span>
                <span className="font-mono text-amber-400 font-semibold">{result.record.psgcCode}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Readiness Level</span>
                <span className="font-semibold text-emerald-400">{result.record.readinessStatus}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Circuit ID</span>
                <span className="font-mono text-slate-200">{result.record.circuitId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Issued Ledger</span>
                <span className="font-mono text-slate-200">#{result.record.issuedLedger}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Revoked Ledger</span>
                <span className="font-mono text-slate-400">{result.record.revokedLedger ? `#${result.record.revokedLedger}` : 'None (Active)'}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Schema Version</span>
                <span className="font-mono text-slate-200">v{result.record.schemaVersion}</span>
              </div>
            </div>
          )}

          {/* If valid Creator record */}
          {result.record && 'contributionType' in result.record && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Featured MSME</span>
                <span className="font-mono text-blue-400 font-semibold">{result.record.msmeId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Format</span>
                <span className="font-semibold text-blue-400">{result.record.contributionType}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Circuit ID</span>
                <span className="font-mono text-slate-200">{result.record.circuitId}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
                <span className="text-slate-400 block text-[10px] uppercase">Recorded Ledger</span>
                <span className="font-mono text-slate-200">#{result.record.recordedLedger}</span>
              </div>
            </div>
          )}

          {/* On-Chain Commitment Comparison */}
          {result.onChainCommitment && (
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-400 block text-[11px]">On-Chain Content Commitment (SHA-256):</span>
              <div className="font-mono p-2 rounded bg-black/50 text-slate-200 break-all select-all text-[11px] border border-slate-800">
                0x{result.onChainCommitment}
              </div>
            </div>
          )}

          {/* Explorer Link */}
          {result.state === 'VALID_VERIFIED' && (
            <div className="pt-2 flex justify-end">
              <a
                href={getStellarExpertUrl('account', targetAddress)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1.5 underline"
              >
                <span>Inspect Account & Ledger State on Stellar Expert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
