# Croque ton Sud V4 — recette Preview

## Pré-requis Preview
1. Appliquer `20260919_v4_multicity_languages_admins.sql` puis `20260919_v4_traveler_secure.sql` sur l'environnement de test.
2. Déployer la fonction Supabase `traveler-session`.
3. Déployer cette branche sur Vercel Preview avec les variables Supabase existantes.
4. Ne pas modifier `main` avant recette complète.

## Tests critiques
- Connexion admin autorisée / refus compte non autorisé.
- Administrateur principal voit « Ajouter un administrateur » ; secondaire ne le voit pas.
- Création conciergerie, logement mono-ville et multi-ville.
- QR permanent : scan actif, QR bloqué, seuil 80 %, seuil 100 %.
- Voyageur mono-ville : ville directe → FR/EN → PDF.
- Voyageur multi-ville : uniquement villes autorisées → FR/EN → PDF.
- Aucun nom de conciergerie/adresse/version technique affiché au voyageur.
- Guide publié unique par ville + langue ; remplacement sans changement du QR.
- Lien établissement `/r/<token>` redirige et journalise l'interaction.
- Sans session voyageur, interaction établissement enregistrée sans attribution inventée.
- Statistiques : scans, pages vues, ouvertures guide, clics externes, langues.
- Rapports : conciergerie, client, commercial établissement, partenaire.
- Suspension/réactivation : historique conservé et page voyageur indisponible.
- Responsive Mac/iPhone et navigation complète.
