// frontend/src/modules/supplier/pages/Dashboard.jsx

/**
 * Dashboard Component
 * 
 * Main landing page showing key business metrics and insights
 * Displays:
 * - Summary statistics (suppliers, parts, purchase orders, quotations)
 * - Low stock alerts
 * - Recent purchase orders
 * - Quick action buttons
 * 
 * Purpose: Gives users a complete overview of the system at a glance
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingCart, 
  FiFileText, 
  FiAlertTriangle,
  FiTrendingUp,
  FiPlusCircle,
  FiChevronDown
} from "react-icons/fi";

// Import services to fetch data
import supplierService from "../services/supplierService";
import partService from "../services/partService";
import purchaseOrderService from "../services/purchaseOrderService";
import { getAllQuotations } from "../services/quotationService";

/**
 * Dashboard Page Component
 * @returns {JSX.Element} Dashboard with statistics and alerts
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // State for statistics
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    totalParts: 0,
    totalPurchaseOrders: 0,
    totalQuotations: 0,
    lowStockItems: 0,
    activePOs: 0 // Pending + Approved orders
  });

  // State for low stock parts (parts below minimum stock level)
  const [lowStockParts, setLowStockParts] = useState([]);

  // State for recent purchase orders
  const [recentPOs, setRecentPOs] = useState([]);

  // State for loading indicator
  const [loading, setLoading] = useState(true);

  // State for dropdown menu visibility (tracks which part's menu is open)
  const [openDropdown, setOpenDropdown] = useState(null);

  /**
   * Fetch all dashboard data on component mount
   * Runs once when the dashboard loads
   */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch data from all services and calculate statistics
   * This function orchestrates multiple API calls
   */
  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      // Fetch data from all endpoints in parallel for better performance
      const [suppliers, parts, purchaseOrders, quotations] = await Promise.all([
        supplierService.getSuppliers(),
        partService.getParts(),
        purchaseOrderService.getOrders(),
        getAllQuotations()
      ]);

      // Calculate low stock items (quantity <= minimumStock)
      const lowStock = parts.filter(part => part.quantity <= part.minimumStock);

      // Calculate active purchase orders (Pending or Approved status)
      const active = purchaseOrders.filter(
        po => po.status === "Pending" || po.status === "Approved"
      );

      // Get recent 5 purchase orders (sorted by creation date, newest first)
      const recent = purchaseOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Update statistics state
      setStats({
        totalSuppliers: suppliers.length,
        totalParts: parts.length,
        totalPurchaseOrders: purchaseOrders.length,
        totalQuotations: quotations.length,
        lowStockItems: lowStock.length,
        activePOs: active.length
      });

      // Update low stock parts for alerts section
      setLowStockParts(lowStock.slice(0, 5)); // Show top 5 low stock items

      // Update recent purchase orders
      setRecentPOs(recent);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get color class for status badges
   * @param {string} status - Purchase order status
   * @returns {string} Tailwind CSS color classes
   */
  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Approved: "bg-blue-100 text-blue-800 border-blue-300",
      Received: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  /**
   * Navigate to create quotation page for low stock item
   * @param {Object} part - Part that needs reordering
   */
  const handleRequestQuotation = (part) => {
    // Navigate to quotations page with part data
    // The quotation form can auto-fill with this part's details
    navigate("/quotations", { state: { part } });
  };

  /**
   * Navigate to create purchase order for low stock item
   * @param {Object} part - Part that needs reordering
   */
  const handleCreatePO = (part) => {
    // Navigate to purchase order form with part data
    // The PO form can auto-fill with this part's details
    navigate("/purchase-orders/new", { state: { part } });
  };

  /**
   * Toggle dropdown menu for reorder options
   * @param {string} partId - ID of the part to toggle dropdown for
   */
  const toggleDropdown = (partId) => {
    // Close if already open, open if closed
    setOpenDropdown(openDropdown === partId ? null : partId);
  };

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside dropdown, close it
      if (!event.target.closest('.reorder-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome to HeavySync - Overview of your operations</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Suppliers Card */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/suppliers")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Suppliers</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalSuppliers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiUsers className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Click to view all suppliers</p>
        </div>

        {/* Parts Card */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/parts")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Total Parts</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalParts}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiPackage className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Click to view inventory</p>
        </div>

        {/* Purchase Orders Card */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/purchase-orders")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Purchase Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalPurchaseOrders}</p>
              <p className="text-xs text-purple-600 font-medium mt-1">
                {stats.activePOs} active
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiShoppingCart className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Click to view orders</p>
        </div>

        {/* Quotations Card */}
        <div 
          className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate("/quotations")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">Quotations</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalQuotations}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiFileText className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Click to compare quotes</p>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      {stats.lowStockItems > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Low Stock Alert - {stats.lowStockItems} Item(s) Need Attention
              </h3>
              <p className="text-sm text-red-700 mb-4">
                The following parts are at or below minimum stock levels and need reordering:
              </p>
              
              {/* Low Stock Items List */}
              <div className="space-y-3">
                {lowStockParts.map((part) => (
                  <div 
                    key={part._id} 
                    className="bg-white rounded-lg p-4 border border-red-200 hover:border-red-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{part.name}</p>
                        <p className="text-sm text-gray-600">
                          Part ID: {part.partId} | Location: {part.location}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-sm">
                            <span className="font-medium text-gray-700">Current:</span>{" "}
                            <span className="text-red-600 font-bold">{part.quantity}</span>
                          </span>
                          <span className="text-sm">
                            <span className="font-medium text-gray-700">Minimum:</span>{" "}
                            <span className="text-gray-600">{part.minimumStock}</span>
                          </span>
                          <span className="text-sm">
                            <span className="font-medium text-gray-700">Unit Price:</span>{" "}
                            <span className="text-gray-600">LKR {part.unitPrice.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Reorder Dropdown Button */}
                      <div className="ml-4 relative reorder-dropdown">
                        <button
                          onClick={() => toggleDropdown(part._id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <FiTrendingUp className="w-4 h-4" />
                          Reorder
                          <FiChevronDown className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {openDropdown === part._id && (
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                            <div className="py-1">
                              {/* Option 1: Request Quotation */}
                              <button
                                onClick={() => {
                                  handleRequestQuotation(part);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3"
                              >
                                <FiFileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">Request Quotation</p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    Get quotes from multiple suppliers
                                  </p>
                                </div>
                              </button>

                              {/* Divider */}
                              <div className="border-t border-gray-100"></div>

                              {/* Option 2: Create Purchase Order */}
                              <button
                                onClick={() => {
                                  handleCreatePO(part);
                                  setOpenDropdown(null);
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 transition-colors flex items-start gap-3"
                              >
                                <FiShoppingCart className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">Create Purchase Order</p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    Order directly from a supplier
                                  </p>
                                </div>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show all low stock items link */}
              {stats.lowStockItems > 5 && (
                <button
                  onClick={() => navigate("/parts")}
                  className="mt-4 text-sm text-red-700 hover:text-red-900 font-medium underline"
                >
                  View all {stats.lowStockItems} low stock items →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Purchase Orders Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Recent Purchase Orders</h3>
          <button
            onClick={() => navigate("/purchase-orders")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </button>
        </div>

        {recentPOs.length === 0 ? (
          // Empty state when no purchase orders exist
          <div className="text-center py-8">
            <FiShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No purchase orders yet</p>
            <button
              onClick={() => navigate("/purchase-orders/new")}
              className="btn-primary"
            >
              Create First Purchase Order
            </button>
          </div>
        ) : (
          // Recent purchase orders table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPOs.map((po) => (
                  <tr 
                    key={po._id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/purchase-orders/${po._id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      #{po._id.slice(-6)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {po.supplier?.name || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {po.items?.length || 0} item(s)
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                      LKR {po.totalAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-md p-8 text-white">
        <h3 className="text-2xl font-bold mb-4">Quick Actions</h3>
        <p className="mb-6 text-blue-100">Frequently used operations - access them quickly from here</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Add Supplier */}
          <button
            onClick={() => navigate("/suppliers/new")}
            className="bg-white text-blue-600 hover:bg-blue-50 rounded-lg p-4 flex items-center gap-3 transition-colors font-medium"
          >
            <FiPlusCircle className="w-5 h-5" />
            Add Supplier
          </button>

          {/* Add Part */}
          <button
            onClick={() => navigate("/parts/new")}
            className="bg-white text-green-600 hover:bg-green-50 rounded-lg p-4 flex items-center gap-3 transition-colors font-medium"
          >
            <FiPlusCircle className="w-5 h-5" />
            Add Part
          </button>

          {/* Create Purchase Order */}
          <button
            onClick={() => navigate("/purchase-orders/new")}
            className="bg-white text-purple-600 hover:bg-purple-50 rounded-lg p-4 flex items-center gap-3 transition-colors font-medium"
          >
            <FiPlusCircle className="w-5 h-5" />
            Create PO
          </button>

          {/* Request Quotation */}
          <button
            onClick={() => navigate("/quotations")}
            className="bg-white text-orange-600 hover:bg-orange-50 rounded-lg p-4 flex items-center gap-3 transition-colors font-medium"
          >
            <FiPlusCircle className="w-5 h-5" />
            Request Quote
          </button>
        </div>
        
        {/* Reports Quick Link */}
        <div className="mt-4 pt-4 border-t border-blue-400">
          <button
            onClick={() => navigate("/reports/purchase-orders")}
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg px-6 py-3 flex items-center gap-3 transition-colors font-medium"
          >
            <FiTrendingUp className="w-5 h-5" />
            View Purchase Order Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
