/*
  # Dashboard Expansions: tables and RLS policies

  Adds missing tables and row-level security policies requested for:
  invoices, payout_methods, payout_requests, platform_settings,
  subscription_plans, subscriptions, transactions, usage_tracking, wallets.

  Notes:
  - RLS is enabled and policies are created per specification.
  - "System can insert transactions" is implemented as insert allowed for store owners of the target store. For service role inserts, RLS is bypassed automatically.
*/

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  due_date timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
  CREATE POLICY "Users can view their own invoices"
    ON public.invoices FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- payout_methods
CREATE TABLE IF NOT EXISTS public.payout_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  details jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payout_methods ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their payout methods" ON public.payout_methods;
  CREATE POLICY "Users can manage their payout methods"
    ON public.payout_methods FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
END $$;

-- payout_requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can manage their payout requests" ON public.payout_requests;
  CREATE POLICY "Store owners can manage their payout requests"
    ON public.payout_requests FOR ALL
    TO authenticated
    USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
END $$;

-- platform_settings
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  is_public boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can read platform settings" ON public.platform_settings;
  CREATE POLICY "Public can read platform settings"
    ON public.platform_settings FOR SELECT
    TO public
    USING (is_public = true);
END $$;

-- subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(12,2) NOT NULL,
  interval text NOT NULL DEFAULT 'month',
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON public.subscription_plans;
  CREATE POLICY "Anyone can view active subscription plans"
    ON public.subscription_plans FOR SELECT
    TO authenticated
    USING (is_active = true);
END $$;

-- subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
  CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL, -- e.g., 'sale', 'refund', 'payout'
  status text NOT NULL DEFAULT 'completed',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can view their transactions" ON public.transactions;
  CREATE POLICY "Store owners can view their transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
  CREATE POLICY "System can insert transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
END $$;

-- usage_tracking
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event text NOT NULL,
  properties jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own usage tracking" ON public.usage_tracking;
  CREATE POLICY "Users can view their own usage tracking"
    ON public.usage_tracking FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
END $$;

-- wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  balance numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can view their wallet" ON public.wallets;
  CREATE POLICY "Store owners can view their wallet"
    ON public.wallets FOR SELECT
    TO authenticated
    USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Store owners can update their wallet" ON public.wallets;
  CREATE POLICY "Store owners can update their wallet"
    ON public.wallets FOR UPDATE
    TO authenticated
    USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));
END $$;
