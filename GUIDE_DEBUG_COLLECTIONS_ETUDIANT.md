# 🔍 Guide de Débogage - Collections Étudiant

## 📊 État du Diagnostic

### ✅ Backend Confirmé Fonctionnel
- L'API `/api/classes/:id/collections` fonctionne parfaitement
- L'étudiant peut récupérer les collections partagées
- 3 collections disponibles dans la classe `bac2` (ID: `68884889e4c3c95f0bcd3eed`)

### ❓ Frontend à Déboguer
- Erreur "Erreur lors de la récupération des collections de la classe"
- Logs de débogage ajoutés dans `ClassCollectionsView.js`
- Scripts de test créés

## 🛠️ Étapes de Débogage

### Étape 1: Ouvrir l'Application
1. **Naviguer vers:** `http://localhost:3000`
2. **Se connecter avec:**
   - Email: `etudiant.test@example.com`
   - Mot de passe: `password123`

### Étape 2: Ouvrir la Console de Débogage
1. **Appuyer sur F12** (ou clic droit > Inspecter)
2. **Aller dans l'onglet Console**
3. **Copier-coller le script de test** (voir ci-dessous)

### Étape 3: Exécuter le Script de Test

```javascript
// Copier-coller ce script dans la console du navigateur
fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'etudiant.test@example.com',
    password: 'password123'
  })
}).then(res => res.json()).then(data => {
  localStorage.setItem('token', data.token);
  console.log('✅ Connexion réussie');
  
  // Tester l'API des collections
  return fetch('/api/classes/68884889e4c3c95f0bcd3eed/collections', {
    headers: { 'Authorization': `Bearer ${data.token}` }
  });
}).then(res => res.json()).then(data => {
  console.log('✅ Collections API:', data);
  console.log('Nombre de collections:', data.data.collections.length);
}).catch(error => {
  console.log('❌ Erreur:', error);
});
```

### Étape 4: Navigation vers les Collections
1. **Naviguer vers:** `http://localhost:3000/classes/68884889e4c3c95f0bcd3eed/collections`
2. **Ou utiliser le menu** "Mes Classes" > Sélectionner "bac2" > Voir collections

### Étape 5: Analyser les Logs
Chercher dans la console les logs avec le préfixe `[ClassCollectionsView]`:

```
🔍 [ClassCollectionsView] Début récupération collections
🔍 [ClassCollectionsView] classId: 68884889e4c3c95f0bcd3eed
🔍 [ClassCollectionsView] Appel getClassCollections...
```

## 🎯 Scénarios de Diagnostic

### Scénario A: API Fonctionne, Composant Échoue
**Symptômes:**
- Script de test fonctionne ✅
- Logs `[ClassCollectionsView]` montrent une erreur ❌

**Causes possibles:**
- Problème dans le service `classService.js`
- Problème dans le contexte `DataContext.js`
- Format de réponse inattendu

### Scénario B: Navigation Incorrecte
**Symptômes:**
- Étudiant sur une classe différente
- ID de classe incorrect dans l'URL

**Solution:**
- Vérifier l'URL : doit contenir `68884889e4c3c95f0bcd3eed`
- S'assurer que l'étudiant a rejoint la classe `bac2`

### Scénario C: Token Invalide
**Symptômes:**
- Erreur 401 ou 403
- Authentification échoue

**Solution:**
- Reconnecter l'étudiant
- Vérifier le token dans `localStorage`

## 📋 Checklist de Vérification

### ✅ Prérequis
- [ ] Serveur backend en cours (port 5000)
- [ ] Serveur frontend en cours (port 3000)
- [ ] Étudiant inscrit dans la classe `bac2`
- [ ] Collections partagées dans `bac2` (3 collections)

### ✅ Tests API
- [ ] Connexion étudiant fonctionne
- [ ] API `/api/classes/:id/collections` retourne les données
- [ ] Token d'authentification valide
- [ ] Permissions correctes

### ✅ Tests Frontend
- [ ] Composant `ClassCollectionsView` se monte
- [ ] Logs de débogage apparaissent
- [ ] Appel `getClassCollections` s'exécute
- [ ] Réponse est traitée correctement

## 🚨 Messages d'Erreur Communs

### "Erreur lors de la récupération des collections de la classe"
**Causes:**
1. **Token expiré** → Reconnecter
2. **Classe non trouvée** → Vérifier l'ID de classe
3. **Permissions insuffisantes** → Vérifier que l'étudiant est inscrit
4. **Erreur réseau** → Vérifier les serveurs

### "Cannot read properties of undefined"
**Causes:**
1. **Réponse API malformée** → Vérifier la structure des données
2. **Variable non initialisée** → Vérifier les états React
3. **Appel API échoué** → Vérifier les logs réseau

## 📞 Commandes de Récupération

### Réinitialiser l'État
```javascript
// Dans la console du navigateur
localStorage.clear();
location.reload();
```

### Forcer le Rechargement des Données
```javascript
// Dans la console du navigateur
if (window.refreshData) {
  window.refreshData();
}
```

### Vérifier les Données Locales
```javascript
// Dans la console du navigateur
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

## 🎯 Objectif Final

**L'étudiant doit pouvoir voir:**
1. **Classe:** bac2
2. **Collections partagées:**
   - Geographie
   - Collection Test 1753784557588
   - Collection Test 1753785156379

## 📞 Support

Si le problème persiste après ces étapes :
1. **Copier les logs de la console**
2. **Noter l'étape où ça échoue**
3. **Vérifier l'onglet Network pour les requêtes HTTP**
4. **Prendre une capture d'écran de l'erreur**

---

**🚀 Les serveurs sont opérationnels, l'API fonctionne parfaitement. Le problème est côté frontend et sera identifié avec ces outils de débogage.**
