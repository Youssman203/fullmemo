// src/contexts/DataContext.js
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import collectionService from '../services/collectionService';
import flashcardService from '../services/flashcardService';
import reviewService from '../services/reviewService';
import classService from '../services/classService';
// 🗑️ sharedLinkService supprimé - WebSocket par code remplace les liens partagés
import shareCodeService from '../services/shareCodeService';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔌 WebSocket Configuration
  const socketRef = useRef(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

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
        
        // 🔍 Déduplication simple pour éviter les doublons visuels
        const uniqueCollections = userCollections.filter((collection, index, self) => 
          index === self.findIndex(c => c._id === collection._id)
        );
        
        console.log("Collections formatées:", userCollections);
        if (userCollections.length !== uniqueCollections.length) {
          console.log(`🔍 Doublons supprimés: ${userCollections.length} → ${uniqueCollections.length}`);
        }
        setCollections(uniqueCollections);
        
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
        
        // Calculer le nombre de cartes par collection (utilise les collections dédupliquées)
        const collectionsWithCardCount = uniqueCollections.map(collection => {
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
  
  // 🔥 WEBSOCKET FUNCTIONS - CONNEXION ET GESTION TEMPS RÉEL
  
  // Configuration et connexion WebSocket
  const connectSocket = useCallback(() => {
    if (!user || socketRef.current?.connected) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Pas de token pour WebSocket');
      return;
    }
    
    console.log('🔌 Tentative connexion WebSocket...');
    
    // Création de la connexion Socket.IO
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000
    });
    
    const socket = socketRef.current;
    
    // Événements de connexion
    socket.on('connect', () => {
      console.log('✅ WebSocket connecté:', socket.id);
      setSocketConnected(true);
      reconnectAttempts.current = 0;
      
      // Test de ping pour vérifier la connexion
      socket.emit('ping');
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 WebSocket déconnecté:', reason);
      setSocketConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ Erreur connexion WebSocket:', error.message);
      setSocketConnected(false);
      reconnectAttempts.current++;
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        console.error('❌ Limite de reconnexion atteinte');
        socket.disconnect();
      }
    });
    
    // Réponse au ping
    socket.on('pong', (data) => {
      console.log('🏓 WebSocket pong reçu:', data.message);
    });
    
    // 🚀 ÉCOUTE ÉVÉNEMENT PRINCIPALE - NOUVELLE COLLECTION
    socket.on('newCollection', (data) => {
      console.log('🎆 Événement newCollection reçu:', data);
      
      const { type, collection, message, timestamp } = data;
      
      if (type === 'collection_imported' && collection) {
        // 🔄 MISE À JOUR AUTOMATIQUE DES COLLECTIONS SANS DOUBLONS
        setCollections(prevCollections => {
          console.log('🔄 Mise à jour collections via WebSocket...');
          
          // Vérifier si la collection existe déjà
          const existingIndex = prevCollections.findIndex(c => 
            String(c._id) === String(collection._id)
          );
          
          if (existingIndex !== -1) {
            // Mettre à jour collection existante
            const updatedCollections = [...prevCollections];
            updatedCollections[existingIndex] = { ...collection, cardCount: collection.flashcardsCount || 0 };
            console.log('⚙️ Collection mise à jour:', collection.name);
            return updatedCollections;
          } else {
            // Ajouter nouvelle collection
            const newCollection = { ...collection, cardCount: collection.flashcardsCount || 0 };
            console.log('➕ Nouvelle collection ajoutée:', collection.name);
            return [newCollection, ...prevCollections];
          }
        });
        
        // Notification toast
        toast.success(
          `🎆 ${message}`,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          }
        );
        
        console.log(`✅ Collection "${collection.name}" ajoutée en temps réel`);
      }
    });
    
  }, [user]);
  
  // Déconnexion propre du WebSocket
  const disconnectSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Fermeture connexion WebSocket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    }
  }, []);
  
  // 🔄 EFFET POUR GÉRER CONNEXION/DÉCONNEXION WEBSOCKET
  useEffect(() => {
    if (user) {
      // Connecter WebSocket quand utilisateur connecté
      connectSocket();
    } else {
      // Déconnecter WebSocket quand utilisateur déconnecté
      disconnectSocket();
    }
    
    // Nettoyage au démontage
    return () => {
      disconnectSocket();
    };
  }, [user, connectSocket, disconnectSocket]);

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

  const importCollectionFromClass = async (classId, collectionId) => {
    try {
      const response = await classService.importCollectionFromClass(classId, collectionId);
      // Rafraîchir les données pour inclure la nouvelle collection importée
      refreshData();
      return response.data || response;
    } catch (error) {
      console.error("Failed to import collection:", error);
      throw error;
    }
  };
  
  // 🔥 VERSION WEBSOCKET - Import simple sans refresh manuel
  const importCollectionByCodeWebSocket = async (code) => {
    try {
      console.log('📥 Import collection par code WebSocket:', code);
      
      // 📡 Appel API simple - WebSocket s'occupe du refresh
      const response = await shareCodeService.importCollectionByCode(code);
      console.log('✅ Import WebSocket réussi:', response);
      
      // 🎯 Le refresh sera automatique via l'événement WebSocket 'newCollection'
      console.log('⚡ Attente de l\'événement WebSocket pour mise à jour...');
      
      return response.data || response;
      
    } catch (error) {
      console.error('❌ Erreur import WebSocket:', error);
      throw error;
    }
  };
  
  // 🧺 FONCTIONS COMPLEXES SUPPRIMÉES - WebSocket gère tout
  
  // Créer des alias pour compatibilité avec le code existant
  const getCardsByCollection = getFlashcardsByCollection;
  const updateCardReview = updateFlashcardReview;

  // 🗑️ Code de tracking import supprimé - WebSocket gère le state

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
    getClassById: classService.getClassById,
    importCollectionFromClass,
    getClassCollectionCards: classService.getClassCollectionCards,
    
    // 🗑️ Fonctions des liens partagés supprimées - WebSocket par code les remplace
    
    // Fonctions des codes de partage
    generateShareCode: shareCodeService.generateShareCode,
    getCollectionByCode: shareCodeService.getCollectionByCode,
    importCollectionByCode: importCollectionByCodeWebSocket, // 🔥 WEBSOCKET VERSION
    getUserShareCodes: shareCodeService.getUserShareCodes,
    deactivateShareCode: shareCodeService.deactivateShareCode,
    
    // 🔌 WebSocket Status
    socketConnected,
    
    // 🧪 Functions de debug WebSocket
    testWebSocketConnection: () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('ping');
        console.log('🏓 Test WebSocket envoyé');
      } else {
        console.log('❌ WebSocket non connecté');
      }
    }
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
