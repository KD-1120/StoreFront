import { supabase } from './client';
import { Database } from './types';
import { Store as AppStore } from '../../App';
import { Store as AppStore } from '../../App';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreInsert = Database['public']['Tables']['stores']['Insert'];
type StoreUpdate = Database['public']['Tables']['stores']['Update'];

// Convert database store to app store format
export function dbStoreToAppStore(dbStore: Store): AppStore {
  const settings = (dbStore.settings as any) || {};
  return {
    id: dbStore.id,
    name: dbStore.name,
    subdomain: dbStore.slug,
    ownerId: dbStore.user_id,
    settings: {
      primaryColor: dbStore.theme_color || '#030213',
      logoUrl: dbStore.logo_url || '',
      description: dbStore.description || '',
      contactEmail: settings.contactEmail || '',
      currency: settings.currency || 'USD',
      heroButtonText: settings.heroButtonText || 'Shop Now',
      heroSubtext1: settings.heroSubtext1 || 'Free Shipping',
      heroSubtext2: settings.heroSubtext2 || '30-Day Returns',
      heroImage: settings.heroImage || '',
      heroBadge1: settings.heroBadge1 || 'New',
      heroBadge2: settings.heroBadge2 || '50% Off',
      collections: settings.collections || [],
    },
    createdAt: dbStore.created_at,
    published: dbStore.is_published,
  };
}

// Convert app store to database format
export function appStoreToDbStore(appStore: AppStore): Partial<StoreUpdate> {
  return {
    name: appStore.name,
    description: appStore.settings.description,
    logo_url: appStore.settings.logoUrl,
    theme_color: appStore.settings.primaryColor,
    is_published: appStore.published,
    settings: {
      contactEmail: appStore.settings.contactEmail,
      currency: appStore.settings.currency,
      heroButtonText: appStore.settings.heroButtonText,
      heroSubtext1: appStore.settings.heroSubtext1,
      heroSubtext2: appStore.settings.heroSubtext2,
      heroImage: appStore.settings.heroImage,
      heroBadge1: appStore.settings.heroBadge1,
      heroBadge2: appStore.settings.heroBadge2,
      collections: appStore.settings.collections,
    }
  };
}

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
      .eq('is_published', true)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get store by slug (including unpublished for owners)
  static async getStoreBySlugForOwner(slug: string, userId: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Get store by slug (including unpublished for owners)
  static async getStoreBySlugForOwner(slug: string, userId: string): Promise<Store | null> {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
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

  // Save draft (update without publishing)
  static async saveDraft(storeId: string, appStore: AppStore): Promise<Store> {
    const updates = appStoreToDbStore(appStore);
    updates.is_published = false; // Ensure it's saved as draft
    
    return this.updateStore(storeId, updates);
  }

  // Publish store
  static async publishStore(storeId: string, appStore: AppStore): Promise<Store> {
    const updates = appStoreToDbStore(appStore);
    updates.is_published = true; // Mark as published
    
    return this.updateStore(storeId, updates);
  }

  // Save draft (update without publishing)
  static async saveDraft(storeId: string, appStore: AppStore): Promise<Store> {
    const updates = appStoreToDbStore(appStore);
    updates.is_published = false; // Ensure it's saved as draft
    
    return this.updateStore(storeId, updates);
  }

  // Publish store
  static async publishStore(storeId: string, appStore: AppStore): Promise<Store> {
    const updates = appStoreToDbStore(appStore);
    updates.is_published = true; // Mark as published
    
    return this.updateStore(storeId, updates);
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