import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useDispatchCart } from '../components/ContextReducer';
import ConfirmDialog from '../components/ConfirmDialog';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

export default function Cart() {
  let data = useCart();
  let dispatch = useDispatchCart();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState(null);
  const [pendingQtyAction, setPendingQtyAction] = useState(null);

  const hbStyles = (
    <style>{`
      .hb-cart-page {
        --espresso-950: #120e0a;
        --espresso-900: #17120d;
        --espresso-800: #1f1913;
        --espresso-700: #2a221a;
        --brand: #ff6b35;
        --brand-dark: #e14f1d;
        --cream: #f7f1e7;
        --ink: #201a14;
        --muted: #776c5f;
        --border: #eae2d6;
        min-height: 60vh;
        background:
          radial-gradient(900px 400px at 80% -10%, rgba(255, 107, 53, 0.1), transparent 60%),
          radial-gradient(700px 380px at 10% 110%, rgba(232, 163, 61, 0.07), transparent 60%),
          var(--espresso-900);
        padding: 3rem 1rem 4rem;
      }

      .hb-cart-empty {
        font-family: 'DM Serif Display', Georgia, serif;
        font-weight: 400;
        color: rgba(255, 255, 255, 0.85);
        font-size: clamp(1.5rem, 3vw, 2rem);
        text-align: center;
        padding: 4rem 1rem;
      }

      .hb-ticket {
        max-width: 840px;
        margin: 0 auto;
        background: var(--cream);
        border-radius: 20px;
        padding: 2rem 2rem 1.5rem;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
        color: var(--ink);
      }

      .hb-ticket-eyebrow {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 0.22em;
        color: var(--brand-dark);
        font-weight: 700;
        margin-bottom: 4px;
      }

      .hb-ticket-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-weight: 400;
        font-size: clamp(1.5rem, 3vw, 1.9rem);
        color: var(--ink);
        margin-bottom: 1.5rem;
      }

      .hb-cart-table {
        width: 100%;
        border-collapse: collapse;
      }

      .hb-cart-table thead th {
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.68rem;
        color: var(--muted);
        font-weight: 700;
        padding: 0 8px 12px 8px;
        border-bottom: 2px solid var(--border);
        text-align: left;
      }

      .hb-cart-table tbody td,
      .hb-cart-table tbody th {
        padding: 16px 8px;
        border-bottom: 1px solid var(--border);
        color: var(--ink);
        vertical-align: middle;
      }

      .hb-cart-table tbody tr:last-child td,
      .hb-cart-table tbody tr:last-child th {
        border-bottom: none;
      }

      .hb-row-index {
        font-weight: 700;
        color: var(--brand-dark);
        opacity: 0.55;
        font-size: 0.85rem;
      }

      .hb-row-name {
        font-weight: 600;
      }

      .hb-row-amount {
        font-weight: 700;
      }

      /* ── Quantity Controls ── */
      .hb-qty-controls {
        display: inline-flex;
        align-items: center;
        gap: 0;
        background: #fff;
        border: 1px solid var(--border);
        border-radius: 999px;
        padding: 2px;
      }

      .hb-qty-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 0.7rem;
      }

      .hb-qty-btn:hover {
        background: var(--brand);
        color: #fff;
      }

      .hb-qty-btn:active {
        transform: scale(0.9);
      }

      .hb-qty-btn.remove-btn:hover {
        background: #e5484d;
        color: #fff;
      }

      .hb-qty-num {
        min-width: 32px;
        text-align: center;
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--ink);
        user-select: none;
      }

      /* ── Delete Button ── */
      .hb-delete-btn {
        border: none;
        background: transparent;
        padding: 6px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease, transform 0.15s ease;
      }

      .hb-delete-btn:hover {
        background: rgba(229, 72, 77, 0.12);
        transform: scale(1.08);
      }

      .hb-delete-btn svg {
        stroke: #e5484d;
      }

      /* ── Footer ── */
      .hb-cart-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1.25rem;
        margin-top: 1.75rem;
        padding-top: 1.5rem;
        border-top: 2px solid var(--border);
      }

      .hb-total-label {
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.7rem;
        color: var(--muted);
        font-weight: 700;
        margin-bottom: 2px;
      }

      .hb-total-amount {
        font-family: 'DM Serif Display', Georgia, serif;
        font-weight: 400;
        font-size: 2rem;
        color: var(--brand-dark);
      }

      .hb-checkout-btn {
        background-image: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
        color: #fff;
        border: none;
        font-weight: 700;
        letter-spacing: 0.02em;
        padding: 14px 34px;
        border-radius: 999px;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.2s ease;
        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.32);
      }

      .hb-checkout-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 28px rgba(255, 107, 53, 0.42);
      }

      /* ── Responsive ── */
      @media (max-width: 640px) {
        .hb-ticket {
          padding: 1.5rem 1rem 1rem;
          border-radius: 16px;
        }
        .hb-cart-table thead {
          display: none;
        }
        .hb-cart-table tbody tr {
          display: flex;
          flex-wrap: wrap;
          gap: 4px 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .hb-cart-table tbody tr:last-child {
          border-bottom: none;
        }
        .hb-cart-table tbody td,
        .hb-cart-table tbody th {
          padding: 4px 0;
          border: none;
        }
        .hb-row-index { display: none; }
        .hb-row-name { width: 100%; font-size: 1rem; }
        .hb-qty-controls { order: 1; }
        .hb-row-amount { order: 2; margin-left: auto; }
        .hb-cart-footer { justify-content: center; text-align: center; }
      }
    `}</style>
  );

  if (data.length === 0) {
    return (
      <>
        <Navbar />
        <div className="hb-cart-page">
          {hbStyles}
          <div className='hb-cart-empty'>The cart is empty.</div>
        </div>
        <Footer />
      </>
    )
  }

  let totalPrice = data.reduce((total, food) => total + (food.price * food.qty), 0)

  const handleQtyChange = (index, newQty) => {
    const food = data[index];
    if (!food) return;

    if (newQty <= 0) {
      setPendingQtyAction({ index, type: 'decrease', name: food.name });
      setConfirmOpen(true);
    } else if (newQty > food.qty) {
      setPendingQtyAction({ index, type: 'increase', name: food.name });
      setConfirmOpen(true);
    } else {
      dispatch({ type: "SET_QTY", index, qty: newQty });
    }
  }

  const handleConfirmQty = () => {
    if (pendingQtyAction) {
      const { index, type } = pendingQtyAction;
      if (type === 'decrease') {
        dispatch({ type: "SET_QTY", index, qty: 0 });
      } else {
        dispatch({ type: "SET_QTY", index, qty: data[index].qty + 1 });
      }
    }
    setConfirmOpen(false);
    setPendingQtyAction(null);
  };

  const handleConfirmRemove = () => {
    if (pendingRemoveIndex !== null) {
      dispatch({ type: "REMOVE", index: pendingRemoveIndex });
    }
    setConfirmOpen(false);
    setPendingRemoveIndex(null);
  };

  const handleCancelConfirm = () => {
    setConfirmOpen(false);
    setPendingRemoveIndex(null);
    setPendingQtyAction(null);
  };

  const getConfirmTitle = () => {
    if (pendingQtyAction) {
      return pendingQtyAction.type === 'decrease' ? 'Decrease Quantity' : 'Increase Quantity';
    }
    return 'Remove Item';
  };

  const getConfirmMessage = () => {
    if (pendingQtyAction) {
      if (pendingQtyAction.type === 'decrease') {
        return `Do you want to decrease the quantity of ${pendingQtyAction.name}?`;
      }
      return `Do you want to increase the quantity of ${pendingQtyAction.name}?`;
    }
    return `Do you want to remove ${pendingRemoveIndex !== null && data[pendingRemoveIndex] ? data[pendingRemoveIndex].name : 'this item'} from the cart?`;
  };

  const getConfirmHandler = () => {
    if (pendingQtyAction) return handleConfirmQty;
    return handleConfirmRemove;
  };

  const handleRemoveClick = (index) => {
    setPendingRemoveIndex(index);
    setConfirmOpen(true);
  };

  return (
    <>
      <Navbar />
      <div className="hb-cart-page">
        {hbStyles}
        <div className='container'>
          <div className="hb-ticket">
            <div className="hb-ticket-eyebrow">Order Summary</div>
            <div className="hb-ticket-title">Your Cart</div>

            <table className='hb-cart-table'>
              <thead>
                <tr>
                  <th scope='col'>#</th>
                  <th scope='col'>Name</th>
                  <th scope='col'>Qty</th>
                  <th scope='col'>Option</th>
                  <th scope='col'>Amount</th>
                  <th scope='col'></th>
                </tr>
              </thead>
              <tbody>
                {data.map((food, index) => (
                  <tr key={food._id || `${food.name}-${food.size}-${index}`}>
                    <th scope='row' className="hb-row-index">{String(index + 1).padStart(2, '0')}</th>
                    <td className="hb-row-name">{food.name}</td>
                    <td>
                      <div className="hb-qty-controls">
                        <button
                          className={`hb-qty-btn ${food.qty <= 1 ? 'remove-btn' : ''}`}
                          onClick={() => handleQtyChange(index, food.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          {food.qty <= 1 ? <FaTrash size={10} /> : <FaMinus size={10} />}
                        </button>
                        <span className="hb-qty-num">{food.qty}</span>
                        <button
                          className="hb-qty-btn"
                          onClick={() => handleQtyChange(index, food.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </td>
                    <td>{food.size}</td>
                    <td className="hb-row-amount">{food.price * food.qty}/-</td>
                    <td>
                      <button
                        type="button"
                        className="hb-delete-btn"
                        aria-label={`Remove ${food.name} from cart`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveClick(index);
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="hb-cart-footer">
              <div>
                <div className="hb-total-label">Total</div>
                <div className="hb-total-amount">{totalPrice}/-</div>
              </div>
              <button
                className='hb-checkout-btn'
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title={getConfirmTitle()}
        message={getConfirmMessage()}
        onConfirm={getConfirmHandler()}
        onCancel={handleCancelConfirm}
      />
      <Footer />
    </>
  )
}
