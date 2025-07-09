import React from 'react';

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
export default CardCollectionDisplay;
