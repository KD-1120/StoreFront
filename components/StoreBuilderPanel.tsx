import React, { useState } from 'react';
import { Storefront } from './Storefront';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { StoreService } from '../utils/supabase/stores';

interface StoreBuilderPanelProps {
  store: any;
  products: any[];
  onStoreUpdate: (store: any) => void;
  onPublish?: () => void;
}

export function StoreBuilderPanel({ store, products, onStoreUpdate, onPublish }: StoreBuilderPanelProps) {
  const [draft, setDraft] = useState(store);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await StoreService.saveDraft(store.id, draft);
      onStoreUpdate(draft);
      toast.success('Draft saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await StoreService.publishStore(store.id);
      const updatedStore = { ...draft, is_published: true };
      setDraft(updatedStore);
      onStoreUpdate(updatedStore);
      onPublish?.();
      toast.success('Store published successfully!');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish store');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Upload image to Supabase Storage
      const { uploadImage } = await import('../utils/supabase/client');
      const imageUrl = await uploadImage('store-images', file, `${store.id}/${field}/${Date.now()}`);
      
      const updatedDraft = {
        ...draft,
        settings: { ...draft.settings, [field]: imageUrl },
      };
      
      setDraft(updatedDraft);
      onStoreUpdate(updatedDraft);
      
      // Auto-save the image update
      await StoreService.saveDraft(store.id, updatedDraft);
      toast.success('Image uploaded and saved!');
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('Failed to upload image');
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