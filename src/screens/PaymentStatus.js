import React, { useCallback, useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentSuccessPopup from "../components/PaymentSuccessPopup";
import { useDispatchCart } from "../components/ContextReducer";
import "./Checkout.css";

const API = "http://localhost:5001/api";

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const { gateway: urlGateway } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatchCart();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [transactionId, setTransactionId] = useState(null);
  const [successTotal, setSuccessTotal] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const hasRun = useRef(false);

  const saveOrder = useCallback(async (cartData, orderId, txId, payMethod, delInfo) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    try {
      await fetch(`${API}/orderData`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_data: cartData,
          email: userEmail,
          order_date: new Date().toISOString(),
          deliveryInfo: delInfo || undefined,
          paymentMethod: payMethod,
          transactionId: txId,
        }),
      });
      dispatch({ type: "DROP" });
    } catch {
      // order may have already been placed
    }
  }, [dispatch]);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const verify = async () => {
      const gateway = urlGateway || searchParams.get("gateway");
      const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder") || "null");

      let orderId = pendingOrder?.orderId;
      let cartData = pendingOrder?.cartData;
      let total = pendingOrder?.total;
      let deliveryInfo = pendingOrder?.deliveryInfo;
      let paymentMethod = pendingOrder?.paymentMethod;

      if (gateway === "esewa") {
        const dataParam = searchParams.get("data");
        const failed = searchParams.get("failed");

        if (failed) {
          setStatus("failed");
          setMessage("Payment was cancelled or failed on eSewa.");
          localStorage.removeItem("pendingOrder");
          return;
        }

        if (!dataParam) {
          setStatus("failed");
          setMessage("Invalid eSewa response - no data received.");
          localStorage.removeItem("pendingOrder");
          return;
        }

        try {
          const decoded = JSON.parse(atob(dataParam));

          if (decoded.status !== "COMPLETE") {
            setStatus("failed");
            setMessage(`Payment status: ${decoded.status}`);
            localStorage.removeItem("pendingOrder");
            return;
          }

          orderId = orderId || decoded.transaction_uuid;
          total = total || parseFloat(decoded.total_amount);

          const res = await fetch(`${API}/esewa/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refId: decoded.ref_id || "", amount: total, orderId }),
          });
          const result = await res.json();

          if (result.success && result.status === "Completed") {
            const txCode = decoded.ref_id || orderId;
            if (cartData) {
              await saveOrder(cartData, orderId, txCode, paymentMethod || "esewa", deliveryInfo);
            }
            setTransactionId(txCode);
            setSuccessTotal(total || null);
            setStatus("success");
            setMessage("Payment successful via eSewa!");
            setTimeout(() => setShowSuccess(true), 300);
          } else {
            setStatus("failed");
            setMessage(`Verification failed: ${result.message || result.status || "Unknown"}`);
          }
        } catch (err) {
          console.error("eSewa verification error:", err);
          setStatus("failed");
          setMessage("Could not verify payment. Please contact support.");
        }

        localStorage.removeItem("pendingOrder");
        return;
      }

      if (gateway === "khalti") {
        const pidx = searchParams.get("pidx");
        const khaltiStatus = searchParams.get("status");

        if (khaltiStatus === "User canceled") {
          setStatus("failed");
          setMessage("Payment was cancelled.");
          localStorage.removeItem("pendingOrder");
          return;
        }

        if (!pidx) {
          setStatus("failed");
          setMessage("Invalid Khalti response.");
          localStorage.removeItem("pendingOrder");
          return;
        }

        try {
          const res = await fetch(`${API}/khalti/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pidx }),
          });
          const data = await res.json();

          if (data.success && data.status === "Completed") {
            const txCode = data.transaction_id || pidx;
            if (cartData) {
              await saveOrder(cartData, orderId, txCode, paymentMethod || "khalti", deliveryInfo);
            }
            setTransactionId(txCode);
            setSuccessTotal(total || null);
            setStatus("success");
            setMessage("Payment successful via Khalti!");
            setTimeout(() => setShowSuccess(true), 300);
          } else {
            setStatus("failed");
            setMessage(`Payment status: ${data.status || "Unknown"}`);
          }
        } catch {
          setStatus("error");
          setMessage("Verification failed. Please contact support.");
        }

        localStorage.removeItem("pendingOrder");
        return;
      }

      setStatus("error");
      setMessage("Unknown payment gateway.");
    };

    verify();
  }, [urlGateway, searchParams, saveOrder]);

  return (
    <div className="checkout-container">
      <Navbar />
      <main className="checkout-main">
        <div className="payment-status-card">
          <div className={`payment-status-icon ${status}`}>
            {status === "verifying" && <div className="spinner" />}
            {status === "success" && "\u2713"}
            {status === "failed" && "\u2715"}
            {status === "error" && "!"}
          </div>

          <h2 className={`payment-status-title ${status}`}>
            {status === "verifying"
              ? "Verifying Payment"
              : status === "success"
              ? "Payment Successful"
              : "Payment Failed"}
          </h2>

          <p className="payment-status-message">{message}</p>

          {status === "success" && transactionId && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(47,158,68,0.12)', border: '1px solid rgba(47,158,68,0.35)', borderRadius: 10,
              padding: '10px 16px', marginBottom: '1.25rem', fontSize: '0.85rem'
            }}>
              <span style={{ color: 'rgba(250,247,242,0.6)', fontWeight: 500 }}>Transaction ID:</span>
              <span style={{
                fontFamily: "'SF Mono', 'Consolas', monospace", fontWeight: 700,
                color: '#4ade80', background: 'rgba(250,247,242,0.05)', padding: '3px 10px',
                borderRadius: 6, border: '1px solid rgba(47,158,68,0.35)', fontSize: '0.82rem',
                letterSpacing: '0.02em'
              }}>
                {transactionId}
              </span>
            </div>
          )}

          <div className="payment-status-actions">
            {status === "success" && (
              <button
                className="checkout-place-order-btn"
                onClick={() => {
                  localStorage.removeItem("pendingOrder");
                  navigate("/myOrder");
                }}
              >
                View My Orders
              </button>
            )}
            {status !== "verifying" && (
              <button
                className="checkout-place-order-btn secondary"
                onClick={() => {
                  localStorage.removeItem("pendingOrder");
                  navigate("/checkout");
                }}
              >
                Back to Checkout
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <PaymentSuccessPopup
        show={showSuccess}
        transactionId={transactionId}
        total={successTotal}
        onClose={() => {
          setShowSuccess(false);
          localStorage.removeItem("pendingOrder");
          navigate("/myOrder");
        }}
      />
    </div>
  );
}
