# Spaced Revision - Backend API

Backend pour l'application Spaced Revision, construit avec Node.js, Express et MongoDB.

## Structure du projet

```
backend/
  ├── config/         # Configuration (DB, env)
  ├── controllers/    # Logique métier
  ├── models/         # Modèles MongoDB
  ├── routes/         # Routes API
  ├── middleware/     # Middleware (auth, validation)
  ├── utils/          # Fonctions utilitaires
  ├── uploads/        # Fichiers téléchargés (images, etc.)
  ├── .env            # Variables d'environnement
  └── server.js       # Point d'entrée
```

## Installation

1. **Cloner le projet**

```bash
git clone <url-du-repo>
cd memoire/backend
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env` à la racine du projet avec le contenu suivant:

```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/spaced-revision
JWT_SECRET=votre_secret_jwt_ici
JWT_EXPIRE=30d
UPLOAD_PATH=./uploads
```

## Utilisation

### Démarrer le serveur

```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start
```

### Importer des données initiales

```bash
# Importer les données de test
npm run data:import

# Supprimer toutes les données
npm run data:destroy
```

## API Endpoints

### Utilisateurs

- `POST /api/users` - Enregistrer un nouvel utilisateur
- `POST /api/users/login` - Authentifier un utilisateur
- `GET /api/users/profile` - Obtenir le profil de l'utilisateur connecté
- `PUT /api/users/profile` - Mettre à jour le profil de l'utilisateur

### Collections

- `POST /api/collections` - Créer une nouvelle collection
- `GET /api/collections` - Obtenir toutes les collections de l'utilisateur
- `GET /api/collections/:id` - Obtenir une collection par ID
- `PUT /api/collections/:id` - Mettre à jour une collection
- `DELETE /api/collections/:id` - Supprimer une collection
- `GET /api/collections/public` - Obtenir toutes les collections publiques
- `GET /api/collections/popular` - Obtenir les collections populaires

### Flashcards

- `POST /api/flashcards` - Créer une nouvelle flashcard
- `GET /api/flashcards/collection/:collectionId` - Obtenir toutes les flashcards d'une collection
- `GET /api/flashcards/:id` - Obtenir une flashcard par ID
- `PUT /api/flashcards/:id` - Mettre à jour une flashcard
- `DELETE /api/flashcards/:id` - Supprimer une flashcard
- `GET /api/flashcards/review/today` - Obtenir les flashcards à réviser aujourd'hui
- `PUT /api/flashcards/:id/review` - Mettre à jour l'état de révision d'une flashcard
- `GET /api/flashcards/stats` - Obtenir les statistiques des flashcards de l'utilisateur

### Sessions de révision

- `POST /api/reviews` - Créer une nouvelle session de révision
- `GET /api/reviews` - Obtenir toutes les sessions de révision de l'utilisateur
- `GET /api/reviews/:id` - Obtenir une session de révision par ID
- `PUT /api/reviews/:id` - Mettre à jour une session de révision
- `GET /api/reviews/stats` - Obtenir les statistiques des sessions de révision

## Modèles de données

### User

- `name`: Nom de l'utilisateur
- `email`: Email de l'utilisateur
- `password`: Mot de passe (hashé)
- `profileImage`: Image de profil
- `joinDate`: Date d'inscription
- `preferences`: Préférences utilisateur (mode sombre, notifications, langue)

### Collection

- `name`: Nom de la collection
- `description`: Description de la collection
- `imageUrl`: URL de l'image de la collection
- `user`: Référence à l'utilisateur propriétaire
- `isPublic`: Indique si la collection est publique
- `category`: Catégorie de la collection
- `tags`: Tags associés à la collection
- `lastStudied`: Date de dernière étude
- `cardsCount`: Nombre de cartes dans la collection

### Flashcard

- `collection`: Référence à la collection
- `question`: Question de la carte
- `answer`: Réponse de la carte
- `difficulty`: Difficulté (easy, medium, hard)
- `status`: Statut (new, learning, review, mastered)
- `nextReviewDate`: Date de prochaine révision
- `reviewHistory`: Historique des révisions
- `user`: Référence à l'utilisateur propriétaire
- `cardType`: Type de carte (basic, cloze, image, multiple-choice)
- `interval`: Intervalle de répétition (en jours)
- `easeFactor`: Facteur de facilité (pour l'algorithme SM-2)

### ReviewSession

- `user`: Référence à l'utilisateur
- `collection`: Référence à la collection
- `startTime`: Heure de début
- `endTime`: Heure de fin
- `duration`: Durée de la session (en secondes)
- `cardsReviewed`: Cartes révisées pendant la session
- `mode`: Mode de révision (classic, quiz, typing)
- `completed`: Indique si la session est terminée
- `score`: Score obtenu (pourcentage de bonnes réponses)

## Algorithme de répétition espacée

L'application utilise une version adaptée de l'algorithme SM-2 pour la planification des répétitions.

1. **Performance rating**:
   - `again` (0): Réponse incorrecte, à revoir rapidement
   - `hard` (1): Réponse correcte mais difficile
   - `good` (2): Réponse correcte
   - `easy` (3): Réponse correcte et facile

2. **Calcul de l'intervalle**:
   - Pour une réponse `again`: intervalle réduit (0.1 jour)
   - Pour une réponse `hard`: intervalle légèrement augmenté (intervalle * 1.2)
   - Pour une réponse `good`: intervalle augmenté (intervalle * facteur de facilité)
   - Pour une réponse `easy`: intervalle fortement augmenté (intervalle * facteur de facilité * 1.3)

3. **Ajustement du facteur de facilité**:
   - Pour une réponse `again`: réduit de 0.2 (min 1.3)
   - Pour une réponse `hard`: réduit de 0.15 (min 1.3)
   - Pour une réponse `good`: inchangé
   - Pour une réponse `easy`: augmenté de 0.15

## Authentification

L'authentification utilise des tokens JWT. Pour accéder aux routes protégées, incluez le token dans l'en-tête de la requête:

```
Authorization: Bearer <votre_token_jwt>
```

## Tests

*À venir*

## Licence

*À définir*
