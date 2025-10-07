import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Header from "../components/layout/header.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { 
  ShoppingCart, 
  Clock, 
  Trash2,
  AlertCircle,
  CreditCard,
  FileText,
  Edit
} from "lucide-react";
import { useToast } from "../hooks/use-toast.js";
import CheckoutModal from "../components/orders/checkout-modal.jsx";
import EditCartItemModal from "../components/orders/edit-cart-item-modal.jsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog.jsx";

export default function Cart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch cart items
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ["/api/cart"],
  });



  // Update cart item mutation
  const updateMutation = useMutation({
    mutationFn: async (updatedItem) => {
      // Prepare the data for the API - only send the fields that can be updated
      const updateData = {
        quantity: updatedItem.quantity,
        requestedBy: updatedItem.requestedBy,
        notes: updatedItem.notes,
        status: updatedItem.status
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await fetch(`/api/cart/${updatedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        throw new Error(errorData.message || 'Failed to update item');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
      queryClient.invalidateQueries({queryKey: ["/api/cart"]});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete cart item mutation
  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: async (order) => {
      // Mark all pending cart items as fulfilled
      try {
        const pendingItems = cartItems?.filter(item => item.status === 'pending') || [];
        const updatePromises = pendingItems.map(item => 
          fetch(`/api/cart/${item._id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'fulfilled' }),
          })
        );
        
        await Promise.all(updatePromises);
        console.log('All cart items marked as fulfilled');
      } catch (error) {
        console.error('Failed to update cart item status:', error);
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.orderNumber} has been created and cart cleared`,
      });
      
      // Refresh cart and parts data
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.invalidateQueries({ queryKey: ["/api/parts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      setShowCheckout(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'fulfilled':
        return <Badge variant="default" className="bg-green-100 text-green-800"><Clock className="w-3 h-3 mr-1" />Fulfilled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };



  const handleDelete = (item) => {
    deleteMutation.mutate(item._id);
  };

  const handleCheckout = () => {
    setShowCheckout(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingItem(null);
    setShowEditModal(false);
  };

  const handleCheckoutSubmit = async (orderData) => {
    try {
      const order = await checkoutMutation.mutateAsync(orderData);
      return order;
    } catch (error) {
      throw error;
    }
  };


  // Calculate totals
  const pendingItems = cartItems?.filter(item => item.status === 'pending') || [];
  const otherItems = cartItems?.filter(item => item.status !== 'pending') || [];
  
  const totalValue = pendingItems.reduce((sum, item) => {
    return sum + ((item.part?.unitPrice || 0) * item.quantity);
  }, 0);

  const totalItems = pendingItems.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <>
        <Header
          title="Cart Management"
          description="Manage cart requests and approvals"
        />
        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Cart Management"
        description="Manage cart requests and approvals"
      />

      <div className="p-6 space-y-6">
        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  Pending Requests ({pendingItems.length})
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Items: {totalItems}</p>
                    <p className="text-lg font-semibold">Total Value: ${totalValue.toFixed(2)}</p>
                  </div>
        <Button
          onClick={handleCheckout}
          className="bg-green-600 hover:bg-green-700"
          disabled={checkoutMutation.isPending}
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Checkout
        </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingItems.map((item) => (
                  <div key={item._id} className="border rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.part?.name}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Part Number:</span>
                            <p className="font-mono">{item.part?.partNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span>
                            <p>{item.quantity} units</p>
                          </div>
                          <div>
                            <span className="font-medium">Requested By:</span>
                            <p>{item.requestedBy}</p>
                          </div>
                          <div>
                            <span className="font-medium">Total Value:</span>
                            <p>${((item.part?.unitPrice || 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-gray-600">{item.notes}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          variant="outline"
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Cart Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this cart item? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Items */}
        {otherItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                Fulfilled Items ({otherItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {otherItems.map((item) => (
                  <div key={item._id} className={`border rounded-lg p-4 ${
                    item.status === 'fulfilled' ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{item.part?.name}</h3>
                          {getStatusBadge(item.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Part Number:</span>
                            <p className="font-mono">{item.part?.partNumber}</p>
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span>
                            <p>{item.quantity} units</p>
                          </div>
                          <div>
                            <span className="font-medium">Requested By:</span>
                            <p>{item.requestedBy}</p>
                          </div>
                          <div>
                            <span className="font-medium">Total Value:</span>
                            <p>${((item.part?.unitPrice || 0) * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                        {item.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-sm">Notes:</span>
                            <p className="text-sm text-gray-600">{item.notes}</p>
                          </div>
                        )}
                        {item.status === 'rejected' && item.notes && (
                          <div className="mt-2">
                            <span className="font-medium text-sm text-red-600">Rejection Reason:</span>
                            <p className="text-sm text-red-600">{item.notes}</p>
                          </div>
                        )}
                      </div>
                      {item.status !== 'fulfilled' && (
                        <div className="flex flex-col gap-2 ml-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Cart Item</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this cart item? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {cartItems?.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Cart Items</h3>
              <p className="text-gray-600">Cart requests will appear here when users add items to their cart.</p>
            </CardContent>
          </Card>
        )}

        {/* Edit Cart Item Modal */}
        {showEditModal && editingItem && (
          <EditCartItemModal
            isOpen={showEditModal}
            onClose={handleCloseEditModal}
            item={editingItem}
            onUpdate={(updatedItem) => {
              // Update the cart item
              updateMutation.mutate(updatedItem);
              handleCloseEditModal();
            }}
          />
        )}

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={pendingItems}
          onCheckout={handleCheckoutSubmit}
        />
      </div>
    </>
  );
}
