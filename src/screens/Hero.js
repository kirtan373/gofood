import React from "react";
import { FaSearch, FaArrowRight } from "react-icons/fa";
import "./Hero.css";

export default function Hero({ search, setSearch }) {
  return (
    <section className="hero-section">
      <div
        id="carouselExampleFade"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="5000"
      >
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              className="d-block w-100 hero-image"
              src="https://images.unsplash.com/photo-1485963631004-f2f00b1d6606?q=80&w=1975&auto=format&fit=crop"
              alt="Delicious Food"
            />
          </div>
          <div className="carousel-item">
            <img
              className="d-block w-100 hero-image"
              src="https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=1974&auto=format&fit=crop"
              alt="Fresh Meals"
            />
          </div>
          <div className="carousel-item">
            <img
              className="d-block w-100 hero-image"
              src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=1974&auto=format&fit=crop"
              alt="Gourmet Dishes"
            />
          </div>
        </div>

        <div className="hero-overlay">
          <span className="hero-badge">Fresh &bull; Fast &bull; Delicious</span>

          <h1>
            Every Bite Becomes a <span>Beautiful Memory</span>
          </h1>

          <p>
            Discover handcrafted meals from the finest kitchens.
            Delivered hot, fresh, and right to your door.
          </p>

          <div className="hero-search">
            <input
              type="text"
              placeholder="Search chicken, pizza, burger, biryani..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button>
              <FaSearch />
              Search
            </button>
          </div>

          <a href="#menu" className="hero-btn">
            Explore Menu
            <FaArrowRight />
          </a>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">200+</div>
              <div className="hero-stat-lbl">Menu Items</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">15k+</div>
              <div className="hero-stat-lbl">Happy Customers</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">30min</div>
              <div className="hero-stat-lbl">Avg. Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
