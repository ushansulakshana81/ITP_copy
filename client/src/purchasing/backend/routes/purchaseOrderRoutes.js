const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
} = require("../controllers/purchaseOrderController");

// Routes
router.post("/", createPurchaseOrder);
router.get("/", getPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.put("/:id", updatePurchaseOrder);
router.delete("/:id", deletePurchaseOrder);

module.exports = router;