# 🔧 Guide de Test - Système d'Administration

## 📋 Objectif
Ce guide permet de tester complètement le nouveau système d'administration qui permet la gestion des utilisateurs (enseignants et étudiants).

## 🎯 Prérequis

### Serveurs Lancés
```bash
# Terminal 1 - Backend
cd c:\memoire\backend
npm start

# Terminal 2 - Frontend  
cd c:\memoire\spaced-revision
npm start
```

### URLs de Test
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000
- **Admin Dashboard** : http://localhost:3000/admin

## 👤 Comptes de Test

### Administrateur
- **Email** : admin@spaced-revision.com
- **Mot de passe** : admin123
- **Rôle** : admin

### Enseignant (pour tests)
- **Email** : prof.martin@example.com
- **Mot de passe** : password123
- **Rôle** : teacher

### Étudiant (pour tests)
- **Email** : etudiant.test@example.com
- **Mot de passe** : password123
- **Rôle** : student

## 🧪 Tests à Effectuer

### 1. Test de Connexion Administrateur

1. **Ouvrir** http://localhost:3000/login
2. **Saisir** les identifiants admin
3. **Vérifier** :
   - ✅ Connexion réussie
   - ✅ Redirection vers /home
   - ✅ Badge "Admin" visible dans la sidebar
   - ✅ Section "Administration" visible avec lien "Gestion Système"

### 2. Test d'Accès au Dashboard Admin

1. **Cliquer** sur "Gestion Système" dans la sidebar
2. **Vérifier** l'URL : http://localhost:3000/admin
3. **Contrôler** l'affichage :
   - ✅ Titre "Tableau de bord administrateur"
   - ✅ 4 cartes de statistiques (Utilisateurs, Enseignants, Étudiants, Collections)
   - ✅ 3 cartes de ressources (Cartes Flash, Classes, Administrateurs)
   - ✅ Section "Gestion des utilisateurs" en bas

### 3. Test de Gestion des Utilisateurs

#### Visualisation des Utilisateurs
1. **Observer** le tableau des utilisateurs
2. **Vérifier** :
   - ✅ Liste des utilisateurs avec informations complètes
   - ✅ Badges de rôles colorés (Enseignant/Étudiant/Admin)
   - ✅ Statistiques pour chaque utilisateur
   - ✅ Boutons d'actions (Modifier, Réinitialiser MDP, Supprimer)

#### Recherche et Filtrage
1. **Tester la recherche** :
   - Saisir "martin" → voir prof.martin
   - Saisir "etudiant" → voir compte étudiant
2. **Tester les filtres** :
   - Filtre "Enseignants" → voir uniquement les teachers
   - Filtre "Étudiants" → voir uniquement les students
   - Filtre "Administrateurs" → voir uniquement les admins

### 4. Test de Création d'Utilisateur

1. **Cliquer** "Nouvel utilisateur"
2. **Remplir** le formulaire :
   - Nom : Test Enseignant
   - Email : test.prof@exemple.com
   - Mot de passe : test123
   - Rôle : Enseignant
3. **Vérifier** :
   - ✅ Validation en temps réel
   - ✅ Création réussie avec toast de confirmation
   - ✅ Utilisateur apparaît dans la liste
   - ✅ Statistiques mises à jour

### 5. Test de Modification d'Utilisateur

1. **Cliquer** le bouton "Modifier" (icône crayon)
2. **Modifier** les informations :
   - Changer le nom
   - Modifier le rôle (enseignant → étudiant)
3. **Vérifier** :
   - ✅ Formulaire pré-rempli
   - ✅ Sauvegarde réussie
   - ✅ Changements visibles dans la liste
   - ✅ Badge de rôle mis à jour

### 6. Test de Réinitialisation de Mot de Passe

1. **Cliquer** le bouton "Réinitialiser MDP" (icône clé)
2. **Saisir** un nouveau mot de passe
3. **Vérifier** :
   - ✅ Validation (minimum 6 caractères)
   - ✅ Confirmation de réinitialisation
   - ✅ Toast de succès

### 7. Test de Suppression d'Utilisateur

1. **Créer** un utilisateur de test
2. **Cliquer** le bouton "Supprimer" (icône poubelle)
3. **Vérifier** la modal de confirmation :
   - ✅ Avertissement de suppression définitive
   - ✅ Information sur les données associées
4. **Confirmer** la suppression
5. **Vérifier** :
   - ✅ Utilisateur supprimé de la liste
   - ✅ Statistiques mises à jour

### 8. Test des Statistiques Système

1. **Observer** les statistiques en temps réel :
   - Total utilisateurs
   - Répartition par rôle
   - Utilisateurs récents (7 derniers jours)
   - Ressources système
2. **Créer/supprimer** des utilisateurs
3. **Vérifier** :
   - ✅ Mise à jour automatique des compteurs
   - ✅ Pourcentages corrects
   - ✅ Données cohérentes

### 9. Test de Sécurité

#### Protection des Routes Admin
1. **Se connecter** avec un compte enseignant
2. **Essayer** d'accéder à http://localhost:3000/admin
3. **Vérifier** :
   - ✅ Redirection vers /home
   - ✅ Pas d'accès au dashboard admin
   - ✅ Section "Administration" invisible dans la sidebar

#### API Protection
1. **Ouvrir** les DevTools → Network
2. **Effectuer** des actions admin
3. **Vérifier** les headers Authorization avec JWT
4. **Tester** l'accès direct aux endpoints :
   ```bash
   # Sans token - doit échouer
   curl http://localhost:5000/api/admin/users
   
   # Avec token non-admin - doit échouer  
   curl -H "Authorization: Bearer TOKEN_TEACHER" http://localhost:5000/api/admin/users
   ```

### 10. Test des Interfaces Responsives

1. **Réduire** la taille de la fenêtre (mobile)
2. **Vérifier** :
   - ✅ Interface adaptée mobile
   - ✅ Navigation fonctionnelle
   - ✅ Tableaux scrollables
   - ✅ Modales adaptées

## 📊 Critères de Validation

### ✅ Réussite
- Toutes les fonctionnalités fonctionnent correctement
- Interface responsive et intuitive
- Sécurité respectée (protection des routes)
- Données cohérentes et à jour
- Messages d'erreur appropriés

### ❌ Échec
- Erreurs JavaScript dans la console
- Routes admin accessibles aux non-admins
- Données incohérentes ou non mises à jour
- Interface cassée ou non responsive
- Problèmes de performance

## 🔧 Dépannage

### Problèmes Courants

#### Erreur 401 "Non autorisé"
- Vérifier que l'utilisateur est bien connecté
- Régénérer le token si nécessaire

#### Dashboard vide ou erreurs
- Vérifier la connexion MongoDB
- Contrôler les logs serveur backend

#### Interface non responsive
- Vider le cache navigateur
- Vérifier l'import des CSS

#### Statistiques incorrectes
- Redémarrer le serveur backend
- Vérifier les données en base

## 🎯 Tests API Directs

### Script de Test Backend (Optionnel)

```javascript
// À exécuter dans la console navigateur après connexion admin
const testAdminAPI = async () => {
  const token = localStorage.getItem('token');
  
  try {
    // Test récupération utilisateurs
    const users = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Users:', await users.json());
    
    // Test statistiques
    const stats = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Stats:', await stats.json());
    
  } catch (error) {
    console.error('Erreur API:', error);
  }
};

// Lancer le test
testAdminAPI();
```

## 🎉 Résultat Attendu

À la fin des tests, le système d'administration doit être :
- ✅ **Complètement fonctionnel**
- ✅ **Sécurisé et protégé**
- ✅ **Intuitif et moderne**
- ✅ **Responsive sur tous écrans**
- ✅ **Intégré harmonieusement**

Le rôle administrateur apporte une nouvelle dimension de gestion complète du système !

---
**📞 Support** : En cas de problème, vérifier les logs backend et la console navigateur pour identifier l'erreur précise.
