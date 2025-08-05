# ✅ Checklist de Test - Système d'Administration

## 🎯 Test Rapide - 10 Minutes

### 🔐 Connexion Admin
- [ ] Aller sur http://localhost:3000/login
- [ ] Saisir : `admin@spaced-revision.com` / `admin123`
- [ ] Vérifier la connexion réussie
- [ ] Observer le badge "Admin" dans la sidebar

### 🏠 Dashboard Admin  
- [ ] Naviguer vers `/admin` ou cliquer "Admin Dashboard"
- [ ] Vérifier l'affichage des statistiques :
  - [ ] Nombre total d'utilisateurs
  - [ ] Nombre d'enseignants  
  - [ ] Nombre d'étudiants
  - [ ] Nombre de collections
  - [ ] Nombre de cartes
- [ ] Vérifier que l'interface est en thème violet (admin-theme)

### 👥 Gestion des Utilisateurs
- [ ] Cliquer sur "Gérer les Utilisateurs"
- [ ] Vérifier la liste des utilisateurs existants
- [ ] Tester la recherche par nom/email
- [ ] Tester le filtre par rôle (Tous/Étudiants/Enseignants)

### ➕ Création d'Utilisateur
- [ ] Cliquer "Créer un Utilisateur"
- [ ] Remplir le formulaire :
  - [ ] Nom : "Test Admin User"
  - [ ] Email : "test-admin@example.com"
  - [ ] Mot de passe : "testpass123"
  - [ ] Rôle : "Étudiant"
- [ ] Valider et vérifier la création
- [ ] Voir le nouvel utilisateur dans la liste

### ✏️ Modification d'Utilisateur
- [ ] Cliquer "Modifier" sur l'utilisateur de test
- [ ] Changer le nom en "Modified Test User"
- [ ] Changer le rôle en "Enseignant"
- [ ] Sauvegarder les modifications
- [ ] Vérifier les changements dans la liste

### 🔑 Réinitialisation de Mot de Passe
- [ ] Cliquer "Réinitialiser MDP" sur l'utilisateur de test
- [ ] Saisir nouveau mot de passe : "newpass123"
- [ ] Confirmer la réinitialisation
- [ ] Vérifier le message de succès

### 🗑️ Suppression d'Utilisateur
- [ ] Cliquer "Supprimer" sur l'utilisateur de test
- [ ] Confirmer la suppression
- [ ] Vérifier que l'utilisateur a disparu de la liste

### 🛡️ Sécurité et Autorisations
- [ ] Se déconnecter de l'admin
- [ ] Se connecter avec un compte enseignant/étudiant
- [ ] Tenter d'accéder à `/admin`
- [ ] Vérifier la redirection (accès interdit)
- [ ] Vérifier que les liens admin ne s'affichent pas

## 📊 Critères de Réussite

### ✅ Interface
- [ ] Thème violet admin visible
- [ ] Navigation fluide entre les sections
- [ ] Statistiques affichées correctement
- [ ] Modals et formulaires fonctionnels

### ✅ Fonctionnalités CRUD
- [ ] Création d'utilisateur : OK
- [ ] Lecture/Liste : OK
- [ ] Modification : OK  
- [ ] Suppression : OK
- [ ] Réinitialisation mot de passe : OK

### ✅ Sécurité
- [ ] Accès admin protégé
- [ ] Middleware d'autorisation fonctionnel
- [ ] Routes protégées correctement

### ✅ UX/UI
- [ ] Interface responsive
- [ ] Messages de feedback (toasts)
- [ ] Validation des formulaires
- [ ] Pagination fonctionnelle (si >10 utilisateurs)

## 🚨 Problèmes Potentiels

### Si connexion admin échoue :
```bash
cd backend
node scripts/createAdminUser.js
```

### Si interface ne charge pas :
- Vérifier serveurs : backend:5000 et frontend:3000
- Vérifier console navigateur pour erreurs
- Vérifier network tab pour appels API

### Si erreurs API :
- Vérifier token JWT valide
- Vérifier middleware requireAdmin
- Vérifier routes /api/admin/* configurées

## 🎯 URLs de Test

- **Login** : http://localhost:3000/login
- **Dashboard Admin** : http://localhost:3000/admin  
- **API Users** : http://localhost:5000/api/admin/users
- **API Stats** : http://localhost:5000/api/admin/stats

## 📞 Support

En cas de problème, vérifier :
1. Logs serveur backend
2. Console navigateur (F12)
3. Guide complet : `GUIDE_TEST_ADMINISTRATION.md`

---
**⏱️ Durée estimée : 10-15 minutes**  
**🎯 Objectif : Valider la fonctionnalité admin complète**
