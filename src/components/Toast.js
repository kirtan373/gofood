import React, { createContext, useContext, useState, useCallback } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={styles.container}>
        {toasts.map((toast) => {
          const accent = styles.accent[toast.type] || styles.accent.success;
          return (
            <div key={toast.id} style={{ ...styles.toast, borderLeft: `4px solid ${accent}` }}>
              <FaCheckCircle style={{ ...styles.icon, color: accent }} />
              <span style={styles.message}>{toast.message}</span>
              <button style={styles.closeBtn} onClick={() => removeToast(toast.id)}>
                <FaTimes size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    pointerEvents: 'none',
  },
  accent: {
    success: '#ff6b35',
    error: '#e5484d',
    info: '#e8a33d',
  },
  toast: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#17120d',
    color: '#faf7f2',
    padding: '14px 20px',
    borderRadius: '14px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    animation: 'gf-slide-in 0.35s cubic-bezier(0.4,0,0.2,1)',
    maxWidth: '360px',
  },
  icon: {
    color: '#ff6b35',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(250,247,242,0.5)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    transition: 'color 0.2s',
  },
};
