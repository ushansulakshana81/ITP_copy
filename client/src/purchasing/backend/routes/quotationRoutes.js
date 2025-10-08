// Import Express and create a router
const express = require("express");
const router = express.Router();

// Import quotation controller functions
const {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    updateQuotationStatus,
    updateSupplierQuote,
    deleteQuotation,
} = require("../controllers/quotationController");

/**
 * @route   POST /api/quotations
 * @desc    Create a new quotation request
 * @access  Public
 */
router.post("/", createQuotation);

/**
 * @route   GET /api/quotations
 * @desc    Get all quotations
 * @access  Public
 */
router.get("/", getAllQuotations);

/**
 * @route   GET /api/quotations/:id
 * @desc    Get a single quotation by ID
 * @access  Public
 */
router.get("/:id", getQuotationById);

/**
 * @route   PUT /api/quotations/:id/status
 * @desc    Update quotation status
 * @access  Public
 */
router.put("/:id/status", updateQuotationStatus);

/**
 * @route   PUT /api/quotations/:id/supplier/:supplierId
 * @desc    Update supplier quote in a quotation
 * @access  Public
 */
router.put("/:id/supplier/:supplierId", updateSupplierQuote);

/**
 * @route   DELETE /api/quotations/:id
 * @desc    Delete a quotation
 * @access  Public
 */
router.delete("/:id", deleteQuotation);

module.exports = router;
