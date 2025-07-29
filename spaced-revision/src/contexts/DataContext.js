// src/contexts/DataContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import collectionService from '../services/collectionService';
import flashcardService from '../services/flashcardService';
import reviewService from '../services/reviewService';
import classService from '../services/classService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (user) {
      setLoading(true);
      try {
        // Charger les collections de l'utilisateur
        const collectionsResponse = await collectionService.getUserCollections();
        console.log("Collections récupérées:", collectionsResponse);
        
        // Vérifier la structure de la réponse et extraire les collections
        let userCollections = [];
        if (Array.isArray(collectionsResponse)) {
          userCollections = collectionsResponse;
        } else if (collectionsResponse.collections && Array.isArray(collectionsResponse.collections)) {
          userCollections = collectionsResponse.collections;
        } else if (collectionsResponse.data && Array.isArray(collectionsResponse.data)) {
          userCollections = collectionsResponse.data;
        } else if (collectionsResponse.data && collectionsResponse.data.collections) {
          userCollections = collectionsResponse.data.collections;
        }
        
        console.log("Collections formatées:", userCollections);
        setCollections(userCollections);
        
        // Charger toutes les cartes de l'utilisateur (pas seulement celles à réviser)
        const cardsResponse = await flashcardService.getAllUserFlashcards();
        let userCards = [];
        if (Array.isArray(cardsResponse)) {
          userCards = cardsResponse;
        } else if (cardsResponse.flashcards && Array.isArray(cardsResponse.flashcards)) {
          userCards = cardsResponse.flashcards;
        } else if (cardsResponse.data && Array.isArray(cardsResponse.data)) {
          userCards = cardsResponse.data;
        } else if (cardsResponse.data && cardsResponse.data.flashcards) {
          userCards = cardsResponse.data.flashcards;
        }
        
        console.log("Toutes les cartes récupérées:", userCards);
        
        // Calculer le nombre de cartes par collection
        const collectionsWithCardCount = userCollections.map(collection => {
          const collectionId = collection._id || collection.id;
          // Compter le nombre de cartes pour cette collection
          const count = userCards.filter(card => {
            // Vérifier tous les formats possibles de référence à la collection
            const cardCollectionId = 
              (card.collectionId ? card.collectionId : 
               (card.collection ? 
                 (typeof card.collection === 'string' ? card.collection : 
                  (card.collection._id || card.collection.id)) 
               : null));
            
            // Comparer les IDs après conversion en chaîne
            return cardCollectionId && String(cardCollectionId) === String(collectionId);
          }).length;
          
          console.log(`Collection ${collection.name} (ID: ${collectionId}) a ${count} cartes`);
          
          // Mettre à jour la propriété cardCount
          return { ...collection, cardCount: count };
        });
        
        console.log("Collections avec comptage de cartes:", collectionsWithCardCount);
        setCollections(collectionsWithCardCount);
        setCards(userCards);
        
      } catch (error) {
        console.error("Failed to refresh data:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setCollections([]);
      setCards([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  // Fonctions pour gérer les collections
  const createCollection = async (collectionData) => {
    const response = await collectionService.createCollection(collectionData);
    refreshData();
    return response;
  };
  
  const updateCollection = async (id, collectionData) => {
    const response = await collectionService.updateCollection(id, collectionData);
    refreshData();
    return response;
  };
  
  const deleteCollection = async (id) => {
    const response = await collectionService.deleteCollection(id);
    refreshData();
    return response;
  };
  
  const getCollectionById = async (id) => {
    return await collectionService.getCollectionById(id);
  };
  
  // Fonctions pour gérer les flashcards
  const createFlashcard = async (flashcardData) => {
    try {
      // Créer la flashcard
      const response = await flashcardService.createFlashcard(flashcardData);
      
      // Mettre à jour les données locales immédiatement
      const newCard = response.data || response;
      
      // Ajouter la nouvelle carte à l'état local
      setCards(prevCards => [...prevCards, newCard]);
      
      // Rafraîchir les données en arrière-plan
      refreshData();
      
      return newCard;
    } catch (error) {
      console.error('Erreur lors de la création de la flashcard:', error);
      throw error;
    }
  };
  
  const getFlashcardsByCollection = async (collectionId) => {
    return await flashcardService.getFlashcardsByCollection(collectionId);
  };
  
  const updateFlashcard = async (id, flashcardData) => {
    const response = await flashcardService.updateFlashcard(id, flashcardData);
    refreshData();
    return response;
  };
  
  const deleteFlashcard = async (id) => {
    const response = await flashcardService.deleteFlashcard(id);
    refreshData();
    return response;
  };
  
  const updateFlashcardReview = async (id, reviewData) => {
    const response = await flashcardService.updateFlashcardReview(id, reviewData);
    refreshData();
    return response;
  };
  
  // Fonctions pour gérer les sessions de révision
  const startReviewSession = async (sessionData) => {
    return await reviewService.startReviewSession(sessionData);
  };
  
  const updateReviewSession = async (id, sessionData) => {
    return await reviewService.updateReviewSession(id, sessionData);
  };
  
  const getUserReviewSessions = async () => {
    return await reviewService.getUserReviewSessions();
  };
  
  const getReviewHistory = async (userId) => {
    try {
      const response = await reviewService.getReviewHistory();
      const sessions = response.reviewSessions || response.sessions || response || [];
      
      // Transformer les sessions en format adapté au composant RecentActivity
      const history = sessions.map(session => {
        return {
          id: session._id || session.id,
          cardQuestion: session.flashcard?.question || session.cardQuestion || 'Card reviewed',
          reviewedAt: session.completedAt || session.updatedAt || session.createdAt || new Date()
        };
      }).sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
      
      return history;
    } catch (error) {
      console.error("Failed to get review history:", error);
      return [];
    }
  };

  const getFlashcardsDueNow = async () => {
    try {
      const response = await flashcardService.getFlashcardsDueNow();
      return response.data || response;
    } catch (error) {
      console.error("Failed to get cards due now:", error);
      return { total: 0, difficultCards: 0, easyCards: 0, cards: [] };
    }
  };

  const getTodayStudyTime = async () => {
    try {
      const response = await reviewService.getTodayStudyTime();
      return response.data || response;
    } catch (error) {
      console.error("Failed to get today study time:", error);
      return { totalTimeMinutes: 0, totalTimeSeconds: 0, sessionsCount: 0, cardsReviewed: 0 };
    }
  };

  // Fonctions pour gérer les classes
  const getStudentClasses = async () => {
    try {
      const response = await classService.getStudentClasses();
      return response.data || response;
    } catch (error) {
      console.error("Failed to get student classes:", error);
      return [];
    }
  };

  const joinClassByCode = async (inviteCode) => {
    try {
      const response = await classService.joinClassByCode(inviteCode);
      return response.data || response;
    } catch (error) {
      console.error("Failed to join class:", error);
      throw error;
    }
  };
  
  // Créer des alias pour compatibilité avec le code existant
  const getCardsByCollection = getFlashcardsByCollection;
  const updateCardReview = updateFlashcardReview;

  const value = { 
    collections,
    cards,
    loading,
    refreshData,
    // Collection operations
    createCollection,
    updateCollection,
    deleteCollection,
    getCollectionById,
    // Flashcard operations
    createFlashcard,
    getFlashcardsByCollection,
    getCardsByCollection, // Alias pour compatibilité avec le code existant
    updateFlashcard,
    deleteFlashcard,
    updateFlashcardReview,
    updateCardReview, // Alias pour compatibilité avec le code existant
    // Review operations
    startReviewSession,
    updateReviewSession,
    getUserReviewSessions,
    getReviewHistory,
    getFlashcardsDueNow,
    getTodayStudyTime,
    // Class operations
    getStudentClasses,
    joinClassByCode,
    // Collection sharing operations
    shareCollectionWithClass: classService.shareCollectionWithClass,
    unshareCollectionFromClass: classService.unshareCollectionFromClass,
    getClassCollections: classService.getClassCollections,
    getClassById: classService.getClassById
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  return useContext(DataContext);
};
