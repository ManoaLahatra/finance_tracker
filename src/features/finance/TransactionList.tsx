import type { Account, Category, Transaction } from './types';
import { formatMoney } from './format';
import styles from './FinanceDashboard.module.scss';

type Props = {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
};

export const TransactionList = ({ accounts, categories, transactions }: Props) => {
    const accountName = (id: string) => accounts.find((account) => account.id === id)?.name ?? 'Unknown';
    const categoryName = (id: string) => categories.find((category) => category.id === id)?.name ?? 'Uncategorized';

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <span>Recent activity</span>
                <strong>{transactions.length}</strong>
            </div>
            <div className={styles.table}>
                {transactions.map((transaction) => (
                    <div className={styles.transactionRow} key={transaction.id}>
                        <span>
                            <strong>{categoryName(transaction.categoryId)}</strong>
                            <small>{accountName(transaction.accountId)} · {transaction.date}</small>
                            {transaction.warning && <em>{transaction.warning}</em>}
                        </span>
                        <b className={transaction.type === 'income' ? styles.income : styles.expense}>
                            {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                        </b>
                    </div>
                ))}
            </div>
        </section>
    );
};
