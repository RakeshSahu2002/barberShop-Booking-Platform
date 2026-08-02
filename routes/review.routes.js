const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/review.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.post("/", verifyToken, requireRole("customer"), ctrl.createReview);
router.get("/shop/:shopId", ctrl.getShopReviews);

module.exports = router;
