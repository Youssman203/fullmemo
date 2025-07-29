// Script pour créer des cartes de test avec des dates de révision
const mongoose = require('mongoose');
require('dotenv').config();

// Import des modèles
const Flashcard = require('../models/flashcardModel');
const Collection = require('../models/collectionModel');
const User = require('../models/userModel');

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('Erreur de connexion MongoDB:', error);
    process.exit(1);
  }
};

const createTestCards = async () => {
  try {
    await connectDB();

    // Trouver un utilisateur existant (remplacez par votre ID utilisateur)
    const user = await User.findOne();
    if (!user) {
      console.log('Aucun utilisateur trouvé. Créez d\'abord un compte.');
      return;
    }

    // Trouver ou créer une collection de test
    let collection = await Collection.findOne({ user: user._id, name: 'Test Révision' });
    if (!collection) {
      collection = await Collection.create({
        name: 'Test Révision',
        description: 'Collection de test pour la révision',
        user: user._id,
        imageUrl: 'https://via.placeholder.com/300x200?text=Test'
      });
    }

    // Créer des cartes avec différents statuts de révision
    const testCards = [
      {
        question: 'Carte difficile 1',
        answer: 'Réponse 1',
        collection: collection._id,
        user: user._id,
        interval: 0.003, // 5 minutes (difficile)
        nextReviewDate: new Date(Date.now() - 1000 * 60), // Il y a 1 minute (due)
        status: 'learning'
      },
      {
        question: 'Carte difficile 2',
        answer: 'Réponse 2',
        collection: collection._id,
        user: user._id,
        interval: 0.001, // 1 minute (à revoir)
        nextReviewDate: new Date(Date.now() - 1000 * 30), // Il y a 30 secondes (due)
        status: 'learning'
      },
      {
        question: 'Carte facile 1',
        answer: 'Réponse 3',
        collection: collection._id,
        user: user._id,
        interval: 1, // 1 jour (facile)
        nextReviewDate: new Date(Date.now() - 1000 * 60 * 60), // Il y a 1 heure (due)
        status: 'review'
      },
      {
        question: 'Carte facile 2',
        answer: 'Réponse 4',
        collection: collection._id,
        user: user._id,
        interval: 1, // 1 jour (facile)
        nextReviewDate: new Date(Date.now() - 1000 * 60 * 30), // Il y a 30 minutes (due)
        status: 'review'
      },
      {
        question: 'Carte future',
        answer: 'Réponse 5',
        collection: collection._id,
        user: user._id,
        interval: 1, // 1 jour
        nextReviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // Dans 1 jour (pas due)
        status: 'review'
      }
    ];

    // Supprimer les anciennes cartes de test
    await Flashcard.deleteMany({ 
      collection: collection._id,
      question: { $regex: /^Carte (difficile|facile|future)/ }
    });

    // Créer les nouvelles cartes
    const createdCards = await Flashcard.insertMany(testCards);
    
    console.log(`${createdCards.length} cartes de test créées avec succès !`);
    console.log('Cartes créées:');
    createdCards.forEach(card => {
      console.log(`- ${card.question} (interval: ${card.interval}, due: ${card.nextReviewDate})`);
    });

    console.log('\nVous pouvez maintenant tester la boîte "À revoir" sur le dashboard.');
    
  } catch (error) {
    console.error('Erreur lors de la création des cartes de test:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestCards();
