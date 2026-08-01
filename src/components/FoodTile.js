import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';

export default function FoodTile({ item, badge }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(item._id);
  const price =
    item.options && Object.keys(item.options).length > 0
      ? Object.values(item.options)[0]
      : 0;

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(item);
  };

  return (
    <Link to={`/product/${item._id}`} className="gf-tile">
      {badge && <span className="gf-tile-badge">{badge}</span>}
      <button
        className={`gf-fav-btn ${fav ? 'gf-fav-active' : ''}`}
        aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={handleFav}
      >
        {fav ? <FaHeart /> : <FaRegHeart />}
      </button>
      <img className="gf-tile-img" loading="lazy" src={item.img} alt={item.name} />
      <div className="gf-tile-body">
        <p className="gf-tile-name">{item.name}</p>
        <div className="gf-tile-cat">{item.CategoryName}</div>
        <div className="gf-tile-price">
          <span>Rs. {price}/-</span>
        </div>
      </div>
    </Link>
  );
}
