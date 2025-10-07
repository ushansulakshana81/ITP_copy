import { useState } from "react";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Textarea } from "../ui/textarea.jsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.jsx";
import { CreditCard, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert.jsx";
import { generateInvoice } from "../../lib/invoice-generator.js";
import { Badge } from "../ui/badge.jsx";

export default function CheckoutModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onCheckout 
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      setError("Please enter customer name");
      return;
    }

    if (!customerEmail.trim()) {
      setError("Please enter customer email");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const orderData = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        items: cartItems.map(item => ({
          partId: item.part._id,
          partName: item.part.name,
          partNumber: item.part.partNumber,
          quantity: item.quantity,
          unitPrice: item.part.unitPrice,
          totalPrice: item.part.unitPrice * item.quantity
        })),
        totalAmount: cartItems.reduce((sum, item) => 
          sum + (item.part.unitPrice * item.quantity), 0
        )
      };

      const order = await onCheckout(orderData);
      
      // Generate and download invoice
      if (order) {
        try {
          console.log('Generating invoice for order:', order);
          console.log('Order items:', order.items);
          console.log('Order totalAmount:', order.totalAmount);
          const fileName = generateInvoice(order);
          console.log('Invoice generated successfully:', fileName);
        } catch (error) {
          console.error('Failed to generate invoice:', error);
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
      } else {
        console.error('No order data received for invoice generation');
      }
      
      // Reset form
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setShippingAddress("");
      setNotes("");
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setShippingAddress("");
    setNotes("");
    setError("");
    onClose();
  };

  const totalAmount = cartItems.reduce((sum, item) => 
    sum + (item.part.unitPrice * item.quantity), 0
  );

  if (!cartItems || cartItems.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" />
            Checkout Order
          </DialogTitle>
          <DialogDescription>
            Complete your order and generate invoice
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Order Summary
            </h3>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <div className="flex-1">
                    <p className="font-medium">{item.part.name}</p>
                    <p className="text-gray-600">{item.part.partNumber} × {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.part.unitPrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total Amount:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  type="text"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingAddress">Shipping Address</Label>
              <Textarea
                id="shippingAddress"
                placeholder="Enter shipping address..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Order Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !customerName.trim() || !customerEmail.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Place Order & Generate Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
