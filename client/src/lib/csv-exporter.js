// General CSV export function for parts
export function exportToCSV(data, filename) {
    const headers = [
        'Part Number',
        'Name',
        'Description',
        'Category',
        'Quantity',
        'Minimum Stock',
        'Unit Price',
        'Total Value',
        'Stock Status',
        'Supplier',
        'Location',
        'Created At',
        'Updated At'
    ];

    const rows = data.map(part => [
        part.partNumber || '',
        part.name || '',
        part.description || '',
        part.category?.name || '',
        part.quantity.toString() || '0',
        part.minimumStock.toString() || '0',
        part.unitPrice || '0',
        (part.quantity * parseFloat(part.unitPrice)).toFixed(2),
        part.stockStatus === 'in-stock' ? 'In Stock' :
            part.stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock',
        part.supplier?.name || '',
        part.location || '',
        part.createdAt ? new Date(part.createdAt).toISOString() : '',
        part.updatedAt ? new Date(part.updatedAt).toISOString() : ''
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${Stirng(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

        if (typeof Blob === 'undefined') {
            console.error('Browser does not support Blob');
            alert('Your browser does not support file downloads');
            return false;
        }

        if (typeof URL.createObjectURL === 'undefined') {
            console.error('Browser does not support URL.createObjectURL');
            alert('Your browser does not support file downloads');  
            return false;
        }

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Supplier Analysis CSV Export
export function exportSupplierAnalysisCSV(data, filename = 'supplier-analysis') {
    const headers = ['Supplier Name', 'Total Stock', 'Total Value'];

    const rows = data.map(supplier => [
        supplier.name || '',
        supplier.totalStock?.toString() || '0',
        (supplier.totalValue || 0).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Stock Movements CSV Export
export function exportStockMovementsCSV(movements, filename = 'stock-movements') {
    const headers = ['Part Number', 'Part Name', 'Movement Type', 'Quantity', 'Reason', 'Date'];

    const rows = movements.map(movement => [
        movement.part?.partNumber || 'N/A',
        movement.part?.name || 'N/A',
        movement.type === 'in' ? 'Stock In' : 'Stock Out',
        movement.quantity?.toString() || '0',
        movement.reason || 'N/A',
        movement.createdAt ? new Date(movement.createdAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Low Stock CSV Export
export function exportLowStockCSV(data, filename = 'low-stock-report') {
    const headers = ['Part Number', 'Part Name', 'Current Stock', 'Min Stock', 'Supplier'];

    const rows = data.map(part => [
        part.partNumber,
        part.name,
        part.quantity?.toString() || '0',
        part.minimumStock?.toString() || '0',
        part.supplier?.name || 'N/A'
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}