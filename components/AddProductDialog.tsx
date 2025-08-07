import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, X } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct?: any) => void;
  storeId: string;
  isBuilder?: boolean;
  store: any; // Add the store prop
}

export function AddProductDialog({ isOpen, onClose, onProductAdded, storeId, isBuilder, store }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '' as string | File, // Allow both string and File types
    collection: '',
    description: '',
  });

  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  const collections = store.settings.collections || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      storeId,
      id: Math.random().toString(36).slice(2, 12), // temp id for builder
      collection: formData.collection,
      customFields: customFields.reduce<Record<string, string>>((acc: Record<string, string>, field: { key: string; value: string }) => {
        acc[field.key] = field.value;
        return acc;
      }, {}),
    };

    if (isBuilder) {
      onProductAdded(productData);
      resetForm();
      setLoading(false);
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      const token = session?.access_token;

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/merchant/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        onProductAdded();
        resetForm();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Product creation error:', error);
      setError('Network error during product creation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '' as string | File,
      collection: '',
      description: '',
    });
    setNewCustomField({ key: '', value: '' });
    setError('');
  };

  const addCustomField = () => {
    if (newCustomField.key.trim() && newCustomField.value.trim()) {
      setCustomFields((prev) => [...prev, newCustomField]);
      setNewCustomField({ key: '', value: '' });
    }
  };

  const removeCustomField = (key: string) => {
    setCustomFields((prev) => prev.filter((field) => field.key !== key));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert className="border-red-500">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Awesome T-Shirt"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="29.99"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collection">Collection</Label>
                <select
                  id="collection"
                  value={formData.collection || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, collection: e.target.value }))}
                  disabled={collections.length === 0}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="" disabled>
                    {collections.length === 0 ? 'No collections available' : 'Select a collection'}
                  </option>
                  {collections.map((collection: { id: string; name: string }) => (
                    <option key={collection.id} value={collection.name}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData((prev) => ({ ...prev, image: file }));
                    }
                  }}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your product..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Custom Fields</Label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Field Name"
                  value={newCustomField.key}
                  onChange={(e) => setNewCustomField((prev) => ({ ...prev, key: e.target.value }))}
                />
                <Input
                  type="text"
                  placeholder="Field Value"
                  value={newCustomField.value}
                  onChange={(e) => setNewCustomField((prev) => ({ ...prev, value: e.target.value }))}
                />
                <Button type="button" onClick={addCustomField} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {customFields.map((field, index) => (
                  <Badge key={index} variant="secondary" className="pr-1">
                    {field.key}: {field.value}
                    <button
                      type="button"
                      onClick={() => removeCustomField(field.key)}
                      className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 bg-black text-white hover:bg-black/90 shadow-md hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}