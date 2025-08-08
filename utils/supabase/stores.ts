import { supabase } from './client';
import { Database } from './types';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreUpdate = Database['public']['Tables']['stores']['Update'];

export class StoreService {
  // Create a new store
  static async createStore(storeData: Omit<StoreInsert, 'user_id'>): Promise<Store> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('stores')
      .insert({
        ...storeData,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Get store by slug
  static async getStoreBySlug(slug: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get user's stores
  static async getUserStores(): Promise<Store[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Update store
  static async updateStore(storeId: string, updates: StoreUpdate): Promise<Store> {
    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Delete store
  static async deleteStore(storeId: string): Promise<void> {
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (error) throw error;
  }

  // Check if slug is available
  static async isSlugAvailable(slug: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (error && error.code === 'PGRST116') return true; // No rows found
    if (error) throw error;
    return false; // Slug exists
  }
}