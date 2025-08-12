import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';

export function CustomersManager({ storeId }: { storeId: string }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const load = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    setCustomers(data || []);
  };

  useEffect(() => { load(); }, [storeId]);

  const add = async () => {
    if (!email) return;
    await supabase.from('customers').insert({ store_id: storeId, email, name });
    setEmail(''); setName('');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Customers</h1>
        <p className="text-muted-foreground">Manage your customers</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add customer</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={add}>Add</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Customer list</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {customers.map(c => (
              <div key={c.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{c.name || c.email}</div>
                  <div className="text-sm text-muted-foreground">{c.email}</div>
                </div>
                <div className="text-sm">{new Date(c.created_at).toLocaleString()}</div>
              </div>
            ))}
            {customers.length === 0 && <div className="text-sm text-muted-foreground">No customers yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
