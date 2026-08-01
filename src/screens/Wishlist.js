import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useFavorites } from '../context/FavoritesContext';
import { usePageMeta } from '../utils/usePageMeta';

export default function Wishlist() {
  const { favorites, toggleFavorite } = useFavorites();

  usePageMeta({
    title: 'My Wishlist | Mitho',
    description: 'Your saved favourite foods, ready to order anytime.',
  });

  return (
    <>
      <Navbar />
      <div className="wishlist-page">
      {favorites.length === 0 ? (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">💛</div>
          <h3>Your wishlist is empty</h3>
          <p>
            Tap the heart on any dish to save it here for a quick order later.
          </p>
          <Link to="/menu" className="lp-btn">
            Browse the Menu
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {favorites.map((fav) => (
            <Link to={`/product/${fav.id}`} className="gf-tile" key={fav.id}>
              <button
                className="gf-fav-btn gf-fav-active"
                aria-label="Remove from wishlist"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite({ _id: fav.id, name: fav.name, img: fav.img });
                }}
              >
                <FaHeart />
              </button>
              <img className="gf-tile-img" loading="lazy" src={fav.img} alt={fav.name} />
              <div className="gf-tile-body">
                <p className="gf-tile-name">{fav.name}</p>
                <div className="gf-tile-cat">{fav.category || 'Food'}</div>
                <div className="gf-tile-price">
                  <span>Rs. {fav.price}/-</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      </div>
      <Footer />
    </>
  );
}
