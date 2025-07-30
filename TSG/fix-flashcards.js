/**
 * Script de correction pour le fichier Flashcards.js
 * Ce script va corriger les problèmes de gestion des collections dans les cartes
 */
const fs = require('fs');
const path = require('path');

// Chemin du fichier à corriger
const flashcardsPath = path.join(__dirname, 'spaced-revision', 'src', 'pages', 'Flashcards.js');
const cardCollectionDisplayPath = path.join(__dirname, 'spaced-revision', 'src', 'components', 'CardCollectionDisplay.js');

// Vérifier si le fichier CardCollectionDisplay.js existe déjà
if (!fs.existsSync(cardCollectionDisplayPath)) {
  // Créer le composant CardCollectionDisplay.js
  const cardCollectionDisplayContent = `import React from 'react';

/**
 * Composant utilitaire pour afficher le nom d'une collection de manière sécurisée
 * @param {Object} props - Les propriétés du composant
 * @param {Array} props.collections - Liste des collections disponibles
 * @param {string|Object} props.cardOrCollectionId - ID de la collection ou objet carte
 * @returns {string} - Le nom de la collection ou "Inconnu" si non trouvée
 */
const getCollectionName = (collections, cardOrCollectionId) => {
  try {
    // Si aucun ID n'est fourni, retourner 'Inconnu'
    if (cardOrCollectionId === undefined || cardOrCollectionId === null) {
      return 'Inconnu';
    }
    
    // Si on reçoit une carte complète au lieu d'un ID
    if (typeof cardOrCollectionId === 'object' && cardOrCollectionId !== null) {
      // Utiliser soit collectionId soit collection de la carte
      const collectionId = cardOrCollectionId.collectionId || cardOrCollectionId.collection;
      if (!collectionId) {
        return 'Inconnu';
      }
      return getCollectionName(collections, collectionId); // Appel récursif avec l'ID extrait
    }
    
    // Vérifier si collections existe
    if (!collections || !Array.isArray(collections)) {
      return 'Inconnu';
    }
    
    // Convertir l'ID en chaîne pour les comparaisons
    const idToFind = String(cardOrCollectionId);
    
    // Rechercher la collection par ID
    const collection = collections.find(c => {
      if (!c) return false;
      
      // Extraire les IDs de manière sécurisée
      const cId = c.id ? String(c.id) : '';
      const c_Id = c._id ? String(c._id) : '';
      
      return cId === idToFind || c_Id === idToFind;
    });
    
    return collection ? collection.name : 'Inconnu';
  } catch (error) {
    console.error('Erreur dans getCollectionName:', error);
    return 'Inconnu';
  }
};

/**
 * Composant pour afficher le nom d'une collection
 */
const CardCollectionDisplay = ({ collections, cardOrCollectionId }) => {
  const collectionName = getCollectionName(collections, cardOrCollectionId);
  
  return (
    <span className="collection-name">
      {collectionName}
    </span>
  );
};

export { getCollectionName };
export default CardCollectionDisplay;`;

  fs.writeFileSync(cardCollectionDisplayPath, cardCollectionDisplayContent);
  console.log('✅ Fichier CardCollectionDisplay.js créé avec succès');
} else {
  console.log('ℹ️ Le fichier CardCollectionDisplay.js existe déjà');
}

// Lire le contenu du fichier Flashcards.js
let flashcardsContent = fs.readFileSync(flashcardsPath, 'utf8');

// 1. Ajouter l'import pour CardCollectionDisplay
if (!flashcardsContent.includes('import { getCollectionName }')) {
  flashcardsContent = flashcardsContent.replace(
    "import '../assets/flashcards.css';",
    "import { getCollectionName } from '../components/CardCollectionDisplay';\nimport '../assets/flashcards.css';"
  );
  console.log('✅ Import de getCollectionName ajouté');
}

// 2. Remplacer la fonction getCollectionName par une version qui utilise la fonction importée
const getCollectionNameRegex = /\/\/ Get collection name by ID[\s\S]*?const getCollectionName[\s\S]*?};/;
const getCollectionNameReplacement = `// Fonction utilitaire pour obtenir le nom d'une collection par son ID
  const getCollectionNameLocal = (cardOrCollectionId) => {
    return getCollectionName(collections, cardOrCollectionId);
  };`;

if (flashcardsContent.match(getCollectionNameRegex)) {
  flashcardsContent = flashcardsContent.replace(getCollectionNameRegex, getCollectionNameReplacement);
  console.log('✅ Fonction getCollectionName remplacée');
} else {
  // Si la fonction n'existe pas ou a été modifiée, l'ajouter avant le return
  const beforeReturnRegex = /return \(/;
  flashcardsContent = flashcardsContent.replace(
    beforeReturnRegex,
    `${getCollectionNameReplacement}\n\n  return (`
  );
  console.log('✅ Fonction getCollectionNameLocal ajoutée');
}

// 3. Remplacer tous les appels à getCollectionName par getCollectionNameLocal
flashcardsContent = flashcardsContent.replace(/getCollectionName\(/g, 'getCollectionNameLocal(');
console.log('✅ Appels à getCollectionName remplacés par getCollectionNameLocal');

// 4. Normaliser les cartes pour garantir la cohérence des propriétés
const initializeDataRegex = /\/\/ Initialize data[\s\S]*?useEffect\(\(\) => \{[\s\S]*?if \(cards && cards\.length > 0\) \{[\s\S]*?setAllCards\(cards\);[\s\S]*?setFilteredCards\(cards\);/;
const initializeDataReplacement = `// Initialize data
  useEffect(() => {
    if (cards && cards.length > 0) {
      // Normaliser toutes les cartes pour garantir la cohérence des propriétés
      const normalizedCards = cards.map(card => ({
        ...card,
        // S'assurer que chaque carte a collectionId, même si elle utilise collection
        collectionId: card.collectionId || card.collection
      }));
      
      console.log('Cartes normalisées:', normalizedCards);
      setAllCards(normalizedCards);
      setFilteredCards(normalizedCards);`;

if (flashcardsContent.match(initializeDataRegex)) {
  flashcardsContent = flashcardsContent.replace(initializeDataRegex, initializeDataReplacement);
  console.log('✅ Normalisation des cartes ajoutée');
}

// 5. Améliorer le filtre des cartes pour prendre en compte à la fois collection et collectionId
const filterByCollectionRegex = /\/\/ Filter by collection[\s\S]*?if \(selectedCollection !== 'all'\) \{[\s\S]*?result = result\.filter\(card => card\.collectionId === selectedCollection\);[\s\S]*?\}/;
const filterByCollectionReplacement = `// Filter by collection
    if (selectedCollection !== 'all') {
      result = result.filter(card => 
        // Vérifier à la fois collectionId et collection pour être compatible avec les deux formats
        card.collectionId === selectedCollection || card.collection === selectedCollection
      );
    }`;

if (flashcardsContent.match(filterByCollectionRegex)) {
  flashcardsContent = flashcardsContent.replace(filterByCollectionRegex, filterByCollectionReplacement);
  console.log('✅ Filtre des cartes amélioré');
}

// 6. Améliorer la fonction handleSubmit pour normaliser les données
const handleSubmitRegex = /const cardData = \{[\s\S]*?question,[\s\S]*?answer,[\s\S]*?collectionId[\s\S]*?\};/;
const handleSubmitReplacement = `// Le backend attend 'collection' et non 'collectionId'
    const cardData = { 
      question, 
      answer, 
      collection: collectionId // Renommé pour correspondre au modèle du backend
    };
    
    console.log('Données de la carte à créer:', cardData);`;

if (flashcardsContent.match(handleSubmitRegex)) {
  flashcardsContent = flashcardsContent.replace(handleSubmitRegex, handleSubmitReplacement);
  console.log('✅ Fonction handleSubmit améliorée');
}

// 7. Améliorer la gestion des nouvelles cartes créées
const newCardRegex = /\/\/ Add new card[\s\S]*?const newCard = await createFlashcard\(cardData\);[\s\S]*?setAllCards\(prevCards => \[\.\.\.prevCards, newCard\]\);/;
const newCardReplacement = `// Add new card
        console.log('Création d\\'une nouvelle carte avec:', cardData);
        const response = await createFlashcard(cardData);
        console.log('Réponse du serveur:', response);
        
        // Extraire la carte créée de la réponse
        const newCard = response.data || response;
        console.log('Nouvelle carte créée:', newCard);
        
        // Normaliser la structure de la carte pour qu'elle soit cohérente avec le reste de l'application
        // Si la carte a une propriété 'collection' mais pas 'collectionId', créer collectionId
        const normalizedCard = {
          ...newCard,
          collectionId: newCard.collectionId || newCard.collection
        };
        
        console.log('Carte normalisée:', normalizedCard);
        
        // Ajouter la nouvelle carte à l'état local
        setAllCards(prevCards => [...prevCards, normalizedCard]);`;

if (flashcardsContent.match(newCardRegex)) {
  flashcardsContent = flashcardsContent.replace(newCardRegex, newCardReplacement);
  console.log('✅ Gestion des nouvelles cartes améliorée');
}

// Écrire le contenu modifié dans le fichier
fs.writeFileSync(flashcardsPath, flashcardsContent);
console.log('✅ Fichier Flashcards.js corrigé avec succès');

console.log('\n🎉 Toutes les corrections ont été appliquées avec succès!');
console.log('Redémarrez l\'application pour appliquer les modifications.');
