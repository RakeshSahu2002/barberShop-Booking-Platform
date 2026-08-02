const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/shop.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.use(verifyToken, requireRole("shop_owner"));

// Shop
router.post("/", ctrl.createShop);
router.get("/mine", ctrl.getMyShop);
router.put("/mine", ctrl.updateMyShop);

// Services
router.get("/services", ctrl.listMyServices);
router.post("/services", ctrl.addService);
router.put("/services/:id", ctrl.updateService);
router.delete("/services/:id", ctrl.deleteService);

// Staff
router.get("/staff", ctrl.listMyStaff);
router.post("/staff", ctrl.addStaff);
router.delete("/staff/:id", ctrl.deleteStaff);

// Timings
router.get("/timings", ctrl.getMyTimings);
router.post("/timings", ctrl.setTimings);

// Bookings
router.get("/bookings", ctrl.getMyBookings);
router.put("/bookings/:id/status", ctrl.updateBookingStatus);

// Analytics
router.get("/analytics", ctrl.getAnalytics);

module.exports = router;
