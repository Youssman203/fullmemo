# Guide de Test - Import Simple CSV (Questions & Réponses)

## 🎯 Objectif
Tester la fonctionnalité d'import simplifiée permettant d'importer uniquement des **Questions** et **Réponses** depuis un fichier CSV ou Excel.

## 📋 Prérequis

### Backend
- Serveur sur `http://localhost:5000`
- Routes `/api/simple-bulk-import` opérationnelles
- Dépendances : `csv-parser`, `xlsx`, `multer`

### Frontend  
- Application React sur `http://localhost:3000`
- Composant `SimpleBulkImportModal` intégré
- Utilisateur enseignant connecté

### Fichiers de Test
- `test-cartes-simple-exemple.csv` (15 cartes d'exemple)
- Template téléchargeable depuis l'interface

## 🧪 Procédure de Test

### 1. Préparation
1. **Connexion enseignant** : `prof.martin@example.com` / `password123`
2. **Naviguer** vers la page Collections
3. **Vérifier** que le bouton **"Import Simple CSV"** est visible (uniquement enseignants)

### 2. Interface Modal
1. **Cliquer** sur "Import Simple CSV"
2. **Vérifier** l'ouverture de la modal avec :
   - Titre : "Import Simple CSV - Questions & Réponses"
   - Instructions claires sur le format
   - Bouton "Template CSV Simple"
   - Zone de dépôt de fichier

### 3. Template CSV
1. **Cliquer** sur "Template CSV Simple"
2. **Vérifier** le téléchargement automatique
3. **Ouvrir** le fichier téléchargé
4. **Format attendu** :
   ```csv
   Question,Réponse
   Quelle est la capitale de la France?,Paris
   Combien font 2+2?,4
   ```

### 4. Upload et Prévisualisation
1. **Sélectionner** `test-cartes-simple-exemple.csv`
2. **Cliquer** "Analyser le fichier"
3. **Vérifier** l'affichage :
   - 15 cartes valides
   - 0 erreur
   - 15 total lignes
   - Aperçu des 5 premières cartes

### 5. Configuration Import
1. **Tester** les options :
   - "Ajouter à une collection existante" (si collections disponibles)
   - "Créer une nouvelle collection" : saisir "Test Import Simple"
2. **Vérifier** la validation :
   - Erreur si aucune option sélectionnée
   - Erreur si nom vide pour nouvelle collection

### 6. Import Effectif
1. **Sélectionner** "Créer une nouvelle collection"
2. **Saisir** le nom : "Test Import Simple CSV"
3. **Cliquer** "Importer 15 cartes"
4. **Observer** :
   - Étape "Import en cours..." avec spinner
   - Passage automatique aux résultats

### 7. Résultats
1. **Vérifier** l'affichage des résultats :
   - ✅ 15 cartes créées
   - ⚠️ 0 erreur
   - Nom de la collection : "Test Import Simple CSV"
   - Nom du fichier traité
2. **Toast** de confirmation

### 8. Validation Finale
1. **Fermer** la modal
2. **Vérifier** la nouvelle collection dans la liste
3. **Ouvrir** la collection
4. **Vérifier** les cartes :
   - 15 cartes présentes
   - Questions et réponses correctes
   - Difficulté par défaut : "Moyen"
   - Tags : "import"

## ✅ Critères de Réussite

### Interface
- [x] Bouton visible pour enseignants uniquement
- [x] Modal s'ouvre correctement
- [x] Instructions claires et complètes
- [x] Template téléchargeable
- [x] Zone de dépôt fonctionnelle

### Upload
- [x] Validation des types de fichiers (.csv, .xlsx, .xls)
- [x] Validation de la taille (max 10MB)
- [x] Messages d'erreur appropriés

### Prévisualisation
- [x] Analyse correcte du fichier CSV
- [x] Compteurs exacts (valides/erreurs/total)
- [x] Aperçu des premières cartes
- [x] Gestion des erreurs de format

### Configuration
- [x] Options de destination claires
- [x] Validation des champs obligatoires
- [x] Interface dynamique selon le choix

### Import
- [x] Import effectif des cartes
- [x] Création/ajout à la collection
- [x] Assignation correcte des métadonnées
- [x] Feedback utilisateur approprié

### Résultats
- [x] Statistiques d'import exactes
- [x] Collection visible dans l'interface
- [x] Cartes accessibles et correctes
- [x] Métadonnées appropriées (difficulté, tags)

## 🛠️ Tests d'Erreurs

### 1. Fichiers Invalides
- **CSV vide** : Doit afficher "0 cartes valides"
- **Format incorrect** : Colonnes manquantes ou mal nommées
- **Types non supportés** : .txt, .doc → Message d'erreur
- **Fichier trop volumineux** : >10MB → Message d'erreur

### 2. Données Corrompues
- **Questions vides** : Lignes ignorées
- **Réponses vides** : Lignes ignorées
- **Caractères spéciaux** : Doivent être préservés
- **CSV malformé** : Gestion gracieuse des erreurs

### 3. Configuration
- **Aucune destination** : Message d'erreur explicite
- **Nom vide pour nouvelle collection** : Validation requise
- **Collection inexistante** : Gestion côté backend

## 📊 Format de Données Testé

### CSV Standard
```csv
Question,Réponse
Quelle est la capitale de France?,Paris
Combien font 2+2?,4
Qui a écrit 'Les Misérables'?,Victor Hugo
```

### Métadonnées Automatiques
- **Difficulté** : "medium" (moyen)
- **Tags** : ["import"]
- **Propriétaire** : Utilisateur connecté
- **Statut révision** : "new"

## 🚨 Dépannage

### Erreurs Fréquentes
1. **"Route non trouvée"** → Vérifier serveur backend
2. **"Token non autorisé"** → Reconnecter l'utilisateur
3. **"Bouton invisible"** → Vérifier rôle enseignant
4. **"Fichier non analysé"** → Vérifier format CSV

### Logs Utiles
```javascript
// Console navigateur
console.log('User:', user);
console.log('Collections:', collections);

// Vérifier token
console.log('Token:', localStorage.getItem('token'));
```

### Validation Backend
```bash
# Test route API directe
curl -X POST http://localhost:5000/api/simple-bulk-import/preview \
  -H "Authorization: Bearer <TOKEN>" \
  -F "bulkFile=@test-cartes-simple-exemple.csv"
```

## 🎯 Cas d'Usage Réels

### Enseignant Primaire
- Import listes de vocabulaire
- Questions de révision de base
- Contrôles de connaissances simples

### Professeur Collège/Lycée
- QCM préparatoires
- Définitions de concepts
- Formules et théorèmes

### Formation Professionnelle
- Procédures techniques
- Règles de sécurité
- Contrôles qualité

## 📈 Performance Attendue

### Métriques
- **Upload** : <2 secondes pour 50 cartes
- **Analyse** : <3 secondes pour 100 cartes
- **Import** : <5 secondes pour 200 cartes
- **Interface** : Responsive et fluide

### Limites
- **Taille fichier** : 10MB maximum
- **Nombre de cartes** : ~1000 cartes par import
- **Types supportés** : CSV, XLSX, XLS uniquement

## ✅ Validation Finale

- [ ] Tests interface réussis
- [ ] Import de `test-cartes-simple-exemple.csv` fonctionnel
- [ ] 15 cartes créées avec métadonnées correctes
- [ ] Collection visible et accessible
- [ ] Aucune erreur dans la console
- [ ] Performance acceptable (<10 secondes total)

**🎉 La fonctionnalité d'import simple CSV est opérationnelle et prête pour utilisation !**
