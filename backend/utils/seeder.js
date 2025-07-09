const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');
const ReviewSession = require('../models/reviewSessionModel');

// Charger les variables d'environnement
dotenv.config();

// Connecter à la base de données
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Données d'exemple
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    profileImage: 'default-profile.jpg',
    preferences: {
      darkMode: true,
      notificationsEnabled: true,
      language: 'fr'
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    profileImage: 'default-profile.jpg'
  },
  {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    profileImage: 'default-profile.jpg'
  }
];

// Fonction pour importer les données
const importData = async () => {
  try {
    // Vider la base de données
    await User.deleteMany();
    await Collection.deleteMany();
    await Flashcard.deleteMany();
    await ReviewSession.deleteMany();

    // Créer des utilisateurs
    const createdUsers = await User.insertMany(users);
    const adminUser = createdUsers[0]._id;

    // Créer des collections
    const collections = [
      {
        name: 'React Hooks',
        description: 'A collection of cards for learning React Hooks.',
        imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
        user: adminUser,
        isPublic: true,
        category: 'programming',
        tags: ['react', 'javascript', 'frontend']
      },
      {
        name: 'JavaScript ES6',
        description: 'Essential ES6 features for modern JavaScript development.',
        imageUrl: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
        user: adminUser,
        isPublic: false,
        category: 'programming',
        tags: ['javascript', 'es6', 'frontend']
      }
    ];

    const createdCollections = await Collection.insertMany(collections);

    // Créer des flashcards
    const flashcards = [
      {
        collection: createdCollections[0]._id,
        question: 'What is useState in React?',
        answer: 'useState is a Hook that lets you add React state to function components.',
        difficulty: 'medium',
        status: 'new',
        user: adminUser,
        tags: ['useState', 'hook']
      },
      {
        collection: createdCollections[0]._id,
        question: 'What is useEffect in React?',
        answer: 'useEffect is a Hook that lets you perform side effects in function components.',
        difficulty: 'medium',
        status: 'new',
        user: adminUser,
        tags: ['useEffect', 'hook', 'lifecycle']
      },
      {
        collection: createdCollections[1]._id,
        question: 'What are arrow functions in ES6?',
        answer: 'Arrow functions are a concise syntax for writing function expressions in JavaScript.',
        difficulty: 'easy',
        status: 'new',
        user: adminUser,
        tags: ['functions', 'syntax']
      }
    ];

    await Flashcard.insertMany(flashcards);

    console.log('Données importées avec succès!'.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Fonction pour supprimer les données
const destroyData = async () => {
  try {
    // Vider la base de données
    await User.deleteMany();
    await Collection.deleteMany();
    await Flashcard.deleteMany();
    await ReviewSession.deleteMany();

    console.log('Données supprimées avec succès!'.red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// Exécuter la fonction appropriée en fonction de l'argument
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
