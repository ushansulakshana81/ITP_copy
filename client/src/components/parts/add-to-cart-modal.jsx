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
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../ui/alert.jsx";

export default function AddToCartModal({ 
  isOpen, 
  onClose, 
  part, 
  onAddToCart 
}) {
  const [quantity, setQuantity] = useState(1);
  const [requestedBy, setRequestedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!requestedBy.trim()) {
      setError("Please enter your name");
      return;
    }

    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (quantity > part.quantity) {
      setError(`Only ${part.quantity} units available in stock`);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onAddToCart({
        partId: part._id,
        quantity: parseInt(quantity),
        requestedBy: requestedBy.trim(),
        notes: notes.trim()
      });
      
      // Reset form
      setQuantity(1);
      setRequestedBy("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add item to cart");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setRequestedBy("");
    setNotes("");
    setError("");
    onClose();
  };

  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Add to Cart
          </DialogTitle>
          <DialogDescription>
            Add <strong>{part.name}</strong> to your cart request
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Part Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-slate-600">Part Number:</span>
                <p className="font-mono">{part.partNumber}</p>
              </div>
              <div>
                <span className="font-medium text-slate-600">Available Stock:</span>
                <p className="font-semibold text-green-600">{part.quantity} units</p>
              </div>
              <div>
                <span className="font-medium text-slate-600">Unit Price:</span>
                <p>${part.unitPrice?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <span className="font-medium text-slate-600">Category:</span>
                <p>{part.category?.name || 'Uncategorized'}</p>
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={part.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedBy">Requested By *</Label>
                <Input
                  id="requestedBy"
                  type="text"
                  placeholder="Your name"
                  value={requestedBy}
                  onChange={(e) => setRequestedBy(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
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
              disabled={isLoading || quantity < 1 || quantity > part.quantity}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
