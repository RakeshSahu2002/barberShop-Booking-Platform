const db = require("../config/db");

function createReview(req, res) {
  const { booking_id, rating, comment } = req.body;
  if (!booking_id || !rating) {
    return res.status(400).json({ message: "booking_id and rating are required." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }

  const booking = db
    .prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ?")
    .get(booking_id, req.user.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });

  if (booking.status !== "completed") {
    return res.status(400).json({ message: "You can only review completed bookings." });
  }

  const existingReview = db.prepare("SELECT id FROM reviews WHERE booking_id = ?").get(booking_id);
  if (existingReview) {
    return res.status(409).json({ message: "You have already reviewed this booking." });
  }

  db.prepare(
    "INSERT INTO reviews (booking_id, customer_id, shop_id, rating, comment) VALUES (?, ?, ?, ?, ?)"
  ).run(booking_id, req.user.id, booking.shop_id, rating, comment || "");

  return res.status(201).json({ message: "Review submitted. Thank you!" });
}

function getShopReviews(req, res) {
  const reviews = db
    .prepare(
      `SELECT r.*, u.name AS customer_name FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.shop_id = ? ORDER BY r.created_at DESC`
    )
    .all(req.params.shopId);
  return res.json(reviews);
}

module.exports = { createReview, getShopReviews };
