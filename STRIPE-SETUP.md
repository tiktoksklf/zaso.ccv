# Zaso Stripe + Supabase deployment

The site HTML is ready, but real checkout will NOT work until you deploy the three Supabase Edge Functions and configure Stripe secrets and webhook. No private credentials are embedded in the website.

## 1. Database
Run `supabase/subscriptions-migration.sql` in the Supabase SQL editor. Existing subscriptions and profiles remain intact. Ensure users cannot INSERT/UPDATE subscriptions through public RLS; only service-role functions should write them. Existing subscription SELECT policy for the owner should remain.

## 2. Secrets (Supabase dashboard → Edge Functions → Secrets)
Set `STRIPE_SECRET_KEY` to your live `sk_live_...` key, `STRIPE_WEBHOOK_SECRET` to your Stripe live webhook `whsec_...`. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` if not already injected by Supabase. Never place these in GitHub or browser JavaScript. Price IDs are hardcoded to the live prices you supplied.

## 3. Deploy functions
Install Supabase CLI, log in and link project `taisoikscxytvgmcgjgr`, then from the project folder run:

```
supabase login
supabase link --project-ref taisoikscxytvgmcgjgr
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy billing-portal --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

The checkout and portal functions independently verify the user's Supabase bearer token. The webhook verifies the Stripe signature. CORS permits zaso.cc and www.zaso.cc.

## 4. Stripe webhook
Stripe Dashboard → Developers → Webhooks → Add destination. Endpoint:
`https://taisoikscxytvgmcgjgr.supabase.co/functions/v1/stripe-webhook`
Subscribe to: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the LIVE signing secret to Supabase secrets.

## 5. Stripe customer portal
Stripe → Settings → Billing → Customer portal: enable the portal and cancellation. If you want users to switch between Pro and Elite within the portal, configure the subscription update feature and include both products. Stripe handles prorations based on your portal settings.

## 6. Website
Upload the files to the GitHub Pages repository root (preserve CNAME). Homepage Pro/Elite links open dashboard; signed-out users are prompted to log in, then can select a plan on the dashboard. Logged-in users are linked to their existing Supabase ID. A verified webhook updates their plan. After Stripe approval and webhooks, test using a small real transaction or test-mode configuration in a separate staging environment.

## Important
- Existing users keep their profiles. Stripe subscriptions attach to their Supabase user ID.
- Payment success page is informational; only a verified webhook updates the plan.
- This does not implement feature gating for Pro/Elite; implement secure feature entitlements before promising paid-only functionality.
- Annual prices are NOT enabled; only monthly recurring prices were supplied.
- The Supabase dashboard's service-role key and Stripe secrets must remain private.
- Stripe billing portal can fail until enabled/configured in Stripe.
- Check Stripe and Supabase webhook logs after testing. A webhook failure should trigger Stripe retries.
