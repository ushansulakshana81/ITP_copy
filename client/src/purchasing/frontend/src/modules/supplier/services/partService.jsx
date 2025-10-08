// frontend/src/modules/supplier/services/partService.js

/**
 * Part Service
 * Handles all API calls related to parts/items
 */

import axios from "axios";

const API_URL = "http://localhost:5002/api/parts";

/**
 * Get all parts
 * @returns {Promise} Array of parts
 */
const getParts = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

/**
 * Get part by ID
 * @param {string} id - Part ID
 * @returns {Promise} Part object
 */
const getPartById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

/**
 * Get parts by category
 * @param {string} categoryId - Category ID
 * @returns {Promise} Array of parts in category
 */
const getPartsByCategory = async (categoryId) => {
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    return response.data;
};

/**
 * Get low stock parts
 * @returns {Promise} Array of parts with low stock
 */
const getLowStockParts = async () => {
    const response = await axios.get(`${API_URL}/low-stock`);
    return response.data;
};

/**
 * Create a new part
 * @param {Object} partData - Part data
 * @returns {Promise} Created part object
 */
const createPart = async (partData) => {
    const response = await axios.post(API_URL, partData);
    return response.data;
};

/**
 * Update a part
 * @param {string} id - Part ID
 * @param {Object} partData - Updated part data
 * @returns {Promise} Updated part object
 */
const updatePart = async (id, partData) => {
    const response = await axios.put(`${API_URL}/${id}`, partData);
    return response.data;
};

/**
 * Update part quantity only
 * @param {string} id - Part ID
 * @param {number} quantity - New quantity
 * @returns {Promise} Updated part object
 */
const updatePartQuantity = async (id, quantity) => {
    const response = await axios.patch(`${API_URL}/${id}/quantity`, { quantity });
    return response.data;
};

/**
 * Delete a part
 * @param {string} id - Part ID
 * @returns {Promise} Success message
 */
const deletePart = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Export all functions
const partService = {
    getParts,
    getPartById,
    getPartsByCategory,
    getLowStockParts,
    createPart,
    updatePart,
    updatePartQuantity,
    deletePart,
};

export default partService;
