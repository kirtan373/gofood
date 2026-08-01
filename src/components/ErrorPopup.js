import React, { useEffect } from "react";
import { FaExclamationTriangle, FaTimes } from "react-icons/fa";

export default function ErrorPopup({ show, message, onClose }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ""; };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="psp-overlay" onClick={onClose}>
      <div className="ep-modal" onClick={(e) => e.stopPropagation()}>
        <button className="ep-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="ep-icon">
          <FaExclamationTriangle />
        </div>

        <h3 className="ep-title">Oops!</h3>
        <p className="ep-message">{message}</p>

        <button className="ep-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
