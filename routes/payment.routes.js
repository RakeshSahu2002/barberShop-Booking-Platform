const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/payment.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/create-order", verifyToken, requireRole("customer"), ctrl.createOrder);
router.post("/verify", verifyToken, requireRole("customer"), ctrl.verifyPayment);

module.exports = router;
