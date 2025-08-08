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
import { StoreService, dbStoreToAppStore } from '../utils/supabase/stores';
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
      // Try to load user's stores from Supabase
      const userStores = await StoreService.getUserStores();
      
      if (userStores.length > 0) {
        // User has existing stores, use the first one
        const appStore = dbStoreToAppStore(userStores[0]);
        setStore(appStore);
      } else {
        // User has no stores, create a default store
        const defaultStore: Store = {
          id: `temp-${user.id}`,
          name: user.user_metadata?.full_name ? `${user.user_metadata.full_name}'s Store` : 'My Store',
          subdomain: 'temp-store',
          ownerId: user.id,
          settings: {
            primaryColor: '#030213',
            logoUrl: '',
            description: 'Welcome to my online store',
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
          createdAt: new Date().toISOString(),
          published: false,
        };
        setStore(defaultStore);
      }
    } catch (error) {
      console.error('Error loading store:', error);
      // Create fallback store on error
      const fallbackStore: Store = {
        id: `fallback-${user.id}`,
        name: 'My Store',
        subdomain: 'fallback-store',
        ownerId: user.id,
        settings: {
          primaryColor: '#030213',
          logoUrl: '',
          description: 'Welcome to my online store',
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
        createdAt: new Date().toISOString(),
        published: false,
      };
      setStore(fallbackStore);
      toast.error('Failed to load store data, using default store');
    }
  };

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
            onPublish={setStore}
          />
        );
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