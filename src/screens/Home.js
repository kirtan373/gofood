import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Home.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Card from "../components/Card";

import Hero from "./Hero";
import Categories from "./Categories";
import Offers from "./Offers";
import Reviews from "./Reviews";
import WhyChooseUs from "./WhyChooseUs";

export default function Home() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [foodCat, setFoodCat] = useState([]);
  const [foodItem, setFoodItem] = useState([]);

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
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Scroll reveal observer
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
  }, [foodCat, foodItem]);

  return (
    <div className="home-page">
      <Navbar />

      <Hero search={search} setSearch={setSearch} />

      <Categories categories={foodCat} />

      <Offers />

      <section id="menu" className="menu-section">
        {foodCat.map((cat) => {
          const items = foodItem.filter(
            (item) =>
              item.CategoryName === cat.CategoryName &&
              item.name.toLowerCase().includes(search.toLowerCase())
          );

          if (items.length === 0) return null;

          return (
            <div key={cat._id} className="mb-5">
              <h2
                id={cat.CategoryName.toLowerCase()}
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
        })}
      </section>

      <WhyChooseUs />

      <Reviews />

      <Footer />
    </div>
  );
}
