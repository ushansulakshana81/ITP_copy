// frontend/src/modules/supplier/services/pdfService.js

/**
 * PDF Service Module
 * Handles PDF generation for purchase orders
 * Uses jsPDF and jspdf-autotable for creating professional invoices
 */

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Generate PDF for a purchase order
 * @param {Object} order - Purchase order object
 * @param {Object} order.supplier - Supplier information
 * @param {Array} order.items - Array of order items
 * @param {Number} order.totalAmount - Total order amount
 * @param {String} order.status - Order status
 * @param {String} order.orderDate - Order date
 * @param {String} order._id - Order ID
 */
const generatePurchaseOrderPDF = (order) => {
  try {
    // Debug logging
    console.log('PDF Generation - Order Object:', order);
    
    // Validate required fields
    if (!order) {
      throw new Error('Order data is required');
    }
    
    if (!order._id) {
      throw new Error('Order ID is missing');
    }
    
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('Order must have at least one item');
    }

    console.log('PDF Generation - Validation passed, creating document...');

    // Create new PDF document (A4 size)
    const doc = new jsPDF();
  
  // Set document properties
  doc.setProperties({
    title: `Purchase Order - ${order._id}`,
    subject: 'Purchase Order Document',
    author: 'HeavySync',
    keywords: 'purchase order, invoice',
    creator: 'HeavySync System'
  });

  // Company Header
  doc.setFillColor(40, 44, 52); // Dark gray background
  doc.rect(0, 0, 210, 40, 'F'); // Full width rectangle
  
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('PURCHASE ORDER', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('HeavySync - Supplier Management System', 105, 25, { align: 'center' });
  doc.text('Procurement Department', 105, 32, { align: 'center' });

  // Reset text color for body
  doc.setTextColor(0, 0, 0);

  // Order Information Box
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 50, 182, 30, 'F');
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Order ID:', 20, 58);
  doc.text('Order Date:', 20, 66);
  doc.text('Status:', 20, 74);
  
  doc.setFont(undefined, 'normal');
  doc.text(`#${order._id.slice(-8).toUpperCase()}`, 50, 58);
  doc.text(new Date(order.orderDate || order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 50, 66);
  
  // Status with color
  const statusColor = {
    'Pending': [255, 193, 7],
    'Approved': [33, 150, 243],
    'Received': [76, 175, 80],
    'Cancelled': [244, 67, 54]
  };
  
  const color = statusColor[order.status] || [128, 128, 128];
  doc.setTextColor(color[0], color[1], color[2]);
  doc.setFont(undefined, 'bold');
  doc.text(order.status.toUpperCase(), 50, 74);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'normal');

  // Supplier Information
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SUPPLIER INFORMATION', 20, 92);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Name: ${order.supplier?.name || 'N/A'}`, 20, 100);
  doc.text(`Email: ${order.supplier?.contactEmail || 'N/A'}`, 20, 107);
  doc.text(`Phone: ${order.supplier?.contactPhone || 'N/A'}`, 20, 114);
  doc.text(`Address: ${order.supplier?.address || 'N/A'}`, 20, 121);

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 128, 190, 128);

  // Items Table
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('ORDER ITEMS', 20, 138);

  // Prepare table data
  const tableData = order.items.map((item, index) => [
    (index + 1).toString(),
    item.name,
    item.quantity.toString(),
    `LKR ${item.unitPrice.toFixed(2)}`,
    `LKR ${item.totalPrice.toFixed(2)}`
  ]);

  // Add table using autoTable
  doc.autoTable({
    startY: 145,
    head: [['#', 'Item Name', 'Quantity', 'Unit Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [40, 44, 52],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 80 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 20, right: 20 }
  });

  // Get final Y position after table
  const finalY = doc.lastAutoTable.finalY + 10;

  // Total Amount Box - wider to prevent text overlap
  doc.setFillColor(40, 44, 52);
  doc.rect(110, finalY, 80, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL AMOUNT:', 115, finalY + 10);
  doc.text(`LKR ${order.totalAmount.toFixed(2)}`, 185, finalY + 10, { align: 'right' });

  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont(undefined, 'italic');
  const footerY = 280;
  doc.text('This is a computer-generated document. No signature is required.', 105, footerY, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleString('en-US')}`, 105, footerY + 5, { align: 'center' });
  doc.text('HeavySync - Supplier & Purchase Order Management System', 105, footerY + 10, { align: 'center' });

  // Save the PDF
  console.log('PDF Generation - About to save PDF...');
  const fileName = `PurchaseOrder_${order._id.slice(-8)}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  console.log('PDF Generation - PDF saved successfully:', fileName);

  return fileName;
  
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Preview PDF in new window (without downloading)
 * @param {Object} order - Purchase order object
 */
const previewPurchaseOrderPDF = (order) => {
  const doc = new jsPDF();
  
  // Same generation logic as above...
  // (You can extract the generation logic into a separate function to avoid duplication)
  
  // Open in new window instead of downloading
  window.open(doc.output('bloburl'), '_blank');
};

/**
 * Test function to verify jsPDF is working
 */
const testPDF = () => {
  try {
    console.log('Testing jsPDF...');
    const doc = new jsPDF();
    doc.text('Hello World!', 10, 10);
    doc.save('test.pdf');
    console.log('Test PDF created successfully!');
    return true;
  } catch (error) {
    console.error('jsPDF Test Failed:', error);
    return false;
  }
};

const pdfService = {
  generatePurchaseOrderPDF,
  previewPurchaseOrderPDF,
  testPDF
};

export default pdfService;
