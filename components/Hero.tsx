import React, { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';

export function Hero({ storeName, storeDescription, heroButtonText, heroSubtext1, heroSubtext2, heroImage, heroBadge1, heroBadge2, isEditable = false, onImageUpload }: {
  storeName?: string;
  storeDescription?: string;
  heroButtonText?: string;
  heroSubtext1?: string;
  heroSubtext2?: string;
  heroImage?: string;
  heroBadge1?: string;
  heroBadge2?: string;
  isEditable?: boolean;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
} = {}) {
  const [editableStoreName, setEditableStoreName] = useState(storeName || 'Summer 2024');
  const [editableDescription, setEditableDescription] = useState(storeDescription || 'Discover the latest trends in fashion with our curated collection of premium apparel. Quality meets style in every piece.');
  const [editableHeroButtonText, setEditableHeroButtonText] = useState(heroButtonText || 'Shop Now');
  const [editableHeroSubtext1, setEditableHeroSubtext1] = useState(heroSubtext1 || 'Free Shipping');
  const [editableHeroSubtext2, setEditableHeroSubtext2] = useState(heroSubtext2 || '30-Day Returns');
  const [editableHeroBadge1, setEditableHeroBadge1] = useState(heroBadge1 || 'New');
  const [editableHeroBadge2, setEditableHeroBadge2] = useState(heroBadge2 || '50% Off');
  const [uploadedHeroImage, setUploadedHeroImage] = useState(heroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');

  useEffect(() => {
    setUploadedHeroImage(heroImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
  }, [heroImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        setUploadedHeroImage(imageData);
        // If there's a parent upload handler, call it too
        if (onImageUpload) {
          onImageUpload(e);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="relative bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => setEditableStoreName(e.target.textContent || '')}
              className="text-4xl md:text-5xl lg:text-6xl tracking-tight"
            >
              Welcome to <span className="block text-primary">{editableStoreName}</span>
            </h1>
            <p
              contentEditable={isEditable}
              suppressContentEditableWarning
              onBlur={(e) => setEditableDescription(e.target.textContent || '')}
              className="text-lg text-muted-foreground max-w-md"
            >
              {editableDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="w-full sm:w-auto bg-black text-white hover:text-black">
                <span
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => setEditableHeroButtonText(e.target.textContent || '')}
                >
                  {editableHeroButtonText}
                </span>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View Catalog
              </Button>
            </div>
            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => setEditableHeroSubtext1(e.target.textContent || '')}
                >
                  {editableHeroSubtext1}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span
                  contentEditable={isEditable}
                  suppressContentEditableWarning
                  onBlur={(e) => setEditableHeroSubtext2(e.target.textContent || '')}
                >
                  {editableHeroSubtext2}
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square relative overflow-hidden rounded-2xl">
              <ImageWithFallback
                src={uploadedHeroImage}
                fallbackSrc="https://via.placeholder.com/150"
                alt="Fashion model wearing summer collection"
                className="w-full h-full object-cover"
              />
              {isEditable && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute top-2 left-2 bg-white p-1 rounded text-xs shadow-md focus:outline-none"
                />
              )}
            </div>
            {/* Floating badges */}
            <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
              <span
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => setEditableHeroBadge1(e.target.textContent || '')}
                className="text-sm"
              >
                {editableHeroBadge1}
              </span>
            </div>
            <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg">
              <span
                contentEditable={isEditable}
                suppressContentEditableWarning
                onBlur={(e) => setEditableHeroBadge2(e.target.textContent || '')}
                className="text-sm"
              >
                {editableHeroBadge2}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}