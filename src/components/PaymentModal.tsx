import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Fingerprint, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { BankAccount, Contact, RegisteredFinger, Transaction } from '../types';
import { playBiometricScanChirp, playTouchTick, playSuccessChime } from '../utils/audio';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payee: Contact | null;
  initialAmount?: number;
  bankAccounts: BankAccount[];
  registeredFingers: RegisteredFinger[];
  onPaymentSuccess: (transaction: Transaction) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  payee,
  initialAmount = 0,
  bankAccounts,
  registeredFingers,
  onPaymentSuccess,
}) => {
  const [amount, setAmount] = useState<string>(initialAmount > 0 ? initialAmount.toString() : '');
  const [note, setNote] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0] || {} as BankAccount);
  const [selectedFinger, setSelectedFinger] = useState<RegisteredFinger>(registeredFingers[0] || {} as RegisteredFinger);
  const [showBankSelector, setShowBankSelector] = useState(false);
  
  // Auth state
  const [authStep, setAuthStep] = useState<'details' | 'biometric_auth' | 'processing'>('details');
  const [isPressingSensor, setIsPressingSensor] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStatus, setAuthStatus] = useState<string>('Touch & hold thumb to authorize');
  const [usePinFallback, setUsePinFallback] = useState(false);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);

  const pressTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialAmount > 0) {
      setAmount(initialAmount.toString());
    }
  }, [initialAmount]);

  useEffect(() => {
    if (bankAccounts.length > 0 && (!selectedBank.id || !bankAccounts.some(b => b.id === selectedBank.id))) {
      setSelectedBank(bankAccounts[0]);
    }
  }, [bankAccounts, selectedBank]);

  useEffect(() => {
    if (registeredFingers.length > 0 && (!selectedFinger.id || !registeredFingers.some(f => f.id === selectedFinger.id))) {
      setSelectedFinger(registeredFingers[0]);
    }
  }, [registeredFingers, selectedFinger]);

  // Handle sensor press during biometric authorization
  useEffect(() => {
    if (isPressingSensor && authStep === 'biometric_auth') {
      playTouchTick();
      setAuthStatus(`Scanning ${selectedFinger.name}...`);
      
      pressTimerRef.current = window.setInterval(() => {
        setAuthProgress((prev) => {
          const next = prev + 15;
          if (next >= 100) {
            clearInterval(pressTimerRef.current!);
            handleBiometricVerified();
            return 100;
          }
          return next;
        });
      }, 100);
    } else {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
      if (authProgress < 100 && authStep === 'biometric_auth') {
        setAuthProgress(0);
        setAuthStatus('Touch & hold thumb to authorize');
      }
    }

    return () => {
      if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    };
  }, [isPressingSensor, authStep, selectedFinger, authProgress]);

  const handleBiometricVerified = () => {
    playBiometricScanChirp();
    setAuthStatus('Biometric signature verified! Routing payment...');
    setAuthStep('processing');

    setTimeout(() => {
      completeTransaction();
    }, 1200);
  };

  const completeTransaction = () => {
    playSuccessChime();

    const numericAmount = parseFloat(amount) || 0;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      recipientName: payee?.name || 'BioPay User',
      recipientBioId: payee?.bioId || 'user@biopay',
      recipientAvatar: payee?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      amount: numericAmount,
      type: 'DEBIT',
      status: 'SUCCESS',
      date: 'Just now',
      note: note || (payee?.isMerchant ? 'Merchant Biometric Payment' : 'Transfer via BioPay'),
      category: payee?.isMerchant ? 'MERCHANT' : 'TRANSFER',
      utrNumber: `BIO${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      biometricHash: `BIO-${selectedFinger.fingerType}-${(99.2 + Math.random() * 0.7).toFixed(1)}% MATCH`,
      fingerUsed: selectedFinger.name,
      bankName: `${selectedBank.bankName} (${selectedBank.accountNumber})`,
    };

    onPaymentSuccess(newTx);
    onClose();
    resetModal();
  };

  const resetModal = () => {
    setAmount('');
    setNote('');
    setAuthStep('details');
    setIsPressingSensor(false);
    setAuthProgress(0);
    setUsePinFallback(false);
    setPinDigits(['', '', '', '']);
  };

  if (!isOpen || !payee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-200">
              {authStep === 'details' ? 'Paying via BioPay' : 'Biometric Security Authorization'}
            </h3>
          </div>
          <button
            onClick={() => {
              resetModal();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Payment Details & Amount */}
        {authStep === 'details' && (
          <div className="p-5 flex flex-col items-center">
            {/* Payee Profile */}
            <div className="relative">
              <img
                src={payee.avatar}
                alt={payee.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
              {payee.verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 text-white border-2 border-slate-900">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <h4 className="mt-2 text-base font-bold text-white text-center flex items-center gap-1.5">
              {payee.name}
            </h4>
            <p className="text-xs text-slate-400 font-mono">{payee.bioId}</p>

            {/* Amount Input */}
            <div className="w-full mt-4 flex flex-col items-center">
              <div className="relative flex items-center justify-center w-full">
                <span className="text-3xl font-bold text-slate-400 mr-1">$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-48 bg-transparent text-4xl sm:text-5xl font-extrabold text-white text-center focus:outline-none placeholder:text-slate-600"
                  autoFocus
                />
              </div>

              {/* Note / Purpose */}
              <input
                type="text"
                placeholder="What is this for? (Optional note)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-3 w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 text-center"
              />
            </div>

            {/* Bank Account Switcher (GPay Style) */}
            <div className="w-full mt-5 bg-slate-800/60 rounded-2xl border border-slate-700/70 p-3">
              <div 
                onClick={() => setShowBankSelector(!showBankSelector)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-xl">{selectedBank.logo || '🏦'}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {selectedBank.bankName} {selectedBank.accountNumber}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Balance: ${(selectedBank.balance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showBankSelector ? 'rotate-180' : ''}`} />
              </div>

              {showBankSelector && (
                <div className="mt-3 pt-2 border-t border-slate-700 space-y-1.5">
                  {bankAccounts.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setSelectedBank(b);
                        setShowBankSelector(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                        selectedBank.id === b.id ? 'bg-blue-600/30 border border-blue-500/50 text-white' : 'hover:bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      <span>{b.bankName} ({b.accountNumber})</span>
                      <span className="text-slate-400">${b.balance.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Biometric Finger Badge */}
            <div className="w-full mt-3 flex items-center justify-between px-2 py-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                Auth: <span className="text-slate-200 font-medium">{selectedFinger.name}</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                99.8% match quality
              </span>
            </div>

            {/* Proceed to Biometric Auth Button */}
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              onClick={() => setAuthStep('biometric_auth')}
              className="mt-5 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Fingerprint className="w-4 h-4" />
              Pay ${parseFloat(amount || '0').toFixed(2)} with Thumb Scan
            </button>
          </div>
        )}

        {/* Step 2: Biometric Fingerprint Auth (The GPay PIN replacement!) */}
        {authStep === 'biometric_auth' && (
          <div className="p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Biometric Authorization
            </p>
            <h4 className="text-2xl font-black text-white mt-1">
              ${parseFloat(amount).toFixed(2)}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              To {payee.name} via {selectedBank.bankName}
            </p>

            {/* Biometric Touch Sensor Area */}
            <div className="relative my-7 flex flex-col items-center justify-center">
              {/* Animated wave rings when user presses */}
              {isPressingSensor && (
                <>
                  <div className="absolute w-36 h-36 rounded-full border-2 border-cyan-400 animate-bio-wave" />
                  <div className="absolute w-48 h-48 rounded-full border border-blue-400 animate-bio-wave" style={{ animationDelay: '0.3s' }} />
                </>
              )}

              {/* Sensor Pad Button */}
              <button
                onMouseDown={() => setIsPressingSensor(true)}
                onMouseUp={() => setIsPressingSensor(false)}
                onTouchStart={() => setIsPressingSensor(true)}
                onTouchEnd={() => setIsPressingSensor(false)}
                className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-200 select-none ${
                  isPressingSensor
                    ? 'scale-95 bg-cyan-500/30 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.8)]'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-2 border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                }`}
              >
                <Fingerprint className={`w-14 h-14 transition-colors ${
                  isPressingSensor ? 'text-cyan-300 animate-pulse' : 'text-blue-400'
                }`} />
                <span className="text-[9px] font-mono tracking-wider text-slate-300 mt-1 uppercase">
                  {isPressingSensor ? `${authProgress}% AUTH` : 'HOLD THUMB'}
                </span>
              </button>
            </div>

            {/* Instruction / Status text */}
            <p className={`text-xs font-medium transition-colors ${
              isPressingSensor ? 'text-cyan-300' : 'text-slate-300'
            }`}>
              {authStatus}
            </p>

            {/* Auth Progress bar */}
            <div className="w-56 bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-100"
                style={{ width: `${authProgress}%` }}
              />
            </div>

            {/* Fast 1-click fallback simulation button if user prefers quick tap */}
            <button
              onClick={() => handleBiometricVerified()}
              className="mt-6 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4 font-medium"
            >
              (Or click here to simulate instant fingerprint match)
            </button>

            {/* Finger enrollment switcher */}
            <div className="mt-4 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-[11px] text-slate-400">
              <span>Switch registered finger:</span>
              <select
                value={selectedFinger.id}
                onChange={(e) => {
                  const found = registeredFingers.find(f => f.id === e.target.value);
                  if (found) setSelectedFinger(found);
                }}
                className="bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                {registeredFingers.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Processing Screen */}
        {authStep === 'processing' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
              <Fingerprint className="w-8 h-8 text-blue-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Contacting {selectedBank.bankName}...</h4>
              <p className="text-xs text-slate-400 mt-1">Verifying encrypted biometric token with Federal Switch</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
