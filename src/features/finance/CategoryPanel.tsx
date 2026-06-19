import type { FormEvent } from 'react';
import type { Category } from './types';
import { formatMoney } from './format';
import styles from './FinanceDashboard.module.scss';

type Props = {
    categories: Category[];
    onSubmit: (payload: { name: string; monthlySpendingLimit: number | null }) => Promise<void>;
};

export const CategoryPanel = ({ categories, onSubmit }: Props) => {
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const limit = String(form.get('monthlySpendingLimit') ?? '');
        await onSubmit({
            name: String(form.get('name') ?? ''),
            monthlySpendingLimit: limit ? Number(limit) : null,
        });
        event.currentTarget.reset();
    };

    return (
        <section className={styles.panel}>
            <div className={styles.panelHeader}>
                <span>Categories</span>
                <strong>{categories.length}</strong>
            </div>
            <form className={styles.formGrid} onSubmit={handleSubmit}>
                <input name="name" placeholder="Category name" required />
                <input name="monthlySpendingLimit" type="number" min="0" step="0.01" placeholder="Monthly limit" />
                <button type="submit">Add category</button>
            </form>
            <div className={styles.list}>
                {categories.map((category) => (
                    <div className={styles.listItem} key={category.id}>
                        <strong>{category.name}</strong>
                        <small>{category.monthlySpendingLimit === null ? 'No limit' : formatMoney(category.monthlySpendingLimit)}</small>
                    </div>
                ))}
            </div>
        </section>
    );
};
