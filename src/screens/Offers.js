import React from "react";
import { useNavigate } from "react-router-dom";
import "./Offers.css";

export default function Offers() {
  const navigate = useNavigate();

  const scrollToMenu = () => {
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/#menu");
    }
  };

  return (
    <section className="offer-section container">
      <div className="row g-4">
        <div className="col-md-6 reveal reveal-delay-1">
          <div className="offer-card offer-card--orange">
            <span className="offer-card-tag">First Order</span>
            <h2>30% OFF</h2>
            <p>On your very first order. Taste the best, pay less.</p>
            <button onClick={scrollToMenu}>Order Now</button>
          </div>
        </div>

        <div className="col-md-6 reveal reveal-delay-2">
          <div className="offer-card offer-card--dark">
            <span className="offer-card-tag">Every Order</span>
            <h2>Free Delivery</h2>
            <p>On all orders above Rs.1000. Fast &amp; reliable.</p>
            <button onClick={scrollToMenu}>Shop Now</button>
          </div>
        </div>
      </div>
    </section>
  );
}
