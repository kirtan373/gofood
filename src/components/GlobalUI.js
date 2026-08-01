import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaArrowUp } from 'react-icons/fa';
import { useCart } from './ContextReducer';

export function FloatingCart() {
  const navigate = useNavigate();
  const cartData = useCart() || [];
  const location = useLocation();

  if (
    location.pathname === '/cart' ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/payment') ||
    location.pathname.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <button
      className="floating-cart"
      aria-label="View cart"
      onClick={() => navigate('/cart')}
    >
      <FaShoppingCart />
      {cartData.length > 0 && (
        <span className="floating-cart-badge">{cartData.length}</span>
      )}
    </button>
  );
}

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      className={`scroll-top-btn ${visible ? 'visible' : ''}`}
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <FaArrowUp />
    </button>
  );
}

export default function GlobalUI() {
  return (
    <>
      <ScrollToTop />
      <FloatingCart />
    </>
  );
}
