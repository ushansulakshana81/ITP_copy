// Import Quotation model
const Quotation = require("../models/Quotation");
const Part = require("../models/Part");
const Supplier = require("../models/Supplier");

/**
 * Create a new quotation request
 * POST /api/quotations
 */
const createQuotation = async (req, res) => {
    try {
        const { partId, partNumber, partName, quantity, supplierIds, notes } = req.body;

        // Validate required fields
        if (!partId || !partNumber || !partName || !quantity || !supplierIds || supplierIds.length === 0) {
            return res.status(400).json({ 
                message: "Part details, quantity, and at least one supplier are required" 
            });
        }

        // Fetch supplier details
        const suppliers = await Supplier.find({ supplierId: { $in: supplierIds } });
        
        if (suppliers.length === 0) {
            return res.status(404).json({ message: "No valid suppliers found" });
        }

        // Generate quotation ID
        const quotationId = `QUO-${Date.now()}`;

        // Prepare suppliers data
        const suppliersData = suppliers.map(supplier => ({
            supplierId: supplier.supplierId,
            name: supplier.name,
            contactEmail: supplier.contactEmail,
            quotedPrice: 0,
            deliveryTime: '',
            status: 'pending',
        }));

        // Create new quotation
        const quotation = new Quotation({
            quotationId,
            part: {
                partId,
                partNumber,
                name: partName,
            },
            quantity,
            suppliers: suppliersData,
            notes: notes || '',
            status: 'draft',
        });

        await quotation.save();

        res.status(201).json({
            message: "Quotation request created successfully",
            quotation,
        });
    } catch (error) {
        console.error("Error creating quotation:", error);
        res.status(500).json({ 
            message: "Failed to create quotation", 
            error: error.message 
        });
    }
};

/**
 * Get all quotations
 * GET /api/quotations
 */
const getAllQuotations = async (req, res) => {
    try {
        const quotations = await Quotation.find().sort({ createdAt: -1 });
        res.status(200).json(quotations);
    } catch (error) {
        console.error("Error fetching quotations:", error);
        res.status(500).json({ 
            message: "Failed to fetch quotations", 
            error: error.message 
        });
    }
};

/**
 * Get a single quotation by ID
 * GET /api/quotations/:id
 */
const getQuotationById = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        res.status(200).json(quotation);
    } catch (error) {
        console.error("Error fetching quotation:", error);
        res.status(500).json({ 
            message: "Failed to fetch quotation", 
            error: error.message 
        });
    }
};

/**
 * Update quotation status
 * PUT /api/quotations/:id/status
 */
const updateQuotationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        res.status(200).json({
            message: "Quotation status updated successfully",
            quotation,
        });
    } catch (error) {
        console.error("Error updating quotation status:", error);
        res.status(500).json({ 
            message: "Failed to update quotation status", 
            error: error.message 
        });
    }
};

/**
 * Update supplier quote in a quotation
 * PUT /api/quotations/:id/supplier/:supplierId
 */
const updateSupplierQuote = async (req, res) => {
    try {
        const { quotedPrice, deliveryTime, status } = req.body;
        const { id, supplierId } = req.params;

        const quotation = await Quotation.findById(id);
        
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        // Find and update the supplier
        const supplierIndex = quotation.suppliers.findIndex(
            s => s.supplierId === supplierId
        );

        if (supplierIndex === -1) {
            return res.status(404).json({ message: "Supplier not found in this quotation" });
        }

        if (quotedPrice !== undefined) {
            quotation.suppliers[supplierIndex].quotedPrice = quotedPrice;
        }
        if (deliveryTime !== undefined) {
            quotation.suppliers[supplierIndex].deliveryTime = deliveryTime;
        }
        if (status !== undefined) {
            quotation.suppliers[supplierIndex].status = status;
        }

        await quotation.save();

        res.status(200).json({
            message: "Supplier quote updated successfully",
            quotation,
        });
    } catch (error) {
        console.error("Error updating supplier quote:", error);
        res.status(500).json({ 
            message: "Failed to update supplier quote", 
            error: error.message 
        });
    }
};

/**
 * Delete a quotation
 * DELETE /api/quotations/:id
 */
const deleteQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findByIdAndDelete(req.params.id);

        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        res.status(200).json({ 
            message: "Quotation deleted successfully" 
        });
    } catch (error) {
        console.error("Error deleting quotation:", error);
        res.status(500).json({ 
            message: "Failed to delete quotation", 
            error: error.message 
        });
    }
};

module.exports = {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    updateQuotationStatus,
    updateSupplierQuote,
    deleteQuotation,
};
