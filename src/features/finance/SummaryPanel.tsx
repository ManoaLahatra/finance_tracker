import type { MonthlySummary } from './types';
import { formatMoney, formatPercent } from './format';
import styles from './FinanceDashboard.module.scss';

type Props = {
    summary: MonthlySummary | null;
};

export const SummaryPanel = ({ summary }: Props) => {
    if (!summary) {
        return (
            <section className={styles.panel}>
                <div className={styles.emptyState}>Choose an account and month to review spending.</div>
            </section>
        );
    }

    return (
        <section className={styles.panel}>
            <div className={styles.metricGrid}>
                <Metric label="Income" value={formatMoney(summary.totalIncome)} tone="good" />
                <Metric label="Expenses" value={formatMoney(summary.totalExpenses)} tone="warn" />
                <Metric label="Net" value={formatMoney(summary.netBalance)} tone="neutral" />
            </div>
            <div className={styles.progressList}>
                {summary.spendingByCategory.map((category) => (
                    <div className={styles.progressItem} key={category.categoryId}>
                        <span>{category.categoryName}</span>
                        <b>{formatMoney(category.spent)} · {formatPercent(category.progress)}</b>
                        <div>
                            <i style={{ width: `${Math.min((category.progress ?? 0) * 100, 100)}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone: string }) => (
    <div className={`${styles.metric} ${styles[tone]}`}>
        <span>{label}</span>
        <strong>{value}</strong>
    </div>
);
