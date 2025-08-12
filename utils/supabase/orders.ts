import { supabase } from './client';
import { Database } from './types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderInsert = Database['public']['Tables']['orders']['Insert'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

export class OrderService {
  // Create a new order with items
  static async createOrder(
    orderData: Omit<OrderInsert, 'id'>,
    items: Omit<OrderItemInsert, 'order_id'>[]
  ): Promise<OrderWithItems> {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) throw itemsError;

    return {
      ...order,
      order_items: createdItems || []
    };
  }

  // Get orders by store ID
  static async getOrdersByStore(storeId: string): Promise<OrderWithItems[]> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get single order with items
  static async getOrder(orderId: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Update order status
  static async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get order statistics for store
  static async getOrderStats(storeId: string): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  }> {
    const { data, error } = await supabase
      .from('orders')
      .select('total_amount, status')
      .eq('store_id', storeId);

    if (error) throw error;

    const stats = data?.reduce(
      (acc, order) => {
        acc.totalOrders += 1;
        acc.totalRevenue += Number(order.total_amount);
        if (order.status === 'pending') {
          acc.pendingOrders += 1;
        }
        return acc;
      },
      { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 }
    ) || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0 };

    return stats;
  }
}