const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth route working"
  });
});

const { register, login, getProfile } = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

module.exports = router;