import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@components/Common/PageHeader';
import { Card } from '@components/Cards/Card';
import { financeApi } from '@features/finance/api';
import type { Account, AccountType } from '@features/finance/types';
import { formatMoney } from '@features/finance/format';
import styles from './Accounts.module.css';

type DetailModalProps = {
  account: Account;
  onClose: () => void;
  onSave: (id: string, data: { name?: string; type?: AccountType }) => Promise<void>;
};

const AccountDetailModal: React.FC<DetailModalProps> = ({ account, onClose, onSave }) => {
  const [name, setName] = useState(account.name);
  const [type, setType] = useState<AccountType>(account.type);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload: { name?: string; type?: AccountType } = {};
      if (name !== account.name) payload.name = name;
      if (type !== account.type) payload.type = type;
      if (Object.keys(payload).length > 0) {
        await onSave(account.id, payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
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
        <h2>Account Details</h2>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.detailRow}>
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="cash">Cash</option>
            </select>
          </div>
          <div className={styles.detailRow}>
            <label>Balance</label>
            <span className={styles.detailValue}>{formatMoney(account.balance)}</span>
          </div>
          <div className={styles.detailRow}>
            <label>Created</label>
            <span className={styles.detailValue}>{new Date(account.createdAt).toLocaleString()}</span>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
        </div>
        <div className={styles.modalActions}>
          <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailAccount, setDetailAccount] = useState<Account | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextAccounts = await financeApi.listAccounts();
      setAccounts(nextAccounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
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
      await financeApi.createAccount({
        name: String(form.get('name') ?? ''),
        type: String(form.get('type') ?? 'checking') as AccountType,
        initialBalance: Number(form.get('initialBalance') ?? 0),
      });
      formEl.reset();
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; type?: AccountType }) => {
    await financeApi.updateAccount(id, data);
    await refresh();
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className={styles.container}>
      <PageHeader
        title="Accounts"
        description="Manage all your financial accounts in one place."
      >
        <button
          className={styles.primaryBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ New Account'}
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

      {/* New Account Form */}
      {showForm && (
        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3>Create New Account</h3>
              <input type="text" name="name" placeholder="Account name" required />
              <select name="type" defaultValue="checking">
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
                <option value="cash">Cash</option>
              </select>
              <input type="number" name="initialBalance" placeholder="Initial balance" min="0" step="0.01" required />
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn}>Create Account</button>
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
            <p>Total Balance</p>
            <h2>{formatMoney(totalBalance)}</h2>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <p>Number of Accounts</p>
            <h2>{accounts.length}</h2>
          </div>
        </Card>
      </section>

      {/* Accounts List */}
      <section className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className="loading-spinner"></div>
            <p>Loading accounts...</p>
          </div>
        ) : accounts.length > 0 ? (
          <div className={styles.accountsList}>
            {accounts.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div onClick={() => setDetailAccount(account)} style={{ cursor: 'pointer' }}>
                  <Card>
                    <div className={styles.accountItem}>
                      <div className={styles.accountInfo}>
                        <div>
                          <h3>{account.name}</h3>
                          <p className={styles.type}>{account.type}</p>
                        </div>
                        <small className={styles.date}>
                          Created {new Date(account.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className={styles.accountBalance}>
                        <p className={styles.balanceLabel}>Balance</p>
                        <h2 className={styles.balanceValue}>{formatMoney(account.balance)}</h2>
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
              <p>No accounts yet. Create your first account to get started!</p>
            </div>
          </Card>
        )}
      </section>

      <AnimatePresence>
        {detailAccount && (
          <AccountDetailModal
            account={detailAccount}
            onClose={() => setDetailAccount(null)}
            onSave={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Accounts;
