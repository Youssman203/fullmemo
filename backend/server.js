const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
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
// 🗑️ sharedLinkRoutes supprimé - WebSocket par code remplace les liens partagés
const shareCodeRoutes = require('./routes/shareCodeRoutes');
const simpleBulkImportRoutes = require('./routes/simpleBulkImportRoutes');

// Initialiser l'application Express et le serveur HTTP
const app = express();
const server = http.createServer(app);

// Configuration Socket.IO avec CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware d'authentification Socket.IO
const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Token manquant'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userRole = decoded.role;
    console.log(`✅ Socket authentifié pour utilisateur: ${decoded.id} (${decoded.role})`.green);
    next();
  } catch (error) {
    console.log(`❌ Erreur auth socket: ${error.message}`.red);
    next(new Error('Token invalide'));
  }
};

// Appliquer l'authentification aux sockets
io.use(socketAuth);

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 Nouvelle connexion socket: ${socket.id} (User: ${socket.userId})`.cyan);
  
  // Rejoindre la room personnelle de l'utilisateur
  socket.join(`user_${socket.userId}`);
  console.log(`👤 Utilisateur ${socket.userId} a rejoint sa room`.yellow);
  
  // Événement de déconnexion
  socket.on('disconnect', () => {
    console.log(`🔌 Déconnexion socket: ${socket.id} (User: ${socket.userId})`.cyan);
  });
  
  // Événement de test pour vérifier la connexion
  socket.on('ping', () => {
    socket.emit('pong', { message: 'Connexion WebSocket active', userId: socket.userId });
  });
});

// Rendre io accessible globalement pour les contrôleurs
app.set('io', io);

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
// 🗑️ app.use('/api/shared', sharedLinkRoutes) supprimé - WebSocket par code remplace
app.use('/api/share', shareCodeRoutes);
app.use('/api/simple-bulk-import', simpleBulkImportRoutes);

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

// Démarrer le serveur HTTP avec Socket.IO
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur HTTP + WebSocket en cours d'exécution sur le port ${PORT}`.cyan.bold);
  console.log(`🔌 WebSocket CORS configuré pour: http://localhost:3000`.green);
});
