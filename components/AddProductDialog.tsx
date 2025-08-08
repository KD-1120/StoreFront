import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Loader2, X, Upload } from 'lucide-react';
import { ProductService } from '../utils/supabase/products';
import { uploadImage } from '../utils/supabase/client';

interface AddProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onProductAdded: (newProduct?: any) => void;
  storeId: string;
  isBuilder?: boolean;
  store: any;
}

export function AddProductDialog({ isOpen, onClose, onProductAdded, storeId, isBuilder, store }: AddProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });

  const [newCustomField, setNewCustomField] = useState({ key: '', value: '' });
  const [customFields, setCustomFields] = useState<{ key: string; value: string }[]>([]);

  const collections = store?.settings?.collections || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadImage('product-images', imageFile, `${storeId}/${Date.now()}`);
      }

      const productData = {
        store_id: storeId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        image_url: imageUrl || null,
        category: formData.category || null,
        inventory_count: 0,
        is_active: true,
      };

      if (isBuilder) {
        // For builder mode, just pass the data to parent
        onProductAdded({
          ...productData,
          id: Math.random().toString(36).slice(2, 12),
          customFields: customFields.reduce<Record<string, string>>((acc, field) => {
            acc[field.key] = field.value;
            return acc;
          }, {}),
        });
      } else {
        // Create product in database
        const product = await ProductService.createProduct(productData);
        onProductAdded(product);
      }

      resetForm();
    } catch (error: any) {
      console.error('Product creation error:', error);
      setError(error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
    });
    setNewCustomField({ key: '', value: '' });
    setCustomFields([]);
    setImageFile(null);
    setImagePreview('');
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
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  type="text"
                  placeholder="T-Shirts"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
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

              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
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