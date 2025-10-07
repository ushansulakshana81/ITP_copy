import { useQuery } from "@tanstack/react-query";
import Header from "../components/layout/header.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { 
  Package, 
  Clock, 
  CheckCircle,
  XCircle,
  Truck,
  FileText,
  Download,
  Eye
} from "lucide-react";
import { generateInvoice } from "../lib/invoice-generator.js";

export default function Orders() {
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const getStatusBadge = (status) => {
    // Always show as Success for orders
    return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
  };

  const handleDownloadInvoice = (order) => {
    try {
      generateInvoice(order);
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">View and manage all orders</p>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-1/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-8 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">View and manage all orders</p>
        </div>

        {/* Orders List */}
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {order.orderNumber}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {order.customerName} • {order.customerEmail}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.status)}
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Order Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Order Information</h4>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
                          <p><span className="font-medium">Invoice Number:</span> {order.invoiceNumber || 'N/A'}</p>
                          {order.customerPhone && (
                            <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">
                          {order.shippingAddress || 'No shipping address provided'}
                        </p>
                        {order.notes && (
                          <div className="mt-2">
                            <p className="font-medium text-sm text-gray-900">Notes:</p>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Order Items</h4>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.partName}</span>
                                <span className="text-gray-600 ml-2">({item.partNumber})</span>
                              </div>
                              <div className="text-right">
                                <span className="text-gray-600">{item.quantity}x</span>
                                <span className="ml-2 font-medium">${item.totalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between items-center font-medium">
                          <span>Total:</span>
                          <span>${order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadInvoice(order)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Invoice
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-gray-50 hover:bg-gray-100 text-gray-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders</h3>
              <p className="text-gray-600">Orders will appear here when customers place orders.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
