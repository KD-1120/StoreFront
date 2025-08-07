import React, { useState } from 'react';
import { Storefront } from './Storefront';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { Store, Product } from '../App';

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

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving logic (e.g., API call or local storage update)
    setTimeout(() => {
      toast.success('Draft saved!');
      setIsSaving(false);
      onStoreUpdate(draft); // Notify parent of store update
    }, 1000);
  };

  const handlePublish = () => {
    if (!draft.name.trim()) {
      toast.error('Store name is required');
      return;
    }
    setIsPublishing(true);
    const publishedStore = { ...draft, published: true };
    onPublish(publishedStore);
    setIsPublishing(false);
    toast.success('Store published!');
  };

  const handleImageUpload = (field: keyof Store['settings']) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const imageData = ev.target?.result as string;
        setDraft((prev) => {
          const updatedDraft = {
            ...prev,
            settings: { ...prev.settings, [field]: imageData },
          };
          onStoreUpdate(updatedDraft); // Notify parent of the update
          return updatedDraft;
        });
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
