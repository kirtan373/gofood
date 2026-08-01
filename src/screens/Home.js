import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Home.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";
import RecentlyViewed from "../components/RecentlyViewed";
import { SkeletonGrid } from "../components/Skeleton";
import { usePageMeta } from "../utils/usePageMeta";

import Hero from "./Hero";
import Categories from "./Categories";
import Offers from "./Offers";
import Reviews from "./Reviews";
import WhyChooseUs from "./WhyChooseUs";

function safeId(name) {
  return name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}

export default function Home() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [foodCat, setFoodCat] = useState([]);
  const [foodItem, setFoodItem] = useState([]);
  const [loading, setLoading] = useState(true);

  usePageMeta({
    title: "Menu | Mitho",
    description:
      "Browse the full Mitho menu — 200+ items across pizza, burgers, momos, biryani and more, delivered hot and fresh.",
  });

  const loadData = async () => {
    try {
      let response = await fetch("http://localhost:5001/api/foodData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      response = await response.json();

      setFoodItem(response[0] || []);
      setFoodCat(response[1] || []);
    } catch (err) {
      console.error("Error loading food data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [foodCat, foodItem, search]);

  const searchLower = debouncedSearch.toLowerCase().trim();

  const matchesSearch = (item) => {
    if (!searchLower) return true;
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.CategoryName.toLowerCase().includes(searchLower)
    );
  };

  const handleCategoryClick = (categoryName) => {
    setSearch(categoryName);
    const el = document.getElementById("menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const totalResults = foodItem.filter(matchesSearch).length;

  return (
    <div className="home-page">
      <Navbar />

      <Hero search={search} setSearch={setSearch} />

      <RecentlyViewed foodItems={foodItem} />

      <Categories
        categories={foodCat}
        activeCategory={search}
        onCategoryClick={handleCategoryClick}
      />

      <Offers />

      <section id="menu" className="menu-section">
        {searchLower && (
          <div className="category-filter-bar">
            <button
              className="filter-pill"
              onClick={() => setSearch("")}
            >
              All
            </button>
            {foodCat.map((cat) => (
              <button
                key={cat._id}
                className={`filter-pill ${cat.CategoryName.toLowerCase().includes(searchLower) ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat.CategoryName)}
              >
                <span className="filter-pill-icon">{cat.icon || "🍽️"}</span>
                {cat.CategoryName}
              </button>
            ))}
          </div>
        )}

        {searchLower && (
          <p className="search-results-count">
            {totalResults} {totalResults === 1 ? "item" : "items"} found for "<strong>{search}</strong>"
          </p>
        )}

        {loading ? (
          <SkeletonGrid count={8} />
        ) : (
        foodCat.map((cat) => {
          const items = foodItem.filter(
            (item) =>
              item.CategoryName === cat.CategoryName && matchesSearch(item)
          );

          if (items.length === 0) return null;

          return (
            <div key={cat._id} className="mb-5">
              <h2
                id={safeId(cat.CategoryName)}
                className="category-title reveal"
              >
                {cat.CategoryName}
              </h2>

              <div className="row g-4">
                {items.map((item, index) => (
                  <div
                    key={item._id}
                    className={`col-12 col-md-6 col-lg-4 col-xl-3 reveal`}
                    style={{ transitionDelay: `${Math.min(index * 0.05, 0.2)}s` }}
                  >
                    <Card foodItem={item} options={item.options} />
                  </div>
                ))}
              </div>
            </div>
          );
        })
        )}

        {searchLower && totalResults === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No items found for "{search}"</h3>
            <p>Try searching for something else like chicken, pizza, or cake.</p>
            <button className="filter-pill" onClick={() => setSearch("")}>
              Show All Items
            </button>
          </div>
        )}
      </section>

      <WhyChooseUs />

      <Reviews />

      <Footer />
    </div>
  );
}
