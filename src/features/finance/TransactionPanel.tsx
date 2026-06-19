import type { FormEvent } from 'react';
import type { CreateTransactionPayload } from './api';
import type { Account, Category, TransactionType } from './types';
import styles from './FinanceDashboard.module.scss';

type Props = {
    accounts: Account[];
    categories: Category[];
    onSubmit: (payload: CreateTransactionPayload) => Promise<void>;
};

export const TransactionPanel = ({ accounts, categories, onSubmit }: Props) => {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await onSubmit({
            accountId: String(form.get('accountId') ?? ''),
            categoryId: String(form.get('categoryId') ?? ''),
            type: String(form.get('type') ?? 'expense') as TransactionType,
            amount: Number(form.get('amount') ?? 0),
            date: String(form.get('date') ?? ''),
            note: String(form.get('note') ?? ''),
        });
        event.currentTarget.reset();
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <span>New transaction</span>
                <strong>Entry</strong>
            </div>
            <form className={styles.transactionForm} onSubmit={handleSubmit}>
                <select name="accountId" required>
                    <option value="">Account</option>
                    {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                </select>
                <select name="categoryId" required>
                    <option value="">Category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
                <select name="type" defaultValue="expense">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <input name="amount" type="number" min="0.01" step="0.01" placeholder="Amount" required />
                <input name="date" type="date" required />
                <input name="note" placeholder="Note" />
                <button type="submit">Record</button>
            </form>
        </section>
    );
};
