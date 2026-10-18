ZASO.CC MOBILE PRO AD-SPACE FIX

WHAT CHANGED
The public profile used to read subscriptions directly. Under Supabase RLS,
logged-out visitors (such as a mobile browser) may get no subscription row,
so even Pro profiles were treated as Free and rendered the ad placeholder.

This patch uses a public SECURITY DEFINER RPC returning only an ad-free boolean.
It never makes customer/subscription identifiers publicly readable.
If the RPC fails temporarily, the page does not insert ads.

INSTALL (BOTH STEPS REQUIRED)
1) Supabase Dashboard -> SQL Editor -> New Query:
   Copy all of ad-free-visibility.sql and click Run.
2) GitHub repository: REPLACE the existing root profile.html with this updated
   profile.html, commit, and wait for GitHub Pages to publish.
   Leave all other site files alone.
3) Open a Pro profile in mobile private/incognito mode and hard refresh.
   Expected: no 'Advertisement space' area. Free profiles still have an ad area.

Do NOT place the Supabase SQL file in GitHub and expect it to run: execute it
in Supabase SQL Editor. No need to change Stripe or user subscriptions.
