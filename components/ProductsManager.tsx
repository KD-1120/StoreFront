import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { AddProductDialog } from './AddProductDialog';
import { supabaseFunctionsBaseUrl } from '../utils/supabase/info';
import type { Product } from '../App';


// interface Collection {
//   id: string;
//   name: string;
// }

type ProductWithCollections = Product & { collectionIds?: string[] };

interface ProductsManagerProps {
  store: any;
  products?: ProductWithCollections[];
  onProductsChange?: (products: ProductWithCollections[]) => void;
  isBuilder?: boolean;
}

export function ProductsManager({ store, products: productsProp, onProductsChange, isBuilder }: ProductsManagerProps) {
  const [products, setProducts] = useState<ProductWithCollections[]>(productsProp || []);
  const [loading, setLoading] = useState(!isBuilder);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Collections state
  // const [collections, setCollections] = useState<Collection[]>(store.settings.collections || []);
  // const [newCollectionName, setNewCollectionName] = useState('');

  useEffect(() => {
    if (!isBuilder) {
      loadProducts();
    } else if (productsProp) {
      setProducts(productsProp);
    }
    // eslint-disable-next-line
  }, [isBuilder, productsProp]);

  // Sync collections to store.settings
  // useEffect(() => {
  //   if (isBuilder) return;
  //   // Optionally, persist collections to store/settings if needed
  // }, [collections, isBuilder]);

  const loadProducts = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      const token = session?.access_token;
      if (!token) return;
  const response = await fetch(`${supabaseFunctionsBaseUrl}/make-server-8a855376/merchant/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        if (onProductsChange) onProductsChange(data.products || []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductAdded = (newProduct?: any) => {
    if (isBuilder && onProductsChange && newProduct) {
      const updated = [...products, newProduct];
      setProducts(updated);
      onProductsChange(updated);
      setIsAddDialogOpen(false);
    } else {
      loadProducts();
      setIsAddDialogOpen(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    if (isBuilder && onProductsChange) {
      const updated = products.filter((p) => p.id !== productId);
      setProducts(updated);
      onProductsChange(updated);
      return;
    }
    try {
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      const token = session?.access_token;
      if (!token) return;
  const response = await fetch(`${supabaseFunctionsBaseUrl}/make-server-8a855376/merchant/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (loading) {
    if (isBuilder) return null;
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Products</h1>
            <Button 
            disabled 
            style={{ backgroundColor: '#030303ff', color: 'white', cursor: 'not-allowed' }}
            >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-32 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 bg-black text-white hover:bg-black/90 shadow-md hover:shadow-lg disabled:pointer-events-none disabled:opacity-50"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your catalog by adding your first product
            </p>
            <Button variant="black" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <CardTitle className="text-base">{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">${product.price}</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                  {product.customFields && (
                    <div className="mt-4 space-y-2">
                      {Object.entries(product.customFields).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-sm">{value.toString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      {product.collectionIds?.length || 0} collections
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddProductDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onProductAdded={handleProductAdded}
        storeId={store.id}
        isBuilder={isBuilder}
        store={store} // Pass the store prop
      />
    </div>
  );
}