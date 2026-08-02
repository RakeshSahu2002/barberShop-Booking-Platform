const db = require("../config/db");

// ---------- SHOP ----------
function createShop(req, res) {
  const { name, description, address, city, phone, image } = req.body;
  if (!name || !address || !city) {
    return res.status(400).json({ message: "Name, address and city are required." });
  }

  const existing = db.prepare("SELECT id FROM shops WHERE owner_id = ?").get(req.user.id);
  if (existing) {
    return res.status(409).json({ message: "You already have a shop registered. You can edit it instead." });
  }

  const result = db
    .prepare(
      "INSERT INTO shops (owner_id, name, description, address, city, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(req.user.id, name, description || "", address, city, phone || "", image || "");

  return res.status(201).json({ message: "Shop created. Waiting for admin approval.", shopId: result.lastInsertRowid });
}

function getMyShop(req, res) {
  const shop = db.prepare("SELECT * FROM shops WHERE owner_id = ?").get(req.user.id);
  if (!shop) return res.status(404).json({ message: "No shop found. Please create one." });
  return res.json(shop);
}

function updateMyShop(req, res) {
  const shop = db.prepare("SELECT * FROM shops WHERE owner_id = ?").get(req.user.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });

  const { name, description, address, city, phone, image } = req.body;
  db.prepare(
    "UPDATE shops SET name=?, description=?, address=?, city=?, phone=?, image=? WHERE id=?"
  ).run(
    name || shop.name,
    description ?? shop.description,
    address || shop.address,
    city || shop.city,
    phone ?? shop.phone,
    image ?? shop.image,
    shop.id
  );
  return res.json({ message: "Shop updated successfully." });
}

function getShopHelper(ownerId) {
  return db.prepare("SELECT id FROM shops WHERE owner_id = ?").get(ownerId);
}

// ---------- SERVICES ----------
function addService(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });

  const { name, price, duration_minutes } = req.body;
  if (!name || !price) return res.status(400).json({ message: "Service name and price are required." });

  const result = db
    .prepare("INSERT INTO services (shop_id, name, price, duration_minutes) VALUES (?, ?, ?, ?)")
    .run(shop.id, name, price, duration_minutes || 30);

  return res.status(201).json({ message: "Service added.", serviceId: result.lastInsertRowid });
}

function updateService(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });

  const service = db.prepare("SELECT * FROM services WHERE id = ? AND shop_id = ?").get(req.params.id, shop.id);
  if (!service) return res.status(404).json({ message: "Service not found." });

  const { name, price, duration_minutes } = req.body;
  db.prepare("UPDATE services SET name=?, price=?, duration_minutes=? WHERE id=?").run(
    name || service.name,
    price ?? service.price,
    duration_minutes ?? service.duration_minutes,
    service.id
  );
  return res.json({ message: "Service updated." });
}

function deleteService(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });
  db.prepare("DELETE FROM services WHERE id = ? AND shop_id = ?").run(req.params.id, shop.id);
  return res.json({ message: "Service deleted." });
}

function listMyServices(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });
  const services = db.prepare("SELECT * FROM services WHERE shop_id = ?").all(shop.id);
  return res.json(services);
}

// ---------- STAFF ----------
function addStaff(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });

  const { name, specialization } = req.body;
  if (!name) return res.status(400).json({ message: "Staff name is required." });

  const result = db
    .prepare("INSERT INTO staff (shop_id, name, specialization) VALUES (?, ?, ?)")
    .run(shop.id, name, specialization || "");

  return res.status(201).json({ message: "Staff added.", staffId: result.lastInsertRowid });
}

function deleteStaff(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });
  db.prepare("DELETE FROM staff WHERE id = ? AND shop_id = ?").run(req.params.id, shop.id);
  return res.json({ message: "Staff removed." });
}

function listMyStaff(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });
  const staff = db.prepare("SELECT * FROM staff WHERE shop_id = ?").all(shop.id);
  return res.json(staff);
}

// ---------- TIMINGS ----------
function setTimings(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });

  const { timings } = req.body; // array of { day, open_time, close_time, is_closed }
  if (!Array.isArray(timings)) return res.status(400).json({ message: "Timings must be an array." });

  const deleteStmt = db.prepare("DELETE FROM shop_timings WHERE shop_id = ?");
  const insertStmt = db.prepare(
    "INSERT INTO shop_timings (shop_id, day, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)"
  );

  const tx = db.transaction((rows) => {
    deleteStmt.run(shop.id);
    for (const row of rows) {
      insertStmt.run(shop.id, row.day, row.open_time || "", row.close_time || "", row.is_closed ? 1 : 0);
    }
  });
  tx(timings);

  return res.json({ message: "Timings updated." });
}

function getMyTimings(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });
  const timings = db.prepare("SELECT * FROM shop_timings WHERE shop_id = ?").all(shop.id);
  return res.json(timings);
}

// ---------- BOOKINGS ----------
function getMyBookings(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });

  const bookings = db
    .prepare(
      `SELECT b.*, u.name AS customer_name, u.phone AS customer_phone, s.name AS service_name, st.name AS staff_name
       FROM bookings b
       JOIN users u ON b.customer_id = u.id
       JOIN services s ON b.service_id = s.id
       LEFT JOIN staff st ON b.staff_id = st.id
       WHERE b.shop_id = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`
    )
    .all(shop.id);

  return res.json(bookings);
}

function updateBookingStatus(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });

  const { status } = req.body;
  if (!["confirmed", "completed", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const booking = db.prepare("SELECT * FROM bookings WHERE id = ? AND shop_id = ?").get(req.params.id, shop.id);
  if (!booking) return res.status(404).json({ message: "Booking not found." });

  db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, booking.id);
  return res.json({ message: `Booking marked as ${status}.` });
}

// ---------- ANALYTICS ----------
function getAnalytics(req, res) {
  const shop = getShopHelper(req.user.id);
  if (!shop) return res.status(404).json({ message: "Create your shop first." });

  const totalBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings WHERE shop_id = ?").get(shop.id).count;

  const totalEarnings =
    db
      .prepare("SELECT COALESCE(SUM(amount),0) AS total FROM bookings WHERE shop_id = ? AND payment_status = 'paid'")
      .get(shop.id).total || 0;

  const completedBookings = db
    .prepare("SELECT COUNT(*) AS count FROM bookings WHERE shop_id = ? AND status = 'completed'")
    .get(shop.id).count;

  const cancelledBookings = db
    .prepare("SELECT COUNT(*) AS count FROM bookings WHERE shop_id = ? AND status = 'cancelled'")
    .get(shop.id).count;

  const avgRating =
    db
      .prepare("SELECT AVG(rating) AS avg FROM reviews WHERE shop_id = ?")
      .get(shop.id).avg || 0;

  const earningsByMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', booking_date) AS month, COALESCE(SUM(amount),0) AS earnings
       FROM bookings WHERE shop_id = ? AND payment_status = 'paid'
       GROUP BY month ORDER BY month DESC LIMIT 12`
    )
    .all(shop.id);

  const topServices = db
    .prepare(
      `SELECT s.name, COUNT(b.id) AS bookings_count
       FROM bookings b JOIN services s ON b.service_id = s.id
       WHERE b.shop_id = ? GROUP BY b.service_id ORDER BY bookings_count DESC LIMIT 5`
    )
    .all(shop.id);

  return res.json({
    totalBookings,
    totalEarnings,
    completedBookings,
    cancelledBookings,
    avgRating: Number(avgRating).toFixed(1),
    earningsByMonth,
    topServices,
  });
}

module.exports = {
  createShop,
  getMyShop,
  updateMyShop,
  addService,
  updateService,
  deleteService,
  listMyServices,
  addStaff,
  deleteStaff,
  listMyStaff,
  setTimings,
  getMyTimings,
  getMyBookings,
  updateBookingStatus,
  getAnalytics,
};
