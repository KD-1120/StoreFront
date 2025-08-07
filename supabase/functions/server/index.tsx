import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from '@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Test endpoint
app.get('/make-server-8a855376/test', async (c) => {
  return c.json({ 
    message: 'Server is working!', 
    timestamp: new Date().toISOString(),
    env: {
      supabaseUrl: Deno.env.get('SUPABASE_URL'),
      hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    }
  });
});

// Merchant signup
app.post('/make-server-8a855376/auth/merchant-signup', async (c) => {
  try {
    const { email, password, name, storeName, storeSubdomain } = await c.req.json();
    
    // Check if subdomain is available
    const existingStore = await kv.get(`store:subdomain:${storeSubdomain}`);
    if (existingStore) {
      return c.json({ error: 'Subdomain already taken' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'merchant' },
      email_confirm: true
    });

    if (error) {
      console.log('Merchant signup error:', error);
      return c.json({ error: `Signup failed: ${error.message}` }, 400);
    }

    // Create store
    const storeId = `store_${Date.now()}_${data.user.id}`;
    const store = {
      id: storeId,
      name: storeName,
      subdomain: storeSubdomain,
      ownerId: data.user.id,
      settings: {
        primaryColor: '#030213',
        logoUrl: '',
        description: '',
        contactEmail: email,
        currency: 'USD',
      },
      createdAt: new Date().toISOString(),
    };

    await kv.set(`store:${storeId}`, store);
    await kv.set(`store:subdomain:${storeSubdomain}`, storeId);
    await kv.set(`merchant:${data.user.id}:store`, storeId);
    
    return c.json({ user: data.user, store, message: 'Store created successfully' });
  } catch (error) {
    console.log('Merchant signup error:', error);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get store by subdomain
app.get('/make-server-8a855376/stores/subdomain/:subdomain', async (c) => {
  try {
    const subdomain = c.req.param('subdomain');
    
    // Create demo store if requested
    if (subdomain === 'demo') {
      const demoStore = {
        id: 'demo_store',
        name: 'Demo Fashion Store',
        subdomain: 'demo',
        ownerId: 'demo_user',
        settings: {
          primaryColor: '#030213',
          logoUrl: '',
          description: 'Experience our beautiful e-commerce platform with this demo store.',
          contactEmail: 'demo@stylehub.com',
          currency: 'USD',
        },
        createdAt: new Date().toISOString(),
      };
      
      // Add some demo products
      const demoProducts = [
        {
          id: 'demo_product_1',
          storeId: 'demo_store',
          name: 'Classic White T-Shirt',
          price: 29.99,
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          category: 'T-Shirts',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['White', 'Black', 'Navy'],
          description: 'A timeless classic that never goes out of style. Made from premium cotton.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demo_product_2',
          storeId: 'demo_store',
          name: 'Denim Jacket',
          price: 89.99,
          image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop',
          category: 'Jackets',
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['Blue', 'Black'],
          description: 'Classic denim jacket perfect for layering. Vintage-inspired design.',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'demo_product_3',
          storeId: 'demo_store',
          name: 'Summer Dress',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
          category: 'Dresses',
          sizes: ['XS', 'S', 'M', 'L'],
          colors: ['Floral', 'Navy', 'White'],
          description: 'Light and breezy summer dress perfect for warm weather.',
          createdAt: new Date().toISOString(),
        }
      ];
      
      // Store demo data
      await kv.set(`store:demo_store`, demoStore);
      await kv.set(`store:subdomain:demo`, 'demo_store');
      
      for (const product of demoProducts) {
        await kv.set(`product:${product.id}`, product);
      }
      
      await kv.set(`store:demo_store:products`, demoProducts.map(p => p.id));
      
      return c.json({ store: demoStore });
    }
    
    const storeId = await kv.get(`store:subdomain:${subdomain}`);
    
    if (!storeId) {
      return c.json({ error: 'Store not found' }, 404);
    }
    
    const store = await kv.get(`store:${storeId}`);
    return c.json({ store });
  } catch (error) {
    console.log('Store fetch error:', error);
    return c.json({ error: 'Failed to fetch store' }, 500);
  }
});

// Get merchant's store
app.get('/make-server-8a855376/merchant/store', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (!storeId) {
      return c.json({ error: 'No store found' }, 404);
    }
    
    const store = await kv.get(`store:${storeId}`);
    return c.json({ store });
  } catch (error) {
    console.log('Store fetch error:', error);
    return c.json({ error: 'Failed to fetch store' }, 500);
  }
});

// Update store settings
app.put('/make-server-8a855376/merchant/store', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (!storeId) {
      return c.json({ error: 'No store found' }, 404);
    }
    
    const { settings } = await c.req.json();
    const store = await kv.get(`store:${storeId}`);
    
    const updatedStore = {
      ...store,
      settings: { ...store.settings, ...settings },
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`store:${storeId}`, updatedStore);
    return c.json({ store: updatedStore });
  } catch (error) {
    console.log('Store update error:', error);
    return c.json({ error: 'Failed to update store' }, 500);
  }
});

// Add product to store
app.post('/make-server-8a855376/merchant/products', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (!storeId) {
      return c.json({ error: 'No store found' }, 404);
    }
    
    const productData = await c.req.json();
    const productId = `product_${Date.now()}_${storeId}`;
    
    const product = {
      id: productId,
      storeId,
      ...productData,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`product:${productId}`, product);
    
    // Add to store's product list
    const storeProducts = await kv.get(`store:${storeId}:products`) || [];
    storeProducts.push(productId);
    await kv.set(`store:${storeId}:products`, storeProducts);
    
    return c.json({ product });
  } catch (error) {
    console.log('Product creation error:', error);
    return c.json({ error: 'Failed to create product' }, 500);
  }
});

// Get store products
app.get('/make-server-8a855376/stores/:storeId/products', async (c) => {
  try {
    const storeId = c.req.param('storeId');
    const productIds = await kv.get(`store:${storeId}:products`) || [];
    
    if (productIds.length === 0) {
      return c.json({ products: [] });
    }
    
    const products = await kv.mget(productIds.map((id: string) => `product:${id}`));
    return c.json({ products });
  } catch (error) {
    console.log('Products fetch error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Get merchant's products
app.get('/make-server-8a855376/merchant/products', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (!storeId) {
      return c.json({ error: 'No store found' }, 404);
    }
    
    const productIds = await kv.get(`store:${storeId}:products`) || [];
    const products = productIds.length > 0 ? await kv.mget(productIds.map((id: string) => `product:${id}`)) : [];
    
    return c.json({ products });
  } catch (error) {
    console.log('Products fetch error:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// Update product
app.put('/make-server-8a855376/merchant/products/:productId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (product.storeId !== storeId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const updates = await c.req.json();
    const updatedProduct = {
      ...product,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`product:${productId}`, updatedProduct);
    return c.json({ product: updatedProduct });
  } catch (error) {
    console.log('Product update error:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// Delete product
app.delete('/make-server-8a855376/merchant/products/:productId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const productId = c.req.param('productId');
    const product = await kv.get(`product:${productId}`);
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (product.storeId !== storeId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    await kv.del(`product:${productId}`);
    
    // Remove from store's product list
    const storeProducts = await kv.get(`store:${storeId}:products`) || [];
    const updatedProducts = storeProducts.filter((id: string) => id !== productId);
    await kv.set(`store:${storeId}:products`, updatedProducts);
    
    return c.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log('Product deletion error:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

// Customer cart operations (store-specific)
app.post('/make-server-8a855376/stores/:storeId/cart/save', async (c) => {
  try {
    const storeId = c.req.param('storeId');
    const { cartItems, sessionId } = await c.req.json();
    
    await kv.set(`cart:${storeId}:${sessionId}`, cartItems);
    return c.json({ message: 'Cart saved successfully' });
  } catch (error) {
    console.log('Cart save error:', error);
    return c.json({ error: 'Failed to save cart' }, 500);
  }
});

app.get('/make-server-8a855376/stores/:storeId/cart/:sessionId', async (c) => {
  try {
    const storeId = c.req.param('storeId');
    const sessionId = c.req.param('sessionId');
    
    const cartItems = await kv.get(`cart:${storeId}:${sessionId}`) || [];
    return c.json({ cartItems });
  } catch (error) {
    console.log('Cart load error:', error);
    return c.json({ error: 'Failed to load cart' }, 500);
  }
});

// Create order for store
app.post('/make-server-8a855376/stores/:storeId/orders', async (c) => {
  try {
    const storeId = c.req.param('storeId');
    const { cartItems, total, shippingAddress, customerInfo } = await c.req.json();
    
    const orderId = `order_${Date.now()}_${storeId}`;
    const order = {
      id: orderId,
      storeId,
      items: cartItems,
      total,
      shippingAddress,
      customerInfo,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`order:${orderId}`, order);
    
    // Add to store's order list
    const storeOrders = await kv.get(`store:${storeId}:orders`) || [];
    storeOrders.push(orderId);
    await kv.set(`store:${storeId}:orders`, storeOrders);
    
    return c.json({ order, message: 'Order created successfully' });
  } catch (error) {
    console.log('Order creation error:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Get merchant's orders
app.get('/make-server-8a855376/merchant/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (!storeId) {
      return c.json({ error: 'No store found' }, 404);
    }
    
    const orderIds = await kv.get(`store:${storeId}:orders`) || [];
    const orders = orderIds.length > 0 ? await kv.mget(orderIds.map((id: string) => `order:${id}`)) : [];
    
    return c.json({ 
      orders: orders.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ) 
    });
  } catch (error) {
    console.log('Orders fetch error:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Update order status
app.put('/make-server-8a855376/merchant/orders/:orderId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const storeId = await kv.get(`merchant:${user.id}:store`);
    if (order.storeId !== storeId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }
    
    const { status } = await c.req.json();
    const updatedOrder = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`order:${orderId}`, updatedOrder);
    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log('Order update error:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

Deno.serve(app.fetch);