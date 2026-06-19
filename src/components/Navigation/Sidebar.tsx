import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';

type NavItem = {
  path: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/accounts', label: 'Accounts', icon: '💳' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/transactions', label: 'Transactions', icon: '📝' },
  { path: '/transactions', label: 'Transfer', icon: '↔' },
  { path: '/summary', label: 'Summary', icon: '📈' },
];

function useIsMobile() {
  // Default false (desktop) so SSR never touches window
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    // Only runs on the client after hydration
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  // On desktop the sidebar is always visible; on mobile it slides in/out
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const animate = isMobile ? (isOpen ? 'open' : 'closed') : 'open';

  return (
    <>
      {/* Mobile Menu Button — only rendered on mobile */}
      {isMobile && (
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Overlay */}
      {isMobile && isOpen && (
        <motion.div
          className={styles.overlay}
          onClick={() => setIsOpen(false)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={styles.sidebar}
        initial={isMobile ? 'closed' : 'open'}
        animate={animate}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className={styles.header}>
          <h1 className={styles.logo}>💰 Finance Tracker</h1>
          {isMobile && (
            <button
              className={styles.closeBtn}
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
                onClick={() => isMobile && setIsOpen(false)}
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </motion.aside>
    </>
  );
};
