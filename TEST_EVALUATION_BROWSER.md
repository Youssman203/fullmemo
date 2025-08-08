# 🧪 Test de la Page d'Évaluation - Guide Complet

## 📋 Prérequis
- Backend démarré sur port 5000 ✅
- Frontend démarré sur port 3000 ✅
- Navigateur ouvert sur http://localhost:3000

## 🔐 Étape 1 : Connexion Enseignant

1. **Aller sur la page de connexion**
   - URL : http://localhost:3000/login
   - Ou cliquer sur "Se connecter" dans la navbar

2. **Se connecter avec le compte enseignant**
   ```
   Email : prof.martin@example.com
   Mot de passe : password123
   ```

3. **Vérifier la connexion**
   - ✅ Redirection vers le dashboard
   - ✅ Nom "Prof. Martin Dupont" affiché
   - ✅ Rôle "Enseignant" visible

## 📊 Étape 2 : Accéder à la Page d'Évaluation

### Option A : Via la Navigation
1. Dans la sidebar gauche, cliquer sur **"Évaluation"**
2. Ou dans la navbar, cliquer sur **"Évaluation"**

### Option B : URL Directe
- Naviguer vers : http://localhost:3000/evaluation

## ✅ Étape 3 : Vérifier l'Affichage des Données

### Ce qui devrait s'afficher :

1. **Titre de la page**
   - "Évaluation des Étudiants"

2. **Statistiques Globales** (en haut)
   - Nombre total d'étudiants
   - Sessions totales
   - Score moyen global
   - Dernière activité

3. **Liste des Étudiants**
   - Tableau ou cartes avec :
     - Nom de l'étudiant
     - Email
     - Nombre de sessions
     - Score moyen
     - Dernière session
     - Types de sessions (révision, quiz, test)

4. **Actions disponibles**
   - Bouton "Voir détails" pour chaque étudiant

## 🔍 Étape 4 : Tester les Détails d'un Étudiant

1. **Cliquer sur "Voir détails"** d'un étudiant
2. **Vérifier la modal qui s'ouvre** avec :
   - Onglet "Sessions récentes"
   - Onglet "Statistiques"
   - Liste des sessions avec scores
   - Possibilité de voir les détails de chaque session

## 🐛 Dépannage

### Si la page est vide ou affiche "Aucun étudiant"

1. **Vérifier l'API backend** :
   ```bash
   cd c:\memoire\backend
   node scripts/testEvaluationFinal.js
   ```
   - Devrait afficher les données des étudiants

2. **Vérifier la console du navigateur** :
   - F12 → Console
   - Chercher des erreurs 401 (authentification)
   - Chercher des erreurs 404 (route non trouvée)

3. **Vérifier le token JWT** :
   - F12 → Application → Local Storage
   - Vérifier que "userInfo" contient un token

### Si erreur 401 Unauthorized
- Se déconnecter et se reconnecter
- Vérifier que le compte est bien un enseignant

### Si erreur 404 Not Found
- Vérifier que l'URL est `/evaluation` et non `/stats`
- Vérifier que le backend est bien démarré

## 📝 Résultats Attendus

✅ **Succès** si :
- La page affiche au moins 1 étudiant (Étudiant Test)
- Les statistiques sont visibles
- Les détails des sessions sont accessibles
- Pas d'erreurs dans la console

❌ **Échec** si :
- Page blanche ou erreur
- Message "Accès non autorisé"
- Données non affichées
- Erreurs 401/404 dans la console

## 🔄 Test Complet Automatisé

Pour un test rapide :
1. Backend : `node scripts/testEvaluationFinal.js`
2. Si OK → Tester dans le navigateur
3. Si KO → Vérifier les logs backend

## 📌 Notes Importantes

- La page d'évaluation est réservée aux enseignants
- Les étudiants sont automatiquement redirigés
- Les données proviennent de l'API `/api/evaluation/students`
- Le composant est dans `src/pages/Stats.js` (nommé Evaluation)
