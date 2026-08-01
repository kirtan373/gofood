import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaTimes } from 'react-icons/fa';

export default function LoginRequiredPopup({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <style>{`
        .lr-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 18, 8, 0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: gf-fade-in 0.2s ease;
        }
        .lr-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: var(--surface);
          border: 1px solid var(--border-light);
          border-radius: 18px;
          padding: 2rem 2rem 1.5rem;
          max-width: 380px;
          width: 90%;
          box-shadow: 0 24px 60px rgba(0,0,0,0.25);
          z-index: 10001;
          animation: gf-scale-in 0.25s var(--ease-out);
          font-family: 'DM Sans', -apple-system, sans-serif;
          text-align: center;
        }
        .lr-close {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 30px;
          height: 30px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .lr-close:hover {
          background: var(--danger-light);
          color: var(--danger);
        }
        .lr-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--brand-light);
          margin-bottom: 1rem;
        }
        .lr-icon svg {
          color: var(--brand);
          font-size: 1.5rem;
        }
        .lr-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-weight: 400;
          font-size: 1.25rem;
          color: var(--ink);
          margin: 0 0 0.5rem;
        }
        .lr-message {
          font-size: 0.9rem;
          color: var(--muted);
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }
        .lr-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          padding: 12px 28px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          border: none;
          cursor: pointer;
          font-family: inherit;
          color: #fff;
          background-image: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
          box-shadow: 0 4px 12px rgba(255, 107, 53, 0.24);
          transition: all 0.2s;
        }
        .lr-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(255, 107, 53, 0.34);
        }
      `}</style>
      <div className="lr-overlay" onClick={onClose} />
      <div className="lr-modal">
        <button className="lr-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>
        <div className="lr-icon">
          <FaLock />
        </div>
        <h3 className="lr-title">Login Required</h3>
        <p className="lr-message">Please login first to add items to your cart.</p>
        <button className="lr-btn" onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    </>
  );
}
