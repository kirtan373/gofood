const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Order = require('../models/Orders');
const Review = require('../models/Review');
const authAdmin = require('../middleware/authAdmin');
const mongoose = require('mongoose');

const createAdminToken = (admin) => {
  return jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'admin-secret-key', {
    expiresIn: '7d'
  });
};

router.post('/admin/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const isMatch = await admin.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }

    const token = createAdminToken(admin);
    res.json({ success: true, token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/dashboard', authAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    const orders = await Order.find({});
    const foodItems = await mongoose.connection.db.collection('food_items').find({}).toArray();
    const categories = await mongoose.connection.db.collection('food_category').find({}).toArray();

    const totalRevenue = orders.reduce((sum, order) => {
      const total = Array.isArray(order.order_data) ? order.order_data.reduce((acc, entry) => {
        if (Array.isArray(entry)) {
          return acc + entry.reduce((inner, item) => {
            const price = Number(item?.price) || 0;
            const qty = Number(item?.qty) || 1;
            return item?.Order_date ? inner : inner + (price * qty);
          }, 0);
        }
        return acc;
      }, 0) : 0;
      return sum + total;
    }, 0);

    const recentOrders = orders.slice(-5).reverse();

    let pendingOrders = 0;
    let completedOrders = 0;
    let totalSessions = 0;
    orders.forEach((order) => {
      const sessions = Array.isArray(order.order_data) ? order.order_data : [];
      sessions.forEach((session) => {
        if (!Array.isArray(session)) return;
        totalSessions++;
        const marker = session.find((it) => it && it.Order_date);
        const st = (marker?.status || order.status || 'Pending').toLowerCase();
        if (st === 'pending') pendingOrders++;
        if (st === 'delivered') completedOrders++;
      });
    });

    res.json({
      success: true,
      stats: {
        totalUsers: users.length,
        totalOrders: totalSessions,
        totalFoodItems: foodItems.length,
        totalCategories: categories.length,
        totalRevenue,
        pendingOrders,
        completedOrders
      },
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/revenue', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).lean();
    const byDay = {};

    orders.forEach((order) => {
      if (!Array.isArray(order.order_data)) return;
      order.order_data.forEach((session) => {
        if (!Array.isArray(session)) return;
        const marker = session.find((entry) => entry && entry.Order_date);
        const dateKey = marker ? new Date(marker.Order_date).toISOString().slice(0, 10) : 'Unknown';
        const sessionTotal = session.reduce((acc, item) => {
          if (!item || item.Order_date) return acc;
          const price = Number(item.price) || 0;
          const qty = Number(item.qty) || 1;
          return acc + price * qty;
        }, 0);
        byDay[dateKey] = (byDay[dateKey] || 0) + sessionTotal;
      });
    });

    const days = Object.keys(byDay).filter((d) => d !== 'Unknown').sort();
    const last7 = days.slice(-7);
    const last30 = days.slice(-30);
    const sum = (keys) => keys.reduce((acc, k) => acc + byDay[k], 0);

    res.json({
      success: true,
      revenue: {
        byDay,
        last7Days: last7.map((day) => ({ day, total: byDay[day] })),
        totalLast7: sum(last7),
        totalLast30: sum(last30),
        totalAllTime: sum(days)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/foods', authAdmin, async (req, res) => {
  try {
    const foodItems = await mongoose.connection.db.collection('food_items').find({}).toArray();
    const categories = await mongoose.connection.db.collection('food_category').find({}).toArray();
    res.json({ success: true, foods: foodItems, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/foods', authAdmin, async (req, res) => {
  try {
    const { name, CategoryName, price, description, img, options } = req.body;
    if (!name || !CategoryName) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const categoryCollection = mongoose.connection.db.collection('food_category');
    const existingCategory = await categoryCollection.findOne({ CategoryName });
    if (!existingCategory) {
      await categoryCollection.insertOne({ CategoryName });
    }

    // `options` holds the size/variant -> price map (e.g. { Regular: "180", Large: "380" }).
    // This is what the frontend (Card.js) actually uses to render size dropdowns and prices.
    // We keep the legacy `price` field too for backward compatibility with old records.
    const cleanOptions = {};
    if (options && typeof options === 'object') {
      Object.keys(options).forEach((key) => {
        const trimmedKey = key.trim();
        if (trimmedKey && options[key] !== '' && options[key] !== null && options[key] !== undefined) {
          cleanOptions[trimmedKey] = String(options[key]);
        }
      });
    }

    const newFood = {
      name,
      CategoryName,
      price: Number(price) || 0,
      description: description || '',
      img: img || '',
      options: cleanOptions
    };

    const result = await mongoose.connection.db.collection('food_items').insertOne(newFood);

    res.json({ success: true, food: { _id: result.insertedId, ...newFood } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/foods/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Never let the client overwrite the Mongo _id.
    delete updateData._id;

    // Sanitize/normalize `options` (size -> price map) the same way as create,
    // so admin edits to Regular/Half/Full/Large etc. are actually persisted
    // and don't silently get dropped or saved in an inconsistent shape.
    if (updateData.options && typeof updateData.options === 'object') {
      const cleanOptions = {};
      Object.keys(updateData.options).forEach((key) => {
        const trimmedKey = key.trim();
        const value = updateData.options[key];
        if (trimmedKey && value !== '' && value !== null && value !== undefined) {
          cleanOptions[trimmedKey] = String(value);
        }
      });
      updateData.options = cleanOptions;
    }

    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price) || 0;
    }

    const result = await mongoose.connection.db.collection('food_items').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    res.json({ success: true, message: 'Food updated', food: result.value || result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/foods/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await mongoose.connection.db.collection('food_items').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/categories', authAdmin, async (req, res) => {
  try {
    const categories = await mongoose.connection.db.collection('food_category').find({}).toArray();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/categories', authAdmin, async (req, res) => {
  try {
    const { CategoryName, icon } = req.body;
    if (!CategoryName) return res.status(400).json({ success: false, message: 'Category name is required' });
    const category = { CategoryName };
    if (icon) category.icon = icon;
    const result = await mongoose.connection.db.collection('food_category').insertOne(category);
    res.json({ success: true, category: { _id: result.insertedId, ...category } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/categories/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};
    if (req.body.CategoryName !== undefined) updateData.CategoryName = req.body.CategoryName;
    if (req.body.icon !== undefined) updateData.icon = req.body.icon;
    await mongoose.connection.db.collection('food_category').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/categories/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await mongoose.connection.db.collection('food_category').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/orders', authAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).lean();
    const flattened = [];
    orders.forEach((order) => {
      const sessions = Array.isArray(order.order_data) ? order.order_data : [];
      sessions.forEach((session, idx) => {
        if (!Array.isArray(session)) return;
        const marker = session.find((it) => it && it.Order_date);
        const items = session.filter((it) => it && !it.Order_date);
        const sessionTotal = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
        flattened.push({
          _id: `${order._id}__${idx}`,
          orderId: order._id,
          sessionIndex: idx,
          email: order.email,
          order_date: marker?.Order_date || null,
          items,
          total: sessionTotal,
          status: marker?.status || order.status || 'Pending',
          deliveryInfo: marker?.deliveryInfo || null,
          paymentMethod: marker?.paymentMethod || null,
          transactionId: marker?.transactionId || null,
        });
      });
    });
    flattened.sort((a, b) => {
      const da = a.order_date ? new Date(a.order_date).getTime() : 0;
      const db = b.order_date ? new Date(b.order_date).getTime() : 0;
      return db - da;
    });
    res.json({ success: true, orders: flattened });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/orders/:id', authAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const status = req.body.status;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const parts = id.split('__');
    const orderId = parts[0];
    const sessionIndex = parts.length > 1 ? parseInt(parts[1], 10) : null;

    if (sessionIndex !== null) {
      const updatePath = `order_data.${sessionIndex}.0.status`;
      const order = await Order.findByIdAndUpdate(orderId, { $set: { [updatePath]: status } }, { new: true });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, order });
    } else {
      const order = await Order.findByIdAndUpdate(orderId, { $set: { status } }, { new: true });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, order });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/admin/users', authAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/admin/users/block/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const order = await Order.findOne({ email: user.email });
    if (order && Array.isArray(order.order_data)) {
      let activeCount = 0;
      order.order_data.forEach((session) => {
        if (!Array.isArray(session)) return;
        const marker = session.find((it) => it && it.Order_date);
        const status = (marker?.status || 'Pending').toLowerCase();
        if (status === 'pending' || status === 'preparing' || status === 'out for delivery') {
          activeCount++;
        }
      });
      if (activeCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete this user. They have ${activeCount} active order${activeCount > 1 ? 's' : ''} (Pending/Preparing/Out for Delivery). Please wait until all orders are delivered or cancelled.`
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted permanently' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/reviews', authAdmin, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/reviews/:id', authAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
