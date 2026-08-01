import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ProductsDetails.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FoodRow from "../components/FoodRow";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useFavorites } from "../context/FavoritesContext";
import { recordRecentView } from "../utils/recentlyViewed";
import { usePageMeta } from "../utils/usePageMeta";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:5001/api/product/${id}`),
      fetch(`http://localhost:5001/api/related/${id}`),
    ])
      .then(async ([prodRes, relRes]) => {
        const prodData = await prodRes.json();
        if (prodData && prodData._id) {
          setProduct(prodData);
          recordRecentView(prodData);
        }
        try {
          const relData = await relRes.json();
          if (relData && relData.related) setRelated(relData.related);
        } catch {}
      })
      .catch((err) => console.log(err));
  }, [id]);

  usePageMeta({
    title: product ? `${product.name} | Mitho` : 'Loading | Mitho',
    description: product
      ? `${product.description || `${product.name} at Mitho.`} Order hot & fresh delivery.`
      : 'Order delicious food from Mitho.',
    ogImage: product ? product.img : undefined,
  });

  if (!product) {
    return (
      <div className="pd-loading">
        <div className="pd-loading-spinner"></div>
        <p>Loading Delicious Food...</p>
      </div>
    );
  }

  const options = product.options || {};
  const sizes = Object.keys(options);
  const fav = isFavorite(product._id);

  return (
    <div className="pd-page">
      <Navbar />

      <div className="pd-bg-orb pd-bg-orb-1"></div>
      <div className="pd-bg-orb pd-bg-orb-2"></div>
      <div className="pd-bg-orb pd-bg-orb-3"></div>

      <div className="pd-container">

        <button className="pd-back-btn" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
          Back to Menu
        </button>

        <div className="pd-card">

          <div className="pd-card-inner">

            <div className="pd-image-col">
              <div className="pd-image-wrapper">
                <span className="pd-badge">Chef's Choice</span>
                <button
                  className={`gf-fav-btn ${fav ? 'gf-fav-active' : ''}`}
                  aria-label={fav ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{ top: '16px', right: '16px', width: '40px', height: '40px', fontSize: '1rem' }}
                  onClick={() => toggleFavorite(product)}
                >
                  {fav ? <FaHeart /> : <FaRegHeart />}
                </button>
                <img src={product.img} alt={product.name} className="pd-food-img" />
              </div>
            </div>

            <div className="pd-content-col">

              <div className="pd-content-inner">

                <span className="pd-category">{product.CategoryName}</span>
                <h1 className="pd-title">{product.name}</h1>

                <p className="pd-desc">{product.description}</p>

                <div className="pd-options">
                  <h3 className="pd-options-title">Available Options</h3>
                  <div className="pd-options-list">
                    {sizes.length > 0 ? (
                      sizes.map((item) => (
                        <div className="pd-option-card" key={item}>
                          <span className="pd-option-label">{item}</span>
                          <span className="pd-option-price">Rs. {options[item]}</span>
                        </div>
                      ))
                    ) : (
                      <div className="pd-option-card">
                        <span className="pd-option-label">Price</span>
                        <span className="pd-option-price">Rs. {product.price}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pd-features">
                  {[
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: "Delivery", desc: "25-35 Minutes" },
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: "Fresh", desc: "Made After Order" },
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>, title: "Popular", desc: "Best Selling Item" },
                    { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>, title: "Quality", desc: "Premium Ingredients" },
                  ].map((f, i) => (
                    <div className="pd-feature-card" key={i}>
                      <div className="pd-feature-icon">{f.icon}</div>
                      <div className="pd-feature-text">
                        <h6>{f.title}</h6>
                        <p>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pd-restaurant">
                  <div className="pd-restaurant-card">
                    <div className="pd-restaurant-header">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
                      <h5>Mitho Restaurant</h5>
                    </div>
                    <p>Freshly prepared using premium ingredients with professional chefs ensuring delicious taste and hygiene.</p>
                  </div>
                </div>

                <div className="pd-tags">
                  {["Fresh", "Healthy", "Fast Delivery", "Top Rated", "Hygienic"].map((tag) => (
                    <span className="pd-tag" key={tag}>{tag}</span>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <FoodRow
          label="Frequently Bought Together"
          title="You May Also Like"
          items={related}
          linkText="View all"
          linkTo="/menu"
          loading={false}
          id="related"
        />
      )}

      <Footer />
    </div>
  );
}