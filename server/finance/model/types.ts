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

export type CreateAccountInput = {
    name: string;
    type: AccountType;
    initialBalance?: number;
};

export type CreateCategoryInput = {
    name: string;
    monthlySpendingLimit?: number | null;
};

export type CreateTransactionInput = {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note?: string | null;
};

export type TransferInput = {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    date: string;
    note?: string | null;
};

export type UpdateAccountInput = {
    name?: string;
    type?: AccountType;
};

export type UpdateCategoryInput = {
    name?: string;
    monthlySpendingLimit?: number | null;
};

export type CategorySpendingSummary = {
    categoryId: string;
    categoryName: string;
    spent: number;
    monthlySpendingLimit: number | null;
    progress: number | null;
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
