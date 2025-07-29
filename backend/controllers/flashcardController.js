const asyncHandler = require('express-async-handler');
const Flashcard = require('../models/flashcardModel');
const Collection = require('../models/collectionModel');

/**
 * @desc    Créer une nouvelle flashcard
 * @route   POST /api/flashcards
 * @access  Private
 */
const createFlashcard = asyncHandler(async (req, res) => {
  const { 
    collection, 
    question, 
    answer, 
    difficulty, 
    notes, 
    tags,
    cardType,
    options,
    imageUrl
  } = req.body;

  // Vérifier si les champs requis sont présents
  if (!collection || !question || !answer) {
    res.status(400);
    throw new Error('Veuillez fournir une collection, une question et une réponse');
  }

  // Vérifier si la collection existe
  const collectionExists = await Collection.findById(collection);
  if (!collectionExists) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire de la collection
  if (collectionExists.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette collection');
  }

  // Créer la flashcard
  const flashcard = await Flashcard.create({
    collection,
    question,
    answer,
    difficulty: difficulty || 'medium',
    notes,
    tags: tags || [],
    user: req.user._id,
    cardType: cardType || 'basic',
    options: options || [],
    imageUrl
  });

  // Mettre à jour le compteur de cartes de la collection
  await Collection.findByIdAndUpdate(collection, {
    $inc: { cardsCount: 1 },
    lastStudied: new Date()
  });

  res.status(201).json(flashcard);
});

/**
 * @desc    Obtenir toutes les flashcards d'une collection
 * @route   GET /api/flashcards/collection/:collectionId
 * @access  Private
 */
const getFlashcardsByCollection = asyncHandler(async (req, res) => {
  const { collectionId } = req.params;
  
  // Vérifier si la collection existe
  const collection = await Collection.findById(collectionId);
  if (!collection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est autorisé à voir cette collection
  if (!collection.isPublic && collection.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé');
  }

  const flashcards = await Flashcard.find({ collection: collectionId })
    .sort({ createdAt: 1 }); // Tri croissant: du plus ancien au plus récent

  res.json({
    success: true,
    data: flashcards
  });
});

/**
 * @desc    Obtenir une flashcard par ID
 * @route   GET /api/flashcards/:id
 * @access  Private
 */
const getFlashcardById = asyncHandler(async (req, res) => {
  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    res.status(404);
    throw new Error('Flashcard non trouvée');
  }

  // Vérifier si l'utilisateur est autorisé à voir cette flashcard
  const collection = await Collection.findById(flashcard.collection);
  if (!collection.isPublic && flashcard.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé');
  }

  res.json(flashcard);
});

/**
 * @desc    Mettre à jour une flashcard
 * @route   PUT /api/flashcards/:id
 * @access  Private
 */
const updateFlashcard = asyncHandler(async (req, res) => {
  const {
    question,
    answer,
    difficulty,
    notes,
    tags,
    cardType,
    options,
    imageUrl
  } = req.body;

  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    res.status(404);
    throw new Error('Flashcard non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (flashcard.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette flashcard');
  }

  // Mettre à jour les champs
  flashcard.question = question || flashcard.question;
  flashcard.answer = answer || flashcard.answer;
  flashcard.difficulty = difficulty || flashcard.difficulty;
  flashcard.notes = notes !== undefined ? notes : flashcard.notes;
  flashcard.tags = tags || flashcard.tags;
  flashcard.cardType = cardType || flashcard.cardType;
  flashcard.options = options || flashcard.options;
  flashcard.imageUrl = imageUrl !== undefined ? imageUrl : flashcard.imageUrl;

  const updatedFlashcard = await flashcard.save();
  res.json(updatedFlashcard);
});

/**
 * @desc    Supprimer une flashcard
 * @route   DELETE /api/flashcards/:id
 * @access  Private
 */
const deleteFlashcard = asyncHandler(async (req, res) => {
  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    res.status(404);
    throw new Error('Flashcard non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (flashcard.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette flashcard');
  }

  // Supprimer la flashcard en utilisant la méthode moderne de Mongoose
  await Flashcard.deleteOne({ _id: flashcard._id });
  
  // Mettre à jour le compteur de cartes de la collection
  await Collection.findByIdAndUpdate(flashcard.collection, {
    $inc: { cardsCount: -1 }
  });

  res.json({ message: 'Flashcard supprimée avec succès' });
});

/**
 * @desc    Obtenir les flashcards à réviser aujourd'hui
 * @route   GET /api/flashcards/review/today
 * @access  Private
 */
const getFlashcardsToReviewToday = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Fin de la journée

  const flashcards = await Flashcard.find({
    user: req.user._id,
    nextReviewDate: { $lte: today }
  })
  .populate('collection', 'name imageUrl')
  .sort({ nextReviewDate: 1 });

  res.json(flashcards);
});

/**
 * @desc    Mettre à jour l'état de révision d'une flashcard
 * @route   PUT /api/flashcards/:id/review
 * @access  Private
 */
const updateFlashcardReview = asyncHandler(async (req, res) => {
  const { performance, timeSpent } = req.body;

  // Vérifier les données requises
  if (!performance) {
    res.status(400);
    throw new Error('Veuillez fournir une évaluation de performance');
  }

  const flashcard = await Flashcard.findById(req.params.id);

  if (!flashcard) {
    res.status(404);
    throw new Error('Flashcard non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (flashcard.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette flashcard');
  }

  // Enregistrer l'historique de révision
  flashcard.reviewHistory.push({
    date: new Date(),
    performance,
    timeSpent: timeSpent || 0
  });

  // Calculer le prochain intervalle de révision
  flashcard.calculateNextReview(performance);

  // Sauvegarder les modifications
  const updatedFlashcard = await flashcard.save();

  // Mettre à jour la date de dernière étude de la collection
  await Collection.findByIdAndUpdate(flashcard.collection, {
    lastStudied: new Date()
  });

  res.json(updatedFlashcard);
});

// Définition supprimée - Fonction deleteFlashcard déjà définie aux lignes 164-187

/**
 * @desc    Obtenir les statistiques des flashcards de l'utilisateur
 * @route   GET /api/flashcards/stats
 * @access  Private
 */
const getFlashcardStats = asyncHandler(async (req, res) => {
  // Nombre total de cartes
  const totalCards = await Flashcard.countDocuments({ user: req.user._id });

  // Nombre de cartes par statut
  const cardsByStatus = await Flashcard.aggregate([
    { $match: { user: req.user._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Nombre de cartes à réviser aujourd'hui
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const dueToday = await Flashcard.countDocuments({
    user: req.user._id,
    nextReviewDate: { $lte: today }
  });

  // Activité de révision des 30 derniers jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const reviewActivity = await Flashcard.aggregate([
    { $match: { user: req.user._id } },
    { $unwind: '$reviewHistory' },
    { $match: { 'reviewHistory.date': { $gte: thirtyDaysAgo } } },
    { $group: {
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$reviewHistory.date' } 
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Formater les résultats
  const statusMap = {};
  cardsByStatus.forEach(item => {
    statusMap[item._id] = item.count;
  });

  res.json({
    totalCards,
    dueToday,
    cardsByStatus: {
      new: statusMap.new || 0,
      learning: statusMap.learning || 0,
      review: statusMap.review || 0,
      mastered: statusMap.mastered || 0
    },
    reviewActivity
  });
});

/**
 * @desc    Récupérer toutes les flashcards de l'utilisateur
 * @route   GET /api/flashcards
 * @access  Private
 */
const getAllUserFlashcards = asyncHandler(async (req, res) => {
  // Récupérer toutes les cartes de l'utilisateur connecté
  const flashcards = await Flashcard.find({ user: req.user._id })
    .populate('collection', 'name imageUrl')
    .sort({ createdAt: 1 }); // Tri croissant: du plus ancien au plus récent

  res.json(flashcards);
});

/**
 * @desc    Récupérer les flashcards à revoir maintenant
 * @route   GET /api/flashcards/due-now
 * @access  Private
 */
const getFlashcardsDueNow = asyncHandler(async (req, res) => {
  const now = new Date();

  const flashcards = await Flashcard.find({
    user: req.user._id,
    nextReviewDate: { $lte: now }
  })
  .populate('collection', 'name imageUrl')
  .sort({ nextReviewDate: 1 });

  // Séparer les cartes par type de révision
  const difficultCards = flashcards.filter(card => {
    // Cartes marquées comme difficiles (interval très court)
    // Inclut 'again' (0.001) et 'hard' (0.003)
    return card.interval <= 0.01;
  });

  const easyCards = flashcards.filter(card => {
    // Cartes marquées comme faciles ou correctes (interval d'1 jour ou plus)
    // Inclut 'good' et 'easy' (interval = 1)
    return card.interval >= 1;
  });

  res.json({
    total: flashcards.length,
    difficultCards: difficultCards.length,
    easyCards: easyCards.length,
    cards: flashcards
  });
});

module.exports = {
  createFlashcard,
  getFlashcardsByCollection,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  getFlashcardsToReviewToday,
  updateFlashcardReview,
  getFlashcardStats,
  getAllUserFlashcards,
  getFlashcardsDueNow
};
