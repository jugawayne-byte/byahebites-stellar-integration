import React, { useState } from 'react';
import { Users, Store, PenTool, ExternalLink, CheckCircle, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { PILOT_MSMES, PILOT_CREATORS } from '../lib/mockData';
import { getStellarExpertUrl } from '../lib/stellar';

interface ParticipantDirectoryProps {
  onSelectMSME: (wallet: string) => void;
  onSelectCreator: (creatorId: string) => void;
}

export const ParticipantDirectory: React.FC<ParticipantDirectoryProps> = ({
  onSelectMSME,
  onSelectCreator,
}) => {
  const [tab, setTab] = useState<'MSMES' | 'CREATORS'>('MSMES');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMSMEs = PILOT_MSMES.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.circuitId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCreators = PILOT_CREATORS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 font-heading font-semibold text-sm uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Deliverable 4: Testnet Pilot Cohort Directory</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
            Live On-Chain Participant Registry
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            10 Real Tourism MSMEs + 12 LIT/Kom8ks Creators (≥22 Unique Stellar Wallets).
          </p>
        </div>

        {/* Tab & Search */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setTab('MSMES')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                tab === 'MSMES' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>MSMEs (10)</span>
            </button>
            <button
              onClick={() => setTab('CREATORS')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center space-x-1.5 ${
                tab === 'CREATORS' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Creators (12)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${tab === 'MSMES' ? 'MSMEs by name, location, or circuit...' : 'Creators by name, handle, or format...'}`}
          className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* MSMEs Grid */}
      {tab === 'MSMES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMSMEs.map((msme) => (
            <div
              key={msme.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition group space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-100 group-hover:text-amber-400 transition text-sm">
                      {msme.name}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded border border-slate-700">
                      {msme.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{msme.location}</span>
                  </div>
                </div>

                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {msme.readiness}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic line-clamp-1">
                "{msme.storyTitle}"
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px]">
                  PSGC: <strong className="text-slate-300">{msme.psgcCode}</strong>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectMSME(msme.walletAddress)}
                    className="text-amber-400 hover:text-amber-300 font-sans text-xs underline"
                  >
                    Load in Verifier
                  </button>
                  {msme.txHash && (
                    <a
                      href={getStellarExpertUrl('tx', msme.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creators Grid */}
      {tab === 'CREATORS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreators.map((creator) => (
            <div
              key={creator.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition group space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-100 group-hover:text-blue-400 transition text-sm">
                      {creator.name}
                    </span>
                    <span className="text-xs text-blue-400 font-mono">
                      {creator.handle}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Tag className="w-3 h-3 text-slate-500" />
                    <span>{creator.platform} • {creator.contributionType}</span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30">
                  {creator.id}
                </span>
              </div>

              <div className="text-xs text-slate-300">
                Features: <span className="text-slate-100 font-medium">{creator.featuredMSME}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[11px] truncate max-w-[160px]">
                  {creator.circuitId}
                </span>
                <div className="flex items-center space-x-2 font-sans">
                  <button
                    onClick={() => onSelectCreator(creator.id)}
                    className="text-blue-400 hover:text-blue-300 text-xs underline"
                  >
                    Select Creator
                  </button>
                  {creator.txHash && (
                    <a
                      href={getStellarExpertUrl('tx', creator.txHash)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
