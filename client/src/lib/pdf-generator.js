import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function generatePDF(data, title, stats) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text(title, 20, 25);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    if (stats) {
        // Add stats section
        doc.setFontSize(12);
        doc.text('Summary Statistics', 20, 50);

        doc.setFontSize(10);
        doc.text(`Total Parts: ${stats.totalParts || 0}`, 20, 60);
        doc.text(`Low Stock Items: ${stats.lowStockCount || 0}`, 20, 70);
        doc.text(`Total Value: $${(stats.totalValue || 0).toLocaleString()}`, 20, 80);
        doc.text(`Active Suppliers: ${stats.activeSuppliers || 0}`, 20, 90);
    }

    // Table data
    const tableData = data.map(part => [
        part.partNumber,
        part.name,
        part.category?.name || 'N/A',
        part.quantity.toString(),
        part.minimumStock.toString(),
        part.stockStatus === 'in-stock' ? 'In Stock' :
            part.stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock',
        part.supplier?.name || 'N/A',
        `$${parseFloat(part.unitPrice).toFixed(2)}`,
        part.location || 'N/A'
    ]);

    // Add table
    autoTable(doc, {
        startY: stats ? 105 : 55,
        head: [['Part Number', 'Name', 'Category', 'Qty', 'Min Stock', 'Status', 'Supplier', 'Unit Price', 'Location']],
        body: tableData,
        styles: {fontSize: 8},
        headStyles: {fillColor: [37, 99, 235]},
        alternateRowStyles: {fillColor: [248, 250, 252]},
    });

    // Save the PDF
    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

export const generateInventoryPDF = generatePDF;

// Supplier Analysis Report
export async function generateSupplierAnalysisPDF(data, dateRange) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Supplier Analysis Report', 20, 25);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    if (dateRange) {
        doc.text(`Period: ${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`, 20, 45);
    }

    // Table data - supplier name, stock, total price
    const tableData = data.map(supplier => [
        supplier.name,
        supplier.totalStock?.toString() || '0',
        `$${(supplier.totalValue || 0).toLocaleString()}`
    ]);

    // Add table
    autoTable(doc, {
        startY: dateRange ? 60 : 50,
        head: [['Supplier Name', 'Total Stock', 'Total Value']],
        body: tableData,
        styles: {fontSize: 10},
        headStyles: {fillColor: [37, 99, 235]},
        alternateRowStyles: {fillColor: [248, 250, 252]},
    });

    const filename = `supplier-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

// Stock Movements Report
export async function generateStockMovementsPDF(movements) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Stock Movements Report', 20, 25);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Table data
    const tableData = movements.map(movement => [
        movement.part?.partNumber || 'N/A',
        movement.part?.name || 'N/A',
        movement.type === 'in' ? 'Stock In' : 'Stock Out',
        movement.quantity?.toString() || '0',
        movement.reason || 'N/A',
        new Date(movement.createdAt).toLocaleDateString()
    ]);

    // Add table
    autoTable(doc, {
        startY: 50,
        head: [['Part Number', 'Part Name', 'Type', 'Quantity', 'Reason', 'Date']],
        body: tableData,
        styles: {fontSize: 9},
        headStyles: {fillColor: [37, 99, 235]},
        alternateRowStyles: {fillColor: [248, 250, 252]},
    });

    const filename = `stock-movements-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

// Low Stock Report
export async function generateLowStockPDF(data) {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Low Stock Report', 20, 25);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 35);

    // Table data
    const tableData = data.map(part => [
        part.partNumber,
        part.name,
        part.quantity?.toString() || '0',
        part.minimumStock?.toString() || '0',
        part.supplier?.name || 'N/A'
    ]);

    // Add table
    autoTable(doc, {
        startY: 50,
        head: [['Part Number', 'Part Name', 'Current Stock', 'Min Stock', 'Supplier']],
        body: tableData,
        styles: {fontSize: 9},
        headStyles: {fillColor: [220, 38, 38]},
        alternateRowStyles: {fillColor: [254, 242, 242]},
    });

    const filename = `low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}