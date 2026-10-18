-- Run once in Supabase SQL Editor. Existing subscriptions and accounts are unchanged.
-- Public profiles need to know only whether to show ads; the subscriptions table
-- itself must NOT be made publicly readable because it contains Stripe identifiers.

CREATE OR REPLACE FUNCTION public.zaso_profile_is_ad_free(profile_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions AS s
    WHERE s.user_id = profile_id
      AND s.plan IN ('pro', 'elite')
      AND s.status IN ('active', 'trialing')
  );
$$;

REVOKE ALL ON FUNCTION public.zaso_profile_is_ad_free(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.zaso_profile_is_ad_free(uuid) TO anon, authenticated;
