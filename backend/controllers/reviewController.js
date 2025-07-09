const asyncHandler = require('express-async-handler');
const ReviewSession = require('../models/reviewSessionModel');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');

/**
 * @desc    Créer une nouvelle session de révision
 * @route   POST /api/reviews
 * @access  Private
 */
const startReviewSession = asyncHandler(async (req, res) => {
  const { collection, mode } = req.body;

  // Vérifier si la collection existe
  const collectionExists = await Collection.findById(collection);
  if (!collectionExists) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est autorisé à réviser cette collection
  if (!collectionExists.isPublic && collectionExists.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé');
  }

  // Créer la session de révision
  const reviewSession = await ReviewSession.create({
    user: req.user._id,
    collection,
    mode: mode || 'classic',
    startTime: new Date()
  });

  res.status(201).json(reviewSession);
});

/**
 * @desc    Mettre à jour une session de révision (ajouter des cartes révisées)
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReviewSession = asyncHandler(async (req, res) => {
  const { 
    flashcardId, 
    performance, 
    timeSpent, 
    isCorrect, 
    completed 
  } = req.body;

  const reviewSession = await ReviewSession.findById(req.params.id);

  if (!reviewSession) {
    res.status(404);
    throw new Error('Session de révision non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (reviewSession.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette session de révision');
  }

  // Ajouter une carte révisée si fournie
  if (flashcardId && performance) {
    // Vérifier si la flashcard existe
    const flashcard = await Flashcard.findById(flashcardId);
    if (!flashcard) {
      res.status(404);
      throw new Error('Flashcard non trouvée');
    }

    // Ajouter à l'historique de la session
    reviewSession.cardsReviewed.push({
      flashcard: flashcardId,
      performance,
      timeSpent: timeSpent || 0,
      isCorrect: isCorrect || false
    });

    // Mettre à jour l'état de la flashcard si nécessaire
    if (reviewSession.user.toString() === flashcard.user.toString()) {
      flashcard.calculateNextReview(performance);
      flashcard.reviewHistory.push({
        date: new Date(),
        performance,
        timeSpent: timeSpent || 0
      });
      await flashcard.save();
    }
  }

  // Terminer la session si demandé
  if (completed) {
    reviewSession.completed = true;
    reviewSession.endTime = new Date();
    
    // Calculer les statistiques de la session
    reviewSession.totalCards = reviewSession.cardsReviewed.length;
    reviewSession.correctCards = reviewSession.cardsReviewed.filter(card => card.isCorrect).length;
    
    if (reviewSession.totalCards > 0) {
      reviewSession.score = Math.round((reviewSession.correctCards / reviewSession.totalCards) * 100);
    }
    
    // Mettre à jour la date de dernière étude de la collection
    await Collection.findByIdAndUpdate(reviewSession.collection, {
      lastStudied: new Date()
    });
  }

  // Sauvegarder les modifications
  const updatedSession = await reviewSession.save();
  res.json(updatedSession);
});

/**
 * @desc    Obtenir les détails d'une session de révision
 * @route   GET /api/reviews/:id
 * @access  Private
 */
const getReviewSessionById = asyncHandler(async (req, res) => {
  const reviewSession = await ReviewSession.findById(req.params.id)
    .populate('collection', 'name imageUrl')
    .populate('cardsReviewed.flashcard', 'question answer difficulty status');

  if (!reviewSession) {
    res.status(404);
    throw new Error('Session de révision non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (reviewSession.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette session de révision');
  }

  res.json(reviewSession);
});

/**
 * @desc    Obtenir toutes les sessions de révision de l'utilisateur
 * @route   GET /api/reviews
 * @access  Private
 */
const getUserReviewSessions = asyncHandler(async (req, res) => {
  const { limit = 10, page = 1, completed } = req.query;
  
  const query = { user: req.user._id };
  
  // Filtrer par état de complétion si spécifié
  if (completed !== undefined) {
    query.completed = completed === 'true';
  }

  // Pagination
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const reviewSessions = await ReviewSession.find(query)
    .populate('collection', 'name imageUrl')
    .sort({ startTime: -1 })
    .limit(limitNumber)
    .skip(skip);

  // Compter le nombre total de sessions correspondant à la requête
  const total = await ReviewSession.countDocuments(query);

  res.json({
    reviewSessions,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    total
  });
});

/**
 * @desc    Obtenir les statistiques des sessions de révision de l'utilisateur
 * @route   GET /api/reviews/stats
 * @access  Private
 */
const getReviewStats = asyncHandler(async (req, res) => {
  // Nombre total de sessions complétées
  const totalSessions = await ReviewSession.countDocuments({ 
    user: req.user._id,
    completed: true 
  });

  // Nombre total de cartes révisées
  const cardsReviewedStats = await ReviewSession.aggregate([
    { $match: { user: req.user._id, completed: true } },
    { $group: { 
        _id: null, 
        totalCards: { $sum: '$totalCards' },
        correctCards: { $sum: '$correctCards' },
        averageScore: { $avg: '$score' }
      }
    }
  ]);

  // Temps total passé en révision (en minutes)
  const timeStats = await ReviewSession.aggregate([
    { $match: { user: req.user._id, completed: true } },
    { $group: { 
        _id: null, 
        totalTime: { $sum: '$duration' }
      }
    }
  ]);

  // Activité de révision des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const dailyActivity = await ReviewSession.aggregate([
    { $match: { 
        user: req.user._id,
        completed: true,
        endTime: { $gte: thirtyDaysAgo }
      } 
    },
    { $group: {
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$endTime' } 
        },
        sessionsCount: { $sum: 1 },
        cardsReviewed: { $sum: '$totalCards' },
        timeSpent: { $sum: '$duration' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  const totalCardsReviewed = cardsReviewedStats.length > 0 ? cardsReviewedStats[0].totalCards : 0;
  const correctCardsReviewed = cardsReviewedStats.length > 0 ? cardsReviewedStats[0].correctCards : 0;
  const averageScore = cardsReviewedStats.length > 0 ? Math.round(cardsReviewedStats[0].averageScore) : 0;
  const totalTimeMinutes = timeStats.length > 0 ? Math.round(timeStats[0].totalTime / 60) : 0;

  res.json({
    totalSessions,
    totalCardsReviewed,
    correctCardsReviewed,
    averageScore,
    totalTimeMinutes,
    dailyActivity
  });
});

module.exports = {
  startReviewSession,
  updateReviewSession,
  getReviewSessionById,
  getUserReviewSessions,
  getReviewStats
};
