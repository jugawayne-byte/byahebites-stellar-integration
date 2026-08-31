import React from 'react';
import { History, ExternalLink, CheckCircle2, AlertOctagon, ArrowUpRight } from 'lucide-react';
import { TxLogEntry } from '../types';
import { getStellarExpertUrl } from '../lib/stellar';

interface TransactionTimelineProps {
  logs: TxLogEntry[];
}

export const TransactionTimeline: React.FC<TransactionTimelineProps> = ({ logs }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-slate-400 font-heading font-semibold text-sm uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-amber-400" />
            <span>Public Ledger Activity</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-heading">
            Stellar Testnet Transaction History
          </h2>
        </div>

        <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
          {logs.length} Recorded Events
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        {logs.map((entry) => (
          <div
            key={entry.id}
            className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">
                {entry.status === 'SUCCESS' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-200">{entry.details}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    entry.status === 'SUCCESS' 
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' 
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}>
                    {entry.status}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono mt-1">
                  <span>Signer: {entry.signer.slice(0, 6)}...{entry.signer.slice(-4)}</span>
                  <span>Ledger: #{entry.ledgerSequence}</span>
                  <span className="hidden md:inline">{entry.timestamp}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center font-mono">
              <span className="text-[11px] text-slate-500 truncate max-w-[120px]">
                {entry.txHash.slice(0, 8)}...
              </span>
              <a
                href={getStellarExpertUrl('tx', entry.txHash)}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 flex items-center space-x-1 text-xs transition"
              >
                <span>Stellar Expert</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
