# zaso.cc — Creator Profiles V2

Updated 2026-10-17.

## What changed

- Replaced the five starter looks with seven redesigned editorial profile layouts:
  After Hours, Velvet, Noir, Eclipse, Jade, Champagne, and Ember.
- A single `profile-renderer.js` now powers **public profiles and template demos**, so both pages use the same components.
- Dashboard offers a redesigned gallery, a custom eyebrow/heading, a public Solana wallet address, an on/off switch for the wallet, and optional custom accent override.
- A new public **My Wallet** card puts estimated **USD** first and displays SOL amount as supporting context, plus copy-address and Solscan links.
- The wallet is **view-only**; it never requests a wallet connection, private key or seed phrase and cannot move funds.
- Existing users whose theme was `nocturne`, `aurora`, `editorial`, `obsidian`, or `solstice` automatically map to a new look. No profile migrations or SQL required.
- Free-profile ad placeholder and brand remain; paid profile branding is suppressed.
- Existing Supabase authentication, profiles, links, Stripe checkout and billing pages remain unchanged.

## Deploy on GitHub Pages

1. Back up the current repo or download a ZIP before updating.
2. From `zaso-template-upgrade-only.zip`, extract and upload **all seven files** to your repository root, replacing existing files of the same name:
   - dashboard.html
   - profile.html
   - template-preview.html
   - templates.css
   - effects.css
   - profile-renderer.js (new)
   - wallet.js (new)
3. Keep `CNAME`, `index.html`, `auth.html`, `supabase-config.js`, Stripe setup, and every other existing file as they are.
4. Commit and wait for GitHub Pages to deploy; hard refresh the site.
5. In dashboard, preview a template, enter a *public* Solana address, select Show My Wallet, and click Save profile.
6. Open your public profile with `profile.html?u=YOUR_USERNAME`. Its balance, if available, will be estimated in USD.

## Wallet data / safety notes

- Mainnet Solana **native SOL** balance only. SPL tokens, NFTs and other coins in the wallet are *not included*. This is not a complete wallet portfolio valuation.
- Estimated USD = native SOL balance (lamports) × current SOL/USD price. Values change and may be delayed, unavailable, or rate-limited; this is not a price feed for trading.
- Public APIs used client-side (fallbacks provided): Solana public RPC / PublicNode for native balance, CoinGecko / Coinbase for SOL/USD pricing. There is no API key stored in the HTML. Providers may impose rate limits or CORS restrictions; if so, the UI reports **Unavailable** instead of fabricating a balance. For commercial reliability, put this behind a cached Supabase Edge Function or a paid provider.
- A wallet address, its balance and requests to third-party RPC/price providers are publicly visible to visitors. Do not paste seed phrases, keys or secrets into the public wallet field.
- The full-screen template page uses *explicitly labeled demo wallet figures* that are not live.
- Current themes require no SQL changes because profile settings already persist as `profiles.theme` JSON.

## Important publishing checks

- Existing Pro/Elite plan gating, refund/legal disclosures and Stripe webhooks remain the responsibility of the site's existing backend setup. Do not place Stripe secrets in GitHub.
- Run actual in-browser checks after deployment on desktop and mobile, including profile load and wallet refresh; mocked unit tests cannot guarantee public provider availability.
