import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@components/Common/PageHeader';
import { Card } from '@components/Cards/Card';
import { financeApi } from '@features/finance/api';
import type { Category } from '@features/finance/types';
import { formatMoney } from '@features/finance/format';
import styles from './Categories.module.css';

type DetailModalProps = {
  category: Category;
  onClose: () => void;
  onSave: (id: string, data: { name?: string; monthlySpendingLimit?: number | null }) => Promise<void>;
};

const CategoryDetailModal: React.FC<DetailModalProps> = ({ category, onClose, onSave }) => {
  const [name, setName] = useState(category.name);
  const [limit, setLimit] = useState(category.monthlySpendingLimit?.toString() ?? '');
  const [hasLimit, setHasLimit] = useState(category.monthlySpendingLimit !== null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const payload: { name?: string; monthlySpendingLimit?: number | null } = {};
      if (name !== category.name) payload.name = name;
      const newLimit = hasLimit ? (limit ? Number(limit) : null) : null;
      if (newLimit !== category.monthlySpendingLimit) payload.monthlySpendingLimit = newLimit;
      if (Object.keys(payload).length > 0) {
        await onSave(category.id, payload);
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
        <h2>Category Details</h2>
        <div className={styles.modalBody}>
          <div className={styles.detailRow}>
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className={styles.detailRow}>
            <label>Spending Limit</label>
            <div className={styles.limitToggle}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={hasLimit} onChange={(e) => setHasLimit(e.target.checked)} />
                Enable limit
              </label>
            </div>
            {hasLimit && (
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Monthly limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            )}
          </div>
          <div className={styles.detailRow}>
            <label>Created</label>
            <span className={styles.detailValue}>{new Date(category.createdAt).toLocaleString()}</span>
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

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [detailCategory, setDetailCategory] = useState<Category | null>(null);

  const refresh = useCallback(async () => {
    try {
      const nextCategories = await financeApi.listCategories();
      setCategories(nextCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
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
      const limit = form.get('monthlySpendingLimit');
      await financeApi.createCategory({
        name: String(form.get('name') ?? ''),
        monthlySpendingLimit: limit ? Number(limit) : null,
      });
      formEl.reset();
      setShowForm(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdate = async (id: string, data: { name?: string; monthlySpendingLimit?: number | null }) => {
    await financeApi.updateCategory(id, data);
    await refresh();
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title="Categories"
        description="Organize your expenses and set spending limits."
      >
        <button
          className={styles.primaryBtn}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Close' : '+ New Category'}
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

      {/* New Category Form */}
      {showForm && (
        <motion.div
          className={styles.formWrapper}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <form className={styles.form} onSubmit={handleSubmit}>
              <h3>Create New Category</h3>
              <input type="text" name="name" placeholder="Category name" required />
              <input type="number" name="monthlySpendingLimit" placeholder="Monthly spending limit (optional)" min="0" step="0.01" />
              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn}>Create Category</button>
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
            <p>Total Categories</p>
            <h2>{categories.length}</h2>
          </div>
        </Card>
        <Card>
          <div className={styles.stat}>
            <p>With Limits</p>
            <h2>{categories.filter(c => c.monthlySpendingLimit).length}</h2>
          </div>
        </Card>
      </section>

      {/* Categories List */}
      <section className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className={styles.categoriesList}>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div onClick={() => setDetailCategory(category)} style={{ cursor: 'pointer' }}>
                  <Card>
                    <div className={styles.categoryItem}>
                      <div className={styles.categoryInfo}>
                        <h3>{category.name}</h3>
                        <small className={styles.date}>
                          Created {new Date(category.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      {category.monthlySpendingLimit ? (
                        <div className={styles.limit}>
                          <p className={styles.limitLabel}>Monthly Limit</p>
                          <p className={styles.limitValue}>{formatMoney(category.monthlySpendingLimit)}</p>
                        </div>
                      ) : (
                        <div className={styles.noLimit}>
                          <p className={styles.noLimitText}>No limit</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <div className="empty-state">
              <p>No categories yet. Create your first category to organize expenses!</p>
            </div>
          </Card>
        )}
      </section>

      <AnimatePresence>
        {detailCategory && (
          <CategoryDetailModal
            category={detailCategory}
            onClose={() => setDetailCategory(null)}
            onSave={handleUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Categories;
