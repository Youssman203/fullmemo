# 🚀 Test Rapide - Correction des Rôles

## ✅ Corrections Appliquées

### Backend (`userController.js`)
- ✅ Ajout du traitement du champ `role` dans l'inscription
- ✅ Inclusion du `role` dans toutes les réponses API
- ✅ Valeur par défaut `student` si aucun rôle spécifié

### Frontend (`authService.js`)
- ✅ Correction de la sauvegarde des données utilisateur
- ✅ Le rôle est maintenant correctement stocké dans localStorage

## 🧪 Tests à Effectuer

### 1. Test d'Inscription Enseignant
1. Aller sur `/register`
2. Remplir le formulaire avec :
   - Nom : `Test Enseignant`
   - Email : `test.enseignant@example.com`
   - **Sélectionner "Enseignant"** 📍
   - Mot de passe : `password123`
3. Cliquer sur "Créer mon compte"
4. **Vérifier** : Le composant RoleTest doit afficher "Rôle : teacher"

### 2. Test d'Inscription Étudiant
1. Aller sur `/register` (dans un nouvel onglet/session)
2. Remplir le formulaire avec :
   - Nom : `Test Étudiant`
   - Email : `test.etudiant@example.com`
   - **Sélectionner "Étudiant"** 📍
   - Mot de passe : `password123`
3. Cliquer sur "Créer mon compte"
4. **Vérifier** : Le composant RoleTest doit afficher "Rôle : student"

### 3. Vérification du Dashboard
- **Enseignant** : Doit voir le TeacherPanel avec statistiques
- **Étudiant** : Interface classique sans TeacherPanel

### 4. Vérification de la Navigation
- **Enseignant** : Lien "Mes Classes" dans la sidebar
- **Étudiant** : Lien "Rejoindre une Classe" dans la sidebar

## 🔍 Points de Vérification

### Console du Navigateur
Ouvrir les DevTools (F12) et vérifier :
```javascript
// Dans la console, taper :
JSON.parse(localStorage.getItem('user'))
// Doit afficher un objet avec le champ 'role' correct
```

### Composant RoleTest
Le composant doit afficher :
- ✅ **isTeacher()** : Oui (pour enseignants) / Non (pour étudiants)
- ✅ **isStudent()** : Non (pour enseignants) / Oui (pour étudiants)
- ✅ **getUserRole()** : teacher / student

## 🚨 Si le Problème Persiste

### Nettoyage du Cache
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Application/Storage
3. Supprimer les données de localStorage :
   - `user`
   - `token`
4. Rafraîchir la page et tester à nouveau

### Vérification Backend
Les utilisateurs créés via les scripts ont les bons rôles :
- `prof.martin@example.com` → teacher
- `marie.dubois@example.com` → student

### Logs de Debug
Si le problème persiste, ajouter des logs dans le formulaire d'inscription :
```javascript
console.log('Données envoyées:', userData);
```

## 🎯 Résultat Attendu

Après les corrections :
1. ✅ Les nouveaux comptes enseignants ont le rôle "teacher"
2. ✅ Les nouveaux comptes étudiants ont le rôle "student" 
3. ✅ L'interface s'adapte correctement selon le rôle
4. ✅ La navigation affiche les bons liens

## 📞 Aide au Debug

Si les rôles ne s'affichent toujours pas :

### Vérifier l'API Response
Dans DevTools > Network, lors de l'inscription/connexion :
- Chercher la requête `POST /api/users` ou `POST /api/users/login`
- Vérifier que la réponse contient bien le champ `role`

### Vérifier le localStorage
```javascript
// Console du navigateur
console.log('User data:', JSON.parse(localStorage.getItem('user')));
console.log('Token:', localStorage.getItem('token'));
```

Le problème devrait maintenant être **résolu** ! 🎉
