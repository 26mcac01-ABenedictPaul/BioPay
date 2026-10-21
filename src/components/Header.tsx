import React from 'react';
import { 
  Search, 
  Fingerprint, 
  ShieldCheck, 
  Bell, 
  HelpCircle, 
  ChevronDown,
  Building2,
  Sparkles,
  Zap,
  Smartphone,
  Download
} from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
  userBioId: string;
  activeNav: string;
  onNavChange: (nav: string) => void;
  primaryBalance: number;
  unscratchedRewardsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenProfile,
  onOpenScanner,
  userBioId,
  activeNav,
  onNavChange,
  primaryBalance,
  unscratchedRewardsCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'send', label: 'Send & Request' },
    { id: 'scanner', label: 'Biometric Scanner' },
    { id: 'activity', label: 'Activity & Receipts' },
    { id: 'bills', label: 'Bills & Utilities' },
    { id: 'rewards', label: 'Rewards & Offers', badge: unscratchedRewardsCount > 0 ? `${unscratchedRewardsCount}` : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      {/* Top Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo (GPay style Google colors + BioPay) */}
        <div className="flex items-center space-x-3 shrink-0 cursor-pointer" onClick={() => onNavChange('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Bio<span className="text-blue-400">Pay</span>
              </span>
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Biometric Contactless Payments</span>
          </div>
        </div>

        {/* Global Desktop Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search people, businesses, phone, Bio-ID (e.g. priya.sharma@biopay)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-900 border border-slate-700/80 focus:border-blue-500 rounded-full pl-10 pr-20 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 pointer-events-none">
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-700 rounded border border-slate-600">
                /
              </kbd>
            </div>
          </div>
        </div>

        {/* Right Desktop Actions & Status */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Biometric Sensor Ready Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Sensor Ready</span>
            <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800">
              FIDO2
            </span>
          </div>

          {/* Download ZIP Button */}
          <a
            href="/biopay-source-code.zip"
            download="biopay-source-code.zip"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full text-xs font-semibold border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
            title="Download all project files as ZIP"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">ZIP</span>
          </a>

          {/* Prominent Biometric Scan Button (Replacing QR Scan) */}
          <button
            onClick={onOpenScanner}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-blue-500/25 transition-all group"
          >
            <Fingerprint className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Scan Finger / Thumb</span>
            <span className="sm:hidden">Scan</span>
          </button>

          {/* Balance Pill */}
          <div className="hidden sm:flex flex-col text-right px-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Primary Balance</span>
            <span className="text-xs font-extrabold text-white font-mono">${primaryBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* User Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center space-x-2 p-1 pl-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-full transition-all text-left"
          >
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-white leading-tight">Alex Morgan</p>
              <p className="text-[10px] text-slate-400 font-mono">{userBioId.split('@')[0]}</p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Alex"
                className="w-8 h-8 rounded-full object-cover border-2 border-blue-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
          </button>

        </div>

      </div>

      {/* Desktop Sub-navigation Links */}
      <div className="border-t border-slate-800/80 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 sm:space-x-4 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavChange(item.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                  isActive
                    ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full animate-bounce">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
