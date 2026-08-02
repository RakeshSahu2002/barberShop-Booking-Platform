const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/customer.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

// Public browsing (no login required so people can explore before signing up)
router.get("/shops", ctrl.browseShops);
router.get("/shops/:id", ctrl.getShopDetails);

// Requires login as customer
router.post("/bookings", verifyToken, requireRole("customer"), ctrl.createBooking);
router.get("/bookings/mine", verifyToken, requireRole("customer"), ctrl.getMyBookings);
router.put("/bookings/:id/cancel", verifyToken, requireRole("customer"), ctrl.cancelBooking);

module.exports = router;
