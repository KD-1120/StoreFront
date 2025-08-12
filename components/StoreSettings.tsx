import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { generateStoreUrl } from '../utils/routing';
import { supabaseFunctionsBaseUrl } from '../utils/supabase/info';

interface StoreSettingsProps {
  store: any;
  onStoreUpdate: (store: any) => void;
}

export function StoreSettings({ store, onStoreUpdate }: StoreSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [settings, setSettings] = useState({
    name: store.name || '',
    description: store.settings?.description || '',
    contactEmail: store.settings?.contactEmail || '',
    primaryColor: store.settings?.primaryColor || '#030213',
    logoUrl: store.settings?.logoUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create updated store object
      const updatedStore = {
        ...store,
        name: settings.name,
        settings: {
          ...store.settings,
          description: settings.description,
          contactEmail: settings.contactEmail,
          primaryColor: settings.primaryColor,
          logoUrl: settings.logoUrl,
        },
      };

      // Try to update via API first
      const session = JSON.parse(localStorage.getItem('supabase.auth.token') || 'null');
      const token = session?.access_token;

      if (token) {
        try {
          const response = await fetch(`${supabaseFunctionsBaseUrl}/make-server-8a855376/merchant/store`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ 
              name: settings.name,
              settings: {
                description: settings.description,
                contactEmail: settings.contactEmail,
                primaryColor: settings.primaryColor,
                logoUrl: settings.logoUrl,
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            onStoreUpdate(data.store);
            setSuccess('Settings updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.log('API update failed, falling back to localStorage');
        }
      }

      // Fallback to localStorage update (for demo stores)
      const existingStoreKey = `demo-store-${store.ownerId}`;
      localStorage.setItem(existingStoreKey, JSON.stringify(updatedStore));
      
      onStoreUpdate(updatedStore);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Settings update error:', error);
      setError('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const storeUrl = generateStoreUrl(store.subdomain);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Store Settings</h1>
        <p className="text-muted-foreground">Customize your store appearance and details</p>
      </div>

      {error && (
        <Alert className="border-red-500">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                placeholder="Enter your store name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Store URL</Label>
              <div className="flex items-center space-x-2">
                <Input value={storeUrl} disabled />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(storeUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your store..."
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  className="w-20 h-10 p-1"
                />
                <Input
                  type="text"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                  placeholder="#030213"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
              <Input
                id="logoUrl"
                type="url"
                placeholder="https://example.com/logo.png"
                value={settings.logoUrl}
                onChange={(e) => setSettings(prev => ({ ...prev, logoUrl: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="store@example.com"
                value={settings.contactEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                This email will be displayed in your store footer
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} style={{ backgroundColor: '#030213', color: 'white' }}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}