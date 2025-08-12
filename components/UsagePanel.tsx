import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { supabase } from '../utils/supabase/client';

export function UsagePanel() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setEvents(data || []);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usage</h1>
        <p className="text-muted-foreground">Your usage events</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {events.map(e => (
            <div key={e.id} className="border rounded p-3 text-sm flex justify-between">
              <div>{e.event}</div>
              <div className="text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
            </div>
          ))}
          {events.length === 0 && <div className="text-sm text-muted-foreground">No events</div>}
        </CardContent>
      </Card>
    </div>
  );
}
