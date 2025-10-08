// Quotation Service - Handles all API calls related to quotations

const API_BASE_URL = "http://localhost:5002/api";

/**
 * Create a new quotation request
 * @param {Object} quotationData - Quotation data
 * @returns {Promise<Object>} Created quotation
 */
export const createQuotation = async (quotationData) => {
    try {
        console.log("Creating quotation with data:", quotationData);
        
        const response = await fetch(`${API_BASE_URL}/quotations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quotationData),
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Server error response:", data);
            throw new Error(data.message || "Failed to create quotation");
        }

        console.log("Quotation created successfully:", data);
        return data;
    } catch (error) {
        console.error("Error creating quotation:", error);
        throw error;
    }
};

/**
 * Get all quotations
 * @returns {Promise<Array>} List of quotations
 */
export const getAllQuotations = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/quotations`);

        if (!response.ok) {
            throw new Error("Failed to fetch quotations");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching quotations:", error);
        throw error;
    }
};

/**
 * Get a single quotation by ID
 * @param {string} id - Quotation ID
 * @returns {Promise<Object>} Quotation details
 */
export const getQuotationById = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quotations/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch quotation");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching quotation:", error);
        throw error;
    }
};

/**
 * Update quotation status
 * @param {string} id - Quotation ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated quotation
 */
export const updateQuotationStatus = async (id, status) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quotations/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update quotation status");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating quotation status:", error);
        throw error;
    }
};

/**
 * Update supplier quote in a quotation
 * @param {string} quotationId - Quotation ID
 * @param {string} supplierId - Supplier ID
 * @param {Object} quoteData - Quote data (quotedPrice, deliveryTime, status)
 * @returns {Promise<Object>} Updated quotation
 */
export const updateSupplierQuote = async (quotationId, supplierId, quoteData) => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/quotations/${quotationId}/supplier/${supplierId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(quoteData),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update supplier quote");
        }

        return await response.json();
    } catch (error) {
        console.error("Error updating supplier quote:", error);
        throw error;
    }
};

/**
 * Delete a quotation
 * @param {string} id - Quotation ID
 * @returns {Promise<Object>} Success message
 */
export const deleteQuotation = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/quotations/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete quotation");
        }

        return await response.json();
    } catch (error) {
        console.error("Error deleting quotation:", error);
        throw error;
    }
};
