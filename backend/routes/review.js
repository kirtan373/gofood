const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// GET all reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    return res.status(200).json(reviews);
  } catch (err) {
    console.error("GET Reviews Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// POST a review
router.post("/reviews", async (req, res) => {
  try {
    const { name, email, rating, review } = req.body;

    if (!name || !email || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newReview = new Review({
      name,
      email,
      rating,
      review,
    });

    await newReview.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (err) {
    console.error("POST Review Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;