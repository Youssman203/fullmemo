# 🔗 Test Manuel du Lien Partagé

## 📋 Instructions de Test

### Étape 1: Ouvrir le Frontend
1. Aller sur http://localhost:3000
2. Ouvrir les DevTools (F12)
3. Aller sur l'onglet Console

### Étape 2: Naviguer vers le Lien Partagé
**Option A - Via URL directe :**
```
window.location.href = 'http://localhost:3000/shared/780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b'
```

**Option B - Via Router (dans console) :**
```javascript
// Si React Router est disponible
window.history.pushState({}, '', '/shared/780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b');
```

### Étape 3: Observer les Logs
Avec le debug ajouté, vous devriez voir dans la console :

```
🔍 SharedCollection - Début loadSharedCollection
   Token: 780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b
   Password: [AUCUN]
📡 Appel sharedLinkService.getSharedCollection...
🔗 sharedLinkService.getSharedCollection appelé
   Token: 780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b
   Password: [AUCUN]
   URL complète: http://localhost:5000/api/shared/780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b
   Aucun token auth
   Headers: {Content-Type: 'application/json'}
📡 Fetch en cours...
📨 Response reçue:
   Status: 200
   OK: true
   Data parsed: {success: true, data: {...}}
✅ Response OK, returning data
✅ Réponse reçue: {success: true, data: {...}}
✅ État mis à jour avec succès
🏁 loadSharedCollection terminé
```

## 🎯 Résultats Attendus

### ✅ Si ça marche :
- Page affiche "Collection Partagée: Geographie"
- 3 cartes visibles
- Boutons Import/Téléchargement disponibles
- Logs de debug complets

### ❌ Si ça ne marche pas :
Chercher dans les logs :
- `❌ Erreur chargement collection partagée:`
- `❌ sharedLinkService error:`
- `❌ Response not OK`

## 🔧 Tests API Direct

### Test Backend uniquement :
```bash
curl http://localhost:5000/api/shared/780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b
```

### Test Fetch dans Console :
```javascript
fetch('http://localhost:5000/api/shared/780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b')
  .then(res => res.json())
  .then(data => console.log('API directe:', data))
  .catch(err => console.error('Erreur API:', err));
```

## 📊 Informations de Debug

- **Token**: `780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b`
- **Collection**: Geographie (6 cartes au backend, 3 cartes dans la réponse API)
- **Créateur**: Prof. Martin Dupont
- **Permissions**: view, copy, download
- **Expiration**: 2025-07-30T13:11:46.470Z

## 🚨 Notes importantes

1. **Le backend fonctionne** - Confirmé par les tests automatisés
2. **La route existe** - `/shared/:token` est définie dans App.js 
3. **La route est publique** - En dehors de ProtectedRoute
4. **Le service existe** - sharedLinkService.js est présent

Le problème est probablement :
- Un conflit de routage
- Une erreur dans la gestion des erreurs
- Un problème de CORS
- Une différence entre environnement de test et navigateur
