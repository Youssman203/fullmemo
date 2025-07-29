const SharedLink = require('../models/sharedLinkModel');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');
const crypto = require('crypto');

// Générer un lien de partage pour une collection
const createSharedLink = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const {
      permissions = ['view', 'copy'],
      expiresAt = null,
      maxUses = null,
      password = null
    } = req.body;

    console.log(`🔗 Création d'un lien partagé pour collection ${collectionId} par utilisateur ${req.user.id}`);

    // Vérifier que la collection existe et appartient à l'utilisateur
    const collection = await Collection.findOne({
      _id: collectionId,
      user: req.user.id
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection non trouvée ou vous n\'avez pas les permissions'
      });
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex');

    // Créer le lien partagé
    const sharedLink = new SharedLink({
      token,
      collection: collectionId,
      createdBy: req.user.id,
      config: {
        permissions,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses,
        password
      }
    });

    await sharedLink.save();

    // Populer les données pour la réponse
    await sharedLink.populate('collection', 'name description cardsCount category');
    await sharedLink.populate('createdBy', 'name email');

    console.log(`✅ Lien partagé créé avec token: ${token}`);

    res.status(201).json({
      success: true,
      data: {
        ...sharedLink.toObject(),
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${token}`
      },
      message: 'Lien de partage créé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la création du lien partagé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Récupérer une collection via un lien partagé
const getSharedCollection = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.query;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`🔍 Accès au lien partagé token: ${token} depuis IP: ${clientIP}`);

    // Trouver le lien partagé
    const sharedLink = await SharedLink.findOne({ token, isActive: true })
      .populate({
        path: 'collection',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate('createdBy', 'name email');

    if (!sharedLink) {
      return res.status(404).json({
        success: false,
        message: 'Lien de partage introuvable ou expiré'
      });
    }

    // Vérifier la validité du lien
    if (!sharedLink.isValid()) {
      await SharedLink.findByIdAndUpdate(sharedLink._id, { isActive: false });
      return res.status(410).json({
        success: false,
        message: 'Ce lien de partage a expiré'
      });
    }

    // Vérifier le mot de passe si requis
    if (sharedLink.config.password && sharedLink.config.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe requis pour accéder à cette collection',
        requiresPassword: true
      });
    }

    // Enregistrer l'accès
    await sharedLink.recordAccess(clientIP, userAgent, 'view');

    // Récupérer les cartes si permission 'view'
    let flashcards = [];
    if (sharedLink.config.permissions.includes('view')) {
      flashcards = await Flashcard.find({ 
        collection: sharedLink.collection._id 
      }).select('question answer difficulty category tags createdAt');
    }

    console.log(`✅ Collection partagée récupérée: ${sharedLink.collection.name} (${flashcards.length} cartes)`);

    res.json({
      success: true,
      data: {
        collection: {
          _id: sharedLink.collection._id,
          name: sharedLink.collection.name,
          description: sharedLink.collection.description,
          category: sharedLink.collection.category,
          difficulty: sharedLink.collection.difficulty,
          tags: sharedLink.collection.tags,
          cardsCount: flashcards.length,
          createdBy: {
            name: sharedLink.collection.user.name,
            email: sharedLink.collection.user.email
          }
        },
        flashcards,
        sharedLink: {
          permissions: sharedLink.config.permissions,
          createdBy: sharedLink.createdBy,
          createdAt: sharedLink.createdAt,
          stats: {
            viewCount: sharedLink.stats.viewCount,
            downloadCount: sharedLink.stats.downloadCount
          }
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'accès au lien partagé:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Télécharger (copier) une collection via un lien partagé
const downloadSharedCollection = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';

    console.log(`📥 Téléchargement via lien partagé token: ${token}`);

    // Trouver le lien partagé
    const sharedLink = await SharedLink.findOne({ token, isActive: true })
      .populate('collection');

    if (!sharedLink || !sharedLink.isValid()) {
      return res.status(404).json({
        success: false,
        message: 'Lien de partage introuvable ou expiré'
      });
    }

    // Vérifier les permissions
    if (!sharedLink.config.permissions.includes('copy') && 
        !sharedLink.config.permissions.includes('download')) {
      return res.status(403).json({
        success: false,
        message: 'Téléchargement non autorisé pour ce lien'
      });
    }

    // Vérifier le mot de passe si requis
    if (sharedLink.config.password && sharedLink.config.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe requis pour télécharger cette collection'
      });
    }

    // Si utilisateur connecté, copier dans ses collections
    if (req.user) {
      // Vérifier si déjà importée (pour éviter doublons)
      const existingCollection = await Collection.findOne({
        user: req.user.id,
        name: { $regex: new RegExp(`^${sharedLink.collection.name}`, 'i') },
        description: { $regex: /imported from shared link/i }
      });

      if (existingCollection) {
        return res.status(400).json({
          success: false,
          message: 'Cette collection a déjà été importée'
        });
      }

      // Créer une copie de la collection
      const newCollection = new Collection({
        name: `${sharedLink.collection.name} (Partagé)`,
        description: `${sharedLink.collection.description || ''}\n\n[Collection importée depuis un lien partagé]`,
        category: sharedLink.collection.category,
        difficulty: sharedLink.collection.difficulty,
        tags: [...(sharedLink.collection.tags || []), 'lien-partagé'],
        user: req.user.id
      });

      await newCollection.save();

      // Copier les cartes
      const originalCards = await Flashcard.find({ collection: sharedLink.collection._id });
      const newCards = originalCards.map(card => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        category: card.category,
        tags: card.tags,
        collection: newCollection._id,
        user: req.user.id,
        reviewStatus: 'new',
        reviewDate: new Date(),
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0
      }));

      await Flashcard.insertMany(newCards);

      // Mettre à jour le nombre de cartes
      newCollection.cardsCount = newCards.length;
      await newCollection.save();

      // Enregistrer le téléchargement
      await sharedLink.recordAccess(clientIP, userAgent, 'download');

      console.log(`✅ Collection téléchargée: ${newCollection.name} (${newCards.length} cartes)`);

      res.json({
        success: true,
        data: {
          collection: newCollection,
          cardsImported: newCards.length
        },
        message: 'Collection importée avec succès dans vos collections personnelles'
      });

    } else {
      // Utilisateur non connecté - retourner les données pour téléchargement
      const flashcards = await Flashcard.find({ 
        collection: sharedLink.collection._id 
      }).select('question answer difficulty category tags');

      await sharedLink.recordAccess(clientIP, userAgent, 'download');

      res.json({
        success: true,
        data: {
          collection: sharedLink.collection,
          flashcards,
          format: 'json'
        },
        message: 'Données de la collection récupérées pour téléchargement'
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Récupérer les liens partagés d'un utilisateur
const getUserSharedLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`📋 Récupération des liens partagés pour utilisateur ${userId}`);

    const sharedLinks = await SharedLink.find({ createdBy: userId })
      .populate('collection', 'name description cardsCount category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: sharedLinks.map(link => ({
        ...link.toObject(),
        shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/shared/${link.token}`
      }))
    });

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des liens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Désactiver un lien partagé
const deactivateSharedLink = async (req, res) => {
  try {
    const { linkId } = req.params;
    const userId = req.user.id;

    const sharedLink = await SharedLink.findOneAndUpdate(
      { _id: linkId, createdBy: userId },
      { isActive: false },
      { new: true }
    );

    if (!sharedLink) {
      return res.status(404).json({
        success: false,
        message: 'Lien partagé non trouvé'
      });
    }

    res.json({
      success: true,
      data: sharedLink,
      message: 'Lien partagé désactivé avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la désactivation du lien:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  createSharedLink,
  getSharedCollection,
  downloadSharedCollection,
  getUserSharedLinks,
  deactivateSharedLink
};
