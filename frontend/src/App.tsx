import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { MSMEIssuanceCard } from './components/MSMEIssuanceCard';
import { CreatorContributionCard } from './components/CreatorContributionCard';
import { CredentialVerifier } from './components/CredentialVerifier';
import { ParticipantDirectory } from './components/ParticipantDirectory';
import { TransactionTimeline } from './components/TransactionTimeline';
import { DEMO_ISSUER, PILOT_CREATORS, PILOT_MSMES } from './lib/mockData';
import { onChainStore } from './lib/stellar';
import { 
  Award, 
  BookOpen, 
  ShieldCheck, 
  Users, 
  History, 
  Zap, 
  CheckCircle2, 
  FileCode2, 
  Globe, 
  Lock, 
  ArrowUpRight 
} from 'lucide-react';

export function App() {
  const [activeRole, setActiveRole] = useState<'ISSUER' | 'CREATOR' | 'REVIEWER'>('ISSUER');
  const [activeWallet, setActiveWallet] = useState<string>(DEMO_ISSUER.publicKey);
  const [activeTab, setActiveTab] = useState<'ISSUER' | 'CREATOR' | 'VERIFIER' | 'DIRECTORY' | 'TIMELINE'>('VERIFIER');
  const [txLogs, setTxLogs] = useState(onChainStore.getTxLogs());
  const [currentLedger, setCurrentLedger] = useState(onChainStore.getCurrentLedger());

  const handleTxSuccess = (txHash: string) => {
    setTxLogs(onChainStore.getTxLogs());
    setCurrentLedger(onChainStore.getCurrentLedger());
  };

  const handleSelectMSME = (wallet: string) => {
    setActiveTab('VERIFIER');
  };

  const handleSelectCreator = (creatorId: string) => {
    setActiveRole('CREATOR');
    const creator = PILOT_CREATORS.find((c) => c.id === creatorId);
    if (creator) {
      setActiveWallet(creator.walletAddress);
      setActiveTab('CREATOR');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        activeWallet={activeWallet}
        setActiveWallet={setActiveWallet}
        currentLedger={currentLedger}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner / Sprint Overview */}
        <section className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-transparent shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>Stellar Instawards Sprint • 30-Day Scoped Delivery</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ByahéBITES Soroban Credential Layer
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Anchoring LGU-issued MSME tourism readiness and write-once creator publication proofs on the Stellar Testnet. Real-time discovery meets cryptographic on-chain verifiability for Philippine gastronomy circuits.
            </p>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">MSMEs Seeded</span>
                <span className="text-xl font-bold font-heading text-amber-400">10 MSMEs</span>
                <span className="text-[10px] text-slate-500 block">PSGC Coded</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Creator Proofs</span>
                <span className="text-xl font-bold font-heading text-blue-400">12 Proofs</span>
                <span className="text-[10px] text-slate-500 block">Write-Once Verified</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Unique Wallets</span>
                <span className="text-xl font-bold font-heading text-emerald-400">≥ 22 Wallets</span>
                <span className="text-[10px] text-slate-500 block">Stellar Testnet</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Finality & Fees</span>
                <span className="text-xl font-bold font-heading text-purple-400">&lt; 5s / &lt; $0.01</span>
                <span className="text-[10px] text-slate-500 block">Soroban RPC</span>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('VERIFIER')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
              activeTab === 'VERIFIER'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>1. Soroban RPC Verifier (Fail-Closed)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ISSUER');
              setActiveRole('ISSUER');
              setActiveWallet(DEMO_ISSUER.publicKey);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
              activeTab === 'ISSUER'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>2. MSME Credential Issuance</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('CREATOR');
              setActiveRole('CREATOR');
              setActiveWallet(PILOT_CREATORS[0].walletAddress);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
              activeTab === 'CREATOR'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>3. Creator Contribution Proof</span>
          </button>

          <button
            onClick={() => setActiveTab('DIRECTORY')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
              activeTab === 'DIRECTORY'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Pilot Cohort Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center space-x-2 ${
              activeTab === 'TIMELINE'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>5. Ledger Audit Logs</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        <div className="space-y-8">
          {activeTab === 'VERIFIER' && <CredentialVerifier />}

          {activeTab === 'ISSUER' && (
            <MSMEIssuanceCard
              activeWallet={activeWallet}
              onIssuanceSuccess={handleTxSuccess}
            />
          )}

          {activeTab === 'CREATOR' && (
            <CreatorContributionCard
              activeWallet={activeWallet}
              onContributionSuccess={handleTxSuccess}
            />
          )}

          {activeTab === 'DIRECTORY' && (
            <ParticipantDirectory
              onSelectMSME={handleSelectMSME}
              onSelectCreator={handleSelectCreator}
            />
          )}

          {activeTab === 'TIMELINE' && <TransactionTimeline logs={txLogs} />}
        </div>

        {/* Instaward Verification Rubric Accordion */}
        <section className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-2 font-heading">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instaward 30-Day Acceptance Criteria Compliance Checklist</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Deliverable 1 (MSME Contract):</span> PSGC-coded readiness credentials issued behind issuer allowlist; queryable by MSME wallet via Soroban RPC.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Deliverable 2 (Creator Contract):</span> Write-once recording replay-guarded on <code>(creator, content_hash)</code>. Duplicate writes rejected on-chain.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Deliverable 3 (Fail-Closed Verifier):</span> 5 distinct non-misleading states (`VALID`, `MISMATCH`, `UNKNOWN`, `UNAVAILABLE`, `WRONG_NETWORK`).
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Deliverable 4 (Evidence Package):</span> ≥ 10 real MSMEs & ≥ 12 Kom8ks/LIT Creators (≥ 22 testnet wallets) with Stellar Expert resolvable hashes.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#05080f] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-semibold">ByahéBITES Soroban Credential Layer</span>
            <span>•</span>
            <span>Stellar Philippines Ambassador Chapter</span>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/jugawayne-byte/byahebites-stellar-integration"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="https://stellar.expert/explorer/testnet"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Stellar Expert (Testnet)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
