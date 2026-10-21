import React, { useState } from 'react';
import { 
  X, 
  Fingerprint, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { BankAccount } from '../types';
import { playBiometricScanChirp, playTouchTick } from '../utils/audio';

interface CheckBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  bankAccounts: BankAccount[];
}

export const CheckBalanceModal: React.FC<CheckBalanceModalProps> = ({
  isOpen,
  onClose,
  bankAccounts,
}) => {
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [revealedBalance, setRevealedBalance] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleAuthenticateThumb = (bank: BankAccount) => {
    setSelectedBank(bank);
    setIsVerifying(true);
    playTouchTick();

    setTimeout(() => {
      playBiometricScanChirp();
      setIsVerifying(false);
      setVerified(true);
      setRevealedBalance(bank.balance);
    }, 900);
  };

  const handleReset = () => {
    setVerified(false);
    setRevealedBalance(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white p-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Check Account Balance</h3>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!verified ? (
          <div>
            <p className="text-xs text-slate-400 mb-4">
              Select an account and authenticate using your enrolled thumb or finger to view live available balance:
            </p>

            <div className="space-y-3">
              {bankAccounts.map((bank) => (
                <div
                  key={bank.id}
                  className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{bank.bankName}</p>
                      <p className="text-[11px] text-slate-400">{bank.accountType} • {bank.accountNumber}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAuthenticateThumb(bank)}
                    disabled={isVerifying}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-md disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4 text-cyan-300" />
                    {isVerifying && selectedBank.id === bank.id ? 'Verifying...' : 'Scan Thumb'}
                  </button>
                </div>
              ))}
            </div>

            {/* In-app sensor visualization */}
            {isVerifying && (
              <div className="mt-6 flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-blue-500/30">
                <div className="relative w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 animate-pulse">
                  <Fingerprint className="w-9 h-9" />
                </div>
                <p className="text-xs font-medium text-cyan-300 mt-2">
                  Verifying enrolled thumbprint with {selectedBank.bankName}...
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Balance Revealed */
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
              {selectedBank.bankName} ({selectedBank.accountNumber})
            </span>

            <h2 className="text-4xl font-extrabold text-white mt-2">
              ${(revealedBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>

            <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Biometric verification passed • Real-time bank balance
            </p>

            <div className="mt-6 w-full flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                Check another bank
              </button>
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
