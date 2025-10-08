// Import express and controllers
const express = require("express");
const router = express.Router();
const {
    createPart,
    getParts,
    getPartById,
    getPartsByCategory,
    getLowStockParts,
    updatePart,
    updatePartQuantity,
    deletePart,
} = require("../controllers/partController");

// @route   POST /api/parts
// @desc    Create a new part
router.post("/", createPart);

// @route   GET /api/parts
// @desc    Get all parts
router.get("/", getParts);

// @route   GET /api/parts/low-stock
// @desc    Get parts with low stock (must be before /:id route)
router.get("/low-stock", getLowStockParts);

// @route   GET /api/parts/category/:categoryId
// @desc    Get parts by category
router.get("/category/:categoryId", getPartsByCategory);

// @route   GET /api/parts/:id
// @desc    Get part by ID
router.get("/:id", getPartById);

// @route   PUT /api/parts/:id
// @desc    Update a part
router.put("/:id", updatePart);

// @route   PATCH /api/parts/:id/quantity
// @desc    Update part quantity only
router.patch("/:id/quantity", updatePartQuantity);

// @route   DELETE /api/parts/:id
// @desc    Delete a part
router.delete("/:id", deletePart);

module.exports = router;
