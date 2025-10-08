// frontend/src/modules/supplier/services/purchaseOrderService.js

/**
 * Purchase Order Service Module
 * Handles all API calls related to purchase order operations
 * Uses Axios for HTTP requests to the backend API
 */

import axios from "axios";

// Base API URL for purchase order endpoints
// Note: Backend uses "/api/purchase-orders" (kebab-case)
const API_URL = "http://localhost:5002/api/purchase-orders";

/**
 * Fetch all purchase orders from the database
 * @returns {Promise<Array>} Array of purchase order objects
 */
const getOrders = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/**
 * Fetch a single purchase order by ID
 * @param {string} id - The purchase order's unique identifier
 * @returns {Promise<Object>} Purchase order object
 */
const getOrderById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

/**
 * Create a new purchase order
 * @param {Object} orderData - Order information (supplier, items, totalCost, etc.)
 * @returns {Promise<Object>} Created purchase order object
 */
const createOrder = async (orderData) => {
  const res = await axios.post(API_URL, orderData);
  return res.data;
};

/**
 * Update an existing purchase order
 * @param {string} id - The purchase order's unique identifier
 * @param {Object} orderData - Updated order information
 * @returns {Promise<Object>} Updated purchase order object
 */
const updateOrder = async (id, orderData) => {
  const res = await axios.put(`${API_URL}/${id}`, orderData);
  return res.data;
};

/**
 * Delete a purchase order by ID
 * @param {string} id - The purchase order's unique identifier
 * @returns {Promise<Object>} Deletion confirmation message
 */
const deleteOrder = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// Export all purchase order service functions
const purchaseOrderService = {
  getOrders,
  getOrderById,
  getPurchaseOrderById: getOrderById, // Alias for consistency
  createOrder,
  updateOrder,
  deleteOrder,
};

export default purchaseOrderService;
