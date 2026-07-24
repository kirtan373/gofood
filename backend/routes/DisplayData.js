const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// IMPORTANT: This route used to return `global.food_items` / `global.foodCategory`,
// which were only populated ONCE when the server started (see backend/db.js).
// That meant any admin edit (price, options, name, etc.) was saved correctly to
// MongoDB, but the frontend kept getting the old snapshot from server startup
// until the backend was restarted. We now query MongoDB directly on every
// request so the frontend always gets fresh, up-to-date data.
router.post('/foodData', async (req, res) => {
    try {
        const foodItems = await mongoose.connection.db.collection('food_items').find({}).toArray();
        const foodCategory = await mongoose.connection.db.collection('food_category').find({}).toArray();
        res.json([foodItems, foodCategory]);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
})
router.get('/product/:id', async (req, res) => {
    try {
        const food = await mongoose.connection.db
            .collection('food_items')
            .findOne({
                _id: new mongoose.Types.ObjectId(req.params.id)
            });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.json(food);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});
module.exports = router;