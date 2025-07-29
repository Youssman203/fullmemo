const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Charger les variables d'environnement
dotenv.config();

// Connecter à la base de données MongoDB
connectDB();

// Importer les routes
const userRoutes = require('./routes/userRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const classRoutes = require('./routes/classRoutes');

// Initialiser l'application Express
const app = express();

// Middleware pour parser le corps des requêtes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware pour la sécurité
app.use(helmet());

// Middleware pour autoriser les requêtes CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://spacedrevision.com' // URL de production
    : 'http://localhost:3000', // URL de développement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Pre-flight requests
app.options('*', cors());

// Middleware pour le logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode: ${process.env.NODE_ENV}`.yellow.bold);
}

// Routes principales
app.use('/api/users', userRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/classes', classRoutes);

// Dossier statique pour les uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route racine pour tester l'API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Spaced Revision',
    version: '1.0.0',
    status: 'active'
  });
});

// Middleware pour gérer les erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`.cyan.bold);
});
