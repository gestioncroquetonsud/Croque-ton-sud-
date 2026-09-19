# Croque ton Sud — V4 testable (work branch)

This package is for the `v4-testable` branch only. Do not deploy it over `main` before preview validation.

Implemented in this checkpoint:
- V4 navigation and visual shell
- Dashboard V4 visual hierarchy and quick actions
- Establishments screen + tracked-link copy UI
- Settings V4 with cities, guides, QR 50/80/100, notifications, reports, owner/secondary admin model and suspended items
- Statistics V4 funnel, language split and report actions
- Alerts V4 with resolve + suspend/reactivate controls
- Guides V4 FR/EN UI and language-aware upload (requires migration)
- Properties multi-city creation UI (requires migration)
- QR global create/download/send workflow; ZIP grouped by concierge/property
- V4 SQL migration for property_cities, guide language and admin role

Important preview requirements:
1. Apply `supabase/migrations/20260919_v4_multicity_languages_admins.sql` to a preview/staging database first.
2. `Envoyer le dossier` intentionally generates/downloads the ZIP then opens the mail composer; automatic attachment requires a transactional email provider and server-side implementation.
3. Traveler multi-city + FR/EN secure session routing still requires the V4 server/edge routing layer before production.
4. Do not merge to `main` until `npm run build` passes in Vercel Preview and the traveler flow is validated.
