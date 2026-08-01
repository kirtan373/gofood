import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaArrowRight, FaTruck, FaShieldAlt, FaCreditCard, FaShoppingBag, FaFire } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PromoSlider from '../components/PromoSlider';
import FoodRow from '../components/FoodRow';
import { SkeletonCircle } from '../components/Skeleton';
import { usePageMeta } from '../utils/usePageMeta';
import './Landing.css';

const API = 'http://localhost:5001/api';

const CATEGORY_COLORS = {
  Pizza: '#ff6b35',
  Burger: '#e14f1d',
  Momos: '#7a8b5f',
  Biryani: '#e8a33d',
  Chinese: '#b3452e',
  Drinks: '#d97e3d',
  Dessert: '#c9524f',
};

function pickByFlag(items, flag, fallback, count = 8) {
  const flagged = items.filter((i) => i[flag]);
  const source = flagged.length > 0 ? flagged : fallback;
  return source.slice(0, count);
}

export default function Landing() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: 'Mitho | Delicious Food, Delivered Fast',
    description:
      'Order from the best restaurants in Kathmandu — hot & fresh delivery in under 30 minutes. Explore pizza, momos, burgers and more.',
    ogImage:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, foodRes] = await Promise.all([
          fetch(`${API}/categories`),
          fetch(`${API}/foodData`, { method: 'POST' }),
        ]);
        const catData = await catRes.json();
        const foodData = await foodRes.json();
        setCategories(catData.categories || []);
        setFoodItems(foodData[0] || []);
      } catch {} finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/menu?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  const shuffled = [...foodItems].sort(() => 0.5 - Math.random());
  const popularItems = shuffled.slice(0, 8);

  const trending = pickByFlag(foodItems, 'isTrending', popularItems);
  const bestSellers = pickByFlag(foodItems, 'isBestSeller', popularItems);
  const specials = pickByFlag(foodItems, 'isTodaysSpecial', popularItems);
  const featured = pickByFlag(foodItems, 'isFeatured', popularItems);

  return (
    <div className="lp-page">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg">
          <div className="lp-hero-shape lp-hero-shape-1" />
          <div className="lp-hero-shape lp-hero-shape-2" />
          <div className="lp-hero-shape lp-hero-shape-3" />
        </div>

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <FaFire /> Nepal's Favourite Food Delivery
          </div>
          <h1 className="lp-hero-title">
            Delicious Food,<br />
            <span className="lp-hero-highlight">Delivered Fast</span><br />
            to Your Door
          </h1>
          <p className="lp-hero-subtitle">
            From local favourites to gourmet treasures — order from the best restaurants
            in Kathmandu and get it delivered hot & fresh in under 30 minutes.
          </p>

          <form className="lp-hero-search" onSubmit={handleSearch}>
            <div className="lp-search-icon"><FaSearch /></div>
            <input
              type="text"
              placeholder="Search for pizza, momos, burger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="lp-search-btn">
              Search <FaArrowRight />
            </button>
          </form>

          <div className="lp-hero-tags">
            {categories.slice(0, 5).map((cat) => (
              <span key={cat._id} onClick={() => navigate(`/menu?search=${encodeURIComponent(cat.CategoryName.toLowerCase())}`)}>
                {cat.CategoryName}
              </span>
            ))}
          </div>

          <div className="lp-hero-stats">
            <div className="lp-stat">
              <div className="lp-stat-number">200+</div>
              <div className="lp-stat-label">Menu Items</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <div className="lp-stat-number">15K+</div>
              <div className="lp-stat-label">Happy Customers</div>
            </div>
            <div className="lp-stat-divider" />
            <div className="lp-stat">
              <div className="lp-stat-number">30</div>
              <div className="lp-stat-label">Min Avg. Delivery</div>
            </div>
          </div>
        </div>

        <div className="lp-hero-visual">
          <div className="lp-hero-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=600&fit=crop"
              alt="Delicious food"
              className="lp-hero-img"
            />
            <div className="lp-hero-float lp-hero-float-1">
              <FaTruck /> 30 min delivery
            </div>
          </div>
        </div>
      </section>

      {/* ── Promotional Banner Slider ── */}
      <PromoSlider />

      {/* ── Categories Section ── */}
      <section className="lp-section lp-categories">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-label">Browse</span>
            <h2 className="lp-section-title">Explore Categories</h2>
          </div>
          {loading ? (
            <div className="lp-cat-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="lp-cat-card" style={{ padding: '24px 16px' }}>
                  <SkeletonCircle size={56} />
                  <div className="gf-skeleton gf-skeleton--line short" style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="lp-cat-grid">
              {categories.map((cat, i) => (
                <Link
                  key={cat._id}
                  to={`/menu?search=${encodeURIComponent(cat.CategoryName.toLowerCase())}`}
                  className="lp-cat-card"
                  style={{ '--cat-color': CATEGORY_COLORS[cat.CategoryName] || '#6b7280', animationDelay: `${i * 0.08}s` }}
                >
                  <div className="lp-cat-emoji">{cat.icon || '🍽️'}</div>
                  <div className="lp-cat-name">{cat.CategoryName}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Smart Food Rows ── */}
      <FoodRow
        label="Trending Now"
        title="Trending Dishes"
        items={trending}
        linkText="View all"
        linkTo="/menu"
        badge="Trending"
        loading={loading}
      />
      <FoodRow
        label="Favourites"
        title="Best Sellers"
        items={bestSellers}
        linkText="View all"
        linkTo="/menu"
        badge="Best Seller"
        loading={loading}
      />
      <FoodRow
        label="Chef's Pick"
        title="Today's Specials"
        items={specials}
        linkText="View all"
        linkTo="/menu"
        badge="Special"
        loading={loading}
      />
      <FoodRow
        label="Handpicked"
        title="Featured Foods"
        items={featured}
        linkText="View all"
        linkTo="/menu"
        badge="Featured"
        loading={loading}
      />

      {/* ── How It Works ── */}
      <section className="lp-section lp-how">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-label">Simple & Quick</span>
            <h2 className="lp-section-title">How It Works</h2>
          </div>
          <div className="lp-steps">
            <div className="lp-step">
              <div className="lp-step-icon"><FaSearch /></div>
              <div className="lp-step-num">01</div>
              <h3>Browse & Choose</h3>
              <p>Explore our menu of 200+ items from the best restaurants near you</p>
            </div>
            <div className="lp-step-connector" />
            <div className="lp-step">
              <div className="lp-step-icon"><FaCreditCard /></div>
              <div className="lp-step-num">02</div>
              <h3>Place Your Order</h3>
              <p>Add items to cart, choose delivery address & pay securely online or cash</p>
            </div>
            <div className="lp-step-connector" />
            <div className="lp-step">
              <div className="lp-step-icon"><FaTruck /></div>
              <div className="lp-step-num">03</div>
              <h3>Fast Delivery</h3>
              <p>Your food arrives hot & fresh at your doorstep in under 30 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Items Preview ── */}
      {!loading && popularItems.length > 0 && (
        <section className="lp-section lp-popular">
          <div className="lp-container">
            <div className="lp-section-header">
              <span className="lp-section-label">Loved By Everyone</span>
              <h2 className="lp-section-title">Popular Items</h2>
            </div>
            <div className="lp-popular-grid">
              {popularItems.map((item, i) => (
                <Link
                  key={item._id}
                  to={`/product/${item._id}`}
                  className="lp-popular-card"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="lp-popular-img-wrap">
                    <img loading="lazy" src={item.img} alt={item.name} />
                  </div>
                  <div className="lp-popular-info">
                    <h4>{item.name}</h4>
                    <p className="lp-popular-category">{item.CategoryName}</p>
                    <div className="lp-popular-price">
                      {item.options && Object.keys(item.options).length > 0 && (
                        <span>Rs. {Object.values(item.options)[0]}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="lp-popular-cta">
              <Link to="/menu" className="lp-btn lp-btn-primary">
                View Full Menu <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Choose Us ── */}
      <section className="lp-section lp-features">
        <div className="lp-container">
          <div className="lp-section-header">
            <span className="lp-section-label">Our Promise</span>
            <h2 className="lp-section-title">Why Choose Mitho</h2>
          </div>
          <div className="lp-features-grid">
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: 'rgba(255,107,53,0.1)', color: '#ff6b35' }}>
                <FaTruck />
              </div>
              <h3>Lightning Fast</h3>
              <p>Hot and fresh food delivered to your door in under 30 minutes, every time.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: 'rgba(232,163,61,0.12)', color: '#e8a33d' }}>
                <FaShieldAlt />
              </div>
              <h3>Premium Quality</h3>
              <p>Handpicked ingredients, expert chefs, and strict quality control on every order.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: 'rgba(58,48,38,0.08)', color: '#3a3026' }}>
                <FaCreditCard />
              </div>
              <h3>Secure Payment</h3>
              <p>Pay with eSewa or cash on delivery — your choice, your comfort.</p>
            </div>
            <div className="lp-feature-card">
              <div className="lp-feature-icon" style={{ background: 'rgba(225,79,29,0.1)', color: '#e14f1d' }}>
                <FaShoppingBag />
              </div>
              <h3>First Order Discount</h3>
              <p>Get 30% off on your very first order. Welcome to the Mitho family!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="lp-section lp-cta">
        <div className="lp-container">
          <div className="lp-cta-card">
            <div className="lp-cta-content">
              <h2>Ready to Order?</h2>
              <p>Join thousands of happy customers enjoying delicious food delivered fast.</p>
              <div className="lp-cta-actions">
                <Link to="/menu" className="lp-btn lp-btn-white">
                  Order Now <FaArrowRight />
                </Link>
                <Link to="/createuser" className="lp-btn lp-btn-outline-white">
                  Create Account
                </Link>
              </div>
            </div>
            <div className="lp-cta-visual">
              <img
                src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop"
                alt="Pizza"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
