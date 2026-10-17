ZASO.CC — GitHub Pages + Supabase starter

Upload all files in this ZIP to the ROOT of your GitHub Pages repository.
Keep index.html, auth.html, dashboard.html, profile.html, 404.html, app.css and supabase-config.js together.

Supabase Auth URL configuration: Site URL https://zaso.cc ; Redirect URLs https://zaso.cc/** and localhost as needed.

Existing SQL tables/RLS from your earlier setup are used.
The first profile save happens after verification and sign-in. Unique username is enforced in the database.

IMPORTANT: This is an initial working version. Username availability is not a reservation until profile save.
GitHub Pages 404.html supports /username URLs as a fallback, but it is not true server-side routing.
Paid subscription checkout, media uploads, analytics collection and ad-network integration are NOT implemented.
Free-tier profiles show a placeholder ad area, not real advertisements.
The homepage preview remains a static design demonstration. The published profiles use the starter profile template.
For production: add reserved username rules, abuse prevention, server-side subscription webhooks, secure analytics ingestion, and proper error monitoring.
