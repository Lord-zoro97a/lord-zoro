var Razorpay = require("razorpay");
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, error: "Method not allowed" });
  try {
    var body = req.body || {};
    var amount = body.amount;
    var name = body.name;
    var note = body.note;
    if (!amount || amount < 1 || amount > 100000) {
      return res.status(400).json({ success: false, error: "Invalid amount" });
    }
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: "Name / Gamertag required" });
    }
    var razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
    var order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: "lz_" + Date.now(),
      notes: { supporter_name: name.trim(), message: (note || "").toString().slice(0, 200) }
    });
    return res.status(200).json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency }
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return res.status(500).json({
      success: false,
      error: (err && err.error && err.error.description) || err.message || "Server error"
    });
  }
};
