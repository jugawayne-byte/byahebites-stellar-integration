import React, { useState } from 'react';
import { Shield, Sparkles, Wallet, ExternalLink, RefreshCw, CheckCircle2, ChevronDown } from 'lucide-react';
import { DEMO_ISSUER, PILOT_CREATORS, PILOT_MSMES } from '../lib/mockData';
import { requestFriendbotFunding, getStellarExpertUrl } from '../lib/stellar';

interface NavbarProps {
  activeRole: 'ISSUER' | 'CREATOR' | 'REVIEWER';
  setActiveRole: (role: 'ISSUER' | 'CREATOR' | 'REVIEWER') => void;
  activeWallet: string;
  setActiveWallet: (wallet: string) => void;
  currentLedger: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeRole,
  setActiveRole,
  activeWallet,
  setActiveWallet,
  currentLedger,
}) => {
  const [funding, setFunding] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);

  const handleFundFaucet = async () => {
    setFunding(true);
    await requestFriendbotFunding(activeWallet);
    setFunding(false);
    setFaucetSuccess(true);
    setTimeout(() => setFaucetSuccess(false), 3000);
  };

  const getRoleBadge = () => {
    if (activeRole === 'ISSUER') {
      return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs px-2.5 py-1 rounded-full font-medium">LGU / Demo Issuer</span>;
    }
    if (activeRole === 'CREATOR') {
      return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-1 rounded-full font-medium">Kom8ks / LIT Creator</span>;
    }
    return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-medium">Public Verifier</span>;
  };

  return (
    <header className="border-b border-slate-800 bg-[#070b14]/90 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                  ByahéBITES
                </span>
                <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono border border-slate-700">
                  Soroban
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Stellar Credential Layer for Culinary Tourism Circuits
              </p>
            </div>
          </div>

          {/* Network & Ledger Status */}
          <div className="hidden md:flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Stellar Testnet</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              Ledger: <span className="text-amber-400 font-semibold">#{currentLedger.toLocaleString()}</span>
            </div>
          </div>

          {/* Role & Wallet Controls */}
          <div className="flex items-center space-x-3">
            {/* Role Selector */}
            <div className="relative">
              <button
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl transition text-sm text-slate-200"
              >
                <Wallet className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs hidden sm:inline">
                  {activeWallet.slice(0, 4)}...{activeWallet.slice(-4)}
                </span>
                {getRoleBadge()}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Wallet / Persona Dropdown */}
              {isWalletMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50">
                  <div className="text-xs font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Switch Testnet Persona
                  </div>

                  {/* Issuer Switch */}
                  <button
                    onClick={() => {
                      setActiveRole('ISSUER');
                      setActiveWallet(DEMO_ISSUER.publicKey);
                      setIsWalletMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition mb-1 flex items-center justify-between ${
                      activeRole === 'ISSUER' ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">LGU Demo Issuer</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                        {DEMO_ISSUER.publicKey}
                      </div>
                    </div>
                    {activeRole === 'ISSUER' && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>

                  {/* Creator Switch */}
                  <button
                    onClick={() => {
                      setActiveRole('CREATOR');
                      setActiveWallet(PILOT_CREATORS[0].walletAddress);
                      setIsWalletMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition mb-1 flex items-center justify-between ${
                      activeRole === 'CREATOR' ? 'bg-blue-500/20 border border-blue-500/40 text-blue-300' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">Kom8ks / LIT Creator ({PILOT_CREATORS[0].name})</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                        {PILOT_CREATORS[0].walletAddress}
                      </div>
                    </div>
                    {activeRole === 'CREATOR' && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>

                  {/* MSME Switch */}
                  <button
                    onClick={() => {
                      setActiveRole('REVIEWER');
                      setActiveWallet(PILOT_MSMES[0].walletAddress);
                      setIsWalletMenuOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs transition mb-2 flex items-center justify-between ${
                      activeRole === 'REVIEWER' ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">MSME Wallet ({PILOT_MSMES[0].name})</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                        {PILOT_MSMES[0].walletAddress}
                      </div>
                    </div>
                    {activeRole === 'REVIEWER' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>

                  <div className="border-t border-slate-800 pt-2 flex items-center justify-between">
                    <button
                      onClick={handleFundFaucet}
                      disabled={funding}
                      className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 px-3 py-1.5 rounded-lg font-medium flex items-center space-x-1.5 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${funding ? 'animate-spin' : ''}`} />
                      <span>{faucetSuccess ? 'Funded +10k XLM' : 'Friendbot Faucet'}</span>
                    </button>
                    <a
                      href={getStellarExpertUrl('account', activeWallet)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
