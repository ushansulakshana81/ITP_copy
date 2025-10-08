// frontend/src/modules/supplier/pages/PurchaseOrderList.jsx

/**
 * PurchaseOrderList Page Component
 * Displays a grid of all purchase orders in the system
 * Fetches purchase order data on component mount and displays using PurchaseOrderCard components
 */

import React, { useEffect, useState } from "react";
import purchaseOrderService from "../services/purchaseOrderService";
import PurchaseOrderCard from "../components/PurchaseOrderCard";

/**
 * Purchase Order List Page
 * @returns {JSX.Element} Purchase order list page with grid layout
 */
const PurchaseOrderList = () => {
  // State to store the list of purchase orders
  const [orders, setOrders] = useState([]);

  /**
   * useEffect Hook - Runs on component mount
   * Fetches all purchase orders from the backend and updates state
   */
  useEffect(() => {
    fetchOrders();
  }, []); // Empty dependency array ensures this runs only once on mount

  const fetchOrders = () => {
    // Call the getOrders API and set the returned data to state
    purchaseOrderService.getOrders().then(setOrders);
  };

  const handleDelete = (deletedId) => {
    setOrders(prevOrders => prevOrders.filter(o => o._id !== deletedId));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Purchase Orders</h2>
      
      {/* Purchase Order Grid - Responsive: 1 column on mobile, 2 columns on medium+, 3 columns on large screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Map through orders array and render a PurchaseOrderCard for each */}
        {orders.map((o) => (
          <PurchaseOrderCard key={o._id} order={o} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
};

export default PurchaseOrderList;
