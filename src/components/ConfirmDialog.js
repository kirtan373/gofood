import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <>
      <style>{`
        .gf-confirm-overlay {
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
        .gf-confirm-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #fbf6ee;
          border-radius: 18px;
          padding: 2rem 2rem 1.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          z-index: 10001;
          animation: gf-scale-in 0.25s cubic-bezier(0.4,0,0.2,1);
          font-family: 'DM Sans', -apple-system, sans-serif;
          text-align: center;
        }
        .gf-confirm-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(193, 67, 46, 0.1);
          margin-bottom: 1rem;
        }
        .gf-confirm-icon svg {
          color: #c1432e;
          font-size: 1.4rem;
        }
        .gf-confirm-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-weight: 400;
          font-size: 1.2rem;
          color: #1a1208;
          margin: 0 0 0.5rem;
        }
        .gf-confirm-message {
          font-size: 0.9rem;
          color: #8a7e70;
          margin: 0 0 1.5rem;
          line-height: 1.5;
        }
        .gf-confirm-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .gf-confirm-btn {
          padding: 10px 28px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.85rem;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .gf-confirm-btn-cancel {
          background: transparent;
          border: 1.5px solid #ede5da;
          color: #8a7e70;
        }
        .gf-confirm-btn-cancel:hover {
          border-color: #c4b5a4;
          color: #1a1208;
        }
        .gf-confirm-btn-confirm {
          background: #c1432e;
          color: #fff;
        }
        .gf-confirm-btn-confirm:hover {
          background: #a33624;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(193, 67, 46, 0.3);
        }
      `}</style>
      <div className="gf-confirm-overlay" onClick={onCancel} />
      <div className="gf-confirm-dialog">
        <div className="gf-confirm-icon">
          <FaExclamationTriangle />
        </div>
        <h3 className="gf-confirm-title">{title}</h3>
        <p className="gf-confirm-message">{message}</p>
        <div className="gf-confirm-actions">
          <button className="gf-confirm-btn gf-confirm-btn-cancel" onClick={onCancel}>
            Decline
          </button>
          <button className="gf-confirm-btn gf-confirm-btn-confirm" onClick={onConfirm}>
            Accept
          </button>
        </div>
      </div>
    </>
  );
}
