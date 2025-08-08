import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { CartItem } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { paymentProcessor, formatCurrency, calculateTax, calculateShipping } from '../utils/payment';
import { supabase } from '../utils/supabase/client';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onOrderComplete: (orderData?: any) => void;
  isStorefront?: boolean;
  storeId?: string;
}

export function Checkout({ isOpen, onClose, items, total, onOrderComplete, isStorefront = false, storeId }: CheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.user_metadata?.name || '',
    email: user?.email || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    notes: '',
  });

  // Calculate order totals
  const subtotal = total;
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const finalTotal = subtotal + tax + shipping;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.street || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      // Create order in database first
      const orderData = {
        store_id: storeId,
        customer_email: shippingAddress.email,
        customer_name: shippingAddress.fullName,
        total_amount: finalTotal,
        status: 'pending',
        shipping_address: shippingAddress,
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payment
      setProcessingPayment(true);
      
      paymentProcessor.showPaymentModal(
        {
          amount: finalTotal,
          currency: 'USD',
          description: `Order #${order.id.slice(-8)}`,
          customerEmail: shippingAddress.email,
          customerName: shippingAddress.fullName,
          storeId: storeId || '',
          orderId: order.id,
        },
        async (paymentResult) => {
          // Payment successful - update order status
          await supabase
            .from('orders')
            .update({ 
              status: 'paid',
              payment_id: paymentResult.paymentId 
            })
            .eq('id', order.id);

          setProcessingPayment(false);
          setSuccess(true);
          onOrderComplete({ ...order, items: orderItems });
          
          setTimeout(() => {
            onClose();
            setSuccess(false);
          }, 3000);
        },
        async (paymentError) => {
          // Payment failed - update order status
          await supabase
            .from('orders')
            .update({ status: 'failed' })
            .eq('id', order.id);

          setProcessingPayment(false);
          setError(paymentError);
          setLoading(false);
        }
      );

    } catch (error: any) {
      console.error('Order creation error:', error);
      setError(error.message || 'Failed to create order');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !processingPayment) {
      onClose();
      setError('');
      setSuccess(false);
    }
  };

  if (processingPayment) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <h3 className="text-xl mb-2">Processing Payment</h3>
            <p className="text-muted-foreground mb-4">
              Please wait while we process your payment...
            </p>
            <p className="text-sm text-muted-foreground">
              Do not close this window
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl mb-2">Order Placed Successfully!</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              This dialog will close automatically...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-500">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Order Summary */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</span>
                </div>
              </div>
              <div className="border-t pt-2 font-medium">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-medium">Shipping Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address *</Label>
              <Input
                id="street"
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Delivery Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special delivery instructions..."
                value={shippingAddress.notes}
                onChange={(e) => setShippingAddress(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Place Order ({formatCurrency(finalTotal)})
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}