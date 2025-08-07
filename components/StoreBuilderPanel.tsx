import React, { useState } from 'react';
import { Storefront } from './Storefront';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Store, Product } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface StoreBuilderPanelProps {
  store: Store;
  products: Product[];
  onPublish: (store: Store) => void;
  onStoreUpdate: (store: Store) => void; // Added prop for updating the store
}

export function StoreBuilderPanel({ store, products, onPublish, onStoreUpdate }: StoreBuilderPanelProps) {
  const [draft, setDraft] = useState<Store>({ ...store });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save to Supabase first
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(draft),
      });

      if (response.ok) {
        // Also persist draft to localStorage as backup
        const key = `demo-store-${store.ownerId || 'demo-user'}`;
        localStorage.setItem(key, JSON.stringify(draft));
        
        toast.success('Draft saved!');
        onStoreUpdate(draft); // Notify parent of store update
      } else {
        // If Supabase fails, fall back to localStorage only
        console.warn('Failed to save to Supabase, using localStorage fallback');
        const key = `demo-store-${store.ownerId || 'demo-user'}`;
        localStorage.setItem(key, JSON.stringify(draft));
        toast.success('Draft saved locally!');
        onStoreUpdate(draft);
      }
    } catch (error) {
      console.error('Save error:', error);
      // Fallback to localStorage
      const key = `demo-store-${store.ownerId || 'demo-user'}`;
      localStorage.setItem(key, JSON.stringify(draft));
      toast.success('Draft saved locally!');
      onStoreUpdate(draft);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!draft.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    
    setIsPublishing(true);
    const publishedStore = { ...draft, published: true };
    
    try {
      // Publish to Supabase
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(publishedStore),
      });

      if (response.ok) {
        onPublish(publishedStore);
        toast.success('Store published!');
      } else {
        // Fallback to localStorage if Supabase fails
        console.warn('Failed to publish to Supabase, using localStorage fallback');
        onPublish(publishedStore);
        toast.success('Store published locally!');
      }
    } catch (error) {
      console.error('Publish error:', error);
      // Fallback to localStorage
      onPublish(publishedStore);
      toast.success('Store published locally!');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (field: keyof Store['settings']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const imageData = ev.target?.result as string;
        const updatedDraft = {
          ...draft,
          settings: { ...draft.settings, [field]: imageData },
        };
        
        setDraft(updatedDraft);
        
        try {
          // Save to Supabase immediately for real-time updates
          await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/stores/${store.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(updatedDraft),
          });
        } catch (error) {
          console.warn('Failed to save image update to Supabase:', error);
        }
        
        // Also persist to localStorage as backup
        const key = `demo-store-${store.ownerId || 'demo-user'}`;
        localStorage.setItem(key, JSON.stringify(updatedDraft));
        
        onStoreUpdate(updatedDraft); // Notify parent of the update
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end items-center gap-4 p-4">
        <Button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-black text-white rounded-md hover:bg-black/90">
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        <Button onClick={handlePublish} disabled={isPublishing} className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          {isPublishing ? 'Publishing...' : 'Publish Store'}
        </Button>
      </div>
      <div className="flex-1 bg-background/50 overflow-auto">
        <div className="sticky top-0">
          <div className="mb-2 text-muted-foreground text-sm">Live Preview</div>
          <div className="rounded-lg border bg-white shadow p-4">
            <Storefront
              store={draft}
              products={products}
              isEditable
              onImageUpload={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
