import type { Account, AccountType, Category, MonthlySummary, Transaction, TransactionType, TransferPayload, TransferResult } from './types';

type ApiEnvelope<T> = {
    data: T;
};

type ApiErrorEnvelope = {
    error: {
        code: string;
        message: string;
    };
};

export type CreateTransactionPayload = {
    accountId: string;
    categoryId: string;
    type: TransactionType;
    amount: number;
    date: string;
    note?: string;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetch(`/api${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...init?.headers,
        },
    });
    const body = await response.json() as ApiEnvelope<T> | ApiErrorEnvelope;

    if (!response.ok || 'error' in body) {
        throw new Error('error' in body ? body.error.message : 'Request failed');
    }

    return body.data;
};

export const financeApi = {
    listAccounts: () => request<Account[]>('/accounts'),
    createAccount: (payload: { name: string; type: AccountType; initialBalance: number }) => {
        return request<Account>('/accounts', { method: 'POST', body: JSON.stringify(payload) });
    },
    listCategories: () => request<Category[]>('/categories'),
    createCategory: (payload: { name: string; monthlySpendingLimit: number | null }) => {
        return request<Category>('/categories', { method: 'POST', body: JSON.stringify(payload) });
    },
    listTransactions: (accountId?: string) => {
        const query = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
        return request<Transaction[]>(`/transactions${query}`);
    },
    createTransaction: (payload: CreateTransactionPayload) => {
        return request<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(payload) });
    },
    getMonthlySummary: (accountId: string, month: string) => {
        return request<MonthlySummary>(`/summary?accountId=${encodeURIComponent(accountId)}&month=${month}`);
    },
    updateAccount: (id: string, payload: { name?: string; type?: AccountType }) => {
        return request<Account>(`/accounts/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    },
    updateCategory: (id: string, payload: { name?: string; monthlySpendingLimit?: number | null }) => {
        return request<Category>(`/categories/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
    },
    transfer: (payload: TransferPayload) => {
        return request<TransferResult>('/transactions/transfer', { method: 'POST', body: JSON.stringify(payload) });
    },
    exportTransactions: (accountId: string, from: string, to: string) => {
        const query = `accountId=${encodeURIComponent(accountId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
        return fetch(`/api/transactions/export?${query}`).then(async (res) => {
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transactions-${from}-${to}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        });
    },
};
