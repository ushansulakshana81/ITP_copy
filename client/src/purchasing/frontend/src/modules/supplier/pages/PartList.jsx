// frontend/src/modules/supplier/pages/PartList.jsx

/**
 * PartList Page Component
 * Displays all parts in a grid layout
 * Allows filtering and viewing low stock items
 */

import React, { useState, useEffect } from "react";
import PartCard from "../components/PartCard";
import partService from "../services/partService";

/**
 * Part List Component
 * @returns {JSX.Element} Part list page with cards
 */
const PartList = () => {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  /**
   * Fetch all parts on component mount
   */
  useEffect(() => {
    fetchParts();
  }, []);

  /**
   * Filter parts based on search and low stock filter
   */
  useEffect(() => {
    let filtered = parts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (part) =>
          part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.partId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          part.categoryId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by low stock
    if (showLowStockOnly) {
      filtered = filtered.filter((part) => part.quantity <= part.minimumStock);
    }

    setFilteredParts(filtered);
  }, [searchTerm, showLowStockOnly, parts]);

  /**
   * Fetch parts from API
   */
  const fetchParts = async () => {
    try {
      setLoading(true);
      const data = await partService.getParts();
      setParts(data);
      setFilteredParts(data);
      setError("");
    } catch (err) {
      console.error("Error fetching parts:", err);
      setError("Failed to load parts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get count of low stock items
   */
  const lowStockCount = parts.filter((part) => part.quantity <= part.minimumStock).length;

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Parts Inventory</h1>
          <p className="text-gray-600 mt-2">
            Total: <span className="font-semibold">{parts.length}</span> parts | 
            Low Stock: <span className="font-semibold text-red-600">{lowStockCount}</span>
          </p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          {/* Search Input */}
          <div className="flex-1 w-full">
            <input
              type="text"
              placeholder="Search by name, part ID, part number, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Low Stock Filter Toggle */}
          <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="w-5 h-5 text-blue-600"
            />
            <span>Show Low Stock Only</span>
          </label>

          {/* Refresh Button */}
          <button
            onClick={fetchParts}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Loading parts...</p>
        </div>
      ) : filteredParts.length === 0 ? (
        /* No Parts Found */
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">
            {searchTerm || showLowStockOnly
              ? "No parts match your search criteria."
              : "No parts available. Add a new part to get started."}
          </p>
        </div>
      ) : (
        /* Parts Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParts.map((part) => (
            <PartCard key={part._id} part={part} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PartList;
