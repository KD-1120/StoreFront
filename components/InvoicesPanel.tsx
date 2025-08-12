import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../utils/supabase/client';

export function InvoicesPanel() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setInvoices(data || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Invoices</h1>
        <p className="text-muted-foreground">View your invoices</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center justify-between border rounded p-3">
                <div>
                  <div className="font-medium">{inv.status}</div>
                  <div className="text-sm text-muted-foreground">Due {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</div>
                </div>
                <div className="text-sm font-medium">${Number(inv.amount).toFixed(2)}</div>
              </div>
            ))}
            {invoices.length === 0 && <div className="text-sm text-muted-foreground">No invoices</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
