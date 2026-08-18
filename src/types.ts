export type AccountType = 'PF' | 'PJ' | 'CONSOLIDADO';

export type TransactionNature = 'RECEITA' | 'DESPESA';

export type PaymentMethod = 'PIX' | 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'TRANSFERENCIA';

export interface Category {
  id: string;
  name: string;
  accountType: 'PF' | 'PJ';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  accountType: 'PF' | 'PJ';
  type: TransactionNature;
  category: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  odometerKm?: number; // Optional KM if it was a fuel/maintenance entry
  createdAt: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  category: string;
  type: 'KM' | 'DATE' | 'BOTH';
  lastKm: number;
  intervalKm: number;
  lastDate: string; // YYYY-MM-DD
  intervalDays: number;
  estimatedCost?: number;
  notes?: string;
}

export interface UserProfile {
  id?: string;
  username: string;
  password: string;
  name: string;
  occupation: string;
  motoModel: string;
  motoPlate?: string;
  currentOdometer: number;
  monthlyRevenueGoal: number;
  isDarkMode: boolean;
  createdAt?: string;
}

export type PeriodFilterType = 'CURRENT_MONTH' | 'PREVIOUS_MONTH' | 'LAST_7_DAYS' | 'CURRENT_YEAR' | 'CUSTOM';

export interface DateFilter {
  type: PeriodFilterType;
  startDate?: string;
  endDate?: string;
}
