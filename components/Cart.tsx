import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { CartItem } from '../App';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateItem: (productId: string, size: string, color: string, quantity: number) => void;
  total: number;
  onCheckout: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateItem, total, onCheckout }: CartProps) {
  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    onUpdateItem(item.product.id, item.size, item.color, newQuantity);
  };

  const handleRemoveItem = (item: CartItem) => {
    onUpdateItem(item.product.id, item.size, item.color, 0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Shopping Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">Add some items to get started</p>
            <Button onClick={onClose} style={{backgroundColor: "black"}}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.product.image}
                          fallbackSrc="/fallback-image.png"
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{item.product.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{item.size}</Badge>
                          <Badge variant="outline" className="text-xs">{item.color}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${item.product.price} each
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item)}
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive mt-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="text-sm min-w-[2rem] text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {index < items.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-semibold">${total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Button onClick={onCheckout} className="w-full" size="lg">
                  Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
                  Continue Shopping
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Free shipping on orders over $75
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}