import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '../utils/supabase/client';

export function WalletPanel({ storeId }: { storeId: string }) {
  const [wallet, setWallet] = useState<any | null>(null);

  const load = async () => {
    const { data } = await supabase.from('wallets').select('*').eq('store_id', storeId).maybeSingle();
    setWallet(data);
  };

  useEffect(() => { load(); }, [storeId]);

  const create = async () => {
    await supabase.from('wallets').insert({ store_id: storeId });
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Wallet</h1>
        <p className="text-muted-foreground">Store wallet balance</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Balance</CardTitle></CardHeader>
        <CardContent>
          {wallet ? (
            <div className="text-2xl font-bold">{wallet.currency} ${Number(wallet.balance).toFixed(2)}</div>
          ) : (
            <Button onClick={create}>Create Wallet</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
