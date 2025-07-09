# Spaced Revision - Application d'apprentissage par répétition espacée

Application moderne permettant d'apprendre efficacement grâce à la technique de répétition espacée. L'application utilise un algorithme adapté de SM-2 pour optimiser les intervalles de révision.

## Structure du projet

```
memoire/
  ├── backend/           # API Node.js + MongoDB
  └── spaced-revision/   # Frontend React
```

## Technologies utilisées

### Backend
- Node.js avec Express
- MongoDB avec Mongoose
- JWT pour l'authentification
- Architecture MVC

### Frontend
- React 18
- React Router v6
- Context API
- Bootstrap 5
- Axios pour les requêtes API

## Installation et démarrage

### Prérequis
- Node.js v16+ et npm
- MongoDB installé et en cours d'exécution

### Installation du backend

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
# (le fichier .env est déjà créé)

# Importer des données de test (optionnel)
npm run data:import
```

### Installation du frontend

```bash
# Aller dans le dossier frontend
cd ../spaced-revision

# Installer les dépendances
npm install
```

### Démarrage de l'application

#### En mode développement

```bash
# Dans un premier terminal, démarrer le backend
cd backend
npm run dev

# Dans un second terminal, démarrer le frontend
cd spaced-revision
npm start
```

L'application sera accessible à l'adresse: [http://localhost:3000](http://localhost:3000)
L'API sera accessible à l'adresse: [http://localhost:5000](http://localhost:5000)

## Fonctionnalités principales

- 🔐 Authentification complète (inscription, connexion, déconnexion)
- 📚 Création et gestion de collections de cartes
- 🧠 Système de répétition espacée basé sur l'algorithme SM-2
- 📊 Statistiques d'apprentissage détaillées
- 📱 Interface responsive

## Modèle de données

### Utilisateurs
- Gestion des comptes et profils utilisateurs
- Préférences personnalisées

### Collections
- Organisation des flashcards par thèmes/sujets
- Partage public/privé

### Flashcards
- Questions/réponses avec support multimédia
- Suivi de progression individuelle

### Sessions de révision
- Enregistrement des performances
- Statistiques d'apprentissage

## API Endpoints

Voir le fichier `backend/README.md` pour la documentation complète de l'API.

## Développement futur

- Intégration de l'authentification Google côté backend
- Fonctionnalités sociales et partage communautaire
- Support pour les flashcards multimédias (images, audio)
- Applications mobiles natives
