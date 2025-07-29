# 📚 Guide Étudiant - Collections Partagées

## 🎯 Vue d'ensemble

Ce guide explique comment utiliser les fonctionnalités de **partage et téléchargement de collections** en tant qu'étudiant.

### ✨ Fonctionnalités disponibles :
- **Accès aux collections partagées** via liens sécurisés
- **Copie d'informations** des collections
- **Téléchargement** des collections complètes
- **Import** dans vos collections personnelles
- **Révision en ligne** sans téléchargement
- **Gestion** de vos collections accessibles

---

## 🚀 Accès rapide

### Via le Dashboard
1. **Connectez-vous** en tant qu'étudiant
2. Dans **"Actions rapides"**, cliquez sur **"Collections partagées"**
3. Vous accédez directement à vos collections partagées

### Via la Navigation
1. Dans la sidebar, cliquez sur **"Collections Partagées"**
2. Accès direct à l'interface de gestion

---

## 🔗 Accéder à une nouvelle collection partagée

### Méthode 1 : Via un lien complet
```
https://localhost:3000/shared/68884889e4c3c95f0bcd3eed
```
1. **Cliquez** directement sur le lien fourni par votre enseignant
2. La collection s'ouvre automatiquement

### Méthode 2 : Via l'interface
1. Allez dans **"Collections Partagées"**
2. Cliquez **"Accéder à une collection"**
3. **Collez** le lien ou token dans le champ
4. Cliquez **"Accéder"**

### Formats de liens acceptés :
- **URL complète** : `https://localhost:3000/shared/TOKEN`
- **Token seul** : `68884889e4c3c95f0bcd3eed`
- **Lien direct** : `/shared/TOKEN`

---

## 🔒 Collections protégées par mot de passe

### Si une collection nécessite un mot de passe :
1. **Saisissez** le lien comme d'habitude
2. Une popup **"Mot de passe requis"** apparaît
3. **Entrez** le mot de passe fourni par l'enseignant
4. Cliquez **"Valider"**

### 💡 Conseil :
Le mot de passe est généralement communiqué avec le lien par votre enseignant.

---

## 📖 Utiliser une collection partagée

### Actions disponibles sur chaque collection :

#### 🔍 **Voir**
- **Fonction** : Visualiser les cartes de la collection
- **Accès** : Direct via le bouton "Voir"
- **Contenu** : Questions, réponses, catégories, difficultés

#### 🎮 **Réviser**
- **Fonction** : Révision interactive en ligne
- **Modes** : Quiz, test, révision espacée
- **Avantage** : Aucun téléchargement nécessaire

#### 📥 **Importer**
- **Fonction** : Copier la collection dans vos collections personnelles
- **Prérequis** : Être connecté
- **Résultat** : Collection disponible en permanence
- **Protection** : Évite les doublons automatiquement

#### 📋 **Copier infos**
- **Fonction** : Copier les détails de la collection
- **Format** : Texte structuré avec emojis
- **Usage** : Partage avec d'autres étudiants

#### 💾 **Télécharger**
- **Fonction** : Sauvegarder la collection localement
- **Formats** : JSON (complet) ou CSV (simple)
- **Usage** : Backup, utilisation hors ligne

---

## 📊 Gestion des collections dans vos classes

### Via "Mes Classes" → "Collections"

#### Actions supplémentaires disponibles :

#### 📄 **Copier infos** (format enrichi)
```
📚 Collection: Géographie Europe
📖 Description: Capitales et pays européens
🃏 Cartes: 25
👨‍🏫 Enseignant: Prof. Martin
📅 Créé le: 15 janvier 2024
```

#### 📁 **Télécharger les infos**
- **Format** : Fichier JSON avec métadonnées
- **Contenu** : Informations de la collection (sans les cartes)
- **Usage** : Documentation, suivi de progression

---

## 🛠️ Fonctionnalités avancées

### 🗂️ Sauvegarde automatique
- **Fonction** : Les collections accessibles sont sauvegardées localement
- **Persistance** : Retrouvez vos collections même après fermeture
- **Synchronisation** : Mise à jour automatique des statuts

### ⚡ Accès hors ligne partiel
- **Collections importées** : Disponibles hors ligne
- **Collections partagées** : Nécessitent une connexion
- **Révision** : Possible hors ligne pour les collections importées

### 🔄 Gestion des doublons
- **Protection automatique** : Évite les imports multiples
- **Détection intelligente** : Par nom, description et tags
- **Notification** : Alerte en cas de tentative de doublon

---

## 📱 Interface utilisateur

### 🎨 Codes couleur
- 🟢 **Vert** : Actions de révision et apprentissage
- 🔵 **Bleu** : Actions de visualisation
- 🟠 **Orange** : Actions de copie et partage
- 🟣 **Violet** : Actions de téléchargement
- 🔴 **Rouge** : Collections expirées ou problèmes

### 🏷️ Badges d'information
- **🔒 Protégé** : Collection avec mot de passe
- **⏰ Expire le** : Date d'expiration
- **❌ Expiré** : Collection non accessible
- **📊 25 cartes** : Nombre de cartes

---

## 🚨 Résolution de problèmes

### ❌ "Lien invalide"
**Causes possibles :**
- Format de lien incorrect
- Token manquant ou malformé
- Lien tronqué lors de la copie

**Solutions :**
- Vérifiez le format du lien
- Demandez un nouveau lien à votre enseignant
- Essayez avec le token seul

### 🔒 "Mot de passe incorrect"
**Solutions :**
- Vérifiez la casse (majuscules/minuscules)
- Demandez confirmation du mot de passe
- Attention aux espaces en début/fin

### ⏰ "Collection expirée"
**Solutions :**
- Contactez votre enseignant pour renouveler
- Si importée, elle reste dans vos collections personnelles

### 🚫 "Import impossible"
**Causes possibles :**
- Collection déjà importée
- Permissions insuffisantes
- Problème de connexion

**Solutions :**
- Vérifiez si déjà présente dans vos collections
- Reconnectez-vous
- Contactez l'enseignant

---

## 💡 Conseils d'utilisation

### 🎯 Bonnes pratiques

#### Pour la révision :
1. **Commencez** par "Voir" pour découvrir
2. **Révisez** en ligne pour tester
3. **Importez** si vous voulez garder définitivement

#### Pour le partage :
1. **Copiez les infos** pour partager avec des camarades
2. **Respectez** les droits d'auteur de l'enseignant
3. **Ne partagez pas** les mots de passe publiquement

#### Pour l'organisation :
1. **Nommez clairement** vos collections importées
2. **Organisez** par matière ou thème
3. **Supprimez** les collections obsolètes de votre liste

### ⚡ Astuces
- **Raccourci** : `Ctrl+C` pour copier rapidement les infos
- **Navigation** : Utilisez les onglets pour comparer les collections
- **Sauvegarde** : Téléchargez les collections importantes en backup

---

## 🤝 Support et aide

### 📞 En cas de problème :
1. **Vérifiez** d'abord ce guide
2. **Demandez** à un camarade de classe
3. **Contactez** votre enseignant
4. **Signalez** les bugs techniques à l'administrateur

### 📈 Pour améliorer l'expérience :
- Vos **commentaires** sont les bienvenus
- Proposez des **améliorations**
- Partagez vos **astuces** avec la classe

---

## 🎉 Bon apprentissage !

Ce système vous permet d'accéder facilement aux ressources partagées par vos enseignants tout en gardant le contrôle sur vos propres collections.

**N'hésitez pas à explorer** toutes les fonctionnalités pour optimiser votre apprentissage ! 🚀
