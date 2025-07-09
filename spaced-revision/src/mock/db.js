// src/mock/db.js
import { v4 as uuidv4 } from 'uuid';

// --- Initialization ---
const initDB = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
  if (!localStorage.getItem('collections')) {
    const defaultCollections = [
      {
        id: '1',
        userId: '1', // This is a placeholder; in a real app, this would be dynamic
        name: 'React Hooks',
        description: 'A collection of cards for learning React Hooks.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: '1',
        name: 'JavaScript ES6',
        description: 'Essential ES6 features for modern JavaScript development.',
        imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
        createdAt: new Date().toISOString()
      },
    ];
    localStorage.setItem('collections', JSON.stringify(defaultCollections));
  }
  if (!localStorage.getItem('cards')) {
    localStorage.setItem('cards', JSON.stringify([]));
  }
};

initDB();

// --- User Management ---
export const registerUser = (email, password, googleData = {}) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return null; // User already exists
  }
  const newUser = { 
    id: uuidv4(), 
    email, 
    password, // Will be null for Google users
    name: googleData.name || email.split('@')[0],
    picture: googleData.picture || null,
    isGoogleUser: googleData.isGoogleUser || false,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email);
  
  if (!user || user.isGoogleUser) {
    // User not found, or is a Google user trying to log in with password
    return null; 
  }

  if (user.password === password) {
    return user;
  }

  return null;
};

// --- Collections Management ---
export const getCollections = (userId) => {
  const allCollections = JSON.parse(localStorage.getItem('collections')) || [];
  const userCollections = allCollections.filter(c => c.userId === userId);
  const allCards = JSON.parse(localStorage.getItem('cards')) || [];

  return userCollections.map(collection => ({
    ...collection,
    cards: allCards.filter(card => card.collectionId === collection.id)
  }));
};

export const addCollection = (name, userId) => {
  const collections = JSON.parse(localStorage.getItem('collections'));
  const newCollection = {
    id: uuidv4(),
    userId,
    name,
    createdAt: new Date().toISOString(),
    // Add a default placeholder image for new collections
    imageUrl: 'https://images.unsplash.com/photo-1559136560-16de26555648?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
  };
  collections.push(newCollection);
  localStorage.setItem('collections', JSON.stringify(collections));
  return newCollection;
};

export const renameCollection = (id, newName) => {
    const collections = JSON.parse(localStorage.getItem('collections'));
    const collectionIndex = collections.findIndex(c => c.id === id);
    if (collectionIndex > -1) {
        collections[collectionIndex].name = newName;
        localStorage.setItem('collections', JSON.stringify(collections));
        return collections[collectionIndex];
    }
    return null;
};

export const deleteCollection = (id) => {
    let collections = JSON.parse(localStorage.getItem('collections'));
    let cards = JSON.parse(localStorage.getItem('cards'));
    
    collections = collections.filter(c => c.id !== id);
    cards = cards.filter(card => card.collectionId !== id);

    localStorage.setItem('collections', JSON.stringify(collections));
    localStorage.setItem('cards', JSON.stringify(cards));
};


// --- Cards Management ---
export const getCards = (userId) => {
    const cards = JSON.parse(localStorage.getItem('cards'));
    const userCollections = getCollections(userId).map(c => c.id);
    return cards.filter(card => userCollections.includes(card.collectionId));
};

export const getCardsByCollection = (collectionId) => {
  const cards = JSON.parse(localStorage.getItem('cards'));
  return cards.filter(card => card.collectionId === collectionId);
};

export const getCardsToReview = (userId) => {
  const userCards = getCards(userId);
  const now = new Date();
  return userCards.filter(card => new Date(card.nextReview) <= now);
};

export const addCard = (cardData) => {
  const cards = JSON.parse(localStorage.getItem('cards'));
  const newCard = {
    ...cardData,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    lastReviewed: null,
    nextReview: new Date().toISOString(), // Ready for review now
    level: 1, // Starting level
  };
  cards.push(newCard);
  localStorage.setItem('cards', JSON.stringify(cards));
  return newCard;
};

export const updateCard = (id, updatedData) => {
    const cards = JSON.parse(localStorage.getItem('cards'));
    const cardIndex = cards.findIndex(c => c.id === id);
    if (cardIndex > -1) {
        cards[cardIndex] = { ...cards[cardIndex], ...updatedData };
        localStorage.setItem('cards', JSON.stringify(cards));
        return cards[cardIndex];
    }
    return null;
};

export const deleteCard = (id) => {
    let cards = JSON.parse(localStorage.getItem('cards'));
    cards = cards.filter(c => c.id !== id);
    localStorage.setItem('cards', JSON.stringify(cards));
};

// Spaced Repetition Logic
export const getReviewHistory = (userId) => {
  const userCards = getCards(userId);
  return userCards
    .filter(card => card.lastReviewed)
    .map(card => ({ 
        id: card.id, 
        cardQuestion: card.question, 
        reviewedAt: card.lastReviewed 
    }))
    .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
};

export const updateCardReview = (id, performance) => {
    const card = JSON.parse(localStorage.getItem('cards')).find(c => c.id === id);
    if (!card) return null;

    let { level } = card;
    // performance: 0 = fail, 1 = easy
    if (performance === 1) {
        level = Math.min(level + 1, 8);
    } else {
        level = Math.max(1, Math.floor(level / 2));
    }

    const intervals = [0, 1, 3, 7, 14, 30, 90, 180]; // days
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + intervals[level - 1]);

    return updateCard(id, {
        level,
        lastReviewed: new Date().toISOString(),
        nextReview: nextReviewDate.toISOString(),
    });
};
