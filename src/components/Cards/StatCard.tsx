import React from 'react';
import { motion } from 'framer-motion';
import styles from './StatCard.module.css';

type Props = {
  label: string;
  value: string | number;
  icon?: string;
  type?: 'default' | 'success' | 'warning' | 'error';
  trend?: 'up' | 'down';
  trendValue?: string;
  index?: number;
};

export const StatCard: React.FC<Props> = ({
  label,
  value,
  icon,
  type = 'default',
  trend,
  trendValue,
  index = 0,
}) => {
  return (
    <motion.div
      className={`${styles.card} ${styles[type]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <p className={styles.label}>{label}</p>
        <h3 className={styles.value}>{value}</h3>
        {trend && trendValue && (
          <p className={`${styles.trend} ${styles[trend]}`}>
            {trend === 'up' ? '↑' : '↓'} {trendValue}
          </p>
        )}
      </div>
    </motion.div>
  );
};
