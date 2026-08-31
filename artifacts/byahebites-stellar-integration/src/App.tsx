import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ClipboardCheck,
  Clock3,
  Copy,
  ExternalLink,
  FileCheck2,
  Fingerprint,
  Globe2,
  KeyRound,
  Landmark,
  Link2,
  Loader2,
  Menu,
  Network,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UserRound,
  UsersRound,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import {
  connectWallet,
  disconnectWallet,
  issueCredential,
  loadPublicConfig,
  readContribution,
  readCredential,
  readinessLabel,
  recordContribution,
  shorten,
  type ContributionRecord,
  type CredentialRecord,
  type PublicConfig,
  type TransactionResult,
  type WalletState,
} from "@/lib/stellar";

const queryClient = new QueryClient();

type ChainRecord =
  | { kind: "Business"; value: CredentialRecord }
  | { kind: "Creator"; value: ContributionRecord };

function AppButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  testId,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "quiet" | "yellow";
  className?: string;
  type?: "button" | "submit";
  testId: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-110",
    outline:
      "border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted))]",
    quiet:
      "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
    yellow:
      "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:brightness-105",
  };
  return (
    <button
      data-testid={testId}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-55 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3" data-testid="brand-mark">
      <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white shadow-[0_6px_0_hsl(193_44%_16%)]">
        <img src="/byahebites-logo.png" alt="Byahe Bites" className="h-full w-full object-contain" />
      </div>
      <div>
        <div className="font-serif text-[17px] font-bold tracking-[-.04em]">
          Byahé<span className="text-[hsl(var(--secondary))]">BITES</span>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">
          credential layer
        </div>
      </div>
    </div>
  );
}

function TopBar({
  wallet,
  onConnect,
  onDisconnect,
  onMenu,
}: {
  wallet: WalletState | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onMenu: () => void;
}) {
  const [, setLocation] = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 lg:px-10">
        <button className="lg:hidden" onClick={onMenu} data-testid="button-open-menu">
          <Menu size={22} />
        </button>
        <button onClick={() => setLocation("/")} data-testid="button-home-brand">
          <BrandMark />
        </button>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          <a href="#registry" data-testid="link-registry" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[hsl(var(--muted))]">
            Registry
          </a>
          <a href="#how-it-works" data-testid="link-how-it-works" className="rounded-lg px-4 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
            How it works
          </a>
          <a href="#network" data-testid="link-network" className="rounded-lg px-4 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
            Network
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-[hsl(var(--secondary)/.45)] bg-[hsl(var(--secondary)/.12)] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[.12em] text-[hsl(var(--primary))] sm:inline-flex">
            <span className="mr-2 mt-0.5 h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))]" />
            Stellar Testnet
          </span>
          {wallet ? (
            <AppButton onClick={onDisconnect} variant="outline" className="px-3 sm:px-4" testId="button-disconnect-wallet">
              <Check size={15} /> <span className="hidden sm:inline">{shorten(wallet.address)} · {wallet.network}</span>
              <span className="sm:hidden">Connected</span>
            </AppButton>
          ) : (
            <AppButton onClick={onConnect} className="px-3 sm:px-4" testId="button-connect-wallet">
              <WalletCards size={15} /> Connect wallet
            </AppButton>
          )}
        </div>
      </div>
    </header>
  );
}

function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--primary)/.45)] lg:hidden" onClick={onClose}>
      <aside className="h-full w-[290px] bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-12 flex items-center justify-between">
          <BrandMark />
          <button onClick={onClose} data-testid="button-close-menu"><X size={22} /></button>
        </div>
        <div className="space-y-2">
          {["registry", "how-it-works", "network"].map((item) => (
            <a key={item} href={`#${item}`} onClick={onClose} className="block rounded-xl px-4 py-3 text-sm font-semibold capitalize hover:bg-[hsl(var(--sidebar-accent))]" data-testid={`mobile-link-${item}`}>
              {item.replaceAll("-", " ")}
            </a>
          ))}
        </div>
        <div className="mt-auto pt-24 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
          A civic layer for local tourism work, verified on Stellar Testnet.
        </div>
      </aside>
    </div>
  );
}

function Hero({ onStart, onLookup }: { onStart: () => void; onLookup: () => void }) {
  return (
    <section className="relative overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
      <div className="network-dots absolute inset-0 opacity-30" />
      <div className="absolute -right-20 top-16 h-72 w-72 rounded-full border border-[hsl(var(--secondary)/.25)] lg:h-[460px] lg:w-[460px]" />
      <div className="absolute -right-10 top-28 h-52 w-52 rounded-full border border-[hsl(var(--accent)/.2)] lg:right-20 lg:top-36 lg:h-80 lg:w-80" />
      <div className="relative mx-auto grid max-w-[1440px] gap-12 px-5 pb-20 pt-20 md:pb-28 md:pt-28 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-10 lg:pt-32">
        <div className="animate-rise max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--secondary)/.35)] bg-[hsl(var(--secondary)/.1)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-[hsl(var(--secondary))]">
            <Sparkles size={13} /> Stellar Testnet / live verification
          </div>
          <h1 className="font-serif text-[clamp(3.2rem,7.3vw,7.8rem)] font-bold leading-[.92] tracking-[-.07em]">
            Proof for the<br /><span className="text-[hsl(var(--secondary))]">places that matter.</span>
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[hsl(var(--primary-foreground)/.68)] md:text-lg">
            A trusted civic layer for local tourism readiness and creator work. Issue a credential once, then let anyone verify what happened directly on the public Stellar ledger.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <AppButton onClick={onStart} variant="yellow" testId="button-start-issuing">Start issuing <ArrowRight size={16} /></AppButton>
            <AppButton onClick={onLookup} variant="outline" className="border-[hsl(var(--primary-foreground)/.22)] bg-transparent text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground)/.1)]" testId="button-hero-lookup">
              <Search size={16} /> Look up a record
            </AppButton>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 border-t border-[hsl(var(--primary-foreground)/.14)] pt-5 text-xs text-[hsl(var(--primary-foreground)/.56)]">
            <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-[hsl(var(--secondary))]" /> Independently verifiable</span>
            <span className="inline-flex items-center gap-2"><Globe2 size={14} className="text-[hsl(var(--secondary))]" /> Public by design</span>
            <span className="inline-flex items-center gap-2"><KeyRound size={14} className="text-[hsl(var(--secondary))]" /> Wallet-signed</span>
          </div>
        </div>
        <NetworkDiagram />
      </div>
    </section>
  );
}

function NetworkDiagram() {
  return (
    <div className="relative mx-auto hidden h-[390px] w-full max-w-[500px] lg:block" aria-label="Credential network diagram">
      <div className="absolute left-1/2 top-1/2 z-10 grid h-32 w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[hsl(var(--secondary)/.7)] bg-[hsl(var(--primary))] shadow-[0_0_0_14px_hsl(var(--secondary)/.08)] animate-drift">
        <div className="text-center"><Fingerprint className="mx-auto mb-2 text-[hsl(var(--secondary))]" size={30} /><div className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--primary-foreground)/.7)]">Proof layer</div></div>
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 500 390" fill="none"><path d="M250 195L87 82M250 195L414 82M250 195L88 307M250 195L414 307" stroke="hsl(164 49% 59% / .3)" strokeDasharray="4 8" /><circle cx="250" cy="195" r="150" stroke="hsl(164 49% 59% / .16)" /><circle cx="250" cy="195" r="92" stroke="hsl(37 87% 67% / .14)" /></svg>
      {[["18", "21", "MSME", Store], ["82", "21", "LGU issuer", Landmark], ["18", "79", "Creator", UserRound], ["82", "79", "Public lookup", Search]].map(([x, y, label, Icon]) => (
        <div key={label as string} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${x}%`, top: `${y}%` }}>
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl border border-[hsl(var(--secondary)/.35)] bg-[hsl(var(--primary))] text-[hsl(var(--secondary))] shadow-lg"><Icon size={20} /></div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--primary-foreground)/.58)]">{label as string}</div>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ number, children, light = false }: { number: string; children: ReactNode; light?: boolean }) {
  return <div className={`mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] ${light ? "text-[hsl(var(--secondary))]" : "text-[hsl(var(--muted-foreground))]"}`}><span className="grid h-6 w-6 place-items-center rounded-full border border-current text-[9px]">{number}</span>{children}</div>;
}

function FlowSection({ onStart }: { onStart: () => void }) {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1440px] px-5 py-20 md:py-28 lg:px-10">
      <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
        <div><SectionLabel number="01">The civic flow</SectionLabel><h2 className="max-w-md font-serif text-4xl font-bold leading-[1.03] tracking-[-.05em] md:text-5xl">From local work to a shared source of truth.</h2><p className="mt-5 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">Every write is signed by a Stellar wallet, simulated before submission, and readable again from Soroban RPC.</p><AppButton onClick={onStart} className="mt-8" testId="button-flow-start">Try the live flow <ArrowRight size={16} /></AppButton></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FlowCard n="01" icon={WalletCards} title="Connect a wallet" text="Connect Freighter, xBull, Albedo, LOBSTR, or another supported Stellar wallet on Testnet." accent="mint" />
          <FlowCard n="02" icon={ClipboardCheck} title="Issue readiness" text="An allowlisted issuer records a practical MSME readiness proof on Soroban." accent="gold" />
          <FlowCard n="03" icon={FileCheck2} title="Prove contribution" text="Creators attach a 32-byte commitment to work made for a local destination." accent="coral" />
          <FlowCard n="04" icon={Search} title="Verify publicly" text="Anyone can read the exact contract state by wallet and commitment, without an account." accent="ink" />
        </div>
      </div>
    </section>
  );
}

function FlowCard({ n, icon: Icon, title, text, accent }: { n: string; icon: typeof WalletCards; title: string; text: string; accent: string }) {
  const colors: Record<string, string> = { mint: "bg-[hsl(var(--secondary)/.16)] text-[hsl(var(--primary))]", gold: "bg-[hsl(var(--accent)/.22)] text-[hsl(var(--primary))]", coral: "bg-[hsl(var(--destructive)/.12)] text-[hsl(var(--destructive))]", ink: "bg-[hsl(var(--primary))] text-[hsl(var(--secondary))]" };
  return <article className="group rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_hsl(193_44%_22%/.08)]"><div className="flex items-start justify-between"><div className={`grid h-11 w-11 place-items-center rounded-xl ${colors[accent]}`}><Icon size={20} /></div><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{n}</span></div><h3 className="mt-7 font-serif text-xl font-bold tracking-[-.03em]">{title}</h3><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{text}</p></article>;
}

function Registry({ records, config, onIssue, onLookup }: { records: ChainRecord[]; config: PublicConfig; onIssue: () => void; onLookup: (record: ChainRecord) => void }) {
  const [filter, setFilter] = useState("All records");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => records.filter((item) => (filter === "All records" || item.kind === filter) && JSON.stringify(item).toLowerCase().includes(query.toLowerCase())), [records, filter, query]);
  return (
    <section id="registry" className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card)/.5)]">
      <div className="mx-auto max-w-[1440px] px-5 py-20 md:py-28 lg:px-10">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><SectionLabel number="02">Public registry</SectionLabel><h2 className="font-serif text-4xl font-bold tracking-[-.05em] md:text-5xl">Proofs from the ledger.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">This view never invents records. A proof appears here only after a successful Testnet transaction is read back from Soroban RPC.</p></div><AppButton onClick={onIssue} testId="button-registry-issue"><Plus size={17} /> Issue a credential</AppButton></div>
        <div className="mt-10 flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-1 overflow-x-auto">{["All records", "Business", "Creator"].map((item) => <button key={item} onClick={() => setFilter(item)} data-testid={`button-filter-${item.toLowerCase().replace(" ", "-")}`} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${filter === item ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}>{item}</button>)}</div><div className="relative w-full md:w-64"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search session reads" data-testid="input-search-registry" className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] focus:border-[hsl(var(--secondary))]" /></div></div>
        <div className="mt-5 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]">{visible.length > 0 ? <div className="divide-y divide-[hsl(var(--border))]">{visible.map((item, index) => <RegistryRow key={`${item.kind}-${index}`} item={item} onLookup={onLookup} />)}</div> : <div className="px-6 py-16 text-center"><Network className="mx-auto text-[hsl(var(--muted-foreground))]" /><h3 className="mt-4 font-serif text-lg font-bold">No records loaded</h3><p className="mx-auto mt-1 max-w-md text-sm text-[hsl(var(--muted-foreground))]">The contracts do not expose a list operation. Use the public lookup below with a wallet and commitment to read a record directly from Testnet.</p><AppButton onClick={() => { setQuery(""); setFilter("All records"); document.getElementById("lookup")?.scrollIntoView({ behavior: "smooth" }); }} variant="outline" className="mt-5" testId="button-clear-registry">Open public lookup</AppButton></div>}</div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]"><span>{visible.length} session read{visible.length === 1 ? "" : "s"}</span><a href={`${config.explorerUrl}/contract/${config.msmeContractId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-[hsl(var(--foreground))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--secondary))]" /> View contracts on Stellar Expert <ExternalLink size={12} /></a></div>
      </div>
    </section>
  );
}

function RegistryRow({ item, onLookup }: { item: ChainRecord; onLookup: (record: ChainRecord) => void }) {
  const isBusiness = item.kind === "Business";
  const value = item.value;
  const wallet = isBusiness ? (value as CredentialRecord).msmeWallet : (value as ContributionRecord).creatorWallet;
  const ledger = isBusiness ? (value as CredentialRecord).issuedLedger : (value as ContributionRecord).recordedLedger;
  return <div className="grid gap-4 px-5 py-5 transition-colors hover:bg-[hsl(var(--muted)/.5)] md:grid-cols-[1.5fr_1.2fr_1.1fr_auto] md:items-center md:px-6"><div><div className="flex items-center gap-2 font-bold">{isBusiness ? "MSME readiness" : "Creator contribution"}<BadgeCheck size={16} className="text-[hsl(var(--secondary-foreground))] fill-[hsl(var(--secondary))]" /></div><div className="mt-1 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{shorten(wallet)}</div></div><div><div className="text-sm">{value.msmeId}</div><div className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{isBusiness ? readinessLabel((value as CredentialRecord).readinessStatus) : value.circuitId}</div></div><div className="text-sm text-[hsl(var(--muted-foreground))]">Ledger {ledger}</div><AppButton onClick={() => onLookup(item)} variant="quiet" className="justify-self-start px-2.5 py-2 text-xs" testId={`button-view-record-${wallet}`}><ExternalLink size={14} /> View</AppButton></div>;
}

function IssuePanel({ config, wallet, onClose, onCreated, onError }: { config: PublicConfig; wallet: WalletState | null; onClose: () => void; onCreated: (record: ChainRecord) => void; onError: (message: string) => void }) {
  const [kind, setKind] = useState<"Business" | "Creator">("Business");
  const [msmeWallet, setMsmeWallet] = useState("");
  const [msmeId, setMsmeId] = useState("");
  const [psgcCode, setPsgcCode] = useState("");
  const [readinessStatus, setReadinessStatus] = useState("2");
  const [circuitId, setCircuitId] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<TransactionResult | null>(null);
  const canSubmit = Boolean(wallet && msmeWallet.trim() && msmeId.trim() && circuitId.trim() && contentHash.trim() && (kind === "Creator" || psgcCode.trim()));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!wallet || !canSubmit) return;
    setState("loading");
    setError("");
    try {
      const transaction = kind === "Business"
        ? await issueCredential(config, wallet.address, { msmeWallet, msmeId, psgcCode, readinessStatus: Number(readinessStatus), circuitId, contentHash })
        : await recordContribution(config, wallet.address, { creatorWallet: wallet.address, msmeWallet, msmeId, circuitId, contentHash });
      const chainRecord = kind === "Business" ? await readCredential(config, msmeWallet) : await readContribution(config, wallet.address, contentHash);
      if (!chainRecord) throw new Error("The transaction succeeded but the record could not be read back from Testnet.");
      setResult(transaction);
      if (kind === "Business") {
        onCreated({ kind: "Business", value: chainRecord as CredentialRecord });
      } else {
        onCreated({ kind: "Creator", value: chainRecord as ContributionRecord });
      }
      setState("success");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The Testnet transaction failed.";
      setError(message);
      onError(message);
      setState("error");
    }
  };
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(var(--primary)/.55)] p-0 backdrop-blur-sm sm:items-center sm:p-5"><div className="max-h-[94dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl sm:rounded-3xl">
    <div className="flex items-start justify-between border-b border-[hsl(var(--border))] px-6 py-5"><div><div className="font-mono text-[10px] uppercase tracking-[.17em] text-[hsl(var(--secondary-foreground))]">Stellar Testnet issuer console</div><h2 className="mt-1 font-serif text-2xl font-bold tracking-[-.04em]">Write a proof on-chain</h2></div><button onClick={onClose} data-testid="button-close-issue-panel" className="rounded-lg p-2 hover:bg-[hsl(var(--muted))]"><X size={19} /></button></div>
    {!wallet ? <div className="px-6 py-12 text-center"><WalletCards className="mx-auto text-[hsl(var(--secondary-foreground))]" size={32} /><h3 className="mt-5 font-serif text-2xl font-bold">Connect a Testnet wallet first</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">No signing identity is generated in the browser. Close this panel, connect a Stellar wallet, then start again.</p><AppButton onClick={onClose} className="mt-7 w-full" testId="button-close-wallet-required">Return to demo</AppButton></div>
      : state === "success" && result ? <div className="px-6 py-12 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[hsl(var(--secondary)/.2)] text-[hsl(var(--primary))]"><Check size={30} /></div><h3 className="mt-5 font-serif text-2xl font-bold">Proof written to Testnet</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">The record was submitted, finalized, and read back from the deployed Soroban contract.</p><div className="mt-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-left"><div className="font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Transaction hash</div><div className="mt-1 flex items-center justify-between gap-3 font-mono text-xs font-medium"><span className="break-all">{result.hash}</span><Copy size={15} className="shrink-0 text-[hsl(var(--muted-foreground))]" /></div><div className="mt-3 font-mono text-[10px] text-[hsl(var(--muted-foreground))]">Ledger {result.ledger}</div></div><a href={result.explorerUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:underline">View finalized transaction <ExternalLink size={14} /></a><AppButton onClick={onClose} className="mt-7 w-full" testId="button-close-success">Return to registry</AppButton></div>
      : <form onSubmit={submit} className="space-y-5 px-6 py-6"><div className="rounded-xl border border-[hsl(var(--secondary)/.5)] bg-[hsl(var(--secondary)/.1)] p-3 text-xs leading-5"><span className="font-bold">Real Testnet transaction.</span> Simulation runs first. Your wallet signs the prepared XDR; this demo never receives or stores a secret key.</div><div><label className="mb-2 block text-xs font-bold uppercase tracking-wider">What are you recording?</label><div className="grid grid-cols-2 gap-2">{(["Business", "Creator"] as const).map((value) => <button key={value} type="button" onClick={() => setKind(value)} data-testid={`button-kind-${value.toLowerCase()}`} className={`rounded-xl border p-3 text-left transition-colors ${kind === value ? "border-[hsl(var(--secondary-foreground))] bg-[hsl(var(--secondary)/.16)]" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"}`}><div className="font-bold text-sm">{value === "Business" ? "MSME readiness" : "Creator contribution"}</div><div className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">{value === "Business" ? "Write once for an MSME wallet" : "Write once for creator + commitment"}</div></button>)}</div></div><Field label="MSME wallet address" value={msmeWallet} onChange={setMsmeWallet} placeholder="G..." testId="input-credential-wallet" /><Field label="MSME identifier" value={msmeId} onChange={setMsmeId} placeholder="e.g. msme-001" testId="input-credential-subject" />{kind === "Business" && <Field label="PSGC jurisdiction code" value={psgcCode} onChange={setPsgcCode} placeholder="e.g. 074610000" testId="input-credential-psgc" />}<Field label="Circuit identifier" value={circuitId} onChange={setCircuitId} placeholder="e.g. circuit-1" testId="input-credential-circuit" />{kind === "Business" && <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider">Readiness status</label><select value={readinessStatus} onChange={(event) => setReadinessStatus(event.target.value)} data-testid="select-readiness-status" className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--secondary-foreground))]"><option value="0">Not ready</option><option value="1">In progress</option><option value="2">Ready</option></select></div>}<Field label="Canonical record SHA-256 commitment" value={contentHash} onChange={setContentHash} placeholder="64 hexadecimal characters" testId="input-credential-hash" /><div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Issuer wallet: <span className="font-mono text-[hsl(var(--foreground))]">{shorten(wallet.address)}</span>. Deployed allowlist: <span className="font-mono text-[hsl(var(--foreground))]">{shorten(config.issuerPublicKey)}</span>.</div>{state === "error" && <div className="flex items-start gap-2 rounded-xl border border-[hsl(var(--destructive)/.35)] bg-[hsl(var(--destructive)/.09)] p-3 text-xs text-[hsl(var(--destructive))]"><XCircle size={16} className="mt-0.5 shrink-0" /><span>{error}</span></div>}<div className="flex flex-col-reverse gap-2 border-t border-[hsl(var(--border))] pt-5 sm:flex-row sm:justify-end"><AppButton onClick={onClose} variant="quiet" testId="button-cancel-issue">Cancel</AppButton><AppButton type="submit" disabled={!canSubmit || state === "loading"} testId="button-submit-credential">{state === "loading" ? <><Loader2 size={16} className="animate-spin" /> Simulating / waiting for finality</> : <><FileCheck2 size={16} /> Submit to Testnet</>}</AppButton></div></form>}
  </div></div>;
}

function Field({ label, value, onChange, placeholder, testId }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string }) {
  return <div><label className="mb-2 block text-xs font-bold uppercase tracking-wider">{label}</label><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} data-testid={testId} className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--secondary-foreground))]" /></div>;
}

function Lookup({ config, selected, onRecord }: { config: PublicConfig; selected: ChainRecord | null; onRecord: (record: ChainRecord | null) => void }) {
  const [kind, setKind] = useState<"Business" | "Creator">("Business");
  const [wallet, setWallet] = useState("");
  const [contentHash, setContentHash] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "not-found" | "error">("idle");
  const [error, setError] = useState("");
  const searchRecord = async () => {
    setState("loading");
    setError("");
    onRecord(null);
    try {
      const value = kind === "Business" ? await readCredential(config, wallet) : await readContribution(config, wallet, contentHash);
      if (!value) { setState("not-found"); return; }
      if (kind === "Business") {
        onRecord({ kind: "Business", value: value as CredentialRecord });
      } else {
        onRecord({ kind: "Creator", value: value as ContributionRecord });
      }
      setState("success");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Soroban RPC could not read this state.");
      setState("error");
    }
  };
  useEffect(() => {
    if (!selected) return;
    setKind(selected.kind);
    setWallet(selected.kind === "Business" ? selected.value.msmeWallet : selected.value.creatorWallet);
    setContentHash(selected.value.contentHash);
    setState("success");
  }, [selected]);
  const record = selected;
  return <section id="lookup" className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-20 md:py-28 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><div><SectionLabel number="03" light>Open verification</SectionLabel><h2 className="font-serif text-4xl font-bold leading-[1.04] tracking-[-.05em] md:text-5xl">Trust, but make it checkable.</h2><p className="mt-5 max-w-md text-sm leading-6 text-[hsl(var(--primary-foreground)/.64)]">Read deployed contract state directly through Soroban RPC. A missing, malformed, or unavailable result is never shown as verified.</p><div className="mt-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--secondary))]"><div className="h-px w-8 bg-[hsl(var(--secondary))]" /> No account required</div></div><div className="rounded-3xl border border-[hsl(var(--primary-foreground)/.14)] bg-[hsl(var(--primary-foreground)/.06)] p-5 md:p-7"><div className="mb-4 flex gap-2"><button onClick={() => { setKind("Business"); setState("idle"); }} className={`rounded-full px-3 py-1.5 text-xs font-bold ${kind === "Business" ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "bg-[hsl(var(--primary-foreground)/.1)]"}`} data-testid="button-lookup-business">MSME credential</button><button onClick={() => { setKind("Creator"); setState("idle"); }} className={`rounded-full px-3 py-1.5 text-xs font-bold ${kind === "Creator" ? "bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]" : "bg-[hsl(var(--primary-foreground)/.1)]"}`} data-testid="button-lookup-creator">Creator contribution</button></div><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary-foreground)/.72)]">{kind === "Business" ? "MSME wallet address" : "Creator wallet address"}</label><div className="relative"><Link2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--primary-foreground)/.42)]" /><input value={wallet} onChange={(event) => { setWallet(event.target.value); setState("idle"); }} placeholder="G..." data-testid="input-lookup-wallet" className="w-full rounded-xl border border-[hsl(var(--primary-foreground)/.18)] bg-[hsl(var(--primary)/.7)] py-3 pl-9 pr-3 font-mono text-sm outline-none placeholder:text-[hsl(var(--primary-foreground)/.35)] focus:border-[hsl(var(--secondary))]" /></div>{kind === "Creator" && <div className="mt-4"><label className="mb-3 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--primary-foreground)/.72)]">Content commitment</label><input value={contentHash} onChange={(event) => { setContentHash(event.target.value); setState("idle"); }} placeholder="64 hexadecimal characters" data-testid="input-lookup-hash" className="w-full rounded-xl border border-[hsl(var(--primary-foreground)/.18)] bg-[hsl(var(--primary)/.7)] px-3 py-3 font-mono text-sm outline-none placeholder:text-[hsl(var(--primary-foreground)/.35)] focus:border-[hsl(var(--secondary))]" /></div>}<AppButton onClick={searchRecord} variant="yellow" className="mt-4 w-full" disabled={!wallet || state === "loading"} testId="button-search-record">{state === "loading" ? <><Loader2 size={16} className="animate-spin" /> Reading Soroban RPC</> : <><Search size={16} /> Verify on Testnet</>}</AppButton>{state === "loading" && <div className="mt-4 text-xs text-[hsl(var(--primary-foreground)/.6)]">Querying {config.rpcUrl}</div>}{state === "success" && record && <LookupResult record={record} config={config} />}{state === "not-found" && <ResultMessage title="No matching on-chain record" text="The contract returned no record for these exact lookup keys. Nothing is being presented as verified." />} {state === "error" && <ResultMessage title="Verification unavailable" text={error} error />}</div></div></section>;
}

function LookupResult({ record, config }: { record: ChainRecord; config: PublicConfig }) {
  const isBusiness = record.kind === "Business";
  const value = record.value;
  const wallet = isBusiness ? (value as CredentialRecord).msmeWallet : (value as ContributionRecord).creatorWallet;
  const ledger = isBusiness ? (value as CredentialRecord).issuedLedger : (value as ContributionRecord).recordedLedger;
  return <div className="mt-6 animate-rise rounded-2xl bg-[hsl(var(--card))] p-5 text-[hsl(var(--foreground))]"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-[hsl(var(--secondary)/.2)] text-[hsl(var(--primary))]"><BadgeCheck size={23} /></div><div><div className="font-serif text-xl font-bold">{isBusiness ? "MSME readiness credential" : "Creator contribution"}</div><div className="text-xs text-[hsl(var(--muted-foreground))]">Verified from Soroban RPC</div></div></div><span className="rounded-full bg-[hsl(var(--secondary)/.18)] px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-[hsl(var(--primary))]">Verified</span></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-[hsl(var(--border))] pt-4 text-sm"><div><div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{isBusiness ? "MSME wallet" : "Creator wallet"}</div><div className="mt-1 break-all font-mono text-xs">{wallet}</div></div><div><div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Issuer</div><div className="mt-1 break-all font-mono text-xs">{value.issuer}</div></div><div><div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Record</div><div className="mt-1 font-medium">{value.msmeId} · {value.circuitId}</div></div><div><div className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Ledger</div><div className="mt-1 font-medium">{ledger}</div></div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-4"><span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">SHA-256 {value.contentHash}</span><a href={`${config.explorerUrl}/contract/${isBusiness ? config.msmeContractId : config.contributionContractId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-stellar-explorer"><ExternalLink size={13} /> Contract on explorer</a></div></div>;
}

function ResultMessage({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return <div className={`mt-6 flex items-start gap-3 rounded-2xl border p-5 text-sm ${error ? "border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.1)]" : "border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.1)]"}`}><XCircle className={`shrink-0 ${error ? "text-[hsl(var(--accent))]" : "text-[hsl(var(--accent-foreground))]"}`} size={21} /><div><div className="font-bold">{title}</div><div className="mt-1 text-xs text-[hsl(var(--primary-foreground)/.65)]">{text}</div></div></div>;
}

function NetworkSection({ config }: { config: PublicConfig }) {
  return <section id="network" className="mx-auto max-w-[1440px] px-5 py-20 md:py-28 lg:px-10"><div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr]"><div><SectionLabel number="04">Built for the network</SectionLabel><h2 className="max-w-2xl font-serif text-4xl font-bold leading-[1.02] tracking-[-.05em] md:text-6xl">Small proofs.<br /><span className="text-[hsl(var(--muted-foreground))]">Stronger places.</span></h2><p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">A testnet-only proof layer with public contract state and no browser-local source of truth.</p><div className="mt-10 grid gap-3 sm:grid-cols-3"><Stat icon={Landmark} value="2" label="deployed contracts" /><Stat icon={Store} value="RPC" label="live reads" /><Stat icon={UsersRound} value="WALLET" label="signed writes" /></div></div><div className="relative overflow-hidden rounded-3xl bg-[hsl(var(--accent))] p-7 md:p-10"><div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border-[18px] border-[hsl(var(--primary)/.12)]" /><BarChart3 className="relative text-[hsl(var(--primary))]" size={27} /><h3 className="relative mt-12 max-w-xs font-serif text-3xl font-bold leading-tight tracking-[-.04em] text-[hsl(var(--primary))]">Public state, clearly labeled.</h3><p className="relative mt-4 max-w-sm text-sm leading-6 text-[hsl(var(--primary)/.7)]">Network: Stellar Testnet. Contract IDs and explorer links come from public configuration.</p><a href={`${config.explorerUrl}/contract/${config.contributionContractId}`} target="_blank" rel="noreferrer" className="relative mt-10 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--primary)/.7)] hover:underline">Open contribution contract <ExternalLink size={13} /></a></div></div></section>;
}

function Stat({ icon: Icon, value, label }: { icon: typeof Landmark; value: string; label: string }) {
  return <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"><Icon size={18} className="text-[hsl(var(--secondary-foreground))]" /><div className="mt-5 font-serif text-3xl font-bold">{value}</div><div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{label}</div></div>;
}

function Footer() {
  return <footer className="border-t border-[hsl(var(--border))]"><div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 text-sm md:flex-row md:items-center md:justify-between lg:px-10"><BrandMark /><div className="flex flex-wrap items-center gap-5 text-xs text-[hsl(var(--muted-foreground))]"><a href="#registry" className="hover:text-[hsl(var(--foreground))]" data-testid="footer-link-registry">Public registry</a><span className="font-mono text-[10px] uppercase tracking-wider">Testnet only / wallet required for writes</span></div></div></footer>;
}

function DemoNotice({ onClose }: { onClose: () => void }) {
  return <div className="border-b border-[hsl(var(--accent)/.45)] bg-[hsl(var(--accent)/.2)]"><div className="mx-auto flex max-w-[1440px] items-start gap-3 px-5 py-3 text-xs leading-5 lg:px-10"><Clock3 size={15} className="mt-0.5 shrink-0 text-[hsl(var(--accent-foreground))]" /><p className="flex-1"><strong>Live Testnet demo.</strong> Public lookups read deployed Soroban contracts. Writes are real wallet-signed transactions; no browser-local record is treated as on-chain.</p><button onClick={onClose} aria-label="Dismiss demo notice" data-testid="button-dismiss-notice"><X size={15} /></button></div></div>;
}

function Home() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState("");
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [records, setRecords] = useState<ChainRecord[]>([]);
  const [selected, setSelected] = useState<ChainRecord | null>(null);
  const [toast, setToast] = useState("");
  useEffect(() => { loadPublicConfig().then(setConfig).catch((error) => setConfigError(error instanceof Error ? error.message : "Public configuration unavailable.")); }, []);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 3500); };
  const connect = async () => {
    try { const next = await connectWallet(); setWallet(next); showToast(`Connected ${shorten(next.address)} on ${next.network}.`); }
    catch (error) { showToast(error instanceof Error ? error.message : "Wallet connection failed."); }
  };
  const disconnect = async () => { await disconnectWallet().catch(() => undefined); setWallet(null); showToast("Wallet disconnected."); };
  const openIssue = () => { if (!config) { showToast("Public Testnet configuration is still loading."); return; } setIssueOpen(true); };
  if (configError) return <div className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--primary))] p-6 text-center text-[hsl(var(--primary-foreground))]"><div><Network className="mx-auto text-[hsl(var(--accent))]" size={38} /><h1 className="mt-5 font-serif text-3xl font-bold">Testnet configuration unavailable</h1><p className="mt-3 max-w-md text-sm text-[hsl(var(--primary-foreground)/.7)]">{configError}</p></div></div>;
  if (!config) return <div className="grid min-h-[100dvh] place-items-center bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Loader2 className="animate-spin text-[hsl(var(--secondary))]" size={30} /><span className="sr-only">Loading public Testnet configuration</span></div>;
  return <div className="registry-grain min-h-[100dvh] overflow-x-hidden"><TopBar wallet={wallet} onConnect={connect} onDisconnect={disconnect} onMenu={() => setMenuOpen(true)} /><MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />{noticeOpen && <DemoNotice onClose={() => setNoticeOpen(false)} />}<main><Hero onStart={openIssue} onLookup={() => document.getElementById("lookup")?.scrollIntoView({ behavior: "smooth" })} /><FlowSection onStart={openIssue} /><Registry records={records} config={config} onIssue={openIssue} onLookup={(record) => { setSelected(record); document.getElementById("lookup")?.scrollIntoView({ behavior: "smooth" }); }} /><Lookup config={config} selected={selected} onRecord={(record) => { setSelected(record); if (record && !records.some((item) => item.kind === record.kind && item.value.contentHash === record.value.contentHash)) setRecords((current) => [record, ...current]); }} /><NetworkSection config={config} /></main><Footer />{issueOpen && <IssuePanel config={config} wallet={wallet} onClose={() => setIssueOpen(false)} onCreated={(record) => setRecords((current) => [record, ...current.filter((item) => item.value.contentHash !== record.value.contentHash)])} onError={showToast} />}{toast && <div className="fixed bottom-5 left-1/2 z-[60] max-w-[min(90vw,560px)] -translate-x-1/2 rounded-xl bg-[hsl(var(--primary))] px-4 py-3 text-center text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-2xl animate-rise" role="status" data-testid="status-toast">{toast}</div>}</div>;
}

function Router() {
  return <ErrorBoundary resetKey={location.href}><Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
