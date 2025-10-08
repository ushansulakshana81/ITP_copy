// frontend/src/modules/supplier/services/supplierService.js

/**
 * Supplier Service Module
 * Handles all API calls related to supplier operations
 * Uses Axios for HTTP requests to the backend API
 */

import axios from "axios";

// Base API URL for supplier endpoints
const API_URL = "http://localhost:5000/api/suppliers";

/**
 * Fetch all suppliers from the database
 * @returns {Promise<Array>} Array of supplier objects
 */
const getSuppliers = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

/**
 * Fetch a single supplier by ID
 * @param {string} id - The supplier's unique identifier
 * @returns {Promise<Object>} Supplier object
 */
const getSupplierById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

/**
 * Create a new supplier
 * @param {Object} supplierData - Supplier information (name, email, phone, etc.)
 * @returns {Promise<Object>} Created supplier object
 */
const createSupplier = async (supplierData) => {
  const res = await axios.post(API_URL, supplierData);
  return res.data;
};

/**
 * Update an existing supplier
 * @param {string} id - The supplier's unique identifier
 * @param {Object} supplierData - Updated supplier information
 * @returns {Promise<Object>} Updated supplier object
 */
const updateSupplier = async (id, supplierData) => {
  const res = await axios.put(`${API_URL}/${id}`, supplierData);
  return res.data;
};

/**
 * Delete a supplier by ID
 * @param {string} id - The supplier's unique identifier
 * @returns {Promise<Object>} Deletion confirmation message
 */
const deleteSupplier = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// Export all supplier service functions
const supplierService = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};

export default supplierService;
