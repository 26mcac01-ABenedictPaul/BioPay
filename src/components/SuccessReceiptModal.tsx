import React, { useEffect } from 'react';
import { 
  Check, 
  Share2, 
  Download, 
  Sparkles, 
  Fingerprint, 
  ArrowRight, 
  X,
  ShieldCheck,
  Gift,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction } from '../types';

interface SuccessReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onOpenScratchCard: () => void;
  onSplitExpense?: (transaction: Transaction) => void;
}

export const SuccessReceiptModal: React.FC<SuccessReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onOpenScratchCard,
  onSplitExpense,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285F4', '#34A853', '#FBBC05', '#EA4335', '#06b6d4'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Top Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header banner */}
        <div className="pt-8 pb-6 px-6 flex flex-col items-center text-center bg-gradient-to-b from-emerald-950/40 to-slate-900 border-b border-slate-800">
          
          {/* Animated Green Checkmark Ring (GPay style) */}
          <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <Check className="w-10 h-10 stroke-[3] animate-in zoom-in duration-300" />
          </div>

          <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Payment Successful
          </span>

          <h2 className="text-4xl font-extrabold text-white mt-3">
            ${transaction.amount.toFixed(2)}
          </h2>

          <p className="text-sm text-slate-300 mt-1 font-medium">
            Paid to <span className="text-white font-semibold">{transaction.recipientName}</span>
          </p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{transaction.recipientBioId}</p>
        </div>

        {/* Scratch Card Bonus Promo Banner (GPay signature reward) */}
        <div className="p-4 mx-4 my-3 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-pink-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Gift className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-300">You won a BioPay Scratch Card!</p>
              <p className="text-[11px] text-slate-300">Up to $50 instant cashback reward</p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onOpenScratchCard();
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1"
          >
            Scratch
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Transaction Detail Card */}
        <div className="px-5 py-2 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Date & Time</span>
            <span className="font-medium text-white">{transaction.date}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Paid from</span>
            <span className="font-medium text-white">{transaction.bankName}</span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">Biometric Auth</span>
            <span className="font-medium text-cyan-300 flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              {transaction.fingerUsed} ({transaction.biometricHash})
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800 text-slate-300">
            <span className="text-slate-400">BioPay UTR / Ref</span>
            <span className="font-mono text-[11px] text-slate-300">{transaction.utrNumber}</span>
          </div>

          {transaction.note && (
            <div className="flex items-center justify-between py-1.5 text-slate-300">
              <span className="text-slate-400">Note</span>
              <span className="font-medium text-white italic">"{transaction.note}"</span>
            </div>
          )}
        </div>

        {/* Action Buttons: Split & Done */}
        <div className="p-5 pt-3 flex items-center gap-3">
          <button
            onClick={() => {
              if (onSplitExpense) onSplitExpense(transaction);
              onClose();
            }}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4 text-blue-400" />
            Split expense
          </button>
          
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white shadow-md transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
