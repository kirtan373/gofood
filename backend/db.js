const mongoose = require('mongoose');

const ensureIndexes = async () => {
    const db = mongoose.connection.db;
    try {
        await db.collection('food_items').createIndex({ CategoryName: 1 });
        await db.collection('food_items').createIndex({ name: 1 });
        await db.collection('food_items').createIndex({ isHidden: 1, availability: 1 });
        await db.collection('food_category').createIndex({ CategoryName: 1 });
        await db.collection('food_category').createIndex({ isHidden: 1, displayOrder: 1 });
        await db.collection('order_data').createIndex({ email: 1 });
        await db.collection('order_data').createIndex({ Order_date: -1 });
        console.log("MongoDB indexes ensured");
    } catch (err) {
        console.error("Index creation error:", err.message);
    }
};

const mongoDB = async () => {
    try {
        // await mongoose.connect("mongodb+srv://kirtan0:kirtan012@cluster0.jxowk59.mongodb.net/db");
        await mongoose.connect("mongodb://kirtan0:kirtan012@ac-pmqswbe-shard-00-00.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-01.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-02.jxowk59.mongodb.net:27017/gofood?ssl=true&replicaSet=atlas-ygp8hi-shard-0&authSource=admin&appName=Cluster0");
        console.log("Connection successful");
        // NOTE: We no longer cache food_items/food_category on `global` here.
        // Routes (see backend/routes/DisplayData.js) now query MongoDB directly
        // on every request so admin updates show up immediately without a
        // server restart. A short TTL in-memory cache is used instead to cut
        // latency on repeat page loads without going stale for long.
        await ensureIndexes();
    } catch (err) {
        console.error("Error:", err);
};
}

module.exports = mongoDB;