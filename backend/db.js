const mongoose = require('mongoose');

const mongoDB = async () => {
    try {
        // await mongoose.connect("mongodb+srv://kirtan0:kirtan012@cluster0.jxowk59.mongodb.net/db");
        await mongoose.connect("mongodb://kirtan0:kirtan012@ac-pmqswbe-shard-00-00.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-01.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-02.jxowk59.mongodb.net:27017/gofood?ssl=true&replicaSet=atlas-ygp8hi-shard-0&authSource=admin&appName=Cluster0");
        console.log("Connection successful");
        // NOTE: We no longer cache food_items/food_category on `global` here.
        // Routes (see backend/routes/DisplayData.js) now query MongoDB directly
        // on every request so admin updates show up immediately without a
        // server restart.
    } catch (err) {
        console.error("Error:", err);
};
}

module.exports = mongoDB;