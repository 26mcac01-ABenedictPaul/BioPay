import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Smartphone, 
  Flame, 
  Wifi, 
  Tv, 
  CreditCard, 
  Fingerprint, 
  CheckCircle2, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { BillItem, Transaction } from '../types';
import { playBiometricScanChirp, playSuccessChime, playTouchTick } from '../utils/audio';

interface PayBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: BillItem[];
  onBillPaid: (transaction: Transaction) => void;
}

export const PayBillsModal: React.FC<PayBillsModalProps> = ({
  isOpen,
  onClose,
  bills,
  onBillPaid,
}) => {
  const [selectedBill, setSelectedBill] = useState<BillItem | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [paidBillId, setPaidBillId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Smartphone': return <Smartphone className="w-5 h-5 text-blue-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Wifi': return <Wifi className="w-5 h-5 text-emerald-400" />;
      default: return <CreditCard className="w-5 h-5 text-purple-400" />;
    }
  };

  const handlePayBillWithThumb = (bill: BillItem) => {
    setSelectedBill(bill);
    setIsAuthorizing(true);
    playTouchTick();

    setTimeout(() => {
      playBiometricScanChirp();
      playSuccessChime();
      setIsAuthorizing(false);
      setPaidBillId(bill.id);

      const tx: Transaction = {
        id: `tx-${Date.now()}`,
        recipientName: bill.name,
        recipientBioId: `${bill.biller.replace(/\s+/g, '').toLowerCase()}@biopay`,
        recipientAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
        amount: bill.dueAmount,
        type: 'DEBIT',
        status: 'SUCCESS',
        date: 'Just now',
        note: `Utility Bill payment: ${bill.category}`,
        category: 'BILL',
        utrNumber: `BIO${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        biometricHash: 'BIO-RTHUMB-99.9% VERIFIED',
        fingerUsed: 'Right Thumb',
        bankName: 'HDFC Bank (•••• 4829)',
      };

      setTimeout(() => {
        onBillPaid(tx);
        onClose();
        setPaidBillId(null);
        setSelectedBill(null);
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">Bills & Recharges</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bill Categories Grid */}
        <div className="p-4 border-b border-slate-800 grid grid-cols-4 gap-2 text-center text-slate-300 text-[11px]">
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-1">
              <Smartphone className="w-5 h-5" />
            </div>
            <span>Recharge</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-1">
              <Zap className="w-5 h-5" />
            </div>
            <span>Electricity</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1">
              <Wifi className="w-5 h-5" />
            </div>
            <span>Broadband</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mb-1">
              <Tv className="w-5 h-5" />
            </div>
            <span>DTH Cable</span>
          </div>
        </div>

        {/* Pending Bills List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pending Due Bills
          </h4>

          {bills.map((bill) => {
            const isPayingThis = isAuthorizing && selectedBill?.id === bill.id;
            const isPaid = paidBillId === bill.id;

            return (
              <div
                key={bill.id}
                className="p-3.5 bg-slate-800/70 rounded-2xl border border-slate-700/60 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                    {getIcon(bill.iconName)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{bill.name}</h5>
                    <p className="text-[10px] text-slate-400">{bill.biller} • {bill.dueDate}</p>
                    <p className="text-xs font-extrabold text-amber-400 mt-0.5">
                      ${bill.dueAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <button
                  disabled={isAuthorizing}
                  onClick={() => handlePayBillWithThumb(bill)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                    isPaid
                      ? 'bg-emerald-600 text-white'
                      : isPayingThis
                      ? 'bg-cyan-600 text-white animate-pulse'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  {isPaid ? 'Paid!' : isPayingThis ? 'Scanning...' : 'Pay with Thumb'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
