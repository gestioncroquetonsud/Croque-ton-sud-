# Croque ton Sud — BackOffice V2

BackOffice Next.js pour gérer les conciergeries, logements, QR permanents, guides PDF, alertes et statistiques Croque ton Sud.

## Déjà fonctionnel dans cette V2
- Authentification Supabase email/mot de passe avec restriction UI à `gestion.croquetonsud@gmail.com`
- Protection des routes par middleware
- Dashboard connecté aux vues statistiques Supabase
- Création des conciergeries
- Création d’un logement + génération automatique de son QR en base
- Liste logements / conciergeries avec statistiques réelles
- QR permanent par logement, blocage/réactivation manuel
- Téléchargement QR en PNG HD, SVG vectoriel et PDF A4
- Alertes réelles et résolution manuelle
- Statistiques mensuelles réelles
- Guides PDF : historique des versions déjà connecté à la base (upload Storage à finaliser)
- Déconnexion administrateur
- Design responsive avec charte officielle Croque ton Sud

## Installation
1. Copier `.env.example` vers `.env.local`.
2. `npm install`
3. `npm run dev`

Le projet utilise uniquement la clé **publishable** Supabase côté navigateur. Ne jamais exposer une clé `service_role`.

## Étapes suivantes
- Bucket Supabase Storage privé pour les PDF
- Upload brouillon + publication atomique + historique
- Endpoint public `/g/[token]` avec journalisation des scans et alerte à 50 scans/mois
- Envoi automatique des fichiers QR à l’adresse opérationnelle
- Synchronisation GitHub et déploiement Vercel

## V3 — traveler flow and PDF publishing
- Private `city-guides` Supabase Storage bucket (PDF only, 50 MB max)
- Admin-only Storage RLS policies
- PDF upload as draft with automatic city versioning
- Publish/preview workflow
- Public `/g/[token]` traveler page
- `qr-scan` Edge Function validates QR status, logs scan, checks monthly threshold, creates alert, and returns a short-lived signed PDF URL
