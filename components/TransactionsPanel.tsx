import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../utils/supabase/client';

export function TransactionsPanel({ storeId }: { storeId: string }) {
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      setTxs(data || []);
    })();
  }, [storeId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="text-muted-foreground">Financial activity for this store</p>
      </div>
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {txs.map(t => (
            <div key={t.id} className="border rounded p-3 text-sm grid grid-cols-3">
              <div className="font-medium">{t.type}</div>
              <div>{t.status}</div>
              <div className="text-right">${Number(t.amount).toFixed(2)}</div>
            </div>
          ))}
          {txs.length === 0 && <div className="text-sm text-muted-foreground">No transactions</div>}
        </CardContent>
      </Card>
    </div>
  );
}
