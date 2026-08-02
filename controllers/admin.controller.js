const db = require("../config/db");

function listAllShops(req, res) {
  const { status } = req.query;
  let query = `SELECT s.*, u.name AS owner_name, u.email AS owner_email FROM shops s JOIN users u ON s.owner_id = u.id`;
  const params = [];
  if (status) {
    query += " WHERE s.status = ?";
    params.push(status);
  }
  query += " ORDER BY s.created_at DESC";
  const shops = db.prepare(query).all(...params);
  return res.json(shops);
}

function updateShopStatus(req, res) {
  const { status } = req.body;
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }
  const shop = db.prepare("SELECT * FROM shops WHERE id = ?").get(req.params.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });

  db.prepare("UPDATE shops SET status = ? WHERE id = ?").run(status, shop.id);
  return res.json({ message: `Shop ${status}.` });
}

function deleteShop(req, res) {
  const shop = db.prepare("SELECT * FROM shops WHERE id = ?").get(req.params.id);
  if (!shop) return res.status(404).json({ message: "Shop not found." });
  db.prepare("DELETE FROM shops WHERE id = ?").run(shop.id);
  return res.json({ message: "Shop deleted." });
}

function listAllUsers(req, res) {
  const { role } = req.query;
  let query = "SELECT id, name, email, phone, role, created_at FROM users";
  const params = [];
  if (role) {
    query += " WHERE role = ?";
    params.push(role);
  }
  query += " ORDER BY created_at DESC";
  const users = db.prepare(query).all(...params);
  return res.json(users);
}

function deleteUser(req, res) {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  if (user.role === "admin") return res.status(400).json({ message: "Cannot delete admin account." });
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  return res.json({ message: "User deleted." });
}

function getPlatformStats(req, res) {
  const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='customer'").get().count;
  const totalShopOwners = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role='shop_owner'").get().count;
  const totalShops = db.prepare("SELECT COUNT(*) AS count FROM shops").get().count;
  const pendingShops = db.prepare("SELECT COUNT(*) AS count FROM shops WHERE status='pending'").get().count;
  const approvedShops = db.prepare("SELECT COUNT(*) AS count FROM shops WHERE status='approved'").get().count;
  const totalBookings = db.prepare("SELECT COUNT(*) AS count FROM bookings").get().count;
  const totalRevenue =
    db.prepare("SELECT COALESCE(SUM(amount),0) AS total FROM bookings WHERE payment_status='paid'").get().total || 0;

  const bookingsByMonth = db
    .prepare(
      `SELECT strftime('%Y-%m', booking_date) AS month, COUNT(*) AS count
       FROM bookings GROUP BY month ORDER BY month DESC LIMIT 12`
    )
    .all();

  const topShops = db
    .prepare(
      `SELECT sh.name, COUNT(b.id) AS bookings_count, COALESCE(SUM(CASE WHEN b.payment_status='paid' THEN b.amount ELSE 0 END),0) AS revenue
       FROM shops sh LEFT JOIN bookings b ON sh.id = b.shop_id
       GROUP BY sh.id ORDER BY revenue DESC LIMIT 5`
    )
    .all();

  return res.json({
    totalUsers,
    totalShopOwners,
    totalShops,
    pendingShops,
    approvedShops,
    totalBookings,
    totalRevenue,
    bookingsByMonth,
    topShops,
  });
}

module.exports = {
  listAllShops,
  updateShopStatus,
  deleteShop,
  listAllUsers,
  deleteUser,
  getPlatformStats,
};
