import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { MerchantDashboard } from './components/MerchantDashboard';
import { Storefront } from './components/Storefront';
import { LandingPage } from './components/LandingPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSubdomain, getAppMode } from './utils/routing';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from 'sonner';
import demoStoreData from '../public/demoStoreData.json';

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

export default function App() {
  const [appMode, setAppMode] = useState<'landing' | 'dashboard' | 'storefront' | 'loading'>('loading');
  const [store, setStore] = useState<Store | null>(null);
  const [demoProducts, setDemoProducts] = useState<Product[] | undefined>(undefined);

  useEffect(() => {
    const mode = getAppMode();
    console.log('App mode detected:', mode);
    console.log('Current URL:', window.location.href);
    console.log('Subdomain:', getSubdomain());
    
    if (mode === 'storefront') {
      // Load store data for subdomain
      loadStoreFromSubdomain();
    } else {
      setAppMode(mode);
    }
  }, []);

  useEffect(() => {
    if (store?.id === 'demo-store') {
      fetch('/demoStoreData.json')
        .then((response) => response.json())
        .then((data) => setDemoProducts(data.products))
        .catch((error) => console.error('Failed to load demo store data:', error));
    }
  }, [store?.id]);

  const loadStoreFromSubdomain = async () => {
    try {
      const subdomain = getSubdomain();
      console.log('Loading store for subdomain:', subdomain);
      
      if (!subdomain) {
        console.log('No subdomain found, switching to landing page');
        setAppMode('landing');
        return;
      }

      if (subdomain === 'demo') {
        console.log('Loading demo store directly');
        const demoStore = {
          id: 'demo-store',
          name: 'Demo Store',
          subdomain: 'demo',
          ownerId: 'system',
          settings: {
            primaryColor: '#030213',
            logoUrl: '',
            description: 'A beautiful online store',
            contactEmail: 'demo@storefront.com',
            currency: 'USD',
            heroButtonText: 'Shop Now',
            heroSubtext1: 'Free Shipping',
            heroSubtext2: '30-Day Returns',
            heroImage: '',
            heroBadge1: 'New',
            heroBadge2: '50% Off',
          },
          createdAt: new Date().toISOString(),
          published: true,
        };
        setStore(demoStore);
        setAppMode('storefront');
        return;
      }

      // First, try to find the store in localStorage (for demo stores)
      console.log('All localStorage keys:', Object.keys(localStorage));
      const localStorageKeys = Object.keys(localStorage);
      const demoStoreKeys = localStorageKeys.filter(key => key.startsWith('demo-store-'));
      
      console.log('Looking for demo stores in localStorage:', demoStoreKeys);
      
      for (const demoStoreKey of demoStoreKeys) {
        try {
          const storedStore = localStorage.getItem(demoStoreKey);
          if (storedStore) {
            const parsedStore = JSON.parse(storedStore);
            console.log('Checking demo store:', parsedStore.subdomain, 'against target:', subdomain);
            if (parsedStore.subdomain === subdomain) {
              console.log('Found matching demo store in localStorage:', parsedStore);
              setStore(parsedStore);
              setAppMode('storefront');
              return;
            }
          }
        } catch (e) {
          console.log('Failed to parse demo store from localStorage:', e);
        }
      }
      
      console.log('No matching demo store found in localStorage for subdomain:', subdomain);

      // If not found in localStorage, try the API
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/subdomain/${subdomain}`;
      console.log('Fetching store from API:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Store data received from API:', data);
        setStore(data.store);
        setAppMode('storefront');
      } else {
        const errorText = await response.text();
        console.error('Store not found for subdomain:', subdomain, 'Error:', errorText);
        setAppMode('landing');
      }
    } catch (error) {
      console.error('Failed to load store:', error);
      setAppMode('landing');
    }
  };

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
          {appMode === 'dashboard' && <MerchantDashboard />}
          {appMode === 'storefront' && store && (store.id === 'demo-store' || store.published) && (
            <Storefront 
              store={store} 
              products={store.id === 'demo-store' ? demoProducts : undefined} 
            />
          )}
          {appMode === 'storefront' && store && !store.published && (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl mb-4">Store Not Published</h1>
                <p className="text-muted-foreground">This store is not yet published. Please check back later.</p>
              </div>
            </div>
          )}
          {appMode === 'landing' && <LandingPage />}
        </div>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  );
}