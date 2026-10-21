import React, { useState } from 'react';
import { 
  X, 
  Fingerprint, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  CreditCard, 
  Smartphone, 
  Settings, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Shield,
  Sparkles
} from 'lucide-react';
import { BankAccount, RegisteredFinger } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBioId: string;
  bankAccounts: BankAccount[];
  registeredFingers: RegisteredFinger[];
  onAddFinger: (finger: RegisteredFinger) => void;
  onDeleteFinger: (id: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userBioId,
  bankAccounts,
  registeredFingers,
  onAddFinger,
  onDeleteFinger,
}) => {
  const [copiedBioId, setCopiedBioId] = useState(false);
  const [tapAndPayEnabled, setTapAndPayEnabled] = useState(true);
  const [isAddingFinger, setIsAddingFinger] = useState(false);
  const [newFingerName, setNewFingerName] = useState('Left Index Finger');
  const [enrollingStep, setEnrollingStep] = useState(0);

  if (!isOpen) return null;

  const copyBioId = () => {
    navigator.clipboard?.writeText(userBioId);
    setCopiedBioId(true);
    setTimeout(() => setCopiedBioId(false), 2000);
  };

  const startFingerEnrollment = () => {
    setIsAddingFinger(true);
    setEnrollingStep(1);

    const stepInterval = setInterval(() => {
      setEnrollingStep((prev) => {
        if (prev >= 4) {
          clearInterval(stepInterval);
          setTimeout(() => {
            const newFinger: RegisteredFinger = {
              id: `f-${Date.now()}`,
              name: newFingerName,
              fingerType: 'LEFT_INDEX',
              registeredDate: 'Enrolled Today',
              fingerprintHash: `SHA256:${Math.random().toString(36).substring(2, 10)}...`,
              quality: 99.4,
            };
            onAddFinger(newFinger);
            setIsAddingFinger(false);
            setEnrollingStep(0);
          }, 600);
          return 4;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 z-10">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            BioPay Account & Profile
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* User Card */}
          <div className="flex items-center space-x-3.5 bg-slate-800/70 p-4 rounded-2xl border border-slate-700/60">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Alex Morgan"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-slate-950">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-base font-bold text-white">Alex Morgan</h4>
              <p className="text-xs text-slate-400">+1 (555) 019-8833</p>
              
              <div className="mt-1 flex items-center space-x-1.5">
                <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  {userBioId}
                </span>
                <button
                  onClick={copyBioId}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy Bio-ID"
                >
                  {copiedBioId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Biometric Credentials Management (The heart of BioPay) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-blue-400" />
                  Enrolled Biometric Fingers ({registeredFingers.length}/5)
                </h5>
                <p className="text-[11px] text-slate-400">Used instead of QR scanning or PINs</p>
              </div>

              {!isAddingFinger && registeredFingers.length < 5 && (
                <button
                  onClick={startFingerEnrollment}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Enroll Finger
                </button>
              )}
            </div>

            {/* Live Enrollment Progress Overlay if user is enrolling a new finger */}
            {isAddingFinger && (
              <div className="p-4 bg-slate-950 border border-blue-500/60 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95">
                <div className="relative w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center text-cyan-300 mb-2">
                  <Fingerprint className="w-9 h-9 animate-pulse" />
                </div>
                <h6 className="text-xs font-bold text-white">Enrolling {newFingerName}</h6>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lift and place your finger again ({enrollingStep} of 4 samples captured)
                </p>
                <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${(enrollingStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* List of enrolled fingers */}
            <div className="space-y-2">
              {registeredFingers.map((finger) => (
                <div
                  key={finger.id}
                  className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{finger.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {finger.fingerprintHash} • {finger.quality}% accuracy
                      </p>
                    </div>
                  </div>

                  {registeredFingers.length > 1 && (
                    <button
                      onClick={() => onDeleteFinger(finger.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      title="Remove enrolled finger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contactless Biometric Tap & Pay Setting */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between">
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Contactless Biometric Tap & Pay
              </h5>
              <p className="text-[11px] text-slate-400">
                Hold phone near terminal while touching thumb to pay
              </p>
            </div>
            <button
              onClick={() => setTapAndPayEnabled(!tapAndPayEnabled)}
              className="text-blue-400"
            >
              {tapAndPayEnabled ? (
                <ToggleRight className="w-8 h-8 text-blue-500" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-slate-600" />
              )}
            </button>
          </div>

          {/* Linked Bank Accounts */}
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Linked Bank Accounts
            </h5>

            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="text-lg">{b.logo}</span>
                  <div>
                    <p className="font-semibold text-white">{b.bankName} {b.accountNumber}</p>
                    <p className="text-[10px] text-slate-400">{b.accountType}</p>
                  </div>
                </div>
                {b.isPrimary && (
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 font-semibold px-2 py-0.5 rounded-full border border-blue-500/30">
                    Primary Route
                  </span>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
