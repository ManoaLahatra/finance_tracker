import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@components/Common/PageHeader';
import { StatCard } from '@components/Cards/StatCard';
import { Card } from '@components/Cards/Card';
import { financeApi } from '@features/finance/api';
import type { Account, Transaction, MonthlySummary, Category } from '@features/finance/types';
import { formatMoney } from '@features/finance/format';
import styles from './Dashboard.module.css';

type QuickTransferModalProps = {
  accounts: Account[];
  onTransfer: (payload: { fromAccountId: string; toAccountId: string; amount: number; date: string; note?: string }) => Promise<void>;
  onClose: () => void;
};

const QuickTransferModal: React.FC<QuickTransferModalProps> = ({ accounts, onTransfer, onClose }) => {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const date = new Date().toISOString().slice(0, 10);

  const fromAccount = accounts.find(a => a.id === fromId);
  const previewAmount = parseFloat(amount) || 0;
  const projectedBalance = fromAccount && previewAmount > 0 ? fromAccount.balance - previewAmount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === toId) { setError('Cannot transfer to the same account'); return; }
    try {
      setSaving(true);
      setError('');
      await onTransfer({ fromAccountId: fromId, toAccountId: toId, amount: Number(amount), date });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className={styles.modal} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()}>
        <h2>Quick Transfer</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.detailRow}>
              <label>From</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)} required>
                <option value="">Select source</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatMoney(a.balance)}</option>)}
              </select>
            </div>
            <div className={styles.detailRow}>
              <label>To</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)} required>
                <option value="">Select destination</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatMoney(a.balance)}</option>)}
              </select>
            </div>
            <div className={styles.detailRow}>
              <label>Amount</label>
              <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            {projectedBalance !== null && (
              <div className={styles.transferPreview}>
                {fromAccount?.name} balance after: <strong className={projectedBalance < 0 ? styles.negative : styles.positive}>{formatMoney(projectedBalance)}</strong>
              </div>
            )}
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>{saving ? 'Processing...' : 'Transfer'}</button>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export const Dashboard: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);

  const month = new Date().toISOString().slice(0, 7);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [nextAccounts, nextCategories, nextTransactions] = await Promise.all([
        financeApi.listAccounts(),
        financeApi.listCategories(),
        financeApi.listTransactions(),
      ]);
      setAccounts(nextAccounts);
      setCategories(nextCategories);
      setTransactions(nextTransactions);
      if (!selectedAccountId && nextAccounts.length > 0) {
        setSelectedAccountId(nextAccounts[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedAccountId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedAccountId) {
      setSummary(null);
      return;
    }
    financeApi.getMonthlySummary(selectedAccountId, month)
      .then(setSummary)
      .catch(() => {});
  }, [selectedAccountId, month]);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const transferCategoryId = categories.find(c => c.name === 'Transfer')?.id;
  const transferTxns = transactions.filter(t => transferCategoryId && t.categoryId === transferCategoryId).slice(0, 5);
  const recentTransactions = transactions.filter(t => !transferCategoryId || t.categoryId !== transferCategoryId).slice(0, 5);

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name ?? 'Unknown';
  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name ?? 'Unknown';
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleTransfer = async (payload: { fromAccountId: string; toAccountId: string; amount: number; date: string; note?: string }) => {
    await financeApi.transfer(payload);
    await refresh();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />
        <div className={styles.loading}>
          <div className="loading-spinner"></div>
          <p>Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <PageHeader title="Dashboard" description="Welcome back! Here's your financial overview." />

      {error && (
        <motion.div className={styles.error} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          ⚠️ {error}
        </motion.div>
      )}

      {/* Account Selector + Quick Actions */}
      <section className={styles.actionBar}>
        <div className={styles.filterBar}>
          <label htmlFor="account-select">Monitor:</label>
          <select id="account-select" value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)}>
            <option value="">All accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>{account.name} ({formatMoney(account.balance)})</option>
            ))}
          </select>
        </div>
        <button className={styles.transferBtn} onClick={() => setShowTransfer(true)}>
          ↔ Quick Transfer
        </button>
      </section>

      {/* Stats Grid */}
      <section className={styles.statsGrid}>
        <StatCard icon="💰" label="Total Balance" value={formatMoney(totalBalance)} type="default" index={0} />
        <StatCard icon="📈" label="Income" value={formatMoney(summary?.totalIncome ?? 0)} type="success" index={1} />
        <StatCard icon="📉" label="Expenses" value={formatMoney(summary?.totalExpenses ?? 0)} type="warning" index={2} />
        <StatCard icon="↔" label="Transfers (net)" value={formatMoney((summary?.totalTransferIn ?? 0) - (summary?.totalTransferOut ?? 0))} type="default" index={3} />
      </section>

      <div className={styles.grid}>
        {/* Accounts Grid */}
        <section className={styles.section}>
          <h2>Your Accounts</h2>
          {accounts.length > 0 ? (
            <div className={styles.accountsGrid}>
              {accounts.map((account, index) => (
                <motion.div key={account.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                  <Card>
                    <div className={styles.accountCard}>
                      <div>
                        <p className={styles.accountType}>{account.type}</p>
                        <h3>{account.name}</h3>
                      </div>
                      <p className={styles.balance}>{formatMoney(account.balance)}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No accounts yet. Create your first account to get started!</p></div>
          )}
        </section>

        {/* Recent Activity */}
        <section className={styles.section}>
          <h2>Recent Activity</h2>
          {recentTransactions.length > 0 ? (
            <div className={styles.transactionsList}>
              {recentTransactions.map((transaction, index) => (
                <motion.div key={transaction.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card>
                    <div className={styles.transactionRow}>
                      <div>
                        <p className={styles.transactionCategory}>
                          {transaction.type === 'income' ? '📥' : '📤'} {getCategoryName(transaction.categoryId)}
                        </p>
                        <small>{formatDate(transaction.date)} · {getAccountName(transaction.accountId)}</small>
                        {transaction.note && <small className={styles.note}>{transaction.note}</small>}
                      </div>
                      <p className={`${styles.transactionAmount} ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>No transactions yet.</p></div>
          )}

          {/* Recent Transfers */}
          {transferTxns.length > 0 && (
            <>
              <h3 className={styles.subheading}>Recent Transfers</h3>
              <div className={styles.transactionsList}>
                {transferTxns.slice(0, 4).map((txn, index) => {
                  const isOut = txn.type === 'expense';
                  return (
                    <motion.div key={txn.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
                      <Card>
                        <div className={styles.transactionRow}>
                          <div>
                            <p className={styles.transactionCategory}>↔ Transfer</p>
                            <small>{formatDate(txn.date)} · {getAccountName(txn.accountId)}</small>
                            {txn.note && <small className={styles.note}>{txn.note}</small>}
                          </div>
                          <p className={`${styles.transactionAmount} ${isOut ? 'text-expense' : 'text-income'}`}>
                            {isOut ? '-' : '+'}{formatMoney(txn.amount)}
                          </p>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showTransfer && (
          <QuickTransferModal accounts={accounts} onTransfer={handleTransfer} onClose={() => setShowTransfer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
