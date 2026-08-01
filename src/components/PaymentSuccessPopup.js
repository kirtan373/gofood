import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaShoppingBag, FaHome } from "react-icons/fa";

export default function PaymentSuccessPopup({ show, transactionId, total, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [show]);

  if (!show) return null;

  return (
    <div className="psp-overlay" onClick={onClose}>
      <div className="psp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="psp-checkmark">
          <div className="psp-checkmark-circle">
            <FaCheck className="psp-checkmark-icon" />
          </div>
        </div>

        <h2 className="psp-title">Order Placed Successfully!</h2>
        <p className="psp-subtitle">Your delicious food is on its way.</p>

        <div className="psp-details">
          {total && (
            <div className="psp-detail-row">
              <span>Total Paid</span>
              <span className="psp-detail-value">Rs. {total}</span>
            </div>
          )}
          {transactionId && (
            <div className="psp-detail-row">
              <span>Transaction ID</span>
              <span className="psp-detail-id">{transactionId}</span>
            </div>
          )}
          <div className="psp-detail-row">
            <span>Payment</span>
            <span className="psp-detail-value">Cash on Delivery</span>
          </div>
        </div>

        <div className="psp-actions">
          <button
            className="psp-btn psp-btn-primary"
            onClick={() => {
              onClose();
              navigate("/myOrder");
            }}
          >
            <FaShoppingBag /> View My Orders
          </button>
          <button
            className="psp-btn psp-btn-secondary"
            onClick={() => {
              onClose();
              navigate("/menu");
            }}
          >
            <FaHome /> Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
