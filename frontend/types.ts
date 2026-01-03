
export interface Partner {
  id: string;
  name: string;
  email: string;
  splitPercentage: number;
  profitTaken: number;
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
  soldAt: string | null;
  isSold: boolean;
  notes: string;
  paidPartnerIds: string[];
}

export interface ProfitStats {
  totalRevenue: number;
  totalExpenses: number;
  totalGrossProfit: number;
  netProfit: number;
  profitByPartner: Record<string, number>;
  withdrawnByPartner: Record<string, number>;
  totalWithdrawn: number; 
}
