export interface Contact {
  id: string;
  name: string;
  phone: string;
  bioId: string;
  avatar: string;
  isMerchant?: boolean;
  category?: string;
  verified?: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING' | 'CREDIT';
  balance: number;
  logo: string;
  isPrimary: boolean;
  color: string;
}

export interface Transaction {
  id: string;
  recipientName: string;
  recipientBioId: string;
  recipientAvatar: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  date: string;
  note?: string;
  category: 'TRANSFER' | 'MERCHANT' | 'BILL' | 'RECHARGE' | 'REWARD';
  utrNumber: string;
  biometricHash: string;
  fingerUsed: string;
  bankName: string;
}

export interface ScratchCard {
  id: string;
  title: string;
  subtitle: string;
  rewardType: 'CASHBACK' | 'VOUCHER' | 'BETTER_LUCK';
  amount?: number;
  code?: string;
  merchant?: string;
  isScratched: boolean;
  bgGradient: string;
}

export interface BillItem {
  id: string;
  name: string;
  category: string;
  iconName: string;
  biller: string;
  dueAmount: number;
  dueDate: string;
}

export interface RegisteredFinger {
  id: string;
  name: string;
  fingerType: 'RIGHT_THUMB' | 'LEFT_THUMB' | 'RIGHT_INDEX' | 'LEFT_INDEX';
  registeredDate: string;
  fingerprintHash: string;
  quality: number;
}
