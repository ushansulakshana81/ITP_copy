const mongoose = require("mongoose");

// Purchase Order Schema
const purchaseOrderSchema = new mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier", // Links PO to supplier
      required: true,
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Received", "Cancelled"],
      default: "Pending",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    receivedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);