# Guide de Test - Fonctionnalités Classes Étudiants

## 🎯 Objectif
Tester les nouvelles fonctionnalités permettant aux étudiants de rejoindre et gérer leurs classes.

## 📋 Fonctionnalités Implémentées

### 1. Backend - Nouvelles Routes et Contrôleurs
- ✅ **Route GET `/api/classes/student`** : Récupérer les classes d'un étudiant
- ✅ **Contrôleur `getStudentClasses()`** : Logique pour récupérer les classes
- ✅ **Route POST `/api/classes/join/:inviteCode`** : Rejoindre une classe (existait déjà)

### 2. Frontend - Nouveaux Composants
- ✅ **`JoinClassModal`** : Modal pour rejoindre une classe avec code d'invitation
- ✅ **`StudentClassesPanel`** : Panel d'affichage des classes de l'étudiant
- ✅ **`JoinClassButton`** : Bouton réutilisable pour rejoindre une classe

### 3. Frontend - Intégrations
- ✅ **Dashboard étudiant** : Ajout du panel des classes
- ✅ **Page Classes** : Affichage conditionnel selon le rôle (enseignant/étudiant)
- ✅ **Navbar** : Liens "Mes Classes" et "Rejoindre une Classe" pour les étudiants
- ✅ **DataContext** : Fonctions `getStudentClasses()` et `joinClassByCode()`
- ✅ **Styles CSS** : Styles spécifiques pour les nouveaux composants

## 🧪 Procédure de Test

### Étape 1 : Préparer les Comptes de Test

#### Compte Enseignant
- **Email** : prof.martin@example.com
- **Mot de passe** : password123
- **Rôle** : teacher

#### Compte Étudiant  
- **Email** : Utiliser un des comptes étudiants existants ou créer un nouveau
- **Rôle** : student

### Étape 2 : Tests Côté Enseignant

1. **Connexion Enseignant**
   - Se connecter avec le compte enseignant
   - Vérifier l'accès au dashboard enseignant

2. **Créer une Classe**
   - Aller sur "Mes Classes" dans la navbar
   - Cliquer "Créer une nouvelle classe"
   - Remplir les informations :
     - Nom : "Test Classe Étudiants"
     - Description : "Classe pour tester les fonctionnalités étudiants"
     - Max étudiants : 30
     - Cocher "Permettre l'auto-inscription"
   - Créer la classe

3. **Noter le Code d'Invitation**
   - Dans la liste des classes, noter le code d'invitation (6 caractères)
   - Exemple : ABC123

### Étape 3 : Tests Côté Étudiant

1. **Connexion Étudiant**
   - Se déconnecter du compte enseignant
   - Se connecter avec un compte étudiant

2. **Vérifier l'Interface Étudiant**
   - Vérifier que le dashboard affiche le contenu étudiant
   - Vérifier la présence du composant "Mes Classes" (vide au début)
   - Vérifier les liens navbar : "Mes Classes" et "Rejoindre une Classe"

3. **Test 1 : Rejoindre via Dashboard**
   - Dans le dashboard, section "Actions rapides"
   - Cliquer "Rejoindre une classe"
   - Saisir le code d'invitation récupéré de l'enseignant
   - Vérifier le succès de l'opération

4. **Test 2 : Rejoindre via Page Dédiée**
   - Aller sur "Rejoindre une Classe" dans la navbar
   - Saisir un nouveau code d'invitation (créer une autre classe si nécessaire)
   - Vérifier le succès et la redirection

5. **Test 3 : Visualiser les Classes**
   - Aller sur "Mes Classes" dans la navbar
   - Vérifier l'affichage des classes rejointes
   - Vérifier les informations affichées :
     - Nom de la classe
     - Description
     - Nom de l'enseignant
     - Date de rejointe
     - Nombre de collections (si applicable)

6. **Test 4 : Interface Vide**
   - Créer un nouveau compte étudiant
   - Vérifier l'affichage de l'état vide dans "Mes Classes"
   - Vérifier le bouton "Rejoindre ma première classe"

## ✅ Critères de Validation

### Interface Utilisateur
- [ ] Le panel des classes s'affiche dans le dashboard étudiant
- [ ] La page "Mes Classes" fonctionne pour les étudiants
- [ ] La navbar affiche les bons liens selon le rôle
- [ ] Les modals s'ouvrent et se ferment correctement
- [ ] Les styles CSS s'appliquent correctement

### Fonctionnalités
- [ ] Un étudiant peut rejoindre une classe avec un code valide
- [ ] Les erreurs s'affichent pour les codes invalides
- [ ] Les classes rejointes apparaissent dans la liste
- [ ] Les informations des classes sont correctes
- [ ] L'état vide s'affiche quand aucune classe n'est rejointe

### Backend
- [ ] La route `/api/classes/student` fonctionne
- [ ] La route `/api/classes/join/:code` fonctionne
- [ ] Les permissions sont respectées (étudiants seulement)
- [ ] Les données sont correctement sauvegardées

## 🚨 Cas d'Erreur à Tester

1. **Code d'Invitation Invalide**
   - Saisir un code inexistant → Message d'erreur approprié
   - Saisir un code de mauvaise longueur → Validation

2. **Classe Inactive**
   - Essayer de rejoindre une classe désactivée → Erreur

3. **Classe Pleine**
   - Essayer de rejoindre une classe à capacité max → Erreur

4. **Déjà Inscrit**
   - Essayer de rejoindre une classe déjà rejointe → Message approprié

## 📝 Problèmes Connus à Vérifier

1. **Gestion des IDs** : Vérifier la cohérence entre `_id` et `id`
2. **Dates** : Vérifier l'affichage des dates de rejointe
3. **Permissions** : S'assurer que les enseignants ne voient pas l'interface étudiant
4. **Responsive** : Tester sur différentes tailles d'écran

## 🎉 Fonctionnalités Bonus Possibles

Si le temps le permet, tester aussi :
- Navigation vers les détails d'une classe
- Affichage des collections partagées
- Statistiques sur les classes rejointes
- Tri et filtrage des classes

---

**Note** : Ce guide couvre les fonctionnalités de base. D'autres améliorations peuvent être ajoutées selon les besoins futurs.
