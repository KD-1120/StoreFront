import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../App';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, customFields: Record<string, string | number | boolean>) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [customFieldValues] = useState<Record<string, string | number | boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, customFieldValues);
  };

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div 
        className="relative aspect-square overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          fallbackSrc="/images/default-product.jpg"
        />
        
        <div className={`absolute inset-0 bg-black/20 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
        
        <Button
          size="icon"
          variant="secondary"
          className={`absolute top-4 right-4 transition-transform ${isHovered ? 'scale-100' : 'scale-0'}`}
        >
          <Heart className="w-4 h-4" />
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              className={`absolute bottom-4 left-4 right-4 transition-transform ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
            >
              Quick View
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{product.name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square">
                <ImageWithFallback
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                  fallbackSrc="/images/default-product.jpg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-semibold">${product.price}</p>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <p className="text-muted-foreground">{product.description}</p>
                
                <div className="space-y-3">
                  {product.customFields && Object.entries(product.customFields).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm">{value.toString()}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="w-full"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium line-clamp-2">{product.name}</h3>
            <Badge variant="outline" className="text-xs">{product.category}</Badge>
          </div>
          <p className="text-lg font-semibold">${product.price}</p>
          
          <div className="grid grid-cols-2 gap-2">
            {product.customFields && Object.entries(product.customFields).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key}</span>
                <span className="text-sm">{value.toString()}</span>
              </div>
            ))}
          </div>
          
          <Button 
            onClick={handleAddToCart}
            size="sm"
            className="w-full"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}