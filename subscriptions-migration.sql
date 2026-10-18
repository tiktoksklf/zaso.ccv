-- Run once in Supabase SQL Editor. Existing accounts and subscription rows are preserved.
alter table public.subscriptions add column if not exists current_period_end timestamptz;
alter table public.subscriptions add column if not exists cancel_at_period_end boolean not null default false;
create unique index if not exists subscriptions_stripe_customer_unique on public.subscriptions(stripe_customer_id) where stripe_customer_id is not null;
create unique index if not exists subscriptions_stripe_subscription_unique on public.subscriptions(stripe_subscription_id) where stripe_subscription_id is not null;
-- Subscription writes must be server-side only. Review any pre-existing UPDATE/INSERT policies
-- and remove them if they allow authenticated users to modify plan/status/Stripe IDs.
