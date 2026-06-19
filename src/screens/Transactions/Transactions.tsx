import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@components/Common/PageHeader';
import { Card } from '@components/Cards/Card';
import { financeApi, type CreateTransactionPayload } from '@features/finance/api';
import type { Account, Category, Transaction, TransactionType } from '@features/finance/types';
import { formatMoney } from '@features/finance/format';
import styles from './Transactions.module.css';

/* ─── Transaction Detail Modal (read-only) ─── */
type TxnDetailProps = {
  transaction: Transaction;
  accountName: string;
  categoryName: string;
  onClose: () => void;
};

const TransactionDetailModal: React.FC<TxnDetailProps> = ({ transaction, accountName, categoryName, onClose }) => (
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
      <h2>Transaction Details</h2>
      <div className={styles.modalBody}>
        <div className={styles.detailRow}>
          <label>Type</label>
          <span className={styles.detailValue}>{transaction.type === 'income' ? 'Income' : 'Expense'}</span>
        </div>
        <div className={styles.detailRow}>
          <label>Amount</label>
          <span className={`${styles.detailValue} ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
            {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <label>Category</label>
          <span className={styles.detailValue}>{categoryName}</span>
        </div>
        <div className={styles.detailRow}>
          <label>Account</label>
          <span className={styles.detailValue}>{accountName}</span>
        </div>
        <div className={styles.detailRow}>
          <label>Date</label>
          <span className={styles.detailValue}>{new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
        </div>
        {transaction.note && (
          <div className={styles.detailRow}>
            <label>Note</label>
            <span className={styles.detailValue}>{transaction.note}</span>
          </div>
        )}
        {transaction.warning && (
          <div className={styles.detailRow}>
            <label>Warning</label>
            <span className={styles.warningText}>⚠️ {transaction.warning}</span>
          </div>
        )}
        <div className={styles.detailRow}>
          <label>Recorded At</label>
          <span className={styles.detailValue}>{new Date(transaction.createdAt).toLocaleString()}</span>
        </div>
      </div>
      <div className={styles.modalActions}>
        <button className={styles.primaryBtn} onClick={onClose}>Close</button>
      </div>
    </motion.div>
  </motion.div>
);

/* ─── Transfer Form Modal ─── */
type TransferFormProps = {
  accounts: Account[];
  onTransfer: (payload: { fromAccountId: string; toAccountId: string; amount: number; date: string; note?: string }) => Promise<void>;
  onClose: () => void;
};

const TransferModal: React.FC<TransferFormProps> = ({ accounts, onTransfer, onClose }) => {
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fromAccount = useMemo(() => accounts.find(a => a.id === fromId), [accounts, fromId]);
  const previewAmount = parseFloat(amount) || 0;
  const projectedBalance = fromAccount && previewAmount > 0 ? fromAccount.balance - previewAmount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromId === toId) {
      setError('Cannot transfer to the same account');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await onTransfer({ fromAccountId: fromId, toAccountId: toId, amount: Number(amount), date, note: note || undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setSaving(false);
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
        <h2>Transfer Money</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.detailRow}>
              <label>From Account</label>
              <select value={fromId} onChange={(e) => setFromId(e.target.value)} required>
                <option value="">Select source account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatMoney(a.balance)}</option>)}
              </select>
            </div>
            <div className={styles.detailRow}>
              <label>To Account</label>
              <select value={toId} onChange={(e) => setToId(e.target.value)} required>
                <option value="">Select destination account</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name} — {formatMoney(a.balance)}</option>)}
              </select>
            </div>
            <div className={styles.detailRow}>
              <label>Amount</label>
              <input type="number" min="0.01" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>
            {projectedBalance !== null && (
              <div className={styles.balancePreview}>
                <span>Balance after: <strong className={projectedBalance < 0 ? styles.previewNegative : ''}>{formatMoney(projectedBalance)}</strong></span>
              </div>
            )}
            <div className={styles.detailRow}>
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className={styles.detailRow}>
              <label>Note (optional)</label>
              <input type="text" placeholder="Transfer note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            {error && <p className={styles.errorText}>{error}</p>}
          </div>
          <div className={styles.modalActions}>
            <button type="submit" className={styles.primaryBtn} disabled={saving}>
              {saving ? 'Processing...' : 'Transfer'}
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

/* ─── Export Modal ─── */
type ExportModalProps = {
  accounts: Account[];
  onExport: (accountId: string, from: string, to: string) => Promise<void>;
  onClose: () => void;
};

const ExportModal: React.FC<ExportModalProps> = ({ accounts, onExport, onClose }) => {
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
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

/* ─── Main Transactions Page ─── */
export const Transactions: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);
  const [formAccountId, setFormAccountId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<TransactionType>('expense');

  const refresh = useCallback(async () => {
    try {
      const [nextAccounts, nextCategories, nextTransactions] = await Promise.all([
        financeApi.listAccounts(),
        financeApi.listCategories(),
        financeApi.listTransactions(),
      ]);
      setAccounts(nextAccounts);
      setCategories(nextCategories);
      setTransactions(nextTransactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    try {
      const form = new FormData(formEl);
      const payload: CreateTransactionPayload = {
        accountId: String(form.get('accountId') ?? ''),
        categoryId: String(form.get('categoryId') ?? ''),
        type: String(form.get('type') ?? 'expense') as TransactionType,
        amount: Number(form.get('amount') ?? 0),
        date: String(form.get('date') ?? ''),
        note: String(form.get('note') ?? '') || undefined,
      };
      await financeApi.createTransaction(payload);
      formEl.reset();
      setShowForm(false);
      setFormAccountId('');
      setFormAmount('');
      setFormType('expense');
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const handleTransfer = async (payload: { fromAccountId: string; toAccountId: string; amount: number; date: string; note?: string }) => {
    await financeApi.transfer(payload);
    await refresh();
  };

  const handleExport = async (accountId: string, from: string, to: string) => {
    await financeApi.exportTransactions(accountId, from, to);
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown';
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || (id === 'transfer' ? 'Transfer' : 'Unknown');

  const selectedAccount = useMemo(() => accounts.find(a => a.id === formAccountId), [accounts, formAccountId]);
  const previewAmount = parseFloat(formAmount) || 0;
  const projectedBalance = useMemo(() => {
    if (!selectedAccount || previewAmount <= 0) return null;
    return formType === 'income'
      ? selectedAccount.balance + previewAmount
      : selectedAccount.balance - previewAmount;
  }, [selectedAccount, previewAmount, formType]);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Transactions"
        description="Record and view all your financial transactions."
      >
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={() => setShowTransfer(true)}>
            ↔ Transfer
          </button>
          <button className={styles.secondaryBtn} onClick={() => setShowExport(true)}>
            📥 Export
          </button>
          <button className={styles.primaryBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Close' : '+ New Transaction'}
          </button>
        </div>
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

      {/* New Transaction Form */}
      {showForm && (
        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3>Record Transaction</h3>
              <div className={styles.formRow}>
                <select name="accountId" required value={formAccountId} onChange={e => setFormAccountId(e.target.value)}>
                  <option value="">Select Account</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} — {formatMoney(acc.balance)}</option>
                  ))}
                </select>
                <select name="categoryId" required>
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <select name="type" value={formType} onChange={e => setFormType(e.target.value as TransactionType)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className={styles.formRow}>
                <input type="number" name="amount" placeholder="Amount" min="0.01" step="0.01" required value={formAmount} onChange={e => setFormAmount(e.target.value)} />
                <input type="date" name="date" required />
              </div>
              {selectedAccount && (
                <div className={styles.balancePreview}>
                  <span>Current balance: <strong>{formatMoney(selectedAccount.balance)}</strong></span>
                  {projectedBalance !== null && (
                    <span className={projectedBalance < 0 ? styles.previewNegative : styles.previewPositive}>
                      → After: <strong>{formatMoney(projectedBalance)}</strong>
                    </span>
                  )}
                </div>
              )}
              <input type="text" name="note" placeholder="Note (optional)" />
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn}>Record Transaction</button>
                <button type="button" className={styles.secondaryBtn} onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <section className={styles.stats}>
        <Card>
          <div className={styles.stat}>
            <p>Total Transactions</p>
            <h2>{transactions.length}</h2>
          </div>
        </Card>
      </section>

      {/* Transactions List */}
      <section className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className="loading-spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className={styles.transactionsList}>
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <div onClick={() => setDetailTxn(transaction)} style={{ cursor: 'pointer' }}>
                  <Card>
                    <div className={styles.transactionItem}>
                      <div className={styles.transactionIcon}>
                        {transaction.type === 'income' ? '📥' : '📤'}
                      </div>
                      <div className={styles.transactionInfo}>
                        <h4>{getCategoryName(transaction.categoryId)}</h4>
                        <p className={styles.account}>{getAccountName(transaction.accountId)}</p>
                        {transaction.note && <small className={styles.note}>{transaction.note}</small>}
                        <small className={styles.date}>
                          {new Date(transaction.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </small>
                      </div>
                      <div className={styles.transactionAmount}>
                        <p className={`${styles.amount} ${transaction.type === 'income' ? 'text-income' : 'text-expense'}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatMoney(transaction.amount)}
                        </p>
                        {transaction.warning && (
                          <small className={styles.warning}>⚠️ {transaction.warning}</small>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="empty-state">
              <p>No transactions yet. Record your first transaction!</p>
            </div>
          </Card>
        )}
      </section>

      <AnimatePresence>
        {detailTxn && (
          <TransactionDetailModal
            transaction={detailTxn}
            accountName={getAccountName(detailTxn.accountId)}
            categoryName={getCategoryName(detailTxn.categoryId)}
            onClose={() => setDetailTxn(null)}
          />
        )}
        {showTransfer && (
          <TransferModal
            accounts={accounts}
            onTransfer={handleTransfer}
            onClose={() => setShowTransfer(false)}
          />
        )}
        {showExport && (
          <ExportModal
            accounts={accounts}
            onExport={handleExport}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Transactions;
