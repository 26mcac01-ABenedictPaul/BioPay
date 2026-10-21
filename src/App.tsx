import React, { useState, useMemo } from 'react';
import { 
  Fingerprint, 
  Users, 
  Phone, 
  Building2, 
  AtSign, 
  ArrowLeftRight, 
  Zap, 
  Smartphone, 
  ChevronRight, 
  Gift, 
  Tag, 
  Share2, 
  Receipt, 
  ShieldCheck, 
  Sparkles, 
  CreditCard,
  Plus,
  Compass,
  Store,
  CheckCircle2,
  Lock,
  Volume2,
  Tv,
  Flame,
  Wifi,
  Laptop,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Search,
  Filter,
  Check,
  Shield,
  HelpCircle,
  Clock
} from 'lucide-react';
import { 
  INITIAL_CONTACTS, 
  INITIAL_MERCHANTS, 
  INITIAL_BANK_ACCOUNTS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_SCRATCH_CARDS, 
  INITIAL_BILLS,
  REGISTERED_FINGERS 
} from './data/mockData';
import { BankAccount, BillItem, Contact, RegisteredFinger, ScratchCard, Transaction } from './types';
import { Header } from './components/Header';
import { DesktopBiometricTerminal } from './components/DesktopBiometricTerminal';
import { BiometricScannerModal } from './components/BiometricScannerModal';
import { PaymentModal } from './components/PaymentModal';
import { SuccessReceiptModal } from './components/SuccessReceiptModal';
import { RewardsModal } from './components/RewardsModal';
import { CheckBalanceModal } from './components/CheckBalanceModal';
import { UserProfileModal } from './components/UserProfileModal';
import { PayBillsModal } from './components/PayBillsModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';

export default function App() {
  // App state
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [merchants, setMerchants] = useState<Contact[]>(INITIAL_MERCHANTS);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>(INITIAL_SCRATCH_CARDS);
  const [bills, setBills] = useState<BillItem[]>(INITIAL_BILLS);
  const [registeredFingers, setRegisteredFingers] = useState<RegisteredFinger[]>(REGISTERED_FINGERS);

  // Navigation & Search state
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPayee, setSelectedPayee] = useState<Contact | null>(null);
  const [presetAmount, setPresetAmount] = useState<number | undefined>(undefined);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const [rewardsOpen, setRewardsOpen] = useState(false);
  const [checkBalanceOpen, setCheckBalanceOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [billsOpen, setBillsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Quick Send Form state on desktop
  const [quickSendBioId, setQuickSendBioId] = useState('');
  const [quickSendAmount, setQuickSendAmount] = useState('');

  // Current user BioPay ID
  const userBioId = 'alex.morgan@biopay';

  // Primary bank balance
  const primaryBank = bankAccounts.find(b => b.isPrimary) || bankAccounts[0];
  const primaryBalance = primaryBank ? primaryBank.balance : 0;
  const totalBalance = bankAccounts.reduce((acc, b) => acc + b.balance, 0);

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.bioId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  const filteredMerchants = useMemo(() => {
    if (!searchQuery.trim()) return merchants;
    return merchants.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [merchants, searchQuery]);

  // Handler for opening payment modal for a specific contact/merchant
  const handleInitiatePayment = (contact: Contact, amount?: number) => {
    setSelectedPayee(contact);
    setPresetAmount(amount);
    setPaymentModalOpen(true);
  };

  // Handler when a payment completes
  const handlePaymentSuccess = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setLastTransaction(newTx);

    // Deduct amount from primary bank
    setBankAccounts(prev => prev.map(bank => {
      if (bank.isPrimary) {
        return { ...bank, balance: Math.max(0, bank.balance - newTx.amount) };
      }
      return bank;
    }));

    // Grant a new scratch card reward for biometric payment!
    const newScratchCard: ScratchCard = {
      id: `sc-${Date.now()}`,
      title: 'Biometric Tap Cashback',
      subtitle: `Reward for paying ${newTx.recipientName}`,
      rewardType: 'CASHBACK',
      amount: Math.floor(10 + Math.random() * 40),
      isScratched: false,
      bgGradient: 'from-amber-400 via-orange-500 to-red-500',
    };
    setScratchCards(prev => [newScratchCard, ...prev]);

    // Open receipt modal
    setReceiptOpen(true);
  };

  // Handler when a bill is paid
  const handleBillPaid = (newTx: Transaction) => {
    setTransactions(prev => [newTx, ...prev]);
    setLastTransaction(newTx);
    setBankAccounts(prev => prev.map(bank => {
      if (bank.isPrimary) {
        return { ...bank, balance: Math.max(0, bank.balance - newTx.amount) };
      }
      return bank;
    }));
    setReceiptOpen(true);
  };

  // Handler when scratch card is scratched
  const handleScratchCardCompleted = (id: string, amount?: number) => {
    setScratchCards(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, isScratched: true };
      }
      return c;
    }));

    if (amount) {
      // Credit cashback to bank balance
      setBankAccounts(prev => prev.map(bank => {
        if (bank.isPrimary) {
          return { ...bank, balance: bank.balance + amount };
        }
        return bank;
      }));

      // Add reward transaction
      const rewardTx: Transaction = {
        id: `tx-rwd-${Date.now()}`,
        recipientName: 'BioPay Cashback Reward',
        recipientBioId: 'rewards@biopay',
        recipientAvatar: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=150',
        amount: amount,
        type: 'CREDIT',
        status: 'SUCCESS',
        date: 'Just now',
        note: 'Cashback won from Scratch Card',
        category: 'REWARD',
        utrNumber: `BIO-RWD-${Date.now().toString().slice(-8)}`,
        biometricHash: 'SYSTEM-REWARD-CREDITED',
        fingerUsed: 'Direct Credit',
        bankName: 'HDFC Bank (•••• 4829)',
      };
      setTransactions(prev => [rewardTx, ...prev]);
    }
  };

  const handleAddFinger = (newFinger: RegisteredFinger) => {
    setRegisteredFingers(prev => [...prev, newFinger]);
  };

  const handleDeleteFinger = (id: string) => {
    setRegisteredFingers(prev => prev.filter(f => f.id !== id));
  };

  // Quick Send submit from desktop form
  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSendBioId || !quickSendAmount) return;

    // Check if matches existing contact
    const foundContact = contacts.find(c => 
      c.bioId.toLowerCase() === quickSendBioId.toLowerCase() ||
      c.name.toLowerCase() === quickSendBioId.toLowerCase()
    );

    const targetContact: Contact = foundContact || {
      id: `bio-${Date.now()}`,
      name: quickSendBioId.includes('@') ? quickSendBioId.split('@')[0] : quickSendBioId,
      phone: '+1 (555) 000-0000',
      bioId: quickSendBioId.includes('@') ? quickSendBioId : `${quickSendBioId}@biopay`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      verified: true,
    };

    handleInitiatePayment(targetContact, parseFloat(quickSendAmount));
    setQuickSendAmount('');
    setQuickSendBioId('');
  };

  const unscratchedCount = scratchCards.filter(c => !c.isScratched).length;
  const totalCashbackWon = scratchCards
    .filter(c => c.isScratched && c.rewardType === 'CASHBACK' && c.amount)
    .reduce((sum, c) => sum + (c.amount || 0), 125);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 1. Full Desktop Website Header & Navigation */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenScanner={() => setScannerOpen(true)}
        userBioId={userBioId}
        activeNav={activeNav}
        onNavChange={setActiveNav}
        primaryBalance={primaryBalance}
        unscratchedRewardsCount={unscratchedCount}
      />

      {/* 2. Main Desktop Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* View 1: DASHBOARD / OVERVIEW */}
        {activeNav === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Desktop Hero Section: Biometric Payment Workstation */}
            <DesktopBiometricTerminal
              onSelectPayee={handleInitiatePayment}
              userBioId={userBioId}
            />

            {/* Quick Actions Grid (The 8 Iconic GPay Actions in Desktop Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              
              <button
                onClick={() => setScannerOpen(true)}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500/50 hover:border-blue-400 flex flex-col items-center text-center transition-all group shadow-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 text-cyan-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Fingerprint className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-white leading-tight">
                  Scan Finger
                </span>
                <span className="text-[10px] text-cyan-300 font-medium mt-0.5">
                  Replaces QR
                </span>
              </button>

              <button
                onClick={() => {
                  if (contacts.length > 0) handleInitiatePayment(contacts[0]);
                }}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Pay Contacts
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Friends & Family
                </span>
              </button>

              <button
                onClick={() => {
                  const phone = prompt('Enter recipient phone number:');
                  if (phone) {
                    const tempPayee: Contact = {
                      id: `phone-${Date.now()}`,
                      name: `Mobile Contact (${phone})`,
                      phone,
                      bioId: `${phone.replace(/\D/g, '')}@biopay`,
                      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      verified: true,
                    };
                    handleInitiatePayment(tempPayee);
                  }
                }}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Pay Phone
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Direct Wire
                </span>
              </button>

              <button
                onClick={() => setCheckBalanceOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-all">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Bank Wire
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  ACH / IMPS
                </span>
              </button>

              <button
                onClick={() => {
                  const bio = prompt('Enter Bio-ID handle (e.g. rahul.patel@biopay):');
                  if (bio) {
                    const tempPayee: Contact = {
                      id: `bio-${Date.now()}`,
                      name: bio.split('@')[0],
                      phone: '+1 (555) 000-0000',
                      bioId: bio.includes('@') ? bio : `${bio}@biopay`,
                      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                      verified: true,
                    };
                    handleInitiatePayment(tempPayee);
                  }
                }}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <AtSign className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Pay to Bio-ID
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Zero Fees
                </span>
              </button>

              <button
                onClick={() => setCheckBalanceOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Self Transfer
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Between Accounts
                </span>
              </button>

              <button
                onClick={() => setBillsOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-all">
                  <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Pay Bills
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Power, Internet
                </span>
              </button>

              <button
                onClick={() => setBillsOpen(true)}
                className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 flex flex-col items-center text-center transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  Recharge
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  Prepaid & DTH
                </span>
              </button>

            </div>

            {/* Desktop 2-Column Section (Main 8 cols + Side Control Center 4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Main Stream (8 Cols) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* 1. People & Frequent Contacts Section */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        People & Frequent Transfers
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        One-click biometric transfers with friends and family
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const name = prompt('Enter friend name:');
                        if (name) {
                          const newC: Contact = {
                            id: `c-${Date.now()}`,
                            name,
                            phone: '+1 (555) 777-1234',
                            bioId: `${name.toLowerCase().replace(/\s+/g, '.')}@biopay`,
                            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                            verified: true,
                          };
                          setContacts(prev => [newC, ...prev]);
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Contact
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3.5 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/60 transition-all flex flex-col justify-between group"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative shrink-0">
                            <img
                              src={contact.avatar}
                              alt={contact.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 group-hover:border-blue-500 transition-colors shadow-sm"
                            />
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-blue-600 border border-slate-900 flex items-center justify-center text-[8px] text-white">
                              <Fingerprint className="w-2.5 h-2.5" />
                            </span>
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                              {contact.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-mono truncate">{contact.bioId}</p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center gap-2">
                          <button
                            onClick={() => handleInitiatePayment(contact)}
                            className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Fingerprint className="w-3.5 h-3.5 text-cyan-300" />
                            Pay
                          </button>
                          <button
                            onClick={() => {
                              alert(`Requested $50.00 from ${contact.name} via BioPay request.`);
                            }}
                            className="px-2.5 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                          >
                            Request
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Businesses & Verified Bio-Terminals */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                        <Store className="w-5 h-5 text-indigo-400" />
                        Businesses & Verified Bio-Terminals
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Touch thumb to terminal at physical checkouts or online stores
                      </p>
                    </div>

                    <button
                      onClick={() => setScannerOpen(true)}
                      className="text-xs text-blue-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      Scan Merchant Fingerprint
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredMerchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/60 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <img
                            src={merchant.avatar}
                            alt={merchant.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-700 group-hover:border-cyan-400 transition-colors shadow-sm shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">{merchant.name}</h4>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            </div>
                            <p className="text-[11px] text-slate-400">{merchant.category}</p>
                            <span className="text-[9px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/60 inline-block mt-1">
                              FIDO2 Verified POS
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleInitiatePayment(merchant)}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                        >
                          <Fingerprint className="w-4 h-4 text-cyan-300" />
                          Pay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Upcoming Due Bills & Utilities Table */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white tracking-tight">Upcoming Due Bills</h3>
                        <p className="text-xs text-slate-400">Zero surcharge utility clearing with biometric thumb auth</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setBillsOpen(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                      View All Bills ({bills.length})
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {bills.map((bill) => (
                      <div
                        key={bill.id}
                        className="p-3.5 bg-slate-800/40 hover:bg-slate-800/80 rounded-2xl border border-slate-800/80 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center space-x-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                            {bill.category === 'Electricity' ? <Zap className="w-5 h-5 text-amber-400" /> :
                             bill.category === 'Mobile' ? <Smartphone className="w-5 h-5 text-blue-400" /> :
                             bill.category === 'Broadband' ? <Wifi className="w-5 h-5 text-emerald-400" /> :
                             <Flame className="w-5 h-5 text-orange-400" />}
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-white">{bill.name}</h4>
                            <p className="text-[11px] text-slate-400">{bill.biller} • <span className="text-amber-400 font-medium">{bill.dueDate}</span></p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-extrabold text-white">${bill.dueAmount.toFixed(2)}</span>
                          <button
                            onClick={() => {
                              setSelectedPayee({
                                id: bill.id,
                                name: bill.name,
                                phone: bill.biller,
                                bioId: `${bill.category.toLowerCase()}@biopay`,
                                avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
                                verified: true,
                              });
                              setPresetAmount(bill.dueAmount);
                              setPaymentModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Fingerprint className="w-3.5 h-3.5" />
                            Pay with Thumb
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Desktop Promotions & Scratch Cards Banner */}
                <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-slate-900 rounded-3xl border border-indigo-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 shrink-0">
                      <Gift className="w-8 h-8 animate-bounce" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                          BioPay Rewards Program
                        </span>
                        {unscratchedCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                            {unscratchedCount} Unscratched Cards
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-0.5">
                        You have earned ${totalCashbackWon} in Instant Cashbacks!
                      </h3>
                      <p className="text-xs text-slate-300 mt-1">
                        Every time you pay a merchant or bill with your thumb scan, you earn a scratch card with up to $50 reward.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setRewardsOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 rounded-2xl text-xs font-black shadow-lg shadow-amber-500/20 transition-all shrink-0 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Open Scratch Cards
                  </button>
                </div>

              </div>

              {/* Right Side Control Center (4 Cols on Desktop) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Quick Send / Direct Wire Widget */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-blue-400" />
                      Quick Biometric Send
                    </h3>
                    <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                      Zero Fees
                    </span>
                  </div>

                  <form onSubmit={handleQuickSend} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Payee Bio-ID or Contact Name:
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. priya.sharma@biopay"
                        value={quickSendBioId}
                        onChange={(e) => setQuickSendBioId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                        Amount ($ USD):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={quickSendAmount}
                          onChange={(e) => setQuickSendAmount(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-bold text-base"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!quickSendBioId || !quickSendAmount}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all"
                    >
                      <Fingerprint className="w-4 h-4 text-cyan-300" />
                      Pay with Biometrics
                    </button>
                  </form>
                </div>

                {/* 2. Linked Bank Accounts Card */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        Linked Bank Accounts
                      </h3>
                      <p className="text-[10px] text-slate-400">Total balance: ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                    </div>

                    <button
                      onClick={() => setCheckBalanceOpen(true)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Check Balance
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {bankAccounts.map((b) => (
                      <div
                        key={b.id}
                        className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-xl">{b.logo}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-white">{b.bankName}</p>
                              {b.isPrimary && (
                                <span className="text-[9px] bg-blue-500/20 text-blue-300 font-bold px-1.5 py-0.2 rounded">
                                  Primary
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">{b.accountNumber} • {b.accountType}</p>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-slate-200">
                          ${b.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Registered Biometric Credentials (The Core Feature) */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-cyan-400" />
                        Enrolled Biometrics ({registeredFingers.length}/5)
                      </h3>
                      <p className="text-[10px] text-slate-400">Hardware FIDO2 Cryptographic Keys</p>
                    </div>

                    <button
                      onClick={() => setProfileOpen(true)}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Manage Biometrics"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {registeredFingers.map((finger) => (
                      <div
                        key={finger.id}
                        className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                            <Fingerprint className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{finger.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{finger.fingerprintHash}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {finger.quality}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setProfileOpen(true)}
                    className="w-full mt-2 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5 text-blue-400" />
                    Enroll Another Finger
                  </button>
                </div>

                {/* 4. Recent Biometric Activity Stream */}
                <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-purple-400" />
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => setHistoryOpen(true)}
                      className="text-xs text-blue-400 font-semibold hover:underline"
                    >
                      View All ({transactions.length})
                    </button>
                  </div>

                  <div className="space-y-2">
                    {transactions.slice(0, 4).map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          setLastTransaction(tx);
                          setReceiptOpen(true);
                        }}
                        className="p-2.5 bg-slate-800/40 hover:bg-slate-800 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <img
                            src={tx.recipientAvatar}
                            alt={tx.recipientName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                          <div>
                            <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                              {tx.recipientName}
                            </p>
                            <p className="text-[10px] text-slate-400">{tx.date}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`text-xs font-bold ${tx.type === 'DEBIT' ? 'text-white' : 'text-emerald-400'}`}>
                            {tx.type === 'DEBIT' ? `-$${tx.amount.toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}
                          </p>
                          <span className="text-[9px] text-cyan-300 font-mono flex items-center justify-end gap-1">
                            <Fingerprint className="w-2.5 h-2.5" />
                            {tx.fingerUsed.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* View 2: SEND & REQUEST SUITE */}
        {activeNav === 'send' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-xl">
              <h2 className="text-xl font-extrabold text-white">Send Money with BioPay</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter recipient Bio-ID, mobile number, or select from your enrolled contacts to authorize instant payment.
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Form */}
                <form onSubmit={handleQuickSend} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Recipient Bio-ID, Name, or Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. priya.sharma@biopay"
                      value={quickSendBioId}
                      onChange={(e) => setQuickSendBioId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Amount ($ USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xl">$</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={quickSendAmount}
                        onChange={(e) => setQuickSendAmount(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-lg font-bold text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!quickSendBioId || !quickSendAmount}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 rounded-2xl text-xs font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Fingerprint className="w-4 h-4 text-cyan-300" />
                    Authorize with Registered Thumb Scan
                  </button>
                </form>

                {/* Frequent Recipient Circles */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Or Select Frequent Recipient:
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {contacts.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setQuickSendBioId(c.bioId);
                        }}
                        className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center space-x-2.5 text-left transition-colors"
                      >
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{c.bioId.split('@')[0]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* View 3: BIOMETRIC SCANNER (Standalone Desktop Terminal Page) */}
        {activeNav === 'scanner' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <DesktopBiometricTerminal
              onSelectPayee={handleInitiatePayment}
              userBioId={userBioId}
            />
          </div>
        )}

        {/* View 4: ACTIVITY & RECEIPTS */}
        {activeNav === 'activity' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white">Biometric Transaction History</h2>
                  <p className="text-xs text-slate-400">All payments secured by FIDO2 thumb and fingerprint authentications</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setHistoryOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search History
                  </button>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="mt-4 divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => {
                      setLastTransaction(tx);
                      setReceiptOpen(true);
                    }}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-800/40 px-3 rounded-2xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="relative">
                        <img
                          src={tx.recipientAvatar}
                          alt={tx.recipientName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                          tx.type === 'DEBIT' ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}>
                          {tx.type === 'DEBIT' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white">{tx.recipientName}</h4>
                        <p className="text-[11px] text-slate-400">{tx.note || tx.category} • {tx.date}</p>
                        <p className="text-[10px] font-mono text-slate-500">{tx.utrNumber}</p>
                      </div>
                    </div>

                    <div className="text-right flex items-center space-x-6">
                      <div className="hidden sm:block text-left">
                        <span className="text-[10px] text-slate-400 block">Biometric Auth</span>
                        <span className="text-xs font-mono text-cyan-300 flex items-center gap-1">
                          <Fingerprint className="w-3.5 h-3.5" />
                          {tx.fingerUsed}
                        </span>
                      </div>

                      <div>
                        <span className={`text-sm font-extrabold block ${
                          tx.type === 'DEBIT' ? 'text-white' : 'text-emerald-400'
                        }`}>
                          {tx.type === 'DEBIT' ? `-$${tx.amount.toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 5: BILLS & UTILITIES */}
        {activeNav === 'bills' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm">
              <h2 className="text-lg font-bold text-white">Utility Bill Clearing Station</h2>
              <p className="text-xs text-slate-400 mt-0.5">Pay electricity, broadband, postpaid mobile, and gas bills in 1 second.</p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {bills.map((bill) => (
                  <div
                    key={bill.id}
                    className="p-5 bg-slate-800/60 rounded-3xl border border-slate-700/60 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                          {bill.category === 'Electricity' ? <Zap className="w-6 h-6 text-amber-400" /> :
                           bill.category === 'Mobile' ? <Smartphone className="w-6 h-6 text-blue-400" /> :
                           bill.category === 'Broadband' ? <Wifi className="w-6 h-6 text-emerald-400" /> :
                           <Flame className="w-6 h-6 text-orange-400" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{bill.name}</h4>
                          <p className="text-xs text-slate-400">{bill.biller}</p>
                        </div>
                      </div>

                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        {bill.dueDate}
                      </span>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Due Amount</span>
                        <span className="text-xl font-black text-white">${bill.dueAmount.toFixed(2)}</span>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedPayee({
                            id: bill.id,
                            name: bill.name,
                            phone: bill.biller,
                            bioId: `${bill.category.toLowerCase()}@biopay`,
                            avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150',
                            verified: true,
                          });
                          setPresetAmount(bill.dueAmount);
                          setPaymentModalOpen(true);
                        }}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                      >
                        <Fingerprint className="w-4 h-4 text-cyan-300" />
                        Pay with Thumb
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 6: REWARDS & OFFERS */}
        {activeNav === 'rewards' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-sm flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">BioPay Rewards & Cashbacks</h2>
                <p className="text-xs text-slate-400 mt-0.5">Earn real money credited straight to your bank account with every thumb scan</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Cashback Claimed</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">${totalCashbackWon}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {scratchCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setRewardsOpen(true)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all flex flex-col justify-between min-h-[160px] ${
                    card.isScratched
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-indigo-500/50 hover:scale-105 shadow-xl'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Gift className={`w-6 h-6 ${card.isScratched ? 'text-slate-400' : 'text-amber-300 animate-bounce'}`} />
                    {!card.isScratched && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                        SCRATCH
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white">{card.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">{card.subtitle}</p>
                    {card.isScratched && card.amount && (
                      <span className="text-sm font-black text-emerald-400 block mt-2">
                        +${card.amount} Won
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 3. Full Desktop Website Footer (Google Pay style) */}
      <footer className="border-t border-slate-800/80 bg-slate-900/80 mt-12 py-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-cyan-300">
              <Fingerprint className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">BioPay for Web & Desktop</p>
              <p className="text-[11px] text-slate-500">Google Pay reimagined with contactless biometric scanning</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              FIDO2 Level 3 Hardware Cryptography
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-cyan-300">BioPay ID: {userBioId}</span>
          </div>
        </div>
      </footer>

      {/* MODALS (Desktop Optimized Dialogs) */}

      {/* 1. Flagship Biometric Scanner Modal */}
      <BiometricScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onSelectPayee={handleInitiatePayment}
        userBioId={userBioId}
      />

      {/* 2. Payment Modal with Biometric Authorization */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payee={selectedPayee}
        initialAmount={presetAmount}
        bankAccounts={bankAccounts}
        registeredFingers={registeredFingers}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 3. Success Receipt Modal */}
      <SuccessReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={lastTransaction}
        onOpenScratchCard={() => setRewardsOpen(true)}
        onSplitExpense={(tx) => {
          alert(`Split request generated for $${(tx.amount / 2).toFixed(2)} with contacts!`);
        }}
      />

      {/* 4. Scratch Cards & Rewards Modal */}
      <RewardsModal
        isOpen={rewardsOpen}
        onClose={() => setRewardsOpen(false)}
        scratchCards={scratchCards}
        onScratchCardCompleted={handleScratchCardCompleted}
      />

      {/* 5. Check Balance Modal */}
      <CheckBalanceModal
        isOpen={checkBalanceOpen}
        onClose={() => setCheckBalanceOpen(false)}
        bankAccounts={bankAccounts}
      />

      {/* 6. User Profile Modal */}
      <UserProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        userBioId={userBioId}
        bankAccounts={bankAccounts}
        registeredFingers={registeredFingers}
        onAddFinger={handleAddFinger}
        onDeleteFinger={handleDeleteFinger}
      />

      {/* 7. Pay Bills Modal */}
      <PayBillsModal
        isOpen={billsOpen}
        onClose={() => setBillsOpen(false)}
        bills={bills}
        onBillPaid={handleBillPaid}
      />

      {/* 8. Transaction History Modal */}
      <TransactionHistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        transactions={transactions}
        onSelectTransaction={(tx) => {
          setLastTransaction(tx);
          setReceiptOpen(true);
        }}
      />

    </div>
  );
}
