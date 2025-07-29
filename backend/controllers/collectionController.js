const asyncHandler = require('express-async-handler');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');

/**
 * @desc    Créer une nouvelle collection
 * @route   POST /api/collections
 * @access  Private
 */
const createCollection = asyncHandler(async (req, res) => {
  const { name, description, imageUrl, isPublic, category, tags } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Le nom de la collection est obligatoire');
  }

  const collection = await Collection.create({
    name,
    description,
    imageUrl,
    user: req.user._id,
    isPublic: isPublic || false,
    category: category || 'other',
    tags: tags || []
  });

  res.status(201).json(collection);
});

/**
 * @desc    Obtenir toutes les collections de l'utilisateur
 * @route   GET /api/collections
 * @access  Private
 */
const getUserCollections = asyncHandler(async (req, res) => {
  const collections = await Collection.find({ user: req.user._id })
    .sort({ updatedAt: -1 });

  res.json({
    success: true,
    data: collections
  });
});

/**
 * @desc    Obtenir une collection par son ID
 * @route   GET /api/collections/:id
 * @access  Private
 */
const getCollectionById = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est autorisé à voir cette collection
  if (!collection.isPublic && collection.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé');
  }

  res.json(collection);
});

/**
 * @desc    Mettre à jour une collection
 * @route   PUT /api/collections/:id
 * @access  Private
 */
const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (collection.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette collection');
  }

  const { name, description, imageUrl, isPublic, category, tags } = req.body;

  collection.name = name || collection.name;
  collection.description = description !== undefined ? description : collection.description;
  collection.imageUrl = imageUrl || collection.imageUrl;
  collection.isPublic = isPublic !== undefined ? isPublic : collection.isPublic;
  collection.category = category || collection.category;
  collection.tags = tags || collection.tags;

  const updatedCollection = await collection.save();
  res.json(updatedCollection);
});

/**
 * @desc    Supprimer une collection
 * @route   DELETE /api/collections/:id
 * @access  Private
 */
const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findById(req.params.id);

  if (!collection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'utilisateur est le propriétaire
  if (collection.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé, vous n\'êtes pas le propriétaire de cette collection');
  }

  // Supprimer toutes les flashcards associées
  await Flashcard.deleteMany({ collection: collection._id });

  // Supprimer la collection en utilisant la méthode moderne de Mongoose
  await Collection.deleteOne({ _id: collection._id });
  res.json({ message: 'Collection supprimée avec succès' });
});

/**
 * @desc    Obtenir toutes les collections publiques
 * @route   GET /api/collections/public
 * @access  Public
 */
const getPublicCollections = asyncHandler(async (req, res) => {
  const { category, search, limit = 10, page = 1 } = req.query;
  const query = { isPublic: true };

  // Filtrer par catégorie si spécifiée
  if (category && category !== 'all') {
    query.category = category;
  }

  // Recherche par nom ou description si spécifié
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Pagination
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);
  const skip = (pageNumber - 1) * limitNumber;

  const collections = await Collection.find(query)
    .populate('user', 'name profileImage')
    .sort({ updatedAt: -1 })
    .limit(limitNumber)
    .skip(skip);

  // Compter le nombre total de collections correspondant à la requête
  const total = await Collection.countDocuments(query);

  res.json({
    collections,
    page: pageNumber,
    pages: Math.ceil(total / limitNumber),
    total
  });
});

/**
 * @desc    Obtenir les collections populaires
 * @route   GET /api/collections/popular
 * @access  Public
 */
const getPopularCollections = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  const collections = await Collection.find({ isPublic: true })
    .populate('user', 'name profileImage')
    .sort({ cardsCount: -1 })
    .limit(parseInt(limit, 10));

  res.json(collections);
});

module.exports = {
  createCollection,
  getUserCollections,
  getCollectionById,
  updateCollection,
  deleteCollection,
  getPublicCollections,
  getPopularCollections
};
