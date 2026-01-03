
export interface Partner {
  id: string;
  name: string;
  email: string;
  splitPercentage: number;
  profitTaken: number; // Manual adjustments/withdrawals
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  purchasePrice: number;
  sellingPrice: number;
  expenses: Expense[];
  soldById: string;
  soldAt: string | null; // ISO Date
  isSold: boolean;
  notes: string;
  paidPartnerIds: string[]; // Track which partners have been paid for this specific car
}

export interface ProfitStats {
  totalRevenue: number;
  totalExpenses: number;
  totalGrossProfit: number;
  netProfit: number;
  profitByPartner: Record<string, number>;
  withdrawnByPartner: Record<string, number>; // New: track payouts per individual
  totalWithdrawn: number; 
}
