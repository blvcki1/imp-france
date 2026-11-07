# Plateforme d'Accompagnement à la Restitution d'Impôt sur le Revenu

Plateforme web sécurisée conçue spécifiquement pour accompagner les personnes éloignées des démarches administratives dans la récupération de leur trop-perçu ou de leurs crédits d'impôt auprès de la DGFiP (Finances Publiques).

---

## 🚀 Démarrage Rapide

### Option 1 : En 1 Clic (Windows)
Double-cliquez sur le fichier :
👉 **`lancer-application.bat`**

### Option 2 : En ligne de commande
```bash
npm run dev
```
Rendez-vous ensuite sur : **[http://localhost:3000](http://localhost:3000)**

---

## 🌟 Fonctionnalités Clés

### 1. Parcours Bénéficiaire Simple & Mobile-Friendly (`/`)
* **Étape 1 - Profil :** Coordonnées de base (Nom, Prénom, Téléphone joignable, Ville, numéro fiscal facultatif).
* **Étape 2 - Pièce d'identité :** CNI (recto/verso), Passeport ou Titre de séjour. Possibilité de prendre une photo nette directement depuis le smartphone.
* **Étape 3 - Avis d'imposition 2026 (ou récent) :** Avis d'impôt ou ASDIR.
* **Étape 4 - 3 Dernières fiches de paie :** Bulletins de salaire ou attestations pour calculer le prélèvement à la source.
* **Étape 5 - Facture EDF & RIB :** Justificatif de domicile (< 3 mois) et RIB pour le versement bancaire.
* **Attribution Immédiate du Code de Dossier :** Génération d'un code unique (ex : `IMP-2026-X8K9P2`) avec bouton pour copier ou imprimer le reçu.

### 2. Suivi de Dossier en Direct (`/suivi`)
* Le bénéficiaire saisit son code unique.
* Visualisation de l'état d'avancement en 4 étapes :
  1. *Dossier déposé*
  2. *Vérification des pièces*
  3. *Démarche déposée auprès de la DGFiP*
  4. *Restitution validée / Virement en cours*
* Affichage des notes publiques laissées par votre équipe.

### 3. Agent d'Assistance en Ligne & Live Chat (Partout sur le site)
* **Bulle flottante en bas à droite :** Toujours accessible pour rassurer et guider les personnes en difficulté.
* **Réponse instantanée 24/7 :** Spécialisé sur la restitution fiscale française (règles de la DGFiP, pièces à fournir, fiches de paie, justificatif EDF, crédits d'impôt pour non-imposables).
* **Questions rapides en 1 clic :** « Quels documents fournir ? », « Je gagne peu, ai-je droit ? », etc.
* **Supervision humaine en direct :** Les conseillers peuvent voir toutes les conversations dans l'espace `/admin` et intervenir manuellement dans la discussion.

### 4. Espace Gestionnaire & Conseillers (`/admin`)
* **Accès sécurisé par code PIN** (Code par défaut : **`2026`**).
* Tableau de bord avec indicateurs clés (Total dossiers, En attente, Déposés DGFiP, Restitutions validées).
* Moteur de recherche et filtres par statut.
* **Fiche détaillée par dossier :**
  * Consultation et téléchargement des documents en 1 clic.
  * Changement de statut avec message d'information direct pour le bénéficiaire.
  * Saisie du montant estimé et du montant réellement restitué (€).
  * Fil de notes internes privées pour le suivi des contacts.

---

## 🔒 Moyen de Stockage & Sécurité des Données

* **Fichiers physiques :** Stockés hors du répertoire public dans `data/storage/dossiers/{CODE_DOSSIER}/` pour empêcher tout accès direct non autorisé sur internet.
* **Base de données :** Stockée localement de manière sécurisée et atomique dans `data/dossiers.json`.
* **Accès aux pièces :** Exclusivement via l'API sécurisée `/api/documents/{dossierId}/{fileId}`.
* **Conformité RGPD :** Case de consentement explicite, limitation stricte de l'usage des données à la démarche fiscale.

