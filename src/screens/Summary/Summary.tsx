import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@components/Common/PageHeader';
import { StatCard } from '@components/Cards/StatCard';
import { Card } from '@components/Cards/Card';
import { financeApi } from '@features/finance/api';
import type { Account, MonthlySummary } from '@features/finance/types';
import { formatMoney } from '@features/finance/format';
import styles from './Summary.module.css';

type ExportModalProps = {
  accounts: Account[];
  selectedAccountId: string;
  selectedMonth: string;
  onExport: (accountId: string, from: string, to: string) => Promise<void>;
  onClose: () => void;
};

const ExportModal: React.FC<ExportModalProps> = ({ accounts, selectedAccountId, selectedMonth, onExport, onClose }) => {
  const [accountId, setAccountId] = useState(selectedAccountId);
  const fromDefault = selectedMonth + '-01';
  const [from, setFrom] = useState(fromDefault);
  const lastDay = new Date(parseInt(selectedMonth.slice(0, 4)), parseInt(selectedMonth.slice(5, 7)), 0).getDate();
  const toDefault = selectedMonth + '-' + String(lastDay).padStart(2, '0');
  const [to, setTo] = useState(toDefault);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    try {
      setExporting(true);
      setError('');
      await onExport(accountId, from, to);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Export Transactions</h2>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <label>Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className={styles.detailRow}>
            <label>From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className={styles.detailRow}>
            <label>To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.primaryBtn} onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting...' : 'Export to Excel'}
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Summary: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExport, setShowExport] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const nextAccounts = await financeApi.listAccounts();
      setAccounts(nextAccounts);

      const accountId = selectedAccountId || nextAccounts[0]?.id;
      if (accountId) {
        setSelectedAccountId(accountId);
        const monthlySummary = await financeApi.getMonthlySummary(accountId, selectedMonth);
        setSummary(monthlySummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId, selectedMonth]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleExport = async (accountId: string, from: string, to: string) => {
    await financeApi.exportTransactions(accountId, from, to);
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Summary"
        description="View detailed monthly financial reports and category breakdowns."
      >
        <button className={styles.primaryBtn} onClick={() => setShowExport(true)}>
          📥 Export
        </button>
      </PageHeader>

      {error && (
        <motion.div
          className={styles.error}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      {/* Filters */}
      <section className={styles.filters}>
        <Card>
          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label htmlFor="account">Account</label>
              <select
                id="account"
                value={selectedAccountId}
                onChange={(e) => handleAccountChange(e.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="month">Month</label>
              <input
                id="month"
                type="month"
                value={selectedMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </section>

      {loading ? (
        <div className={styles.loading}>
          <div className="loading-spinner"></div>
          <p>Loading summary...</p>
        </div>
      ) : summary ? (
        <>
          {/* Summary Stats */}
          <section className={styles.statsGrid}>
            <StatCard
              icon="📈"
              label="Income"
              value={formatMoney(summary.totalIncome)}
              type="success"
              index={0}
            />
            <StatCard
              icon="📉"
              label="Expenses"
              value={formatMoney(summary.totalExpenses)}
              type="warning"
              index={1}
            />
            <StatCard
              icon="↔"
              label="Transfers In"
              value={formatMoney(summary.totalTransferIn)}
              type="success"
              index={2}
            />
            <StatCard
              icon="↔"
              label="Transfers Out"
              value={formatMoney(summary.totalTransferOut)}
              type="warning"
              index={3}
            />
            <StatCard
              icon="💚"
              label="Net Balance"
              value={formatMoney(summary.netBalance)}
              type={summary.netBalance >= 0 ? 'success' : 'error'}
              index={4}
            />
          </section>

          {/* Category Breakdown */}
          <section className={styles.content}>
            <h2>Category Breakdown</h2>
            {summary.spendingByCategory.length > 0 ? (
              <div className={styles.categoriesList}>
                {summary.spendingByCategory.map((category, index) => {
                  const isOverLimit =
                    category.monthlySpendingLimit &&
                    category.spent > category.monthlySpendingLimit;

                  return (
                    <motion.div
                      key={category.categoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={isOverLimit ? styles.limitExceeded : ''}>
                        <div className={styles.categoryItem}>
                          <div className={styles.categoryInfo}>
                            <h4>{category.categoryName}</h4>
                            <p className={styles.spent}>
                              Spent: <strong>{formatMoney(category.spent)}</strong>
                            </p>
                            {category.monthlySpendingLimit && (
                              <p className={styles.limit}>
                                Limit: {formatMoney(category.monthlySpendingLimit)}
                              </p>
                            )}
                          </div>

                          <div className={styles.progressSection}>
                            {category.monthlySpendingLimit && (
                              <>
                                <div className={styles.progressBar}>
                                  <motion.div
                                    className={`${styles.progressFill} ${isOverLimit ? styles.exceeded : ''}`}
                                    initial={{ width: 0 }}
                                    animate={{
                                      width: `${Math.min(
                                        100,
                                        (category.progress || 0) * 100
                                      )}%`,
                                    }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                  />
                                </div>
                                <p className={styles.percentage}>
                                  {((category.progress || 0) * 100).toFixed(0)}%
                                </p>
                              </>
                            )}
                          </div>

                          {isOverLimit && (
                            <motion.div
                              className={styles.warning}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              ⚠️ Over limit by {formatMoney(
                                category.spent - (category.monthlySpendingLimit || 0)
                              )}
                            </motion.div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <Card>
                <div className="empty-state">
                  <p>No spending data for this month.</p>
                </div>
              </Card>
            )}
          </section>
        </>
      ) : (
        <Card>
          <div className="empty-state">
            <p>Select an account to view summary.</p>
          </div>
        </Card>
      )}

      <AnimatePresence>
        {showExport && (
          <ExportModal
            accounts={accounts}
            selectedAccountId={selectedAccountId}
            selectedMonth={selectedMonth}
            onExport={handleExport}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Summary;
