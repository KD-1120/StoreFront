import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MerchantDashboard } from './components/MerchantDashboard';
import { Storefront } from './components/Storefront';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSubdomain, getAppMode, sanitizeSubdomain } from './utils/routing';
import { StoreService } from './utils/supabase/stores';
import { Toaster } from 'sonner';
import { Database } from './utils/supabase/types';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  storeId: string;
  customFields?: Record<string, string | number | boolean>;
}

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  settings: {
    primaryColor: string;
    logoUrl: string;
    description: string;
    contactEmail: string;
    currency: string;
    heroButtonText?: string;
    heroSubtext1?: string;
    heroSubtext2?: string;
    heroImage?: string;
    heroBadge1?: string;
    heroBadge2?: string;
    collections?: { id: string; name: string }[];
  };
  createdAt: string;
  published?: boolean;
  products?: {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
  }[];
  categories?: string[];
}

type DbStore = Database['public']['Tables']['stores']['Row'];

export default function App() {
  const [appMode, setAppMode] = useState<'landing' | 'dashboard' | 'storefront' | 'loading'>('loading');
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const mode = getAppMode();
    console.log('App mode detected:', mode);
    console.log('Current URL:', window.location.href);
    console.log('Hostname:', window.location.hostname);
    console.log('Subdomain:', getSubdomain());
    if (mode === 'storefront') {
      loadStoreFromSubdomain();
    } else {
      setAppMode(mode);
      console.log('Set appMode to:', mode);
    }
  }, []);

  const loadStoreFromSubdomain = async () => {
    try {
      const rawSubdomain = getSubdomain();
      console.log('Raw subdomain:', rawSubdomain);
      
      if (!rawSubdomain) {
        console.log('No subdomain found, switching to landing page');
        setAppMode('landing');
        return;
      }

      // Sanitize the subdomain
      const subdomain = sanitizeSubdomain(rawSubdomain);
      console.log('Sanitized subdomain:', subdomain);
      
      if (!subdomain) {
        console.error('Invalid subdomain format:', rawSubdomain);
        console.log('Invalid subdomain, showing landing page');
        setAppMode('landing');
        return;
      }

      // Handle demo store

      if (subdomain === 'demo') {
        console.log('Loading demo store');
        const demoStore: Store = {
          id: 'demo-store',
          name: 'Demo Store',
          subdomain: 'demo',
          ownerId: 'demo-user',
          settings: {
            primaryColor: '#030213',
            logoUrl: '',
            description: 'A beautiful demo store showcasing our platform',
            contactEmail: 'demo@storefront.com',
            currency: 'USD',
            heroButtonText: 'Shop Now',
            heroSubtext1: 'Free Shipping',
            heroSubtext2: '30-Day Returns',
            heroImage: '',
            heroBadge1: 'New',
            heroBadge2: '50% Off',
            collections: [{ id: '1', name: 'Featured' }],
          },
          createdAt: new Date().toISOString(),
          published: true,
          products: [
            {
              id: 1,
              name: 'Demo Product',
              description: 'This is a demo product.',
              price: 29.99,
              image: '',
              category: 'Featured',
            },
          ],
          categories: ['Featured'],
        };
        setStore(demoStore);
        setAppMode('storefront');
        return;
      }

      console.log('Fetching store from database for slug:', subdomain);
      
      // Fetch store from Supabase
      const storeData = await StoreService.getStoreBySlug(subdomain);
      
      if (storeData) {
        console.log('Store found:', storeData);
        setStore(storeData);
        setAppMode('storefront');
      } else {
        console.log('Store not found for subdomain:', subdomain);
        console.log('No store found, showing landing page');
        setAppMode('landing');
      }
    } catch (error) {
      console.error('Failed to load store:', error);
      console.log('Error loading store, showing landing page');
      setAppMode('landing');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-destructive mb-4">Store Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          {appMode === 'loading' && (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading...</p>
              </div>
            </div>
          )}
          {appMode === 'dashboard' && (
            <>
              {console.log('Rendering MerchantDashboard (appMode === "dashboard")')}
              <MerchantDashboard />
            </>
          )}
          {/* Fallback UI for dashboard mode if MerchantDashboard fails to render */}
          {appMode === 'dashboard' && typeof MerchantDashboard !== 'function' && (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <div className="text-2xl font-semibold mb-2">Dashboard failed to load</div>
                <div className="text-muted-foreground">Please check authentication and component export.</div>
              </div>
            </div>
          )}
          {appMode === 'storefront' && store && (
            <Storefront store={store} />
          )}
          {appMode === 'landing' && <LandingPage />}
        </div>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  );
}