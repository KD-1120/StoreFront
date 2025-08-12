import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';

interface ProductGridProps {
  products: Product[];
  collections: string[]; // Updated from categories to collections
  onAddToCart: (product: Product, customFields: Record<string, string | number | boolean>) => void;
}

export function ProductGrid({ products, collections, onAddToCart }: ProductGridProps) {
  const [selectedCollection, setSelectedCollection] = useState('All'); // Updated from selectedCategory
  const [sortBy, setSortBy] = useState('name');

  const filteredAndSortedProducts = useMemo(() => {
    let filtered =
      selectedCollection === 'All'
        ? products
        : products.filter((product) => product.collectionIds?.includes(selectedCollection)); // Updated filtering logic

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [products, selectedCollection, sortBy]);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl mb-2">Our Products</h2>
            <p className="text-muted-foreground">Discover our complete collection</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Collection Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {collections.map((collection) => (
            <Badge
              key={collection}
              variant={selectedCollection === collection ? 'default' : 'secondary'}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCollection(collection)}
            >
              {collection}
            </Badge>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>

        {filteredAndSortedProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  storeId: string;
  customFields?: Record<string, string | number | boolean>;
  collectionIds?: string[]; // Added collectionIds
}