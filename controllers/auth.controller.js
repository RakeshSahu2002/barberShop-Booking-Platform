const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Register - customers and shop owners can self-register. Admin is seeded only.
function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password and role are required." });
    }

    if (!["customer", "shop_owner"].includes(role)) {
      return res.status(400).json({ message: "Role must be either 'customer' or 'shop_owner'." });
    }

    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)")
      .run(name, email, hashedPassword, phone || null, role);

    const user = { id: result.lastInsertRowid, name, email, role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.status(201).json({ message: "Registered successfully.", token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration." });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const dbUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!dbUser) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const validPassword = bcrypt.compareSync(password, dbUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

    return res.json({ message: "Login successful.", token, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login." });
  }
}

function getProfile(req, res) {
  const user = db
    .prepare("SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found." });
  return res.json(user);
}

module.exports = { register, login, getProfile };
