import type { FormEvent } from 'react';
import type { Account, AccountType } from './types';
import { formatMoney } from './format';
import styles from './FinanceDashboard.module.scss';

type Props = {
    accounts: Account[];
    onSubmit: (payload: { name: string; type: AccountType; initialBalance: number }) => Promise<void>;
};

export const AccountPanel = ({ accounts, onSubmit }: Props) => {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        await onSubmit({
            name: String(form.get('name') ?? ''),
            type: String(form.get('type') ?? 'checking') as AccountType,
            initialBalance: Number(form.get('initialBalance') ?? 0),
        });
        event.currentTarget.reset();
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <span>Accounts</span>
                <strong>{accounts.length}</strong>
            </div>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
                <input name="name" placeholder="Account name" required />
                <select name="type" defaultValue="checking">
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="cash">Cash</option>
                </select>
                <input name="initialBalance" type="number" min="0" step="0.01" placeholder="Initial balance" />
                <button type="submit">Add account</button>
            </form>
            <div className={styles.list}>
                {accounts.map((account) => (
                    <div className={styles.listItem} key={account.id}>
                        <span>
                            <strong>{account.name}</strong>
                            <small>{account.type}</small>
                        </span>
                        <b>{formatMoney(account.balance)}</b>
                    </div>
                ))}
            </div>
        </section>
    );
};
