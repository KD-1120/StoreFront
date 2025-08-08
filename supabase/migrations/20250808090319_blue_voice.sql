/*
  # Complete E-commerce Schema Setup

  1. New Tables
    - `stores` - Store information and settings with JSON settings column
    - `products` - Product catalog with inventory tracking
    - `orders` - Customer orders with status tracking
    - `order_items` - Order line items linking products to orders
    - `customers` - Customer information per store
    - `profiles` - User profiles extending auth.users

  2. Security
    - Enable RLS on all tables
    - Store owners can manage their stores, products, orders
    - Customers can view active stores and products
    - Public can view published stores

  3. Storage
    - Create buckets for store-images, product-images, user-avatars
    - Secure upload policies

  4. Functions
    - Updated timestamp trigger function
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name text,
    email text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Stores table with JSON settings
CREATE TABLE IF NOT EXISTS stores (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    logo_url text,
    theme_color text DEFAULT '#030213',
    domain text UNIQUE,
    settings jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    is_published boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their stores"
    ON stores FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view published stores"
    ON stores FOR SELECT
    TO public
    USING (is_active = true AND is_published = true);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    category text,
    inventory_count integer DEFAULT 0,
    custom_fields jsonb DEFAULT '{}',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their products"
    ON products FOR ALL
    TO authenticated
    USING (store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
    ));

CREATE POLICY "Public can view active products from published stores"
    ON products FOR SELECT
    TO public
    USING (
        is_active = true 
        AND store_id IN (
            SELECT id FROM stores 
            WHERE is_active = true AND is_published = true
        )
    );

-- Customers table
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

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their customers"
    ON customers FOR ALL
    TO authenticated
    USING (store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
    ));

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id uuid REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
    customer_id uuid REFERENCES customers(id),
    customer_email text,
    customer_name text,
    total_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'pending',
    shipping_address jsonb,
    payment_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can manage their orders"
    ON orders FOR ALL
    TO authenticated
    USING (store_id IN (
        SELECT id FROM stores WHERE user_id = auth.uid()
    ));

CREATE POLICY "Public can create orders"
    ON orders FOR INSERT
    TO public
    WITH CHECK (true);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    quantity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store owners can view their order items"
    ON order_items FOR SELECT
    TO authenticated
    USING (order_id IN (
        SELECT orders.id FROM orders
        JOIN stores ON orders.store_id = stores.id
        WHERE stores.user_id = auth.uid()
    ));

CREATE POLICY "Public can create order items"
    ON order_items FOR INSERT
    TO public
    WITH CHECK (true);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
    BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('store-images', 'store-images', true),
    ('product-images', 'product-images', true),
    ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for store-images
CREATE POLICY "Store owners can upload store images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Store owners can update their store images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Store owners can delete their store images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'store-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view store images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'store-images');

-- Storage policies for product-images
CREATE POLICY "Store owners can upload product images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Store owners can update their product images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Store owners can delete their product images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view product images"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'product-images');

-- Storage policies for user-avatars
CREATE POLICY "Users can upload their own avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view user avatars"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'user-avatars');