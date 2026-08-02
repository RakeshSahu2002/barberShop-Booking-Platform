const db = require("../config/db");

// Browse approved shops with optional city/search filter
function browseShops(req, res) {
  const { city, search } = req.query;
  let query = "SELECT * FROM shops WHERE status = 'approved'";
  const params = [];

  if (city) {
    query += " AND city LIKE ?";
    params.push(`%${city}%`);
  }
  if (search) {
    query += " AND name LIKE ?";
    params.push(`%${search}%`);
  }
  query += " ORDER BY created_at DESC";

  const shops = db.prepare(query).all(...params);

  // attach avg rating to each shop
  const withRatings = shops.map((shop) => {
    const rating = db
      .prepare("SELECT AVG(rating) AS avg, COUNT(*) AS count FROM reviews WHERE shop_id = ?")
      .get(shop.id);
    return { ...shop, avgRating: rating.avg ? Number(rating.avg).toFixed(1) : null, reviewCount: rating.count };
  });

  return res.json(withRatings);
}

function getShopDetails(req, res) {
  const shop = db.prepare("SELECT * FROM shops WHERE id = ? AND status = 'approved'").get(req.params.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });

  const services = db.prepare("SELECT * FROM services WHERE shop_id = ?").all(shop.id);
  const staff = db.prepare("SELECT * FROM staff WHERE shop_id = ?").all(shop.id);
  const timings = db.prepare("SELECT * FROM shop_timings WHERE shop_id = ?").all(shop.id);
  const reviews = db
    .prepare(
      `SELECT r.*, u.name AS customer_name FROM reviews r JOIN users u ON r.customer_id = u.id
       WHERE r.shop_id = ? ORDER BY r.created_at DESC`
    )
    .all(shop.id);

  return res.json({ ...shop, services, staff, timings, reviews });
}

function createBooking(req, res) {
  const { shop_id, service_id, staff_id, booking_date, booking_time } = req.body;
  if (!shop_id || !service_id || !booking_date || !booking_time) {
    return res.status(400).json({ message: "shop_id, service_id, booking_date and booking_time are required." });
  }

  const shop = db.prepare("SELECT * FROM shops WHERE id = ? AND status='approved'").get(shop_id);
  if (!shop) return res.status(404).json({ message: "Shop not found or not approved." });

  const service = db.prepare("SELECT * FROM services WHERE id = ? AND shop_id = ?").get(service_id, shop_id);
  if (!service) return res.status(404).json({ message: "Service not found for this shop." });

  const result = db
    .prepare(
      `INSERT INTO bookings (customer_id, shop_id, service_id, staff_id, booking_date, booking_time, amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(req.user.id, shop_id, service_id, staff_id || null, booking_date, booking_time, service.price);

  return res.status(201).json({ message: "Booking created. Proceed to payment.", bookingId: result.lastInsertRowid, amount: service.price });
}

function getMyBookings(req, res) {
  const bookings = db
    .prepare(
      `SELECT b.*, sh.name AS shop_name, sh.address AS shop_address, s.name AS service_name, st.name AS staff_name,
        (SELECT COUNT(*) FROM reviews WHERE booking_id = b.id) AS has_review
       FROM bookings b
       JOIN shops sh ON b.shop_id = sh.id
       JOIN services s ON b.service_id = s.id
       LEFT JOIN staff st ON b.staff_id = st.id
       WHERE b.customer_id = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`
    )
    .all(req.user.id);

  return res.json(bookings);
}

function cancelBooking(req, res) {
  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND customer_id = ?").get(req.params.id, req.user.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });
  if (booking.status === "completed") return res.status(400).json({ message: "Cannot cancel a completed booking." });

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking.id);
  return res.json({ message: "Booking cancelled." });
}

module.exports = { browseShops, getShopDetails, createBooking, getMyBookings, cancelBooking };
