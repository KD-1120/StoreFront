import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Package, ShoppingCart, DollarSign, TrendingUp, ExternalLink, Plus } from 'lucide-react';
import { generateStoreUrl } from '../utils/routing';
import { projectId } from '../utils/supabase/info';

interface DashboardOverviewProps {
  store: any;
}

export function DashboardOverview({ store }: DashboardOverviewProps) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [store.id]);

  const loadStats = async () => {
    try {
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      const token = session?.access_token;

      if (!token) return;

      // Load products
      const productsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/merchant/products`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // Load orders
      const ordersResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-8a855376/merchant/orders`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (productsResponse.ok && ordersResponse.ok) {
        const productsData = await productsResponse.json();
        const ordersData = await ordersResponse.json();

        const totalRevenue = ordersData.orders.reduce((sum: number, order: any) => sum + order.total, 0);
        const recentOrders = ordersData.orders.slice(0, 5);

        setStats({
          totalProducts: productsData.products.length,
          totalOrders: ordersData.orders.length,
          totalRevenue,
          recentOrders,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const storeUrl = generateStoreUrl(store.subdomain);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with {store.name}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
            <ExternalLink className="w-4 h-4 mr-2" />
            View Store
          </Button>
          <Button style={{ backgroundColor: '#030303ff', color: 'white' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products in your catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Store is live
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Store URL */}
      <Card>
        <CardHeader>
          <CardTitle>Your Store</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{store.name}</p>
              <p className="text-sm text-muted-foreground">{storeUrl}</p>
            </div>
            <Button variant="outline" onClick={() => window.open(storeUrl, '_blank')}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
              <p className="text-sm text-muted-foreground">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(-8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                    <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}