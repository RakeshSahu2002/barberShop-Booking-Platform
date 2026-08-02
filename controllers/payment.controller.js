const db = require("../config/db");
const crypto = require("crypto");
const razorpay = require("../utils/razorpay");
require("dotenv").config();

// Create a Razorpay order for a given booking
async function createOrder(req, res) {
  try {
    const { booking_id } = req.body;
    if (!booking_id) return res.status(400).json({ message: "booking_id is required." });

    const booking = db
      .prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ?")
      .get(booking_id, req.user.id);
    if (!booking) return res.status(404).json({ message: "Booking not found." });

    if (booking.payment_status === "paid") {
      return res.status(400).json({ message: "This booking is already paid." });
    }

    const options = {
      amount: Math.round(booking.amount * 100), // paise
      currency: "INR",
      receipt: `booking_rcpt_${booking.id}`,
    };

    const order = await razorpay.orders.create(options);

    db.prepare("UPDATE bookings SET razorpay_order_id = ? WHERE id = ?").run(order.id, booking.id);

    return res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to create payment order. Check Razorpay keys in .env" });
  }
}

// Verify payment signature after checkout completes on frontend
function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed. Signature mismatch." });
    }

    db.prepare(
      "UPDATE bookings SET payment_status = 'paid', status = 'confirmed', razorpay_payment_id = ? WHERE id = ?"
    ).run(razorpay_payment_id, booking_id);

    return res.json({ message: "Payment verified successfully. Booking confirmed!" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Payment verification error." });
  }
}

module.exports = { createOrder, verifyPayment };
