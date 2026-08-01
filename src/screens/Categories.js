import React from "react";
import "./Category.css";

const fallbackIcons = {
  Pizza: "🍕",
  Burger: "🍔",
  Biryani: "🍛",
  Momos: "🥟",
  "Mo:Mo": "🥟",
  Chinese: "🍜",
  Drinks: "🥤",
  Dessert: "🍰",
  Chicken: "🍗",
  Pasta: "🍝",
  Sandwich: "🥪",
  Fries: "🍟",
  Sushi: "🍣",
  Taco: "🌮",
  Salad: "🥗",
  Noodles: "🍜",
  Bento: "🍱",
  Donut: "🍩",
  Cookie: "🍪",
  Coffee: "☕",
  BubbleTea: "🧋",
};

export default function Categories({ categories, activeCategory, onCategoryClick }) {
  return (
    <section className="quick-categories container">
      <div className="section-header">
        <div className="section-label">Browse</div>
        <h2>Explore Categories</h2>
      </div>

      <div className="row g-4">
        {categories.map((cat, index) => (
          <div
            key={cat._id}
            className={`col-6 col-md-4 col-lg-2 reveal reveal-delay-${Math.min(index + 1, 4)}`}
          >
            <div
              className={`category-box ${activeCategory === cat.CategoryName ? "category-active" : ""}`}
              onClick={() => onCategoryClick(cat.CategoryName)}
            >
              <div className="category-icon">
                {cat.icon || fallbackIcons[cat.CategoryName] || "🍽️"}
              </div>
              <h5>{cat.CategoryName}</h5>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
