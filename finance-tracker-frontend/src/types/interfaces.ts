// Account interface
export interface Account {
  id: string;
  name: string;
  bankName: string;
  balance?: number;
  // You might want to add these based on your database schema
  type?: string;
  currency?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  color?: string;
  type?: 'income' | 'expense'; // Add if you have category types
  parentId?: string | null; // For subcategories
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transaction interface
export interface Transaction {
  id: string;
  date: Date;
  description: string | null;
  account_id: string;
  category_id: string;
  amount: number;
  // You might want to add these based on your database schema
  type?: 'income' | 'expense';
  status?: 'pending' | 'completed' | 'cancelled';
  reference?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

// User interface
export interface User {
  id: string;
  phone: string;
  email: string;
  full_name: string;
  profession: string;
  profile_complete: boolean;
  created_at: string;
  // You might want to add these
  avatar?: string | null;
  date_of_birth?: string | null;
  preferences?: Record<string, any>;
  last_login?: Date;
  updated_at?: Date;
}

// Profile payload interface
export interface ProfilePayload {
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  profile_complete: boolean;
  // Optional fields that might be included
  avatar?: string | null;
  date_of_birth?: string | null;
}

// Bank card props interface
export interface BankCardProps {
  bankName: string;
  cardNumber: string;
  balance?: number;
  // Additional props you might need
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  type?: 'credit' | 'debit';
  currency?: string;
}

// Additional types you might find useful

// For API responses
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// For paginated responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// For financial filters
export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  accountId?: string;
  categoryId?: string;
  type?: 'income' | 'expense';
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

// For chart data
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

// For analytics
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  totalBalance: number;
  byCategory: Record<string, number>;
  byAccount: Record<string, number>;
  byMonth: Record<string, { income: number; expenses: number }>;
}

// For chart data
export interface ChartDataInput {
  [key: string]: string | number | undefined; // Index signature
  name: string;
  value: number;
  color?: string;
}

// For category analysis
export interface CategoryAnalysis {
  [key: string]: string | number | undefined; // Index signature
  id: string;
  name: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
  color?: string;
}

// For account analysis
export interface AccountAnalysis {
  [key: string]: string | number | undefined;
  id: string;
  name: string;
  bankName: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
  currentBalance: number;
}

// For monthly data
export interface MonthlyData {
  [key: string]: string | number;
  month: string;
  income: number;
  expenses: number;
}