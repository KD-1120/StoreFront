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
import { toast } from 'sonner';

export function MerchantDashboard() {
  const { user, loading } = useAuth();

  const [currentView, setCurrentView] = useState('builder');
  const [store, setStore] = useState<Store | null>(null);
  const [products] = useState<Product[]>([]); // TODO: integrate with ProductsManager

  useEffect(() => {
    if (!loading) {
      if (user) {
        loadStore();
      }
    }
  }, [user, loading]);

  const loadStore = async () => {
    try {
      // Try to load store from Supabase first
      const { StoreService } = await import('../utils/supabase/stores');
      const userStores = await StoreService.getUserStores();
      
      if (userStores.length > 0) {
        // Convert Supabase store to app Store format
        const dbStore = userStores[0];
        const appStore: Store = {
          id: dbStore.id,
          name: dbStore.name,
          subdomain: dbStore.slug,
          ownerId: dbStore.user_id,
          settings: {
            primaryColor: dbStore.theme_color || '#030213',
            logoUrl: dbStore.logo_url || '',
            description: dbStore.description || '',
            contactEmail: user?.email || '',
            currency: 'USD',
            heroButtonText: 'Shop Now',
            heroSubtext1: 'Free Delivery',
            heroSubtext2: '30-Day Returns',
            heroImage: '',
            heroBadge1: 'New',
            heroBadge2: '50% Off',
            collections: [],
          },
          createdAt: dbStore.created_at,
          published: dbStore.is_active,
        };
        setStore(appStore);
      } else {
        createDefaultStore();
      }
    } catch (error) {
      console.error('Failed to load store:', error);
      createDefaultStore();
    }
  };

  const createDefaultStore = async () => {
    try {
      if (!user) {
        console.error('Cannot create store: no user');
        return;
      }

      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'demo';
      const cleanName = userName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const timestamp = Date.now().toString().slice(-4);
      const slug = `${cleanName}${timestamp}`;

      // Create store in Supabase
      const { StoreService } = await import('../utils/supabase/stores');
      const dbStore = await StoreService.createStore({
        name: user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Store` : 'My Store',
        slug: slug,
        description: 'Welcome to my online store',
        theme_color: '#030213',
      });

      // Convert to app Store format
      const appStore: Store = {
        id: dbStore.id,
        name: dbStore.name,
        subdomain: dbStore.slug,
        ownerId: dbStore.user_id,
        settings: {
          primaryColor: dbStore.theme_color || '#030213',
          logoUrl: dbStore.logo_url || '',
          description: dbStore.description || '',
          contactEmail: user.email || '',
          currency: 'USD',
          heroButtonText: 'Shop Now',
          heroSubtext1: 'Free Shipping',
          heroSubtext2: '30-Day Returns',
          heroImage: '',
          heroBadge1: 'New',
          heroBadge2: '50% Off',
          collections: [],
        },
        createdAt: dbStore.created_at,
        published: dbStore.is_active,
      };

      setStore(appStore);
      toast.success('Welcome to your new store dashboard!');
    } catch (error) {
      console.error('Failed to create store:', error);
      toast.error('Failed to create store. Please try again.');
    }
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading store...</p>
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