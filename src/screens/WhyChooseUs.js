import React from "react";
import "./WhyChooseUs.css";

const features = [
  {
    icon: "🚚",
    title: "Fast Delivery",
    desc: "Hot and fresh food delivered to your doorstep in under 30 minutes.",
  },
  {
    icon: "⭐",
    title: "Premium Quality",
    desc: "Handpicked ingredients and expert chefs crafting every meal.",
  },
  {
    icon: "💳",
    title: "Secure Payment",
    desc: "Multiple payment options with bank-level security encryption.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="why-section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Our Promise</div>
          <h2>Why Choose Us</h2>
        </div>

        <div className="row g-4">
          {features.map((feat, index) => (
            <div key={index} className={`col-md-4 reveal reveal-delay-${index + 1}`}>
              <div className="why-card">
                <div className="why-icon">
                  <span>{feat.icon}</span>
                </div>
                <h4>{feat.title}</h4>
                <p>{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
