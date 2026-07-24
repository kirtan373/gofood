const express = require("express");
const axios = require("axios");
const router = express.Router();

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "";
const KHALTI_API_BASE =
  process.env.KHALTI_API_BASE || "https://dev.khalti.com/api/v2";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

router.post("/khalti/initiate", async (req, res) => {
  if (!KHALTI_SECRET_KEY) {
    return res
      .status(500)
      .json({ success: false, message: "Khalti secret key not configured" });
  }

  const { amount, orderId, productName, customerInfo } = req.body;

  if (!amount || !orderId || !productName) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  try {
    const payload = {
      return_url: `${FRONTEND_URL}/payment/status/khalti`,
      website_url: FRONTEND_URL,
      amount: amount * 100,
      purchase_order_id: orderId,
      purchase_order_name: productName,
      customer_info: customerInfo || {},
      product_details: [
        {
          identity: orderId,
          name: productName,
          total_price: amount * 100,
          quantity: 1,
          unit_price: amount * 100,
        },
      ],
    };

    const response = await axios.post(
      `${KHALTI_API_BASE}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    const errData = error.response?.data || {};
    console.error("Khalti initiate error:", errData);
    res.status(error.response?.status || 500).json({
      success: false,
      message: errData.detail || errData.message || "Khalti initiation failed",
      errors: errData,
    });
  }
});

router.post("/khalti/verify", async (req, res) => {
  if (!KHALTI_SECRET_KEY) {
    return res
      .status(500)
      .json({ success: false, message: "Khalti secret key not configured" });
  }

  const { pidx } = req.body;

  if (!pidx) {
    return res
      .status(400)
      .json({ success: false, message: "pidx is required" });
  }

  try {
    const response = await axios.post(
      `${KHALTI_API_BASE}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          Authorization: `Key ${KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    res.json({
      success: true,
      status: data.status,
      transaction_id: data.transaction_id,
      total_amount: data.total_amount,
      fee: data.fee,
      refunded: data.refunded,
    });
  } catch (error) {
    const errData = error.response?.data || {};
    console.error("Khalti verify error:", errData);
    res.status(error.response?.status || 500).json({
      success: false,
      message: errData.detail || "Khalti verification failed",
    });
  }
});

module.exports = router;
