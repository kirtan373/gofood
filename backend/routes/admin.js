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
const DisplayData = require('./DisplayData');

const invalidateDataCache = () => {
  if (DisplayData && typeof DisplayData.clearDataCache === 'function') {
    DisplayData.clearDataCache();
  }
};

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

/* ============================================================
   ANALYTICS — everything the admin dashboard needs in one call
   ============================================================ */

const toDateKey = (d) => d.toISOString().slice(0, 10);
const pctChange = (prev, curr) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

const flattenSessions = (orders) => {
  const out = [];
  orders.forEach((order) => {
    const sessions = Array.isArray(order.order_data) ? order.order_data : [];
    sessions.forEach((session) => {
      if (!Array.isArray(session)) return;
      const marker = session.find((it) => it && it.Order_date) || {};
      const items = session.filter((it) => it && !it.Order_date && !it._status && it.name !== undefined);
      const total = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
      const date = marker.Order_date ? new Date(marker.Order_date) : null;
      const statusMarkers = session.filter((it) => it && it._status);
      const status = statusMarkers.length
        ? String(statusMarkers[statusMarkers.length - 1]._status).trim()
        : String(marker.status || order.status || 'Pending').trim();
      out.push({
        email: order.email,
        date,
        dateKey: date ? toDateKey(date) : null,
        status,
        total,
        items,
        paymentMethod: marker.paymentMethod || null,
        transactionId: marker.transactionId || null,
      });
    });
  });
  return out;
};

const sumRange = (sessions, fromKey, toKey) =>
  sessions.reduce((acc, s) => (s.dateKey && s.dateKey >= fromKey && s.dateKey <= toKey ? acc + s.total : acc), 0);

const countRange = (sessions, fromKey, toKey) =>
  sessions.reduce((acc, s) => (s.dateKey && s.dateKey >= fromKey && s.dateKey <= toKey ? acc + 1 : acc), 0);

router.get('/admin/analytics', authAdmin, async (req, res) => {
  try {
    const { from, to } = req.query;
    const validRange = from && to && from <= to;

    const [orders, users, reviews] = await Promise.all([
      Order.find({}).lean(),
      User.find({}).select('-password').lean(),
      Review.find({}).lean(),
    ]);
    const foodItems = await mongoose.connection.db.collection('food_items').find({}).toArray();
    const categories = await mongoose.connection.db.collection('food_category').find({}).toArray();

    const allSessions = flattenSessions(orders);
    const rangedSessions = validRange
      ? allSessions.filter((s) => s.dateKey && s.dateKey >= from && s.dateKey <= to)
      : allSessions;

    const now = new Date();
    const todayKey = toDateKey(now);
    const yesterday = new Date(now.getTime() - 86400000);
    const yesterdayKey = toDateKey(yesterday);

    const d30ago = new Date(now.getTime() - 30 * 86400000);
    const d60ago = new Date(now.getTime() - 60 * 86400000);
    const last30Sum = sumRange(allSessions, toDateKey(d30ago), todayKey);
    const prev30Sum = sumRange(allSessions, toDateKey(d60ago), toDateKey(new Date(d30ago.getTime() - 1)));

    // ── Status counts ──
    const statusCount = (st) => allSessions.filter((s) => s.status.toLowerCase() === st.toLowerCase()).length;
    const statusTrend = (st) => {
      const cur = countRange(allSessions.filter((s) => s.status.toLowerCase() === st.toLowerCase()), toDateKey(d30ago), todayKey);
      const prev = countRange(allSessions.filter((s) => s.status.toLowerCase() === st.toLowerCase()), toDateKey(d60ago), toDateKey(new Date(d30ago.getTime() - 1)));
      return { change: pctChange(prev, cur), previous: prev };
    };

    // ── Foods / category aggregation ──
    const nameToCategory = {};
    foodItems.forEach((f) => { nameToCategory[f.name] = f.CategoryName; });

    const foodCounts = {};
    const catCounts = {};
    allSessions.forEach((s) => {
      s.items.forEach((it) => {
        const qty = Number(it.qty) || 1;
        foodCounts[it.name] = (foodCounts[it.name] || 0) + qty;
        const cat = nameToCategory[it.name] || it.CategoryName || 'Other';
        catCounts[cat] = (catCounts[cat] || 0) + qty;
      });
    });
    const topFoods = Object.entries(foodCounts).sort((a, b) => b[1] - a[1]);
    const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

    const mostOrderedFood = topFoods[0] ? { value: topFoods[0][0], sub: topFoods[0][1] } : { value: '—', sub: 0 };
    const bestSellingCategory = topCats[0] ? { value: topCats[0][0], sub: topCats[0][1] } : { value: '—', sub: 0 };

    // ── Daily revenue / orders (last 14 days) ──
    const dailyKeys = [];
    for (let i = 13; i >= 0; i--) dailyKeys.push(toDateKey(new Date(now.getTime() - i * 86400000)));
    const dailyRevenue = dailyKeys.map((k) => sumRange(rangedSessions, k, k));
    const dailyOrders = dailyKeys.map((k) => countRange(rangedSessions, k, k));
    const dailyLabels = dailyKeys.map((k) => k.slice(5));

    // ── Weekly revenue (last 8 weeks) ──
    const weekBuckets = [];
    const currentMonday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const dow = currentMonday.getUTCDay();
    currentMonday.setUTCDate(currentMonday.getUTCDate() - (dow === 0 ? 6 : dow - 1));
    for (let i = 7; i >= 0; i--) {
      const start = new Date(currentMonday);
      start.setUTCDate(start.getUTCDate() - i * 7);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 6);
      weekBuckets.push({
        label: `${start.toLocaleString('en', { month: 'short' })} ${start.getUTCDate()}`,
        total: sumRange(rangedSessions, toDateKey(start), toDateKey(end)),
      });
    }

    // ── Monthly revenue / orders + customers (last 12 months) ──
    const monthList = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      monthList.push({ label: d.toLocaleString('en', { month: 'short' }), key });
    }
    const monthlyRevenue = monthList.map((m) => rangedSessions.reduce((acc, s) => (s.dateKey && s.dateKey.startsWith(m.key) ? acc + s.total : acc), 0));
    const monthlyOrders = monthList.map((m) => rangedSessions.reduce((acc, s) => (s.dateKey && s.dateKey.startsWith(m.key) ? acc + 1 : acc), 0));
    const newCustomersPerMonth = monthList.map((m) =>
      users.reduce((acc, u) => {
        if (!u.date) return acc;
        const ud = new Date(u.date);
        const ukey = `${ud.getUTCFullYear()}-${String(ud.getUTCMonth() + 1).padStart(2, '0')}`;
        return ukey === m.key ? acc + 1 : acc;
      }, 0)
    );
    const monthLabels = monthList.map((m) => m.label);

    // ── Activity ──
    const latestOrders = [...allSessions]
      .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0))
      .slice(0, 8)
      .map((s) => ({
        email: s.email,
        date: s.date,
        total: s.total,
        status: s.status,
        items: s.items.length,
      }));

    const latestUsers = [...users]
      .sort((a, b) => (b.date ? new Date(b.date).getTime() : 0) - (a.date ? new Date(a.date).getTime() : 0))
      .slice(0, 8)
      .map((u) => ({ name: u.name, email: u.email, date: u.date }));

    const recentPayments = [...allSessions]
      .filter((s) => s.paymentMethod || s.transactionId)
      .sort((a, b) => (b.date ? b.date.getTime() : 0) - (a.date ? a.date.getTime() : 0))
      .slice(0, 8)
      .map((s) => ({
        email: s.email,
        date: s.date,
        amount: s.total,
        method: s.paymentMethod || 'cod',
        transactionId: s.transactionId,
      }));

    const lowStockFoods = foodItems
      .filter((f) => typeof f.stock === 'number' && f.stock <= 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 8)
      .map((f) => ({ _id: f._id, name: f.name, stock: f.stock, CategoryName: f.CategoryName, img: f.img }));

    const latestReviews = [...reviews]
      .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
      .slice(0, 8)
      .map((r) => ({ name: r.name, email: r.email, rating: r.rating, review: r.review, date: r.createdAt || r.date }));

    // ── Quick stats (respects date range) ──
    const rangeRevenue = rangedSessions.reduce((acc, s) => acc + s.total, 0);
    const rangeOrders = rangedSessions.length;
    const avgOrderValue = rangeOrders ? Math.round(rangeRevenue / rangeOrders) : 0;
    const activeOrders = allSessions.filter((s) => ['pending', 'preparing', 'out for delivery'].includes(s.status.toLowerCase())).length;
    const deliveredRate = rangeOrders
      ? Math.round((rangedSessions.filter((s) => s.status.toLowerCase() === 'delivered').length / rangeOrders) * 100)
      : 0;

    res.json({
      success: true,
      range: { from: validRange ? from : null, to: validRange ? to : null },
      cards: {
        totalRevenue: {
          value: allSessions.reduce((acc, s) => acc + s.total, 0),
          change: pctChange(prev30Sum, last30Sum),
          previous: prev30Sum,
        },
        todayRevenue: {
          value: sumRange(allSessions, todayKey, todayKey),
          change: pctChange(sumRange(allSessions, yesterdayKey, yesterdayKey), sumRange(allSessions, todayKey, todayKey)),
        },
        todayOrders: {
          value: countRange(allSessions, todayKey, todayKey),
          change: pctChange(countRange(allSessions, yesterdayKey, yesterdayKey), countRange(allSessions, todayKey, todayKey)),
        },
        pendingOrders: { value: statusCount('pending'), ...statusTrend('pending') },
        preparingOrders: { value: statusCount('preparing'), ...statusTrend('preparing') },
        outForDeliveryOrders: { value: statusCount('out for delivery'), ...statusTrend('out for delivery') },
        deliveredOrders: { value: statusCount('delivered'), ...statusTrend('delivered') },
        cancelledOrders: { value: statusCount('cancelled'), ...statusTrend('cancelled') },
        totalCustomers: { value: users.length, change: null, previous: null },
        totalFoods: { value: foodItems.length, change: null, previous: null },
        totalCategories: { value: categories.length, change: null, previous: null },
        totalReviews: { value: reviews.length, change: null, previous: null },
        mostOrderedFood: mostOrderedFood,
        bestSellingCategory: bestSellingCategory,
      },
      charts: {
        dailyRevenue: { labels: dailyLabels, data: dailyRevenue },
        weeklyRevenue: { labels: weekBuckets.map((w) => w.label), data: weekBuckets.map((w) => w.total) },
        monthlyRevenue: { labels: monthLabels, data: monthlyRevenue },
        dailyOrders: { labels: dailyLabels, data: dailyOrders },
        monthlyOrders: { labels: monthLabels, data: monthlyOrders },
        popularCategories: { labels: topCats.slice(0, 8).map(([k]) => k), data: topCats.slice(0, 8).map(([, v]) => v) },
        mostOrderedFoods: { labels: topFoods.slice(0, 8).map(([k]) => k), data: topFoods.slice(0, 8).map(([, v]) => v) },
        newCustomersPerMonth: { labels: monthLabels, data: newCustomersPerMonth },
      },
      activity: {
        latestOrders,
        latestUsers,
        recentPayments,
        lowStockFoods,
        latestReviews,
      },
      quickStats: {
        revenueInRange: rangeRevenue,
        ordersInRange: rangeOrders,
        avgOrderValue,
        activeOrders,
        deliveredRate,
        totalCustomers: users.length,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error.message);
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

// Builds a sanitized food document from a request body (used by create + update).
const normalizeFood = (body) => {
  const out = {};
  if (body.name !== undefined) out.name = String(body.name).trim();
  if (body.CategoryName !== undefined) out.CategoryName = String(body.CategoryName).trim();
  if (body.price !== undefined) out.price = body.price === '' || body.price === null ? 0 : Number(body.price) || 0;
  if (body.discountPrice !== undefined) {
    out.discountPrice = body.discountPrice === '' || body.discountPrice === null ? null : Number(body.discountPrice) || 0;
  }
  if (body.description !== undefined) out.description = body.description || '';
  if (body.ingredients !== undefined) {
    const raw = Array.isArray(body.ingredients) ? body.ingredients : String(body.ingredients).split(',');
    out.ingredients = raw.map((s) => String(s).trim()).filter(Boolean);
  }
  if (body.calories !== undefined) out.calories = body.calories === '' || body.calories === null ? null : Number(body.calories) || 0;
  if (body.prepTime !== undefined) out.prepTime = String(body.prepTime).trim();
  if (body.availability !== undefined) out.availability = !!body.availability;
  if (body.stock !== undefined) out.stock = body.stock === '' || body.stock === null ? 50 : Number(body.stock);
  if (body.img !== undefined) out.img = body.img || '';
  if (body.images !== undefined) {
    out.images = (Array.isArray(body.images) ? body.images : [String(body.images)]).map((u) => String(u)).filter(Boolean);
  }
  if (body.options !== undefined) {
    const clean = {};
    if (body.options && typeof body.options === 'object') {
      Object.keys(body.options).forEach((key) => {
        const trimmedKey = key.trim();
        const value = body.options[key];
        if (trimmedKey && value !== '' && value !== null && value !== undefined) {
          clean[trimmedKey] = String(value);
        }
      });
    }
    out.options = clean;
  }
  ['isHidden', 'isBestSeller', 'isTodaysSpecial', 'isFeatured', 'isTrending'].forEach((flag) => {
    if (body[flag] !== undefined) out[flag] = !!body[flag];
  });
  return out;
};

router.get('/admin/foods', authAdmin, async (req, res) => {
  try {
    const { search = '', category = 'all', visibility = 'all', page = '1', limit = '12' } = req.query;
    const collection = mongoose.connection.db.collection('food_items');

    const filter = {};
    if (String(search).trim()) filter.name = { $regex: String(search).trim(), $options: 'i' };
    if (category && category !== 'all') filter.CategoryName = category;
    if (visibility === 'visible') filter.isHidden = { $ne: true };
    if (visibility === 'hidden') filter.isHidden = true;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));

    const total = await collection.countDocuments(filter);
    const foodItems = await collection
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .toArray();

    const categories = await mongoose.connection.db
      .collection('food_category')
      .find({})
      .sort({ displayOrder: 1, CategoryName: 1 })
      .toArray();

    res.json({
      success: true,
      foods: foodItems,
      categories,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/foods', authAdmin, async (req, res) => {
  try {
    const { name, CategoryName } = req.body;
    if (!name || !CategoryName) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const categoryCollection = mongoose.connection.db.collection('food_category');
    const existingCategory = await categoryCollection.findOne({ CategoryName });
    if (!existingCategory) {
      await categoryCollection.insertOne({ CategoryName, icon: '🍽️', displayOrder: 999, isHidden: false, createdAt: new Date() });
    }

    // `options` holds the size/variant -> price map (e.g. { Regular: "180", Large: "380" }).
    // This is what the frontend (Card.js) actually uses to render size dropdowns and prices.
    // We keep the legacy `price` field too for backward compatibility with old records.
    const newFood = {
      name: String(name).trim(),
      CategoryName: String(CategoryName).trim(),
      price: 0,
      discountPrice: null,
      description: '',
      ingredients: [],
      calories: null,
      prepTime: '',
      availability: true,
      stock: 50,
      img: '',
      images: [],
      options: {},
      isHidden: false,
      isBestSeller: false,
      isTodaysSpecial: false,
      isFeatured: false,
      isTrending: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...normalizeFood(req.body),
    };

    const result = await mongoose.connection.db.collection('food_items').insertOne(newFood);
    invalidateDataCache();

    res.json({ success: true, food: { _id: result.insertedId, ...newFood } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/foods/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Never let the client overwrite the Mongo _id.
    const updateData = { ...normalizeFood(req.body), updatedAt: new Date() };
    delete updateData._id;

    const result = await mongoose.connection.db.collection('food_items').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    invalidateDataCache();

    res.json({ success: true, message: 'Food updated', food: result.value || result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Toggle a single boolean flag (hide/restore, best seller, today's special, featured, trending, availability).
router.patch('/admin/foods/:id/flag', authAdmin, async (req, res) => {
  try {
    const { flag, value } = req.body;
    const allowed = ['isHidden', 'isBestSeller', 'isTodaysSpecial', 'isFeatured', 'isTrending', 'availability'];
    if (!allowed.includes(flag)) {
      return res.status(400).json({ success: false, message: 'Invalid flag' });
    }

    const result = await mongoose.connection.db.collection('food_items').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { [flag]: !!value, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    invalidateDataCache();

    res.json({ success: true, message: 'Food updated', food: result.value || result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/foods/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await mongoose.connection.db.collection('food_items').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    invalidateDataCache();
    res.json({ success: true, message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/admin/categories', authAdmin, async (req, res) => {
  try {
    const catCol = mongoose.connection.db.collection('food_category');
    const foodCol = mongoose.connection.db.collection('food_items');

    const categories = await catCol.find({}).sort({ displayOrder: 1, CategoryName: 1 }).toArray();
    const counts = await foodCol.aggregate([
      { $group: { _id: '$CategoryName', total: { $sum: 1 } } }
    ]).toArray();
    const countMap = {};
    counts.forEach((c) => { countMap[c._id] = c.total; });
    categories.forEach((c) => { c.foodCount = countMap[c.CategoryName] || 0; });

    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/admin/categories', authAdmin, async (req, res) => {
  try {
    const { CategoryName } = req.body;
    if (!CategoryName) return res.status(400).json({ success: false, message: 'Category name is required' });
    const category = {
      CategoryName: String(CategoryName).trim(),
      icon: req.body.icon || '🍽️',
      image: req.body.image || '',
      displayOrder: req.body.displayOrder !== undefined && req.body.displayOrder !== '' ? Number(req.body.displayOrder) : 999,
      isHidden: !!req.body.isHidden,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await mongoose.connection.db.collection('food_category').insertOne(category);
    invalidateDataCache();
    res.json({ success: true, category: { _id: result.insertedId, ...category } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/categories/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { updatedAt: new Date() };
    ['CategoryName', 'icon', 'image', 'displayOrder', 'isHidden'].forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'displayOrder') updateData[field] = req.body[field] === '' ? 999 : Number(req.body[field]);
        else if (field === 'isHidden') updateData[field] = !!req.body[field];
        else updateData[field] = String(req.body[field]).trim();
      }
    });
    await mongoose.connection.db.collection('food_category').updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: updateData }
    );
    invalidateDataCache();
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Hide / restore a category.
router.patch('/admin/categories/:id/flag', authAdmin, async (req, res) => {
  try {
    const { flag, value } = req.body;
    if (flag !== 'isHidden') {
      return res.status(400).json({ success: false, message: 'Invalid flag' });
    }
    await mongoose.connection.db.collection('food_category').updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { isHidden: !!value, updatedAt: new Date() } }
    );
    invalidateDataCache();
    res.json({ success: true, message: 'Category updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/admin/categories/:id', authAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await mongoose.connection.db.collection('food_category').deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    invalidateDataCache();
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

// Per-user stats: total sessions (orders) and total spent, computed across the orders collection.
const computeUserStats = async () => {
  const orders = await Order.find({}).lean();
  const stats = {};
  orders.forEach((order) => {
    const email = String(order.email || '').toLowerCase();
    if (!email) return;
    const entry = stats[email] || (stats[email] = { totalOrders: 0, totalSpending: 0, lastOrder: null });
    (Array.isArray(order.order_data) ? order.order_data : []).forEach((session) => {
      if (!Array.isArray(session)) return;
      const marker = session.find((it) => it && it.Order_date) || {};
      const items = session.filter((it) => it && !it.Order_date && !it._status && it.name !== undefined);
      const total = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
      entry.totalOrders += 1;
      entry.totalSpending += total;
      const d = marker.Order_date ? new Date(marker.Order_date).getTime() : 0;
      if (d && (!entry.lastOrder || d > entry.lastOrder)) entry.lastOrder = d;
    });
  });
  return stats;
};

router.get('/admin/users', authAdmin, async (req, res) => {
  try {
    const { search = '', role = 'all', status = 'all', page = '1', limit = '10' } = req.query;

    const filter = {};
    if (String(search).trim()) {
      const rx = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    if (role && role !== 'all') filter.role = role;
    if (status === 'active') filter.isBlocked = false;
    if (status === 'blocked') filter.isBlocked = true;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

    const stats = await computeUserStats();
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ date: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    users.forEach((u) => {
      u.role = u.role || 'user';
      const s = stats[String(u.email || '').toLowerCase()] || { totalOrders: 0, totalSpending: 0, lastOrder: null };
      u.stats = {
        totalOrders: s.totalOrders,
        totalSpending: s.totalSpending,
        lastOrder: s.lastOrder ? new Date(s.lastOrder) : null,
      };
    });

    res.json({
      success: true,
      users,
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / limitNum))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Full user profile: details, saved addresses, order history, totals.
router.get('/admin/users/:id', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.role = user.role || 'user';

    const orders = await Order.find({ email: user.email }).lean();
    const history = [];
    const addressMap = new Map();
    let totalOrders = 0;
    let totalSpending = 0;

    orders.forEach((order) => {
      (Array.isArray(order.order_data) ? order.order_data : []).forEach((session, idx) => {
        if (!Array.isArray(session)) return;
        const marker = session.find((it) => it && it.Order_date) || {};
        const items = session.filter((it) => it && !it.Order_date && !it._status && it.name !== undefined);
        const total = items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
        totalOrders += 1;
        totalSpending += total;

        if (marker.deliveryInfo && marker.deliveryInfo.address && marker.deliveryInfo.address.trim()) {
          const addr = String(marker.deliveryInfo.address).trim();
          if (!addressMap.has(addr)) addressMap.set(addr, marker.deliveryInfo);
        }

        history.push({
          _id: `${order._id}__${idx}`,
          orderDate: marker.Order_date || null,
          items,
          total,
          status: marker.status || order.status || 'Pending',
          paymentMethod: marker.paymentMethod || null,
          deliveryInfo: marker.deliveryInfo || null,
        });
      });
    });

    history.sort((a, b) =>
      (a.orderDate ? new Date(a.orderDate).getTime() : 0) - (b.orderDate ? new Date(b.orderDate).getTime() : 0)
    ).reverse();

    res.json({
      success: true,
      user: { ...user, totalOrders, totalSpending },
      addresses: Array.from(addressMap.values()),
      orderHistory: history,
    });
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

// Explicit block/unblock: body { blocked: true|false }
router.patch('/admin/users/:id/block', authAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isBlocked = !!req.body.blocked;
    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Change a user's role: body { role: 'user' | 'admin' }
router.patch('/admin/users/:id/role', authAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { $set: { role } }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
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
