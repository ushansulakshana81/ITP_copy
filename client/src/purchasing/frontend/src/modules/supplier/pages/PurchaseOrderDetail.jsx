// frontend/src/modules/supplier/pages/PurchaseOrderDetail.jsx

/**
 * PurchaseOrderDetail Page Component
 * Displays detailed information about a single purchase order
 * Includes option to download PDF
 */

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import purchaseOrderService from "../services/purchaseOrderService";
import pdfService from "../services/pdfService";

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await purchaseOrderService.getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError("Failed to load purchase order details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleDownloadPDF = () => {
    try {
      pdfService.generatePurchaseOrderPDF(order);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (window.confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
      setUpdating(true);
      try {
        const updatedOrder = await purchaseOrderService.updateOrder(id, { status: newStatus });
        setOrder(updatedOrder);
        toast.success(`Status updated to ${newStatus} successfully!`);
      } catch (error) {
        console.error('Error updating status:', error);
        toast.error('Failed to update status. Please try again.');
      } finally {
        setUpdating(false);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading purchase order...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!order) {
    return <div className="error">Purchase order not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Back Button and PDF Download */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/purchase-orders')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>
      </div>

      {/* Order Information Card */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Purchase Order
            </h1>
            <p className="text-gray-600">Order ID: #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                order.status === "Pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : order.status === "Approved"
                  ? "bg-blue-100 text-blue-800"
                  : order.status === "Received"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {order.status}
            </span>
            
            {/* Status Change Buttons */}
            <div className="flex gap-2">
              {order.status !== "Approved" && order.status !== "Received" && order.status !== "Cancelled" && (
                <button
                  onClick={() => handleStatusChange("Approved")}
                  disabled={updating}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? "Updating..." : "Approve"}
                </button>
              )}
              {order.status === "Approved" && (
                <button
                  onClick={() => handleStatusChange("Received")}
                  disabled={updating}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? "Updating..." : "Mark Received"}
                </button>
              )}
              {order.status !== "Cancelled" && order.status !== "Received" && (
                <button
                  onClick={() => handleStatusChange("Cancelled")}
                  disabled={updating}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {updating ? "Updating..." : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Order Date</h3>
            <p className="text-gray-900">
              {new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
            <p className="text-gray-900">
              {new Date(order.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-3">Supplier Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{order.supplier?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{order.supplier?.contactEmail || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{order.supplier?.contactPhone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{order.supplier?.address || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3">Order Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Item Name</th>
                  <th className="p-3 text-center">Quantity</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">LKR {item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-right font-medium">LKR {item.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-800 text-white">
                  <td colSpan="4" className="p-3 text-right font-bold">TOTAL AMOUNT:</td>
                  <td className="p-3 text-right font-bold text-lg">
                    LKR {order.totalAmount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;
