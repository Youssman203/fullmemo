# 📮 TEST POSTMAN - CORRECTIF IMPORT COLLECTIONS

## 🎯 Objectif
Valider que l'étudiant voit la collection après import et que l'enseignant ne la voit plus en doublon.

## 📋 Prérequis
1. **Backend** : `http://localhost:5000` en cours
2. **Enseignant connecté** : `prof.martin@example.com`
3. **Étudiant connecté** : `etudiant.test@example.com`
4. **Code de partage** généré par l'enseignant

---

## 🔧 ÉTAPE 1 : Récupération des tokens

### A. Token Enseignant
```bash
# Dans navigateur enseignant (F12 → Console)
localStorage.getItem('token')
# Copier le résultat → [TOKEN_ENSEIGNANT]
```

### B. Token Étudiant  
```bash
# Dans navigateur étudiant (F12 → Console)
localStorage.getItem('token')  
# Copier le résultat → [TOKEN_ETUDIANT]
```

---

## 🧪 ÉTAPE 2 : Tests Postman

### Test 1 : Collections Enseignant (AVANT)
```http
GET http://localhost:5000/api/collections?refresh=true
Authorization: Bearer [TOKEN_ENSEIGNANT]
Cache-Control: no-cache
```

**Résultat attendu :** Nombre collections initial (ex: 3)

---

### Test 2 : Collections Étudiant (AVANT)
```http
GET http://localhost:5000/api/collections?refresh=true
Authorization: Bearer [TOKEN_ETUDIANT]  
Cache-Control: no-cache
```

**Résultat attendu :** Nombre collections initial (ex: 1)

---

### Test 3 : Import Collection via Code
```http
POST http://localhost:5000/api/share/import/[CODE_PARTAGE]
Authorization: Bearer [TOKEN_ETUDIANT]
Content-Type: application/json
```

**Remplacer `[CODE_PARTAGE]`** par le code généré (ex: `ABC123`)

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Collection \"[NOM]\" importée avec succès",
  "data": {
    "collection": {
      "_id": "...",
      "name": "[NOM] (Importé)",
      "user": "[ETUDIANT_ID]"
    }
  }
}
```

---

### Test 4 : Collections Étudiant (APRÈS)
```http
GET http://localhost:5000/api/collections?refresh=true&t={{timestamp}}
Authorization: Bearer [TOKEN_ETUDIANT]
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
```

**Résultat attendu :** 
- Nombre collections = initial + 1
- Collection avec "(Importé)" visible
- Pas de doublons

---

### Test 5 : Collections Enseignant (APRÈS)  
```http
GET http://localhost:5000/api/collections?refresh=true&t={{timestamp}}
Authorization: Bearer [TOKEN_ENSEIGNANT]
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
```

**Résultat attendu :**
- Nombre collections = identique à AVANT
- Aucune collection ajoutée
- Pas de duplication

---

## ✅ Validation Succès

### Côté Étudiant
- ✅ **Collections +1** par rapport à avant
- ✅ **Collection visible** avec "(Importé)"
- ✅ **user field** = ID étudiant
- ✅ **Pas de doublons** (même ID une seule fois)

### Côté Enseignant  
- ✅ **Collections identiques** avant/après
- ✅ **Aucune collection ajoutée**
- ✅ **Pas de duplication**

### Backend Logs
- ✅ **Logs visible** : "Nouvelle collection créée"
- ✅ **userId correct** dans logs
- ✅ **Cache busting headers** appliqués

---

## ❌ Diagnostic Échec

### Si Étudiant ne voit pas la collection
1. **Vérifier token** : Pas expiré, bon format
2. **Vérifier userId** : Logs backend vs token
3. **Tester cache busting** : Paramètre `t=` et headers
4. **Clear localStorage** : Navigateur étudiant

### Si Enseignant voit doublons
1. **Vérifier logs déduplication** : Backend et frontend
2. **Tester avec token différent** : Session propre
3. **Vider cache navigateur** : Enseignant
4. **Vérifier base données** : MongoDB Compass

### Si Collections disparaissent après F5
1. **Problème auth** : Token expiré
2. **Problème cache** : Headers pas respectés  
3. **Problème base** : Collection pas sauvée
4. **Problème query** : MongoDB find() incorrect

---

## 🔄 Test de Persistance

### Après import réussi :

1. **Actualiser navigateur** étudiant → Collections doivent rester
2. **Se déconnecter/reconnecter** → Collections doivent rester  
3. **Test après délai** (1h+) → Collections doivent rester

### Curl alternatif :
```bash
# Étudiant - Test persistance
curl -X GET "http://localhost:5000/api/collections?refresh=true&t=$(date +%s)" \
  -H "Authorization: Bearer [TOKEN_ETUDIANT]" \
  -H "Cache-Control: no-cache"
```

---

## 🎯 Résultats Attendus Finaux

| Utilisateur | Avant Import | Après Import | Après F5 |
|-------------|--------------|--------------|----------|
| **Enseignant** | N collections | N collections | N collections |
| **Étudiant** | M collections | M+1 collections | M+1 collections |

**N** = Nombre initial enseignant  
**M** = Nombre initial étudiant  
**Différence** = Collection importée visible uniquement chez étudiant

---

## ⚡ Script de Test Rapide

```bash
#!/bin/bash
# test-import-quick.sh

echo "🧪 Test Rapide Import Collection"

# Variables (à modifier)
TEACHER_TOKEN="eyJ..." 
STUDENT_TOKEN="eyJ..."
SHARE_CODE="ABC123"
BASE_URL="http://localhost:5000"

echo "📊 Collections enseignant AVANT:"
curl -s -X GET "$BASE_URL/api/collections?refresh=true" \
  -H "Authorization: Bearer $TEACHER_TOKEN" | jq '.data | length'

echo "📊 Collections étudiant AVANT:"  
curl -s -X GET "$BASE_URL/api/collections?refresh=true" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.data | length'

echo "📥 Import collection..."
curl -s -X POST "$BASE_URL/api/share/import/$SHARE_CODE" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.success'

sleep 2

echo "📊 Collections enseignant APRÈS:"
curl -s -X GET "$BASE_URL/api/collections?refresh=true&t=$(date +%s)" \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Cache-Control: no-cache" | jq '.data | length'

echo "📊 Collections étudiant APRÈS:"
curl -s -X GET "$BASE_URL/api/collections?refresh=true&t=$(date +%s)" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Cache-Control: no-cache" | jq '.data | length'

echo "✅ Test terminé"
```

---

**💡 Le correctif sera validé si les tests Postman montrent que l'étudiant a +1 collection et l'enseignant garde le même nombre !**
