/*
  # Initial Schema Setup for StoreFront Application

  1. New Tables
    - `stores` - Store information and settings
    - `products` - Product catalog
    - `orders` - Customer orders
    - `order_items` - Order line items
    - `customers` - Customer information
    - `profiles` - User profiles (extends auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for store owners and customers
    - Secure image upload policies

  3. Storage
    - Create buckets for store images, product images, and user avatars
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create stores table
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  theme_color text DEFAULT '#8B5CF6',
  domain text UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  image_url text,
  category text,
  inventory_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  phone text,
  address jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(store_id, email)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES customers(id),
  customer_email text,
  customer_name text,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Stores policies
CREATE POLICY "Users can manage their own stores" ON stores FOR ALL TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own stores" ON stores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Public can view active stores by slug" ON stores FOR SELECT TO public USING (is_active = true);

-- Products policies
CREATE POLICY "Store owners can manage their products" ON products FOR ALL TO authenticated 
  USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));
CREATE POLICY "Public can view active products" ON products FOR SELECT TO public 
  USING (is_active = true AND store_id IN (SELECT id FROM stores WHERE is_active = true));

-- Customers policies
CREATE POLICY "Store owners can manage their customers" ON customers FOR ALL TO authenticated 
  USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));
CREATE POLICY "Store owners can view their customers" ON customers FOR SELECT TO authenticated 
  USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));

-- Orders policies
CREATE POLICY "Store owners can manage their orders" ON orders FOR ALL TO authenticated 
  USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));
CREATE POLICY "Store owners can view their orders" ON orders FOR SELECT TO authenticated 
  USING (store_id IN (SELECT id FROM stores WHERE user_id = auth.uid()));
CREATE POLICY "Public can create orders" ON orders FOR INSERT TO public WITH CHECK (true);

-- Order items policies
CREATE POLICY "Store owners can manage their order items" ON order_items FOR ALL TO authenticated 
  USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())));
CREATE POLICY "Store owners can view their order items" ON order_items FOR SELECT TO authenticated 
  USING (order_id IN (SELECT id FROM orders WHERE store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())));
CREATE POLICY "Public can create order items" ON order_items FOR INSERT TO public WITH CHECK (true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('store-images', 'store-images', true),
  ('product-images', 'product-images', true),
  ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for store-images bucket
CREATE POLICY "Store owners can upload store images" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'store-images');
CREATE POLICY "Store owners can update their store images" ON storage.objects FOR UPDATE TO authenticated 
  USING (bucket_id = 'store-images');
CREATE POLICY "Store owners can delete their store images" ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'store-images');
CREATE POLICY "Public can view store images" ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'store-images');

-- Storage policies for product-images bucket
CREATE POLICY "Store owners can upload product images" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Store owners can update their product images" ON storage.objects FOR UPDATE TO authenticated 
  USING (bucket_id = 'product-images');
CREATE POLICY "Store owners can delete their product images" ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'product-images');
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'product-images');

-- Storage policies for user-avatars bucket
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated 
  USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO authenticated 
  USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Public can view user avatars" ON storage.objects FOR SELECT TO public 
  USING (bucket_id = 'user-avatars');