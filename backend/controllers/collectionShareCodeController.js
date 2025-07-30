const CollectionShareCode = require('../models/collectionShareCodeModel');
const Collection = require('../models/collectionModel');
const Flashcard = require('../models/flashcardModel');

// Générer un code de partage pour une collection
const generateShareCode = async (req, res) => {
  try {
    const { collectionId } = req.params;
    const userId = req.user._id;

    console.log('🔢 Génération code de partage pour collection:', collectionId);
    console.log('👤 Par utilisateur:', userId);

    // Vérifier que la collection existe et appartient à l'utilisateur
    const collection = await Collection.findOne({ 
      _id: collectionId, 
      user: userId 
    });

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection non trouvée ou accès non autorisé'
      });
    }

    // Vérifier s'il existe déjà un code actif pour cette collection
    const existingCode = await CollectionShareCode.findOne({
      collection: collectionId,
      createdBy: userId,
      isActive: true,
      'config.expiresAt': { $gt: new Date() }
    });

    if (existingCode) {
      console.log('✅ Code existant trouvé:', existingCode.code);
      return res.status(200).json({
        success: true,
        message: 'Code de partage récupéré',
        data: {
          code: existingCode.code,
          shareCode: existingCode,
          collection: collection,
          expiresAt: existingCode.config.expiresAt,
          permissions: existingCode.config.permissions
        }
      });
    }

    // Générer un nouveau code unique
    const code = await CollectionShareCode.generateUniqueCode();
    console.log('🆕 Nouveau code généré:', code);

    // Créer le code de partage
    const shareCode = new CollectionShareCode({
      code,
      collection: collectionId,
      createdBy: userId,
      config: {
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        permissions: ['view', 'copy']
      }
    });

    await shareCode.save();
    console.log('💾 Code de partage sauvegardé:', shareCode._id);

    res.status(201).json({
      success: true,
      message: 'Code de partage généré avec succès',
      data: {
        code: shareCode.code,
        shareCode: shareCode,
        collection: collection,
        expiresAt: shareCode.config.expiresAt,
        permissions: shareCode.config.permissions
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération code de partage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération du code',
      error: error.message
    });
  }
};

// Accéder à une collection via un code de partage
const getCollectionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user?.id; // Optionnel

    console.log('🔍 Recherche collection avec code:', code);
    console.log('👤 Utilisateur:', userId || 'Non connecté');

    // Rechercher le code de partage
    const shareCode = await CollectionShareCode.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    })
    .populate('collection')
    .populate('createdBy', 'name email');

    if (!shareCode) {
      return res.status(404).json({
        success: false,
        message: 'Code de partage introuvable ou inactif'
      });
    }

    // Vérifier la validité du code
    if (!shareCode.isValid()) {
      return res.status(410).json({
        success: false,
        message: 'Code de partage expiré'
      });
    }

    // Récupérer les cartes de la collection
    const flashcards = await Flashcard.find({ 
      collection: shareCode.collection._id 
    }).select('question answer difficulty category tags');

    console.log(`📚 Collection trouvée: ${shareCode.collection.name}`);
    console.log(`🃏 Cartes trouvées: ${flashcards.length}`);

    // Enregistrer l'utilisation si l'utilisateur est connecté
    if (userId) {
      await shareCode.recordUsage(userId);
      console.log('📊 Utilisation enregistrée pour utilisateur:', userId);
    }

    res.status(200).json({
      success: true,
      message: 'Collection récupérée avec succès',
      data: {
        collection: shareCode.collection,
        flashcards: flashcards,
        shareCode: {
          code: shareCode.code,
          permissions: shareCode.config.permissions,
          expiresAt: shareCode.config.expiresAt,
          createdBy: shareCode.createdBy
        },
        stats: {
          useCount: shareCode.stats.useCount,
          lastUsedAt: shareCode.stats.lastUsedAt
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération collection par code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération',
      error: error.message
    });
  }
};

// Importer une collection via un code de partage
const importCollectionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user._id;

    console.log('📥 Import collection avec code:', code);
    console.log('👤 Par utilisateur (ObjectId):', userId);
    console.log('👤 Type userId:', typeof userId);
    console.log('🕐 Timestamp import:', new Date().toISOString());

    // Rechercher le code de partage
    const shareCode = await CollectionShareCode.findOne({ 
      code: code.toUpperCase(), 
      isActive: true 
    })
    .populate('collection')
    .populate('createdBy', 'name email');

    if (!shareCode) {
      return res.status(404).json({
        success: false,
        message: 'Code de partage introuvable'
      });
    }

    // Vérifier la validité et les permissions
    if (!shareCode.isValid()) {
      return res.status(410).json({
        success: false,
        message: 'Code de partage expiré'
      });
    }

    if (!shareCode.config.permissions.includes('copy')) {
      return res.status(403).json({
        success: false,
        message: 'Import non autorisé pour ce code'
      });
    }

    // Vérifier si l'utilisateur a déjà importé cette collection
    const existingCollection = await Collection.findOne({
      user: userId,
      name: shareCode.collection.name + ' (Importé)',
      tags: { $in: [`source_${shareCode.collection._id}_code_${shareCode.code}`] }
    });

    if (existingCollection) {
      return res.status(400).json({
        success: false,
        message: 'Vous avez déjà importé cette collection'
      });
    }

    // Récupérer les cartes originales
    const originalCards = await Flashcard.find({ 
      collection: shareCode.collection._id 
    });

    // Créer la nouvelle collection
    const newCollection = new Collection({
      name: shareCode.collection.name + ' (Importé)',
      description: shareCode.collection.description + 
                   `\n\nImporté via le code ${shareCode.code} de ${shareCode.createdBy.name}`,
      category: shareCode.collection.category,
      difficulty: shareCode.collection.difficulty,
      tags: [
        ...shareCode.collection.tags,
        'importé',
        `source_${shareCode.collection._id}_code_${shareCode.code}`
      ],
      user: userId
    });

    await newCollection.save();
    console.log('✅ Nouvelle collection créée:', newCollection._id);
    console.log('💾 Collection user field:', newCollection.user);
    console.log('💾 User field type:', typeof newCollection.user);
    console.log('💾 Collection name:', newCollection.name);

    // Copier les cartes
    const newCards = [];
    for (const card of originalCards) {
      const newCard = new Flashcard({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        category: card.category,
        tags: [...card.tags, 'importé'],
        collection: newCollection._id,
        user: userId,
        reviewStatus: 'new',
        nextReviewDate: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0
      });
      
      await newCard.save();
      newCards.push(newCard);
    }

    console.log(`📋 ${newCards.length} cartes copiées`);

    // Enregistrer l'utilisation
    await shareCode.recordUsage(userId);

    // 🔥 ÉMISSION WEBSOCKET - NOUVELLE COLLECTION IMPORTÉE
    const io = req.app.get('io');
    if (io) {
      const collectionData = {
        _id: newCollection._id,
        name: newCollection.name,
        description: newCollection.description,
        category: newCollection.category,
        difficulty: newCollection.difficulty,
        tags: newCollection.tags,
        user: newCollection.user,
        createdAt: newCollection.createdAt,
        flashcardsCount: newCards.length,
        isImported: true,
        sourceCode: shareCode.code,
        originalCollection: {
          name: shareCode.collection.name,
          author: shareCode.createdBy.name
        }
      };
      
      // Émettre vers la room de l'utilisateur qui importe
      io.to(`user_${userId}`).emit('newCollection', {
        type: 'collection_imported',
        collection: collectionData,
        message: `Collection "${shareCode.collection.name}" importée avec succès`,
        timestamp: new Date().toISOString()
      });
      
      console.log(`🚀 WebSocket: Collection importée émise vers user_${userId}`.green);
      console.log(`📊 Données envoyées: ${collectionData.name} (${newCards.length} cartes)`.cyan);
    } else {
      console.log('⚠️ WebSocket non disponible pour l\'émission'.yellow);
    }

    res.status(201).json({
      success: true,
      message: `Collection "${shareCode.collection.name}" importée avec succès`,
      data: {
        collection: newCollection,
        flashcards: newCards,
        originalCollection: shareCode.collection,
        sourceCode: shareCode.code
      }
    });

  } catch (error) {
    console.error('❌ Erreur import collection par code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'import',
      error: error.message
    });
  }
};

// Récupérer tous les codes de partage d'un utilisateur
const getUserShareCodes = async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('📋 Récupération codes de partage pour:', userId);

    const shareCodes = await CollectionShareCode.find({ 
      createdBy: userId 
    })
    .populate('collection', 'name description cardCount')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Codes de partage récupérés',
      data: shareCodes
    });

  } catch (error) {
    console.error('❌ Erreur récupération codes utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// Désactiver un code de partage
const deactivateShareCode = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user._id;

    console.log('🚫 Désactivation code:', code);

    const shareCode = await CollectionShareCode.findOneAndUpdate(
      { 
        code: code.toUpperCase(), 
        createdBy: userId,
        isActive: true 
      },
      { 
        isActive: false 
      },
      { new: true }
    );

    if (!shareCode) {
      return res.status(404).json({
        success: false,
        message: 'Code de partage non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Code de partage désactivé',
      data: shareCode
    });

  } catch (error) {
    console.error('❌ Erreur désactivation code:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = {
  generateShareCode,
  getCollectionByCode,
  importCollectionByCode,
  getUserShareCodes,
  deactivateShareCode
};
