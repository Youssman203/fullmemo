# 🧪 Guide de Test - Système de Rôles Étudiant/Enseignant

## 📋 Comptes de Test Disponibles

### 👨‍🏫 Compte Enseignant
- **Email** : `prof.martin@example.com`
- **Mot de passe** : `password123`
- **Rôle** : Enseignant

### 👩‍🎓 Compte Étudiant
- **Email** : `marie.dubois@example.com`
- **Mot de passe** : `password123`
- **Rôle** : Étudiant

## 🎯 Scénarios de Test

### 1. Test d'Inscription avec Sélection de Rôle

#### Étapes :
1. Aller sur `/register`
2. Remplir le formulaire d'inscription
3. **Vérifier** : Sélecteur de rôle avec options "Étudiant" et "Enseignant"
4. Tester l'inscription avec chaque rôle
5. **Résultat attendu** : Compte créé avec le bon rôle

### 2. Test de l'Interface Enseignant

#### Étapes :
1. Se connecter avec le compte enseignant
2. Aller sur le Dashboard (`/home`)
3. **Vérifier** : 
   - Composant RoleTest affiche "Enseignant"
   - TeacherPanel visible avec statistiques
   - Lien "Mes Classes" dans la sidebar

#### Fonctionnalités à tester :
- **Créer une classe** :
  1. Cliquer sur "Nouvelle Classe" dans le TeacherPanel
  2. Remplir le formulaire de création
  3. **Vérifier** : Classe créée avec code d'invitation généré
  
- **Gestion des classes** :
  1. Aller sur `/classes`
  2. **Vérifier** : Liste des classes avec statistiques
  3. Tester l'invitation d'étudiants par email
  4. **Vérifier** : Code d'invitation copiable

### 3. Test de l'Interface Étudiant

#### Étapes :
1. Se connecter avec le compte étudiant
2. Aller sur le Dashboard (`/home`)
3. **Vérifier** :
   - Composant RoleTest affiche "Étudiant"
   - Pas de TeacherPanel visible
   - Lien "Rejoindre une Classe" dans la sidebar

#### Fonctionnalités à tester :
- **Rejoindre une classe** :
  1. Aller sur `/join-class`
  2. Entrer un code d'invitation valide (obtenu depuis l'enseignant)
  3. **Vérifier** : Adhésion réussie avec message de confirmation

### 4. Test des Permissions API

#### Avec Postman/Thunder Client :

**Routes Enseignant (nécessitent token + role: teacher) :**
```
POST /api/classes
GET /api/classes
POST /api/classes/:id/invite
DELETE /api/classes/:id
```

**Routes Étudiant :**
```
POST /api/classes/join/:inviteCode
```

**Test de sécurité :**
- Tenter d'accéder aux routes enseignant avec un token étudiant
- **Résultat attendu** : Erreur 403 "Permissions enseignant requises"

## 🔍 Points de Vérification

### Interface Conditionnelle
- [ ] Dashboard affiche le bon contenu selon le rôle
- [ ] Sidebar affiche les bons liens selon le rôle
- [ ] Pages protégées par rôle (Classes pour enseignants, JoinClass pour étudiants)

### Fonctionnalités Enseignant
- [ ] Création de classe avec génération automatique de code
- [ ] Invitation d'étudiants par email
- [ ] Statistiques de classe (nombre d'étudiants, collections)
- [ ] Gestion des paramètres de classe

### Fonctionnalités Étudiant
- [ ] Adhésion à une classe via code d'invitation
- [ ] Interface identique à l'original (pas de changement)
- [ ] Accès refusé aux fonctionnalités enseignant

### Sécurité
- [ ] Middleware de rôle fonctionne correctement
- [ ] Tokens JWT incluent le rôle utilisateur
- [ ] Permissions API respectées
- [ ] Isolation des données par utilisateur/classe

## 🚀 Workflow de Test Complet

### Scénario Réaliste :
1. **Enseignant** se connecte et crée une classe "Mathématiques 3ème"
2. **Enseignant** obtient le code d'invitation (ex: ABC123)
3. **Enseignant** partage le code avec l'étudiant
4. **Étudiant** se connecte et utilise le code pour rejoindre la classe
5. **Enseignant** voit l'étudiant dans sa liste de classe
6. **Vérifier** : Toutes les données sont cohérentes

## 🐛 Problèmes Potentiels à Surveiller

### Backend :
- Codes d'invitation en doublon
- Permissions non respectées
- Erreurs de validation des données

### Frontend :
- Composants conditionnels qui ne s'affichent pas
- Erreurs de navigation entre rôles
- États non synchronisés après changement de rôle

### Base de Données :
- Migration des utilisateurs existants
- Intégrité des relations classe-étudiant
- Index manquants sur les champs critiques

## 📊 Métriques de Succès

- ✅ **100%** des utilisateurs existants migrés vers "étudiant"
- ✅ **0** erreur lors du changement de rôle
- ✅ **Interface identique** pour les étudiants
- ✅ **Fonctionnalités supplémentaires** pour les enseignants
- ✅ **Sécurité** : Aucun accès non autorisé

## 🔧 Commandes Utiles

### Vérifier les utilisateurs :
```bash
# Backend
node scripts/migrateUserRoles.js
```

### Créer des comptes de test :
```bash
# Enseignant
node scripts/createTeacherUser.js

# Étudiant  
node scripts/createStudentUser.js
```

### Démarrer l'application :
```bash
# Backend (port 5000)
cd backend && node server.js

# Frontend (port 3000)
cd spaced-revision && npm start
```

---

**🎯 Objectif** : Valider que le système de rôles fonctionne parfaitement sans impacter l'expérience utilisateur existante pour les étudiants, tout en ajoutant des fonctionnalités puissantes pour les enseignants.
