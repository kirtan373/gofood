const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb://kirtan0:kirtan012@ac-pmqswbe-shard-00-00.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-01.jxowk59.mongodb.net:27017,ac-pmqswbe-shard-00-02.jxowk59.mongodb.net:27017/gofood?ssl=true&replicaSet=atlas-ygp8hi-shard-0&authSource=admin&appName=Cluster0";
 // "mongodb+srv://kirtan0:kirtan012@cluster0.jxowk59.mongodb.net/db";

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Delete old data
    await db.collection("food_items").deleteMany({});
    await db.collection("food_category").deleteMany({});

    console.log("🗑️ Old data deleted");

    // Insert Categories
    await db.collection("food_category").insertMany([
      { CategoryName: "Pizza", icon: "🍕", displayOrder: 1, isHidden: false, createdAt: new Date() },
      { CategoryName: "Burger", icon: "🍔", displayOrder: 2, isHidden: false, createdAt: new Date() },
      { CategoryName: "Biryani", icon: "🍛", displayOrder: 3, isHidden: false, createdAt: new Date() },
      { CategoryName: "Drinks", icon: "🥤", displayOrder: 4, isHidden: false, createdAt: new Date() },
      { CategoryName: "Dessert", icon: "🍰", displayOrder: 5, isHidden: false, createdAt: new Date() }
    ]);

    // Insert Food Items
    await db.collection("food_items").insertMany([
      {
        CategoryName: "Pizza",
        name: "Margherita Pizza",
        img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
        images: [
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
          "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500"
        ],
        options: { Regular: "180", Medium: "280", Large: "380" },
        price: 380,
        discountPrice: 320,
        ingredients: ["Cheese", "Tomato sauce", "Basil", "Olive oil"],
        calories: 220,
        prepTime: "15 mins",
        availability: true,
        description: "Classic cheese pizza.",
        stock: 5,
        isBestSeller: true,
        isTodaysSpecial: true,
        isHidden: false,
        isFeatured: false,
        isTrending: false,
        createdAt: new Date()
      },
      {
        CategoryName: "Pizza",
        name: "Pepperoni Pizza",
        img: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500",
        images: [
          "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500",
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500"
        ],
        options: { Regular: "220", Medium: "320", Large: "420" },
        price: 420,
        discountPrice: null,
        ingredients: ["Pepperoni", "Cheese", "Tomato sauce"],
        calories: 290,
        prepTime: "18 mins",
        availability: true,
        description: "Loaded with pepperoni.",
        stock: 8,
        isBestSeller: true,
        isTodaysSpecial: false,
        isHidden: false,
        isFeatured: false,
        isTrending: false,
        createdAt: new Date()
      },
      {
        CategoryName: "Pizza",
        name: "BBQ Chicken Pizza",
        img: "https://images.unsplash.com/photo-1571066811602-716837d681de?w=500",
        images: ["https://images.unsplash.com/photo-1571066811602-716837d681de?w=500"],
        options: { Regular: "240", Medium: "340", Large: "440" },
        price: 440,
        discountPrice: null,
        ingredients: ["BBQ chicken", "Onions", "Cheese"],
        calories: 330,
        prepTime: "20 mins",
        availability: true,
        description: "Smoky BBQ chicken with onions and cheese.",
        stock: 35,
        isBestSeller: false,
        isTodaysSpecial: false,
        isHidden: false,
        isFeatured: true,
        isTrending: false,
        createdAt: new Date()
      },
      {
        CategoryName: "Pizza",
        name: "Veggie Supreme Pizza",
        img: "https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=500",
        options: { Regular: "200", Medium: "300", Large: "400" },
        description: "Loaded with fresh garden vegetables.",
        stock: 42
      },
      {
        CategoryName: "Pizza",
        name: "Mushroom Truffle Pizza",
        img: "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=500",
        options: { Regular: "260", Medium: "360", Large: "460" },
        description: "Wild mushrooms with a hint of truffle oil."
      },
      {
        CategoryName: "Pizza",
        name: "Hawaiian Pizza",
        img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500",
        options: { Regular: "210", Medium: "310", Large: "410" },
        description: "Ham and pineapple, sweet and savory."
      },

      {
        CategoryName: "Burger",
        name: "Chicken Burger",
        img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
        options: { Regular: "150", Large: "220" },
        description: "Grilled chicken burger."
      },
      {
        CategoryName: "Burger",
        name: "Veg Burger",
        img: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500",
        options: { Regular: "120", Large: "180" },
        description: "Fresh vegetable burger.",
        stock: 3
      },
      {
        CategoryName: "Burger",
        name: "Classic Beef Burger",
        img: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=500",
        options: { Regular: "170", Large: "240" },
        description: "Juicy beef patty with lettuce and tomato."
      },
      {
        CategoryName: "Burger",
        name: "Cheese Burst Burger",
        img: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500",
        options: { Regular: "160", Large: "230" },
        description: "Melted cheese oozing from every bite."
      },
      {
        CategoryName: "Burger",
        name: "Double Patty Burger",
        img: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500",
        options: { Regular: "200", Large: "280" },
        description: "Two patties stacked with all the fixings."
      },
      {
        CategoryName: "Burger",
        name: "Spicy Jalapeno Burger",
        img: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=500",
        options: { Regular: "180", Large: "250" },
        description: "Extra spicy with jalapenos and pepper jack."
      },
      {
        CategoryName: "Burger",
        name: "Mushroom Swiss Burger",
        img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500",
        options: { Regular: "175", Large: "245" },
        description: "Sauteed mushrooms with melted swiss cheese."
      },

      {
        CategoryName: "Biryani",
        name: "Chicken Biryani",
        img: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=500",
        options: { Half: "180", Full: "320" },
        description: "Spicy chicken biryani.",
        stock: 6
      },
      {
        CategoryName: "Biryani",
        name: "Veg Biryani",
        img: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=500",
        options: { Half: "150", Full: "280" },
        description: "Vegetable biryani."
      },
      {
        CategoryName: "Biryani",
        name: "Mutton Biryani",
        img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500",
        options: { Half: "250", Full: "450" },
        description: "Slow-cooked mutton with fragrant basmati rice."
      },
      {
        CategoryName: "Biryani",
        name: "Egg Biryani",
        img: "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500",
        options: { Half: "140", Full: "260" },
        description: "Boiled eggs layered with spiced rice."
      },
      {
        CategoryName: "Biryani",
        name: "Prawn Biryani",
        img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500",
        options: { Half: "220", Full: "400" },
        description: "Fresh prawns cooked in aromatic spices and rice."
      },
      {
        CategoryName: "Biryani",
        name: "Paneer Biryani",
        img: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
        options: { Half: "170", Full: "300" },
        description: "Soft paneer cubes with basmati rice and spices."
      },

      {
        CategoryName: "Drinks",
        name: "Coca Cola",
        img: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500",
        options: { "250ml": "50", "500ml": "80" },
        description: "Cold soft drink."
      },
      {
        CategoryName: "Drinks",
        name: "Fresh Lemonade",
        img: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500",
        options: { "250ml": "60", "500ml": "100" },
        description: "Refreshing homemade lemonade."
      },
      {
        CategoryName: "Drinks",
        name: "Mango Lassi",
        img: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500",
        options: { "250ml": "80", "500ml": "130" },
        description: "Creamy yogurt drink blended with mango.",
        stock: 4
      },
      {
        CategoryName: "Drinks",
        name: "Iced Coffee",
        img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500",
        options: { "250ml": "90", "500ml": "150" },
        description: "Chilled coffee served over ice."
      },
      {
        CategoryName: "Drinks",
        name: "Orange Juice",
        img: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500",
        options: { "250ml": "70", "500ml": "120" },
        description: "Freshly squeezed orange juice."
      },
  

      {
        CategoryName: "Dessert",
        name: "Chocolate Cake",
        img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
        options: { Slice: "120", Half: "500", Full: "900" },
        description: "Rich chocolate cake."
      },
      {
        CategoryName: "Dessert",
        name: "Vanilla Ice Cream",
        img: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500",
        options: { Small: "70", Large: "130" },
        description: "Classic creamy vanilla ice cream."
      },
      {
        CategoryName: "Dessert",
        name: "Red Velvet Cake",
        img: "https://images.unsplash.com/photo-1586985289906-406988974504?w=500",
        options: { Slice: "140", Half: "550", Full: "950" },
        description: "Velvety smooth cake with cream cheese frosting."
      },
      {
        CategoryName: "Dessert",
        name: "Tiramisu",
        img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500",
        options: { Slice: "160", Full: "700" },
        description: "Classic Italian coffee-flavored dessert."
      },
     
      {
        CategoryName: "Dessert",
        name: "Brownie with Ice Cream",
        img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500",
        options: { Single: "150", Double: "270" },
        description: "Warm fudgy brownie topped with ice cream."
      }
    ]);

    console.log("✅ Dummy data inserted successfully!");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedDatabase();