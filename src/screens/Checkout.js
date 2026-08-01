import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PaymentSuccessPopup from "../components/PaymentSuccessPopup";
import ErrorPopup from "../components/ErrorPopup";
import { useCart, useDispatchCart } from "../components/ContextReducer";
import { useUserAuth } from "../context/UserAuthContext";
import "./Checkout.css";

const API = "http://localhost:5001/api";
const STANDARD_DELIVERY_FEE = 150;
const FREE_DELIVERY_THRESHOLD = 1000;
const FIRST_ORDER_DISCOUNT_PERCENT = 30;

export default function Checkout() {
  const cartData = useCart() || [];
  const dispatch = useDispatchCart();
  const navigate = useNavigate();
  const { isLoggedIn, logout, verifyUser } = useUserAuth();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [processing, setProcessing] = useState(false);
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [checkingFirstOrder, setCheckingFirstOrder] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTxId, setSuccessTxId] = useState(null);
  const [successTotal, setSuccessTotal] = useState(null);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ name: false, phone: false, address: false });

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  const subtotal = useMemo(
    () => cartData.reduce((sum, item) => sum + (item.price * item.qty), 0),
    [cartData]
  );

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  const discountAmount = isFirstOrder ? Math.round(subtotal * FIRST_ORDER_DISCOUNT_PERCENT / 100) : 0;
  const total = subtotal - discountAmount + deliveryFee;

  useEffect(() => {
    const checkFirstOrder = async () => {
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        setCheckingFirstOrder(false);
        return;
      }
      try {
        const res = await fetch(`${API}/check-first-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await res.json();
        if (data.success) {
          setIsFirstOrder(data.isFirstOrder);
        }
      } catch {
        // Silently fail
      } finally {
        setCheckingFirstOrder(false);
      }
    };
    checkFirstOrder();
  }, []);

  const handleDeliveryChange = (field, value) => {
    setDeliveryInfo((prev) => ({ ...prev, [field]: value }));
  };

  const validateFields = () => {
    const errors = { name: false, phone: false, address: false };
    let msg = "";

    if (!deliveryInfo.name.trim()) {
      errors.name = true;
      msg = "Please enter your full name.";
    } else if (!deliveryInfo.phone.trim()) {
      errors.phone = true;
      msg = "Please enter your phone number.";
    } else if (!deliveryInfo.address.trim()) {
      errors.address = true;
      msg = "Please enter your delivery address.";
    }

    setFieldErrors(errors);
    if (msg) {
      setErrorMsg(msg);
      setShowError(true);
      return false;
    }
    return true;
  };

  const clearFieldError = (field) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const saveOrder = async (txId) => {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return false;

    const response = await fetch(`${API}/orderData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_data: cartData,
        email: userEmail,
        order_date: new Date().toISOString(),
        subtotal,
        deliveryFee,
        discount: discountAmount,
        total,
        deliveryInfo: {
          name: deliveryInfo.name.trim(),
          phone: deliveryInfo.phone.trim(),
          address: deliveryInfo.address.trim(),
          notes: deliveryInfo.notes.trim(),
        },
        paymentMethod: paymentMethod,
        transactionId: txId,
      }),
    });
    return response.ok;
  };

  const handlePlaceOrder = async () => {
    if (cartData.length === 0) {
      setErrorMsg("Your cart is empty.");
      setShowError(true);
      return;
    }

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || !isLoggedIn) {
      setErrorMsg("Please log in to place an order.");
      setShowError(true);
      return;
    }

    try {
      const res = await fetch(`${API}/verify-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (!data.success) {
        logout();
        setErrorMsg(data.message || "This account no longer exists. It has been permanently deleted.");
        setShowError(true);
        navigate("/login", { replace: true });
        return;
      }
    } catch {
      // Network error — proceed anyway, backend will catch it
    }

    if (!validateFields()) return;

    if (paymentMethod === "cod") {
      setProcessing(true);
      try {
        const txId = `COD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const saved = await saveOrder(txId);
        if (saved) {
          dispatch({ type: "DROP" });
          setSuccessTxId(txId);
          setSuccessTotal(total);
          setShowSuccess(true);
        } else {
          setErrorMsg("Failed to place order. Please try again.");
          setShowError(true);
        }
      } catch {
        setErrorMsg("Something went wrong.");
        setShowError(true);
      } finally {
        setProcessing(false);
      }
      return;
    }

    setProcessing(true);
    const orderId = `GF-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const productName = cartData.map((i) => i.name).join(", ");

    try {
      if (paymentMethod === "khalti") {
        const res = await fetch(`${API}/khalti/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: total,
            orderId,
            productName,
            customerInfo: {
              name: deliveryInfo.name,
              email: localStorage.getItem("userEmail"),
              phone: deliveryInfo.phone,
              address: deliveryInfo.address,
            },
          }),
        });
        const data = await res.json();

        if (data.success && data.data.payment_url) {
          localStorage.setItem(
            "pendingOrder",
            JSON.stringify({ orderId, cartData, total, gateway: "khalti", deliveryInfo, paymentMethod: "khalti" })
          );
          window.location.href = data.data.payment_url;
        } else {
          setErrorMsg(data.message || "Khalti initiation failed.");
          setShowError(true);
          setProcessing(false);
        }
      } else if (paymentMethod === "esewa") {
        const res = await fetch(`${API}/esewa/initiate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total, orderId }),
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem(
            "pendingOrder",
            JSON.stringify({ orderId, cartData, total, gateway: "esewa", deliveryInfo, paymentMethod: "esewa" })
          );

          const { gatewayUrl, params } = data.data;
          const form = document.createElement("form");
          form.method = "POST";
          form.action = gatewayUrl;
          Object.entries(params).forEach(([key, value]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
          });
          document.body.appendChild(form);
          form.submit();
        } else {
          setErrorMsg(data.message || "eSewa initiation failed.");
          setShowError(true);
          setProcessing(false);
        }
      }
    } catch (err) {
      console.error("Payment initiation error:", err);
      setErrorMsg("Something went wrong. Please try again.");
      setShowError(true);
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <Navbar />

      <main className="checkout-main">
        <div className="checkout-header">
          <h1 className="checkout-title">Checkout</h1>
          <p className="checkout-subtitle">
            Fill in your delivery details and choose a payment method to complete your order.
          </p>
        </div>

        <div className="checkout-grid">
          <div className="checkout-form-col">
            <div className="checkout-card">
              <div className="checkout-section-header">
                <span className="checkout-step-badge">1</span>
                <h2 className="checkout-section-title">Delivery Information</h2>
              </div>

              <div className="checkout-form-fields">
                <div className={`checkout-field ${fieldErrors.name ? "has-error" : ""}`}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={deliveryInfo.name}
                    onChange={(e) => {
                      handleDeliveryChange("name", e.target.value);
                      clearFieldError("name");
                    }}
                  />
                  {fieldErrors.name && <span className="checkout-field-error">Name is required</span>}
                </div>

                <div className={`checkout-field ${fieldErrors.phone ? "has-error" : ""}`}>
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="98XXXXXXXX"
                    value={deliveryInfo.phone}
                    onChange={(e) => {
                      handleDeliveryChange("phone", e.target.value);
                      clearFieldError("phone");
                    }}
                  />
                  {fieldErrors.phone && <span className="checkout-field-error">Phone number is required</span>}
                </div>

                <div className={`checkout-field ${fieldErrors.address ? "has-error" : ""}`}>
                  <label>Delivery Address</label>
                  <textarea
                    className="address-field"
                    rows="4"
                    placeholder="House No, Street, Area, City..."
                    value={deliveryInfo.address}
                    onChange={(e) => {
                      handleDeliveryChange("address", e.target.value);
                      clearFieldError("address");
                    }}
                  />
                  {fieldErrors.address && <span className="checkout-field-error">Delivery address is required</span>}
                </div>

                <div className="checkout-field">
                  <label>
                    Delivery Notes
                    <span className="optional-text">(optional)</span>
                  </label>
                  <textarea
                    className="notes-field"
                    rows="3"
                    placeholder="Leave at the gate, ring the bell, call before..."
                    value={deliveryInfo.notes}
                    onChange={(e) => handleDeliveryChange("notes", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-sidebar-col">
            <div className="checkout-sidebar-inner">
              <div className="checkout-card">
                <div className="checkout-section-header">
                  <span className="checkout-step-badge">2</span>
                  <h2 className="checkout-section-title">Payment</h2>
                </div>

                <div className="checkout-payment-options">
                  <label
                    className={`checkout-payment-option ${paymentMethod === "cod" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("cod")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "cod"}
                      readOnly
                    />
                    <span className="payment-label">Cash on Delivery</span>
                  </label>

                  <label
                    className={`checkout-payment-option ${paymentMethod === "esewa" ? "selected" : ""}`}
                    onClick={() => setPaymentMethod("esewa")}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "esewa"}
                      readOnly
                    />
                    <span className="payment-label">eSewa</span>
                  </label>
                </div>
              </div>

              <div className="checkout-card">
                <div className="checkout-section-header">
                  <span className="checkout-step-badge">3</span>
                  <h2 className="checkout-section-title">Summary</h2>
                </div>

                {cartData.length === 0 ? (
                  <p className="checkout-empty-cart">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="checkout-items-list">
                      {cartData.map((item, index) => (
                        <div className="checkout-item" key={item.id + "-" + item.size + "-" + index}>
                          <div className="checkout-item-info">
                            <span className="checkout-item-name">{item.name}</span>
                            <span className="checkout-item-meta">{item.size} × {item.qty}</span>
                          </div>
                          <span className="checkout-item-price">Rs. {item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>

                    <div className="checkout-summary-rows">
                      <div className="checkout-summary-row">
                        <span>Subtotal</span>
                        <span>Rs. {subtotal}</span>
                      </div>
                      {isFirstOrder && discountAmount > 0 && (
                        <div className="checkout-summary-row" style={{ color: '#4ade80' }}>
                          <span>First Order Discount (30%)</span>
                          <span>- Rs. {discountAmount}</span>
                        </div>
                      )}
                      <div className="checkout-summary-row">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? 'Free' : `Rs. ${deliveryFee}`}</span>
                      </div>
                      <div className="checkout-summary-total">
                        <span className="total-label">Total</span>
                        <span className="total-value">Rs. {total}</span>
                      </div>
                    </div>

                    <button
                      className="checkout-place-order-btn"
                      onClick={handlePlaceOrder}
                      disabled={processing}
                    >
                      {processing
                        ? "Processing..."
                        : paymentMethod === "cod"
                        ? "Place Order"
                        : `Pay Rs. ${total} with ${paymentMethod === "khalti" ? "Khalti" : "eSewa"}`}
                    </button>
                  </>
                )}

                <p className="checkout-terms-note">
                  By placing this order you agree to our terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <PaymentSuccessPopup
        show={showSuccess}
        transactionId={successTxId}
        total={successTotal}
        onClose={() => {
          setShowSuccess(false);
          navigate("/myOrder");
        }}
      />

      <ErrorPopup
        show={showError}
        message={errorMsg}
        onClose={() => setShowError(false)}
      />
    </div>
  );
}
