export type AccountType = 'checking' | 'savings' | 'cash';

export type TransactionType = 'income' | 'expense';

export type Account = {
    id: string;
    name: string;
    type: AccountType;
    balance: number;
    createdAt: string;
};

export type Category = {
    id: string;
    name: string;
    monthlySpendingLimit: number | null;
    createdAt: string;
};

export type Transaction = {
    id: string;
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note: string | null;
    warning: string | null;
    createdAt: string;
};

export type MonthlySummary = {
    accountId: string;
    month: string;
    totalIncome: number;
    totalExpenses: number;
    totalTransferIn: number;
    totalTransferOut: number;
    netBalance: number;
    spendingByCategory: CategorySpendingSummary[];
};

export type CategorySpendingSummary = {
    categoryId: string;
    categoryName: string;
    spent: number;
    monthlySpendingLimit: number | null;
    progress: number | null;
};

export type TransferPayload = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    note?: string;
};

export type TransferResult = {
    fromTransaction: Transaction;
    toTransaction: Transaction;
};
