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
        {toasts.map((toast) => (
          <div key={toast.id} style={styles.toast}>
            <FaCheckCircle style={styles.icon} />
            <span style={styles.message}>{toast.message}</span>
            <button style={styles.closeBtn} onClick={() => removeToast(toast.id)}>
              <FaTimes size={12} />
            </button>
          </div>
        ))}
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
  toast: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: '#1a1208',
    color: '#fff',
    padding: '14px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
    fontFamily: "'DM Sans', -apple-system, sans-serif",
    fontSize: '0.9rem',
    fontWeight: 500,
    animation: 'gf-slide-in 0.35s cubic-bezier(0.4,0,0.2,1)',
    maxWidth: '360px',
    borderLeft: '4px solid #5b7553',
  },
  icon: {
    color: '#5b7553',
    fontSize: '1.1rem',
    flexShrink: 0,
  },
  message: {
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    transition: 'color 0.2s',
  },
};
