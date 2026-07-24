import React, { useEffect, useState } from "react";
import "./Reviews.css";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");

  const userEmail = localStorage.getItem("userEmail");
  const userName = userEmail
    ? userEmail.split("@")[0].charAt(0).toUpperCase() +
      userEmail.split("@")[0].slice(1)
    : "";

  const loadReviews = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/reviews");
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!userEmail) {
      alert("Please login to write a review.");
      return;
    }

    if (!review.trim()) {
      alert("Please enter a review.");
      return;
    }

    const res = await fetch("http://localhost:5001/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        rating,
        review,
      }),
    });

    const data = await res.json();

    if (data.success) {
      setReview("");
      setRating(5);
      loadReviews();
    }
  };

  return (
    <section className="reviews-section">
      <div className="container">
        <div className="section-header">
          <div className="section-label">Testimonials</div>
          <h2>Customer Reviews</h2>
        </div>

        {/* Review Form */}
        {userEmail ? (
          <div className="review-form-wrapper">
            <form onSubmit={submitReview}>
              <div className="mb-3">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value="5">⭐⭐⭐⭐⭐</option>
                  <option value="4">⭐⭐⭐⭐</option>
                  <option value="3">⭐⭐⭐</option>
                  <option value="2">⭐⭐</option>
                  <option value="1">⭐</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Your Review</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Share your experience with us..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>

              <button className="btn btn-success">Submit Review</button>
            </form>
          </div>
        ) : (
          <div className="alert alert-warning text-center">
            Please login to write a review.
          </div>
        )}

        {/* Review Cards */}
        <div className="row g-4">
          {reviews.map((item, index) => (
            <div
              className="col-md-4 reveal"
              key={item._id}
              style={{ transitionDelay: `${Math.min(index * 0.1, 0.3)}s` }}
            >
              <div className="review-card">
                <h4>{"⭐".repeat(item.rating)}</h4>
                <p>&ldquo;{item.review}&rdquo;</p>
                <strong>{item.name}</strong>
                <small className="review-date">
                  {new Date(item.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
