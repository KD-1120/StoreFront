import { CartItem } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export class CartService {
  private getAuthToken(): string | null {
    // This will be set by the auth context
    const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
    return session?.access_token || null;
  }

  async saveCart(cartItems: CartItem[]): Promise<void> {
    const token = this.getAuthToken();
    if (!token) return; // Don't save if not authenticated

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/cart/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems }),
      });

      if (!response.ok) {
        console.error('Failed to save cart:', await response.text());
      }
    } catch (error) {
      console.error('Cart save error:', error);
    }
  }

  async loadCart(): Promise<CartItem[]> {
    const token = this.getAuthToken();
    if (!token) return [];

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/cart/load`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to load cart:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.cartItems || [];
    } catch (error) {
      console.error('Cart load error:', error);
      return [];
    }
  }

  async createOrder(cartItems: CartItem[], total: number, shippingAddress: any): Promise<any> {
    const token = this.getAuthToken();
    if (!token) throw new Error('Authentication required');

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ cartItems, total, shippingAddress }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  async getOrders(): Promise<any[]> {
    const token = this.getAuthToken();
    if (!token) return [];

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('Failed to fetch orders:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Orders fetch error:', error);
      return [];
    }
  }
}

export const cartService = new CartService();