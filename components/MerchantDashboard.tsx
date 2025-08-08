import { AuthDialog } from './AuthDialog';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DashboardHeader } from './DashboardHeader';
import { DashboardSidebar } from './DashboardSidebar';
import { ProductsManager } from './ProductsManager';
import { OrdersManager } from './OrdersManager';
import { StoreSettings } from './StoreSettings';
import { DashboardOverview } from './DashboardOverview';
import { Store, Product } from '../App';
import { StoreBuilderPanel } from './StoreBuilderPanel';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import demoStoreData from '../public/demoStoreData.json';

const storefrontTemplate = {
  settings: {
    primaryColor: '#030213',
    logoUrl: '',
    description: 'A beautiful online store',
    contactEmail: 'demo@example.com',
    currency: 'USD',
  },
};

export function MerchantDashboard() {
  console.log('[MerchantDashboard] Mounting');
  let auth;
  try {
    auth = useAuth();
    console.log('[MerchantDashboard] useAuth() result:', auth);
  } catch (error) {
    console.warn('[MerchantDashboard] Auth context not available:', error);
    // Provide fallback during hot reload or development issues
    auth = {
      user: null,
      loading: true,
      signUp: async () => ({ error: 'Auth not available' }),
      signIn: async () => ({ error: 'Auth not available' }),
      signOut: async () => {},
    };
  }

  const [currentView, setCurrentView] = useState('builder');
  const [store, setStore] = useState<Store | null>(null);
  const [products] = useState<Product[]>([]); // TODO: integrate with ProductsManager

  // Handle cases where auth might not be fully loaded yet
  const { user, loading, session } = auth || { user: null, loading: true, session: null };

  useEffect(() => {
    console.log('[MerchantDashboard] useEffect: user:', user, 'loading:', loading);
    if (!loading) {
      if (user) {
        console.log('[MerchantDashboard] User is logged in, loading store...');
        loadStore();
      } else {
        console.log('[MerchantDashboard] No user found, redirecting to landing page');
        window.location.href = '/';
      }
    }
  }, [user, loading]);

  const loadStore = async () => {
    try {
      console.log('Starting loadStore, user:', user);
      
      // Try multiple ways to get the auth session
      let token = null;
      
      // Method 1: Try getting from auth context (if available)
      if (session?.access_token) {
        token = session.access_token;
        console.log('Got token from auth context session');
      }
      
      // Method 2: Try localStorage with different possible keys
      if (!token) {
        const possibleKeys = [
          'supabase.auth.token',
          'sb-auth-token',
          'supabase-auth-token'
        ];
        
        for (const key of possibleKeys) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed?.access_token) {
                token = parsed.access_token;
                console.log(`Got token from localStorage key ${key}`);
                break;
              }
            }
          } catch (e) {
            // Continue to next key
          }
        }
      }
      
      // Method 3: Try to get fresh session from Supabase
      if (!token && typeof window !== 'undefined') {
        try {
          // Import supabase client here to avoid circular dependencies
          const { supabase } = await import('../utils/supabase/client');
          const { data: { session: freshSession } } = await supabase.auth.getSession();
          if (freshSession?.access_token) {
            token = freshSession.access_token;
            console.log('Got fresh token from Supabase');
          }
        } catch (e) {
          console.log('Could not get fresh session:', e);
        }
      }

      if (!token) {
        console.log('No token found, creating demo store');
        createDefaultStore();
        return;
      }

      console.log('Making API request with token');
      
      // Add a timeout to the API call
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/merchant/store`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Store data received:', data);
        setStore(data.store);
        toast.success('Store loaded successfully!');
      } else if (response.status === 404) {
        console.log('Store not found, creating default store');
        // Merchant doesn't have a store yet - create a default one for demo
        createDefaultStore();
      } else {
        const errorText = await response.text();
        console.log('API error:', errorText);
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Failed to load store:', error);
      // Create a default store for demo purposes
      createDefaultStore();
    }
  };

  const createStoreInSupabase = async (store: Store) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(store),
      });

      if (response.ok) {
        console.log('Store created in Supabase successfully');
      } else {
        const errorData = await response.json();
        console.warn('Failed to create store in Supabase:', errorData);
      }
    } catch (error) {
      console.error('Error creating store in Supabase:', error);
    }
  };

  const createDefaultStore = () => {
    // Check if we already have a stored demo store
    const existingStoreKey = `demo-store-${user?.id || 'demo-user'}`;
    const existingStore = localStorage.getItem(existingStoreKey);

    if (existingStore) {
      try {
        const parsedStore = JSON.parse(existingStore);
        setStore(parsedStore);
        console.log('Loaded existing demo store from localStorage');
        return;
      } catch (e) {
        console.log('Failed to parse existing store, creating new one');
      }
    }

    // Create a new demo store by copying the Storefront.tsx template
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'demo';
    const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits for uniqueness

    const defaultStore: Store = {
      id: `demo-store-${user?.id || 'demo-user'}`,
      name: user?.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Store` : 'My Store',
      subdomain: `${cleanName}${timestamp}`, // e.g., "johnsmith1234"
      ownerId: user?.id || 'demo-user',
      settings: {
        ...storefrontTemplate.settings, // Copy settings from Storefront.tsx template
        contactEmail: user?.email || 'demo@example.com',
      },
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage for persistence
    localStorage.setItem(existingStoreKey, JSON.stringify(defaultStore));
    
    // Also create the store in Supabase
    createStoreInSupabase(defaultStore);
    
    setStore(defaultStore);

    console.log('Created new demo store:', defaultStore);
    toast.success('Welcome to your new store dashboard!', {
      description: `Your store is available at: ${defaultStore.subdomain}.localhost:${window.location.port || '3005'}`,
      duration: 5000,
    });
  };

  const loadDemoStore = () => {
    const demoStore: Store = {
      id: 'demo-store',
      name: demoStoreData.storeName,
      subdomain: 'demo',
      ownerId: 'system',
      settings: {
        ...storefrontTemplate.settings,
        contactEmail: 'demo@storefront.com',
      },
      createdAt: new Date().toISOString(),
      published: true, // Ensure the demo store is always published
      products: demoStoreData.products, // Load products from JSON
      categories: demoStoreData.categories, // Load categories from JSON
    };

    return demoStore;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthDialog isOpen={true} onClose={() => {}} />
      </div>
    );
  }

  if (!store) {
    console.log('[MerchantDashboard] No store loaded for user:', user);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
          <div className="text-xs text-muted-foreground mt-2">(Waiting for store data... user: {JSON.stringify(user)})</div>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'builder':
        return (
          <StoreBuilderPanel
            store={store}
            products={products}
            onStoreUpdate={setStore}
            onPublish={(publishedStore) => {
              // Persist published state in localStorage for demo stores
              const key = `demo-store-${store.ownerId || 'demo-user'}`;
              localStorage.setItem(key, JSON.stringify({ ...publishedStore, published: true }));
              setStore({ ...publishedStore, published: true });
            }}
          />
        );
      case 'overview':
        return <DashboardOverview store={store} />;
      case 'products':
        return <ProductsManager store={store} />;
      case 'orders':
        return <OrdersManager store={store} />;
      case 'settings':
        return <StoreSettings store={store} onStoreUpdate={setStore} />;
      default:
        return <DashboardOverview store={store} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader store={store} user={user} className="sticky top-0 z-10" />
      <div className="flex">
        <DashboardSidebar 
          currentView={currentView} 
          onViewChange={setCurrentView}
        />
        <main className="flex-1 p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}