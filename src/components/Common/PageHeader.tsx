import React from 'react';
import { motion } from 'framer-motion';
import styles from './PageHeader.module.css';

type Props = {
  title: string;
  description?: string;
  children?: React.ReactNode;
};

export const PageHeader: React.FC<Props> = ({ title, description, children }) => {
  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.content}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </motion.header>
  );
};
