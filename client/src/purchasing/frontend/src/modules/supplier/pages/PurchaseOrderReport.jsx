// frontend/src/modules/supplier/pages/PurchaseOrderReport.jsx

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import purchaseOrderService from "../services/purchaseOrderService";
import supplierService from "../services/supplierService";
import { FiFilter, FiDownload, FiRefreshCw } from "react-icons/fi";
import jsPDF from "jspdf";
// eslint-disable-next-line no-unused-vars
import autoTable from "jspdf-autotable";

/**
 * Purchase Order Summary Report Component
 * Generates comprehensive reports with filters for date range, status, and supplier
 * Includes PDF export functionality with professional formatting
 */
const PurchaseOrderReport = () => {
    // State for purchase orders and suppliers
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Filter state
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        status: "",
        supplierId: "",
    });

    // Filtered results
    const [filteredOrders, setFilteredOrders] = useState([]);

    /**
     * Load initial data on component mount
     */
    useEffect(() => {
        fetchData();
    }, []);

    /**
     * Fetch purchase orders and suppliers from API
     */
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log("Fetching purchase orders and suppliers...");
            
            const [ordersData, suppliersData] = await Promise.all([
                purchaseOrderService.getOrders(),
                supplierService.getSuppliers()
            ]);
            
            console.log("Orders fetched:", ordersData);
            console.log("Suppliers fetched:", suppliersData);
            
            setPurchaseOrders(ordersData || []);
            setSuppliers(suppliersData || []);
            setFilteredOrders(ordersData || []); // Initially show all orders
        } catch (err) {
            console.error("Error fetching data:", err);
            console.error("Error details:", err.message);
            setError(`Failed to load data: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Apply filters to purchase orders
     */
    const applyFilters = () => {
        let filtered = [...purchaseOrders];

        // Filter by date range
        if (filters.startDate) {
            filtered = filtered.filter(order => 
                new Date(order.createdAt) >= new Date(filters.startDate)
            );
        }
        if (filters.endDate) {
            filtered = filtered.filter(order => 
                new Date(order.createdAt) <= new Date(filters.endDate)
            );
        }

        // Filter by status
        if (filters.status) {
            filtered = filtered.filter(order => 
                order.status.toLowerCase() === filters.status.toLowerCase()
            );
        }

        // Filter by supplier (using populated supplier._id)
        if (filters.supplierId) {
            filtered = filtered.filter(order => 
                order.supplier?._id === filters.supplierId
            );
        }

        setFilteredOrders(filtered);
    };

    /**
     * Reset all filters and show all orders
     */
    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            status: "",
            supplierId: "",
        });
        setFilteredOrders(purchaseOrders);
    };

    /**
     * Calculate summary statistics
     */
    const calculateSummary = () => {
        const total = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const count = filteredOrders.length;
        const average = count > 0 ? total / count : 0;

        // Count by status
        const statusCounts = filteredOrders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});

        return {
            totalAmount: total,
            orderCount: count,
            averageAmount: average,
            statusCounts
        };
    };

    const summary = calculateSummary();

    /**
     * Export report to PDF with professional formatting
     */
    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text("Purchase Order Summary Report", pageWidth / 2, 20, { align: "center" });

        // Report generation date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

        // Filter information
        let yPos = 40;
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        doc.text("Filter Criteria:", 14, yPos);
        
        doc.setFontSize(10);
        yPos += 7;
        if (filters.startDate || filters.endDate) {
            const dateRange = `Date Range: ${filters.startDate || 'Start'} to ${filters.endDate || 'End'}`;
            doc.text(dateRange, 14, yPos);
            yPos += 5;
        }
        if (filters.status) {
            doc.text(`Status: ${filters.status}`, 14, yPos);
            yPos += 5;
        }
        if (filters.supplierId) {
            const supplier = suppliers.find(s => s._id === filters.supplierId);
            doc.text(`Supplier: ${supplier?.name || 'Unknown'}`, 14, yPos);
            yPos += 5;
        }
        if (!filters.startDate && !filters.endDate && !filters.status && !filters.supplierId) {
            doc.text("All Purchase Orders", 14, yPos);
            yPos += 5;
        }

        // Summary statistics
        yPos += 5;
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text("Summary Statistics:", 14, yPos);
        
        doc.setFontSize(10);
        yPos += 7;
        doc.text(`Total Orders: ${summary.orderCount}`, 14, yPos);
        yPos += 5;
        doc.text(`Total Amount: LKR ${summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, yPos);
        yPos += 5;
        doc.text(`Average Order Value: LKR ${summary.averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 14, yPos);

        // Orders table
        yPos += 10;
        const tableData = filteredOrders.map(order => {
            return [
                order._id?.slice(-8).toUpperCase() || 'N/A',
                order.supplier?.name || 'N/A',
                new Date(order.createdAt).toLocaleDateString(),
                order.status,
                `LKR ${(order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
            ];
        });

        doc.autoTable({
            startY: yPos,
            head: [['PO ID', 'Supplier', 'Date', 'Status', 'Total Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                4: { halign: 'right' } // Right-align amounts
            }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const filename = `PO_Report_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(filename);
        
        // Show success toast notification
        toast.success(`Report exported successfully as ${filename}`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to generate PDF report. Please try again.');
        }
    };

    /**
     * Get status badge color
     */
    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-500",
            approved: "bg-blue-500",
            received: "bg-green-500",
            cancelled: "bg-red-500",
        };
        return colors[status.toLowerCase()] || "bg-gray-500";
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Purchase Order Report</h2>
                <button
                    onClick={exportToPDF}
                    disabled={filteredOrders.length === 0}
                    className="btn-primary flex items-center gap-2"
                >
                    <FiDownload /> Export to PDF
                </button>
            </div>

            {error && (
                <div className="error mb-4">{error}</div>
            )}

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FiFilter /> Filters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Start Date */}
                    <div>
                        <label className="form-label">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="form-input"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="form-label">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="form-input"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Supplier */}
                    <div>
                        <label className="form-label">Supplier</label>
                        <select
                            value={filters.supplierId}
                            onChange={(e) => setFilters({ ...filters, supplierId: e.target.value })}
                            className="form-input"
                        >
                            <option value="">All Suppliers</option>
                            {suppliers.map(supplier => (
                                <option key={supplier._id} value={supplier._id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={applyFilters}
                        className="btn-primary flex items-center gap-2"
                    >
                        <FiFilter /> Apply Filters
                    </button>
                    <button
                        onClick={resetFilters}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition flex items-center gap-2"
                    >
                        <FiRefreshCw /> Reset
                    </button>
                </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-gray-600 text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-700">{summary.orderCount}</p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                    <p className="text-gray-600 text-sm">Total Amount</p>
                    <p className="text-2xl font-bold text-green-700">
                        LKR {summary.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                    <p className="text-gray-600 text-sm">Average Order</p>
                    <p className="text-2xl font-bold text-purple-700">
                        LKR {summary.averageAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                    <p className="text-gray-600 text-sm">Status Breakdown</p>
                    <div className="text-sm mt-1">
                        {Object.entries(summary.statusCounts).map(([status, count]) => (
                            <div key={status} className="flex justify-between">
                                <span className="capitalize">{status}:</span>
                                <span className="font-semibold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-gray-600">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No purchase orders found matching the filters.</p>
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        PO ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Supplier
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Amount
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                    // Supplier is populated by backend, so order.supplier is an object
                                    const supplierName = order.supplier?.name || 'N/A';
                                    
                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order._id?.slice(-8).toUpperCase() || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {supplierName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)} text-white`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {order.items?.length || 0} item(s)
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                                                LKR {(order.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrderReport;
