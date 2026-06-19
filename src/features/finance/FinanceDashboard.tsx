import { useCallback, useEffect, useMemo, useState } from 'react';
import { AccountPanel } from './AccountPanel';
import { financeApi, type CreateTransactionPayload } from './api';
import { CategoryPanel } from './CategoryPanel';
import styles from './FinanceDashboard.module.scss';
import { SummaryPanel } from './SummaryPanel';
import { TransactionList } from './TransactionList';
import { TransactionPanel } from './TransactionPanel';
import type { Account, Category, MonthlySummary, Transaction } from './types';

export const FinanceDashboard = () => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [summary, setSummary] = useState<MonthlySummary | null>(null);
    const [message, setMessage] = useState('Ready');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const month = useMemo(() => new Date().toISOString().slice(0, 7), []);

    const refresh = useCallback(async () => {
        const [nextAccounts, nextCategories, nextTransactions] = await Promise.all([
            financeApi.listAccounts(),
            financeApi.listCategories(),
            financeApi.listTransactions(),
        ]);
        setAccounts(nextAccounts);
        setCategories(nextCategories);
        setTransactions(nextTransactions);
        setSelectedAccountId((current) => current || (nextAccounts[0]?.id ?? ''));
    }, []);

    useEffect(() => {
        refresh().catch((error: Error) => setMessage(error.message));
    }, [refresh]);

    useEffect(() => {
        if (!selectedAccountId) {
            setSummary(null);
            return;
        }
        financeApi.getMonthlySummary(selectedAccountId, month)
            .then(setSummary)
            .catch((error: Error) => setMessage(error.message));
    }, [month, selectedAccountId, transactions]);

    const createTransaction = async (payload: CreateTransactionPayload) => {
        const transaction = await financeApi.createTransaction(payload);
        setMessage(transaction.warning ?? 'Transaction recorded');
        await refresh();
    };

    return (
        <main className={styles.page}>
            <header className={styles.hero}>
                <span>Finance Tracker</span>
                <h1>Track money with clarity.</h1>
                <p>Manage accounts, record activity, and catch category limits before spending drifts.</p>
            </header>
            <div className={styles.notice}>{message}</div>
            <div className={styles.toolbar}>
                <select value={selectedAccountId} onChange={(event) => setSelectedAccountId(event.target.value)}>
                    <option value="">Select account for summary</option>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
                <span>{month}</span>
            </div>
            <section className={styles.grid}>
                <AccountPanel accounts={accounts} onSubmit={async (payload) => { await financeApi.createAccount(payload); await refresh(); }} />
                <CategoryPanel categories={categories} onSubmit={async (payload) => { await financeApi.createCategory(payload); await refresh(); }} />
                <TransactionPanel accounts={accounts} categories={categories} onSubmit={createTransaction} />
                <SummaryPanel summary={summary} />
                <TransactionList accounts={accounts} categories={categories} transactions={transactions} />
            </section>
        </main>
    );
};
