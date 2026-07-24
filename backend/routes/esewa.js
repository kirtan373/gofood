const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const router = express.Router();

const ESEWA_SECRET_KEY = process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q";
const ESEWA_PRODUCT_CODE = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
const ESEWA_FORM_URL =
  process.env.ESEWA_FORM_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
const ESEWA_STATUS_URL =
  process.env.ESEWA_STATUS_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";

function generateEsewaSignature(totalAmount, transactionUuid, productCode) {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const key = Buffer.from(ESEWA_SECRET_KEY, "utf-8");
  const data = Buffer.from(message, "utf-8");
  return crypto.createHmac("sha256", key).update(data).digest("base64");
}

router.post("/esewa/initiate", async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing amount or orderId" });
  }

  const taxAmount = "0";
  const serviceCharge = "0";
  const deliveryCharge = "0";
  const totalAmount = String(amount);

  const signature = generateEsewaSignature(
    totalAmount,
    orderId,
    ESEWA_PRODUCT_CODE
  );

  const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

  res.json({
    success: true,
    data: {
      gatewayUrl: ESEWA_FORM_URL,
      params: {
        amount: String(amount),
        tax_amount: taxAmount,
        product_service_charge: serviceCharge,
        product_delivery_charge: deliveryCharge,
        total_amount: totalAmount,
        transaction_uuid: orderId,
        product_code: ESEWA_PRODUCT_CODE,
        success_url: `${FRONTEND_URL}/payment/status/esewa`,
        failure_url: `${FRONTEND_URL}/payment/status/esewa?failed=1`,
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: signature,
      },
    },
  });
});

router.post("/esewa/verify", async (req, res) => {
  const { amount, orderId } = req.body;

  if (!amount || !orderId) {
    return res
      .status(400)
      .json({ success: false, message: "Missing amount or orderId" });
  }

  try {
    const response = await axios.get(ESEWA_STATUS_URL, {
      params: {
        product_code: ESEWA_PRODUCT_CODE,
        total_amount: amount,
        transaction_uuid: orderId,
      },
    });

    const data = response.data;

    if (data.status === "COMPLETE") {
      res.json({
        success: true,
        status: "Completed",
        refId: data.ref_id,
        transaction_id: data.transaction_uuid,
        total_amount: data.total_amount,
      });
    } else {
      res.json({
        success: false,
        status: data.status || "Unknown",
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("eSewa verify error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      success: false,
      message: "eSewa verification failed",
    });
  }
});

module.exports = router;
