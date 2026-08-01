const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Short-TTL in-memory cache (15s) so repeated storefront loads are served
// instantly while admin edits still propagate within a few seconds.
const cache = new Map();
const CACHE_TTL = 15 * 1000;

function cached(key, loader) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.t === CACHE_TTL) cache.delete(key);
  const fresh = cache.get(key);
  if (fresh) return Promise.resolve(fresh.v);
  return loader().then((value) => {
    cache.set(key, { v: value, t: Date.now() });
    return value;
  });
}

function clearDataCache() {
  cache.delete('foodData');
  cache.delete('categories');
}
router._clearCache = clearDataCache;

// IMPORTANT: This route used to return `global.food_items` / `global.foodCategory`,
// which were only populated ONCE when the server started (see backend/db.js).
// That meant any admin edit (price, options, name, etc.) was saved correctly to
// MongoDB, but the frontend kept getting the old snapshot from server startup
// until the backend was restarted. We now query MongoDB directly on every
// request so the frontend always gets fresh, up-to-date data.
router.post('/foodData', async (req, res) => {
    try {
        // Hidden foods (isHidden) and hidden categories (isHidden) are managed
        // by the admin panel and should not appear on the public storefront.
        // Unavailable foods (availability === false) are also excluded.
        const data = await cached('foodData', async () => {
            const foodItems = await mongoose.connection.db.collection('food_items').find({
                isHidden: { $ne: true },
                availability: { $ne: false }
            }).toArray();
            const foodCategory = await mongoose.connection.db.collection('food_category').find({
                isHidden: { $ne: true }
            }).sort({ displayOrder: 1, CategoryName: 1 }).toArray();
            return [foodItems, foodCategory];
        });
        res.set('Cache-Control', 'private, max-age=15');
        res.json(data);
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
                _id: new mongoose.Types.ObjectId(req.params.id),
                isHidden: { $ne: true },
                availability: { $ne: false }
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
router.get('/categories', async (req, res) => {
    try {
        const categories = await cached('categories', () =>
            mongoose.connection.db.collection('food_category').find({
                isHidden: { $ne: true }
            }).sort({ displayOrder: 1, CategoryName: 1 }).toArray()
        );
        res.set('Cache-Control', 'private, max-age=15');
        res.json({ success: true, categories });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// Related / "frequently bought together" suggestions: same-category items,
// excluding the current product and anything hidden/unavailable.
router.get('/related/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const food = await mongoose.connection.db.collection('food_items').findOne({
            _id: new mongoose.Types.ObjectId(id),
            isHidden: { $ne: true },
            availability: { $ne: false }
        });
        if (!food) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const related = await mongoose.connection.db.collection('food_items').find({
            _id: { $ne: food._id },
            CategoryName: food.CategoryName,
            isHidden: { $ne: true },
            availability: { $ne: false }
        }).limit(8).toArray();
        res.set('Cache-Control', 'private, max-age=30');
        res.json({ success: true, related });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
module.exports = router;
module.exports.clearDataCache = clearDataCache;