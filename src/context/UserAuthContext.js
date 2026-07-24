import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const UserAuthContext = createContext();

export const useUserAuth = () => useContext(UserAuthContext);

const API = 'http://localhost:5001/api';

export const UserAuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('authToken'));
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || '');
  const [checking, setChecking] = useState(true);
  const [blockedMessage, setBlockedMessage] = useState('');
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
  }, []);

  const verifyUser = useCallback(async () => {
    const email = localStorage.getItem('userEmail');
    const token = localStorage.getItem('authToken');

    if (!email || !token) {
      setIsLoggedIn(false);
      setChecking(false);
      return;
    }

    try {
      const res = await fetch(`${API}/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.success) {
        logout();
        setBlockedMessage(data.message || 'This account no longer exists. It has been permanently deleted.');
        navigate('/login', { replace: true });
      } else {
        setIsLoggedIn(true);
        setUserEmail(email);
      }
    } catch {
      // Network error — don't logout, just skip verification
    } finally {
      setChecking(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    verifyUser();
    const interval = setInterval(verifyUser, 30000);
    return () => clearInterval(interval);
  }, [verifyUser]);

  const login = (email, token) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('authToken', token);
    setIsLoggedIn(true);
    setUserEmail(email);
  };

  return (
    <UserAuthContext.Provider value={{ isLoggedIn, userEmail, checking, blockedMessage, login, logout, verifyUser }}>
      {children}
    </UserAuthContext.Provider>
  );
};
