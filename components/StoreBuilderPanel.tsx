import React, { useState, useCallback } from 'react';
import { Storefront } from './Storefront';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { StoreService } from '../utils/supabase/stores';
import { uploadImage } from '../utils/supabase/client';
import { Loader2, Save, Eye, Upload } from 'lucide-react';

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
  const [uploadingImages, setUploadingImages] = useState<Set<string>>(new Set());

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
      await StoreService.publishStore(store.id, draft);
      const updatedStore = { ...draft, published: true };
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

  const handleImageUpload = useCallback((field: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('Image size must be less than 10MB');
      return;
    }

    setUploadingImages(prev => new Set(prev).add(field));

    try {
      // Create immediate preview for better UX
      const reader = new FileReader();
      reader.onload = () => {
        const previewUrl = reader.result as string;
        const updatedDraft = {
          ...draft,
          settings: { ...draft.settings, [field]: previewUrl },
        };
        setDraft(updatedDraft);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase Storage
      const imageUrl = await uploadImage('store-images', file, `${store.id}/${field}/${Date.now()}`);
      
      const updatedDraft = {
        ...draft,
        settings: { ...draft.settings, [field]: imageUrl },
      };
      
      setDraft(updatedDraft);
      
      // Auto-save the image update if store exists in database
      if (store.id && !store.id.startsWith('temp-') && !store.id.startsWith('fallback-')) {
        await StoreService.saveDraft(store.id, updatedDraft);
        toast.success('Image uploaded and saved!');
      } else {
        toast.success('Image uploaded! Remember to save your changes.');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      toast.error(errorMessage);
      
      // Revert preview on error
      const revertedDraft = {
        ...draft,
        settings: { ...draft.settings, [field]: store.settings[field] || '' },
      };
      setDraft(revertedDraft);
    } finally {
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
  }, [draft, store]);

  const handleTextChange = useCallback((field: string, value: string) => {
    const updatedDraft = {
      ...draft,
      [field === 'name' ? 'name' : 'settings']: field === 'name' 
        ? value 
        : { ...draft.settings, [field]: value }
    };
    setDraft(updatedDraft);
  }, [draft]);

  const isUploading = uploadingImages.size > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Builder Controls */}
      <div className="flex justify-between items-center gap-4 p-4 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Store Builder</h2>
          {isUploading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading images...
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isUploading} 
            variant="outline"
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          
          <Button 
            onClick={handlePublish} 
            disabled={isPublishing || isUploading} 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {isPublishing ? 'Publishing...' : 'Publish Store'}
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 bg-gray-50 overflow-auto">
        <div className="p-4">
          <div className="mb-4 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              <Eye className="w-4 h-4" />
              Live Preview - Changes appear instantly
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Storefront
              store={draft}
              products={products}
              isEditable
              onImageUpload={handleImageUpload}
              onTextChange={handleTextChange}
              uploadingImages={uploadingImages}
            />
          </div>
        </div>
      </div>
    </div>
  );
}