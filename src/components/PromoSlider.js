import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const FALLBACK_SLIDES = [
  {
    tag: 'Today\'s Special',
    title: 'Up to 30% off on your first order',
    text: 'Welcome to the Mitho family. Enjoy premium food delivered hot & fresh.',
    cta: 'Order Now',
    link: '/menu',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
  },
  {
    tag: 'Free Delivery',
    title: 'Free delivery on orders above Rs. 1000',
    text: 'Skip the delivery fee on every order above the mark — every single day.',
    cta: 'Browse Menu',
    link: '/menu',
    img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop',
  },
  {
    tag: 'Join Mitho',
    title: 'Create an account & save more',
    text: 'Track orders, save favourites and unlock exclusive member deals.',
    cta: 'Sign Up Free',
    link: '/createuser',
    img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
  },
];

export default function PromoSlider() {
  const [index, setIndex] = useState(0);
  const slides = FALLBACK_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="promo-slider">
      <div
        className="promo-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, i) => (
          <div className="promo-slide" key={i}>
            <img
              className="promo-slide-img"
              src={slide.img}
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div className="promo-slide-content">
              <span className="promo-slide-tag">{slide.tag}</span>
              <h3>{slide.title}</h3>
              <p>{slide.text}</p>
              <Link to={slide.link} className="promo-btn">
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="promo-dots">
        {slides.map((slide, i) => (
          <button
            key={i}
            className={`promo-dot ${i === index ? 'promo-dot-active' : ''}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
