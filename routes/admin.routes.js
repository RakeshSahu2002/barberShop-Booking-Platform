const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/admin.controller");
const { verifyToken, requireRole } = require("../middleware/auth");

router.use(verifyToken, requireRole("admin"));

router.get("/shops", ctrl.listAllShops);
router.put("/shops/:id/status", ctrl.updateShopStatus);
router.delete("/shops/:id", ctrl.deleteShop);

router.get("/users", ctrl.listAllUsers);
router.delete("/users/:id", ctrl.deleteUser);

router.get("/stats", ctrl.getPlatformStats);

module.exports = router;
