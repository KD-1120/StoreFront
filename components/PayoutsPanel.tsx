import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { supabase } from '../utils/supabase/client';

export function PayoutsPanel({ storeId }: { storeId: string }) {
  const [methods, setMethods] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [amount, setAmount] = useState('');

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const m = await supabase.from('payout_methods').select('*').eq('user_id', user.id);
      setMethods(m.data || []);
    }
    const r = await supabase.from('payout_requests').select('*').eq('store_id', storeId).order('created_at', { ascending: false });
    setRequests(r.data || []);
  };

  useEffect(() => { load(); }, [storeId]);

  const addMethod = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('payout_methods').insert({ user_id: user.id, type: 'bank', details: { account: '****' } });
    load();
  };

  const requestPayout = async () => {
    if (!amount) return;
    await supabase.from('payout_requests').insert({ store_id: storeId, amount: Number(amount), status: 'pending' });
    setAmount('');
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payouts</h1>
        <p className="text-muted-foreground">Manage payout methods and requests</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Payout Methods</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={addMethod}>Add bank method</Button>
          <div className="space-y-2">
            {methods.map((m) => (
              <div key={m.id} className="border rounded p-3 text-sm flex justify-between">
                <div>{m.type}</div>
                <div>{m.is_default ? 'Default' : ''}</div>
              </div>
            ))}
            {methods.length === 0 && <div className="text-sm text-muted-foreground">No payout methods</div>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Payout Requests</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Button onClick={requestPayout}>Request</Button>
          </div>
          <div className="space-y-2">
            {requests.map((r) => (
              <div key={r.id} className="border rounded p-3 text-sm flex justify-between">
                <div>{r.status}</div>
                <div>${Number(r.amount).toFixed(2)}</div>
              </div>
            ))}
            {requests.length === 0 && <div className="text-sm text-muted-foreground">No requests yet</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
