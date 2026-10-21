import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Fingerprint, 
  ShieldCheck, 
  Receipt,
  Filter
} from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');

  if (!isOpen) return null;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipientBioId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.utrNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'ALL' || tx.type === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col">
        
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 z-10">
          <div className="flex items-center space-x-2">
            <Receipt className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">Biometric Transaction History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 bg-slate-900 border-b border-slate-800 space-y-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, Bio-ID, note or UTR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'DEBIT', 'CREDIT'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`py-1 px-3 rounded-lg font-medium transition-colors ${
                  filter === mode 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' ? 'All Payments' : mode === 'DEBIT' ? 'Paid' : 'Received'}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No transactions found matching your criteria.
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => {
                  onSelectTransaction(tx);
                }}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700/50 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
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
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {tx.recipientName}
                    </h5>
                    <p className="text-[10px] text-slate-400">{tx.date}</p>
                    <p className="text-[10px] text-cyan-300 font-mono flex items-center gap-1 mt-0.5">
                      <Fingerprint className="w-3 h-3" />
                      {tx.fingerUsed}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-xs font-bold ${
                    tx.type === 'DEBIT' ? 'text-white' : 'text-emerald-400'
                  }`}>
                    {tx.type === 'DEBIT' ? `-$${tx.amount.toFixed(2)}` : `+$${tx.amount.toFixed(2)}`}
                  </p>
                  <span className="text-[9px] uppercase font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
