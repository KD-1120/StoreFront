import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Cart } from './Cart';
import { Footer } from './Footer';
import { Checkout } from './Checkout';
import { StorefrontProductGrid } from './StorefrontProductGrid';
import { toast } from 'sonner';
import { Product, CartItem, Store } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StorefrontProps {
  store: Store;
  products?: Product[];
  isEditable?: boolean;
  onImageUpload?: (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTextChange?: (field: string, value: string) => void;
  uploadingImages?: Set<string>;
}

export function Storefront({ store, products: productsProp, isEditable = false, onImageUpload, onTextChange }: StorefrontProps) {
  // Defensive: If store or store.settings is missing, show fallback UI
  if (!store || !store.settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Store not found</div>
          <div className="text-muted-foreground">This store is unavailable or not configured properly.</div>
        </div>
      </div>
    );
  }

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(productsProp || []);
  const [loading, setLoading] = useState(productsProp ? false : true);

  const sessionId = React.useMemo(() => {
    let id = localStorage.getItem(`session_${store.id}`);
    if (!id) {
      id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(`session_${store.id}`, id);
    }
    return id;
  }, [store.id]);

  useEffect(() => {
    if (productsProp) {
      setProducts(productsProp);
      setLoading(false);
    } else {
      loadProducts();
    }
    loadCart();
    // eslint-disable-next-line
  }, [store.id, productsProp]);

  useEffect(() => {
    if (cartItems.length >= 0) {
      saveCart();
    }
  }, [cartItems]);

  const loadProducts = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}/products`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let products = data.products;
        if (!Array.isArray(products)) products = [];
        setProducts(products);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}/cart/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let cartItems = data.cartItems;
        if (!Array.isArray(cartItems)) cartItems = [];
        setCartItems(cartItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
      setCartItems([]);
    }
  };

  const saveCart = async () => {
    try {
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}/cart/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ cartItems, sessionId }),
      });
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  const addToCart = (product: Product, customFields: Record<string, string | number | boolean>) => {
    const size = customFields.size as string || '';
    const color = customFields.color as string || '';
    const quantity = Number(customFields.quantity) || 1;
    
    setCartItems(prev => {
      const existingItem = prev.find(
        item => item.product.id === product.id && item.size === size && item.color === color
      );
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { product, size, color, quantity }];
    });

    toast.success(`${product.name} added to cart!`);
  };

  const updateCartItem = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(prev => prev.filter(
        item => !(item.product.id === productId && item.size === size && item.color === color)
      ));
    } else {
      setCartItems(prev => prev.map(item =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = async (orderData: any) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        setCartItems([]);
        toast.success('Order placed successfully!');
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Apply store branding
  useEffect(() => {
    if (store.settings && store.settings.primaryColor) {
      document.documentElement.style.setProperty('--primary', store.settings.primaryColor);
    }
  }, [store.settings?.primaryColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemCount={cartItemCount}
        onCartClick={() => setIsCartOpen(true)}
        onAuthClick={() => {}} // No auth for customers
        user={null}
        storeName={store.name}
        onStoreNameChange={onTextChange ? (name) => onTextChange('name', name) : undefined}
        isStorefront={true}
        isEditable={isEditable}
      />
      <main>
        <Hero
          storeName={store.name}
          storeDescription={store.settings.description}
          heroButtonText={store.settings.heroButtonText}
          heroSubtext1={store.settings.heroSubtext1}
          heroSubtext2={store.settings.heroSubtext2}
          heroImage={store.settings.heroImage}
          heroBadge1={store.settings.heroBadge1}
          heroBadge2={store.settings.heroBadge2}
          isEditable={isEditable}
          onImageUpload={onImageUpload ? onImageUpload('heroImage') : undefined}
          onTextChange={onTextChange}
          uploadingImages={uploadingImages}
        />
        <StorefrontProductGrid products={products} onAddToCart={addToCart} />
      </main>
      <Footer 
        storeName={store.name}
      />
      
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateItem={updateCartItem}
        total={cartTotal}
        onCheckout={handleCheckout}
      />

      <Checkout
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        total={cartTotal}
        onOrderComplete={handleOrderComplete}
        isStorefront={true}
        storeId={store.id}
      />
    </div>
  );
}