import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../utils/supabase/client';

export function SubscriptionsPanel() {
  const [plans, setPlans] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from('subscription_plans').select('*').eq('is_active', true);
      setPlans(p || []);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: s } = await supabase.from('subscriptions').select('*').eq('user_id', user.id);
        setSubs(s || []);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Subscriptions</h1>
        <p className="text-muted-foreground">View plans and your subscription</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Active Plans</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {plans.map(pl => (
            <div key={pl.id} className="border rounded p-3 text-sm flex justify-between">
              <div>{pl.name}</div>
              <div>${Number(pl.price).toFixed(2)}/{pl.interval}</div>
            </div>
          ))}
          {plans.length === 0 && <div className="text-sm text-muted-foreground">No plans</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Your Subscriptions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {subs.map(s => (
            <div key={s.id} className="border rounded p-3 text-sm flex justify-between">
              <div>{s.status}</div>
              <div>Ends {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}</div>
            </div>
          ))}
          {subs.length === 0 && <div className="text-sm text-muted-foreground">No subscription</div>}
        </CardContent>
      </Card>
    </div>
  );
}
