import React from 'react';

/**
 * Fonction utilitaire pour afficher le nom d'une collection de manière sécurisée
 * @param {Array} collections - Liste des collections disponibles
 * @param {string|Object} cardOrCollectionId - ID de la collection ou objet carte
 * @returns {string} - Le nom de la collection ou "Inconnu" si non trouvée
 */
const getCollectionName = (collections, cardOrCollectionId) => {
  // Vérifications de base
  if (!collections || !Array.isArray(collections) || collections.length === 0) {
    return 'Inconnu';
  }
  
  if (cardOrCollectionId === undefined || cardOrCollectionId === null) {
    return 'Inconnu';
  }
  
  // Cas 1: Si on reçoit une carte complète au lieu d'un ID
  if (typeof cardOrCollectionId === 'object' && cardOrCollectionId !== null) {
    // Extraire l'ID de collection de la carte
    let collectionId = null;
    
    // Vérifier toutes les possibilités d'ID de collection dans l'objet carte
    if (cardOrCollectionId.collectionId) {
      collectionId = cardOrCollectionId.collectionId;
    } else if (cardOrCollectionId.collection) {
      if (typeof cardOrCollectionId.collection === 'string' || 
          typeof cardOrCollectionId.collection === 'number') {
        collectionId = cardOrCollectionId.collection;
      } else if (typeof cardOrCollectionId.collection === 'object' && 
                 cardOrCollectionId.collection !== null) {
        collectionId = cardOrCollectionId.collection._id || cardOrCollectionId.collection.id;
      }
    }
    
    // Si aucun ID valide n'a été trouvé
    if (!collectionId) {
      return 'Inconnu';
    }
    
    // Chercher la collection avec cet ID
    for (const collection of collections) {
      // Obtenir tous les IDs possibles de la collection
      const collectionIds = [
        collection._id, 
        collection.id,
        collection._id?.toString(),
        collection.id?.toString()
      ].filter(Boolean); // Filtrer les valeurs null/undefined
      
      // Convertir l'ID de la carte en chaîne pour la comparaison
      const collectionIdStr = String(collectionId);
      
      // Vérifier si l'un des IDs correspond
      if (collectionIds.some(id => String(id) === collectionIdStr)) {
        return collection.name;
      }
    }
    
    return 'Inconnu';
  } 
  
  // Cas 2: Si on reçoit directement un ID de collection
  const idToFind = String(cardOrCollectionId);
  
  // Parcourir toutes les collections pour trouver une correspondance
  for (const collection of collections) {
    // Obtenir tous les IDs possibles de la collection
    const collectionIds = [
      collection._id, 
      collection.id,
      collection._id?.toString(),
      collection.id?.toString()
    ].filter(Boolean); // Filtrer les valeurs null/undefined
    
    // Vérifier si l'un des IDs correspond
    if (collectionIds.some(id => String(id) === idToFind)) {
      return collection.name;
    }
  }
  
  // Aucune correspondance trouvée
  return 'Inconnu';
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
