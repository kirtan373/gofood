import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useDispatchCart, useCart } from "./ContextReducer";
import { useToast } from "./Toast";
import { FaShoppingCart } from "react-icons/fa";

export default function Card(props) {
  const dispatch = useDispatchCart();
  const data = useCart();
  const priceRef = useRef();
  const options = props.options || {};
  const priceOptions = Object.keys(options);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState(priceOptions[0] || "");
  const navigate = useNavigate();
  const addToast = useToast();

  const handleaddtocart = async () => {
    const unitPrice = parseInt(options[size] || 0, 10);
    const itemInCart = data.find(
      (item) => item.id === props.foodItem._id && item.size === size
    );

    if (itemInCart) {
      await dispatch({
        type: "UPDATE",
        id: props.foodItem._id,
        price: unitPrice,
        qty: qty,
      });
      addToast(`${props.foodItem.name} updated in cart`);
      return;
    }

    await dispatch({
      type: "ADD",
      id: props.foodItem._id,
      name: props.foodItem.name,
      price: unitPrice,
      qty: qty,
      size: size,
      img: props.foodItem.img,
    });
    addToast(`${props.foodItem.name} added to cart successfully`);
  };

  const finalPrice = qty * parseInt(options[size] || 0, 10);

  useEffect(() => {
    if (priceRef.current && priceRef.current.value) {
      setSize(priceRef.current.value);
    }
  }, [priceOptions]);

  return (
    <>
    <style>{`
      .gf-card {
        --gf-cream: #fbf6ee;
        --gf-ink: #1a1208;
        --gf-muted: #8a7e70;
        --gf-brand: #ff6b35;
        --gf-brand-light: #ff8c5a;
        --gf-sage: #5b7553;
        --gf-border: #ede5da;
        background: var(--gf-cream);
        border: 1px solid var(--gf-border);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(26, 18, 8, 0.06);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        color: var(--gf-ink);
        font-family: 'DM Sans', -apple-system, sans-serif;
        position: relative;
      }
      .gf-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 16px 40px rgba(26, 18, 8, 0.12);
        border-color: transparent;
      }
      .gf-card .gf-img-wrap {
        position: relative;
        height: 200px;
        overflow: hidden;
      }
      .gf-card .gf-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        cursor: pointer;
        transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .gf-card:hover .gf-img-wrap img {
        transform: scale(1.08);
      }
      .gf-card .gf-img-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, transparent 60%, rgba(26,18,8,0.4) 100%);
        opacity: 0;
        transition: opacity 0.3s;
      }
      .gf-card:hover .gf-img-overlay {
        opacity: 1;
      }
      .gf-card .gf-body {
        padding: 20px;
      }
      .gf-card .gf-title {
        font-family: 'DM Serif Display', Georgia, serif;
        font-weight: 400;
        color: var(--gf-ink);
        font-size: 1.1rem;
        margin-bottom: 12px;
        cursor: pointer;
        transition: color 0.2s;
        line-height: 1.3;
      }
      .gf-card .gf-title:hover {
        color: var(--gf-brand);
      }
      .gf-card .gf-controls {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .gf-card .gf-selects {
        display: flex;
        gap: 8px;
      }
      .gf-card .gf-selects select {
        flex: 1;
        background: #fff;
        color: var(--gf-ink);
        border: 1px solid var(--gf-border);
        border-radius: 10px;
        padding: 8px 12px;
        font-size: 0.85rem;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
        outline: none;
        -webkit-appearance: none;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%238a7e70' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 10px center;
        padding-right: 28px;
      }
      .gf-card .gf-selects select:focus {
        border-color: var(--gf-brand);
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
      }
      .gf-card .gf-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .gf-card .gf-price {
        font-family: 'DM Sans', sans-serif;
        font-weight: 700;
        font-size: 1.05rem;
        color: var(--gf-ink);
        letter-spacing: -0.01em;
      }
      .gf-card .gf-price span {
        color: var(--gf-brand);
      }
      .gf-card .gf-add-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: linear-gradient(135deg, var(--gf-sage), #4a6144);
        border: none;
        color: #fff;
        font-weight: 600;
        font-size: 0.82rem;
        letter-spacing: 0.02em;
        padding: 8px 18px;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
      }
      .gf-card .gf-add-btn:hover {
        background: linear-gradient(135deg, #4a6144, #3d5238);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(91, 117, 83, 0.3);
      }
      .gf-card .gf-add-btn svg {
        font-size: 0.75rem;
      }
    `}</style>

    <div
      className="gf-card"
      style={{ width: "100%", maxHeight: "420px" }}
    >
      <div className="gf-img-wrap">
        <img
          src={props.foodItem.img}
          alt={props.foodItem.name}
          onClick={() => navigate(`/product/${props.foodItem._id}`)}
        />
        <div className="gf-img-overlay" />
      </div>

      <div className="gf-body">
        <h5
          className="gf-title"
          onClick={() => navigate(`/product/${props.foodItem._id}`)}
        >
          {props.foodItem.name}
        </h5>

        <div className="gf-controls">
          <div className="gf-selects">
            <select
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            >
              {Array.from(Array(6), (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Qty: {i + 1}
                </option>
              ))}
            </select>
            <select
              ref={priceRef}
              value={size}
              onChange={(e) => setSize(e.target.value)}
            >
              {priceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="gf-foot">
            <div className="gf-price">
              <span>Rs</span> {finalPrice}/-
            </div>
            <button className="gf-add-btn" onClick={handleaddtocart}>
              <FaShoppingCart />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
