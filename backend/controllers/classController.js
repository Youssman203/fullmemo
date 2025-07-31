const asyncHandler = require('express-async-handler');
const Class = require('../models/classModel');
const User = require('../models/userModel');
const Collection = require('../models/collectionModel');

/**
 * @desc    Créer une nouvelle classe
 * @route   POST /api/classes
 * @access  Private (Teacher only)
 */
const createClass = asyncHandler(async (req, res) => {
  const { name, description, maxStudents, allowSelfEnrollment } = req.body;

  // Vérifier que l'utilisateur est un enseignant
  if (req.user.role !== 'teacher') {
    res.status(403);
    throw new Error('Seuls les enseignants peuvent créer des classes');
  }

  // Créer la classe
  const classData = await Class.create({
    name,
    description,
    teacherId: req.user._id,
    settings: {
      maxStudents: maxStudents || 50,
      allowSelfEnrollment: allowSelfEnrollment !== false
    }
  });

  // Populer les données de l'enseignant
  await classData.populate('teacherId', 'name email');

  res.status(201).json({
    success: true,
    data: classData,
    message: 'Classe créée avec succès'
  });
});

/**
 * @desc    Obtenir toutes les classes d'un enseignant
 * @route   GET /api/classes
 * @access  Private (Teacher only)
 */
const getTeacherClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacherId: req.user._id })
    .populate('students', 'name email')
    .populate('collections', 'name description')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: classes.length,
    data: classes
  });
});

/**
 * @desc    Obtenir une classe spécifique avec détails
 * @route   GET /api/classes/:id
 * @access  Private (Teacher only)
 */
const getClassById = asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id)
    .populate('teacherId', 'name email')
    .populate('collections', 'name description cardCount createdAt user')
    .populate('students', 'name email');

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  res.json({
    success: true,
    data: {
      _id: classData._id,
      name: classData.name,
      description: classData.description,
      inviteCode: classData.inviteCode,
      isActive: classData.isActive,
      settings: classData.settings,
      createdAt: classData.createdAt,
      teacher: {
        _id: classData.teacherId._id,
        name: classData.teacherId.name,
        email: classData.teacherId.email
      },
      students: classData.students.map(student => ({
        _id: student._id,
        name: student.name,
        email: student.email
      })),
      collections: classData.collections.map(collection => ({
        _id: collection._id,
        name: collection.name,
        description: collection.description,
        cardCount: collection.cardCount,
        createdAt: collection.createdAt,
        user: collection.user
      })),
      stats: {
        totalStudents: classData.students.length,
        totalCollections: classData.collections.length,
        totalCards: classData.collections.reduce((total, col) => total + (col.cardCount || 0), 0),
        maxStudents: classData.settings.maxStudents,
        allowSelfEnrollment: classData.settings.allowSelfEnrollment
      }
    }
  });
});

/**
 * @desc    Mettre à jour une classe
 * @route   PUT /api/classes/:id
 * @access  Private (Teacher only)
 */
const updateClass = asyncHandler(async (req, res) => {
  const { name, description, maxStudents, allowSelfEnrollment, isActive } = req.body;

  const classData = await Class.findById(req.params.id);

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  // Mettre à jour les champs
  classData.name = name || classData.name;
  classData.description = description || classData.description;
  classData.isActive = isActive !== undefined ? isActive : classData.isActive;
  
  if (maxStudents) classData.settings.maxStudents = maxStudents;
  if (allowSelfEnrollment !== undefined) classData.settings.allowSelfEnrollment = allowSelfEnrollment;

  await classData.save();

  res.json({
    success: true,
    data: classData,
    message: 'Classe mise à jour avec succès'
  });
});

/**
 * @desc    Supprimer une classe
 * @route   DELETE /api/classes/:id
 * @access  Private (Teacher only)
 */
const deleteClass = asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id);

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  await classData.deleteOne();

  res.json({
    success: true,
    message: 'Classe supprimée avec succès'
  });
});

/**
 * @desc    Inviter des étudiants par email
 * @route   POST /api/classes/:id/invite
 * @access  Private (Teacher only)
 */
const inviteStudents = asyncHandler(async (req, res) => {
  const { emails } = req.body;

  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    res.status(400);
    throw new Error('Liste d\'emails requise');
  }

  const classData = await Class.findById(req.params.id);

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  const results = {
    invited: [],
    alreadyInClass: [],
    notFound: []
  };

  for (const email of emails) {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      results.notFound.push(email);
      continue;
    }

    if (classData.hasStudent(user._id)) {
      results.alreadyInClass.push(email);
      continue;
    }

    await classData.addStudent(user._id);
    results.invited.push(email);
  }

  res.json({
    success: true,
    data: results,
    message: `${results.invited.length} étudiant(s) invité(s) avec succès`
  });
});

/**
 * @desc    Rejoindre une classe avec code d'invitation
 * @route   POST /api/classes/join/:inviteCode
 * @access  Private (Student only)
 */
const joinClassByCode = asyncHandler(async (req, res) => {
  const { inviteCode } = req.params;

  const classData = await Class.findOne({ 
    inviteCode: inviteCode.toUpperCase(),
    isActive: true 
  }).populate('teacherId', 'name email');

  if (!classData) {
    res.status(404);
    throw new Error('Code d\'invitation invalide ou classe inactive');
  }

  // Vérifier si l'auto-inscription est autorisée
  if (!classData.settings.allowSelfEnrollment) {
    res.status(403);
    throw new Error('L\'auto-inscription n\'est pas autorisée pour cette classe');
  }

  // Vérifier la limite d'étudiants
  if (classData.students.length >= classData.settings.maxStudents) {
    res.status(400);
    throw new Error('Cette classe a atteint sa limite d\'étudiants');
  }

  // Vérifier si l'étudiant est déjà dans la classe
  if (classData.hasStudent(req.user._id)) {
    res.status(400);
    throw new Error('Vous êtes déjà inscrit dans cette classe');
  }

  // Ajouter l'étudiant à la classe
  await classData.addStudent(req.user._id);

  res.json({
    success: true,
    data: {
      class: {
        _id: classData._id,
        name: classData.name,
        description: classData.description,
        teacher: classData.teacherId
      }
    },
    message: `Vous avez rejoint la classe "${classData.name}" avec succès`
  });
});

/**
 * @desc    Récupérer les classes d'un étudiant
 * @route   GET /api/classes/student
 * @access  Private (Student only)
 */
const getStudentClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ 
    students: req.user._id,
    isActive: true 
  })
    .populate('teacherId', 'name email')
    .populate('collections', 'name description cardCount')
    .populate('students', 'name email')
    .sort({ createdAt: -1 });

  // Enrichir les données de chaque classe
  const enrichedClasses = classes.map(classData => {
    const classObj = classData.toObject();
    
    // Trouver l'entrée de l'étudiant pour la date de rejointe
    const studentEntry = classData.students.find(student => 
      student._id.toString() === req.user._id.toString()
    );
    
    // Calculer les statistiques
    const totalStudents = classData.students.length;
    const totalCollections = classData.collections ? classData.collections.length : 0;
    const totalCards = classData.collections ? 
      classData.collections.reduce((sum, collection) => sum + (collection.cardCount || 0), 0) : 0;
    
    return {
      ...classObj,
      // Informations de base
      joinDate: studentEntry ? studentEntry.joinDate : classData.createdAt,
      
      // Statistiques détaillées
      stats: {
        totalStudents,
        totalCollections,
        totalCards,
        maxStudents: classData.settings?.maxStudents || 50,
        allowSelfEnrollment: classData.settings?.allowSelfEnrollment || false
      },
      
      // Informations sur l'enseignant
      teacher: {
        id: classData.teacherId._id,
        name: classData.teacherId.name,
        email: classData.teacherId.email
      },
      
      // Liste des autres étudiants (sans l'étudiant actuel)
      classmates: classData.students
        .filter(student => student._id.toString() !== req.user._id.toString())
        .map(student => ({
          id: student._id,
          name: student.name,
          email: student.email
        }))
    };
  });

  res.json({
    success: true,
    count: classes.length,
    data: enrichedClasses
  });
});

/**
 * @desc    Retirer un étudiant d'une classe
 * @route   DELETE /api/classes/:id/students/:studentId
 * @access  Private (Teacher only)
 */
const removeStudent = asyncHandler(async (req, res) => {
  const { id: classId, studentId } = req.params;

  const classData = await Class.findById(classId);

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  await classData.removeStudent(studentId);

  res.json({
    success: true,
    message: 'Étudiant retiré de la classe avec succès'
  });
});

/**
 * @desc    Récupérer les collections d'une classe
 * @route   GET /api/classes/:id/collections
 * @access  Private (Student/Teacher)
 */
const getClassCollections = asyncHandler(async (req, res) => {
  const { id: classId } = req.params;

  console.log(`📚 [API] Récupération collections classe ${classId} par utilisateur ${req.user._id}`);

  // Récupérer la classe avec ses collections populées
  const classData = await Class.findById(classId)
    .populate({
      path: 'collections',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('teacherId', 'name email')
    .populate('students', 'name email');

  if (!classData) {
    console.log(`❌ [API] Classe ${classId} non trouvée`);
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur a accès à cette classe (étudiant ou enseignant)
  const isTeacher = classData.teacherId._id.toString() === req.user._id.toString();
  const isStudent = classData.students.some(student => 
    student._id.toString() === req.user._id.toString()
  );

  if (!isTeacher && !isStudent) {
    console.log(`❌ [API] Accès refusé à la classe ${classId} pour utilisateur ${req.user._id}`);
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  // Enrichir les collections avec des informations supplémentaires
  const enrichedCollections = classData.collections.map(collection => {
    const collectionObj = collection.toObject();
    
    return {
      ...collectionObj,
      // Ajouter le nombre de cartes si pas déjà présent
      cardCount: collection.cardCount || 0,
      // Informations sur le créateur
      createdBy: {
        _id: collection.user._id,
        name: collection.user.name,
        email: collection.user.email
      },
      // Métadonnées
      sharedAt: collection.sharedAt || collection.createdAt,
      canEdit: isTeacher || (collection.user._id.toString() === req.user._id.toString())
    };
  });

  console.log(`✅ [API] ${enrichedCollections.length} collections trouvées pour classe ${classData.name}`);

  res.json({
    success: true,
    data: {
      class: {
        _id: classData._id,
        name: classData.name,
        description: classData.description,
        teacher: {
          _id: classData.teacherId._id,
          name: classData.teacherId.name,
          email: classData.teacherId.email
        },
        studentCount: classData.students.length,
        isTeacher,
        isStudent
      },
      collections: enrichedCollections
    },
    message: `${enrichedCollections.length} collection(s) disponible(s)`
  });
});

/**
 * @desc    Partager une collection avec une classe
 * @route   POST /api/classes/:id/collections
 * @access  Private (Teacher only)
 */
const shareCollectionWithClass = asyncHandler(async (req, res) => {
  const { id: classId } = req.params;
  const { collectionId } = req.body;

  const classData = await Class.findById(classId);

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  // Vérifier que la collection existe et appartient à l'enseignant
  const Collection = require('../models/collectionModel');
  const collection = await Collection.findById(collectionId);

  if (!collection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  if (collection.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Vous ne pouvez partager que vos propres collections');
  }

  // Vérifier si la collection n'est pas déjà partagée
  if (classData.collections.includes(collectionId)) {
    res.status(400);
    throw new Error('Cette collection est déjà partagée avec cette classe');
  }

  // Ajouter la collection à la classe
  classData.collections.push(collectionId);
  await classData.save();

  console.log('Collection partagée avec succès:', {
    classId,
    collectionId,
    className: classData.name,
    collectionName: collection.name
  });

  // Émission WebSocket pour notifier les étudiants
  const io = req.app.get('io');
  if (io && classData.students && classData.students.length > 0) {
    console.log('Émission WebSocket newSharedCollection aux étudiants...');
    
    // Notifier chaque étudiant de la classe
    classData.students.forEach(studentId => {
      const room = `user_${studentId}`;
      console.log(`Envoi à ${room}: Collection "${collection.name}" partagée`);
      
      io.to(room).emit('newSharedCollection', {
        success: true,
        collection: {
          _id: collection._id,
          name: collection.name,
          description: collection.description,
          cardCount: collection.cardCount,
          createdBy: {
            name: req.user.name,
            email: req.user.email
          },
          createdAt: collection.createdAt
        },
        class: {
          _id: classData._id,
          name: classData.name,
          description: classData.description
        },
        message: `Nouvelle collection "${collection.name}" partagée par ${req.user.name} dans la classe "${classData.name}"`
      });
    });
    
    console.log(`WebSocket émis à ${classData.students.length} étudiant(s)`);
  } else {
    console.log('WebSocket non disponible ou classe sans étudiants');
  }

  res.json({
    success: true,
    data: {
      class: classData,
      collection: collection
    },
    message: `Collection "${collection.name}" partagée avec la classe avec succès`
  });
});

/**
 * @desc    Retirer le partage d'une collection d'une classe
 * @route   DELETE /api/classes/:id/collections/:collectionId
 * @access  Private (Teacher only)
 */
const unshareCollectionFromClass = asyncHandler(async (req, res) => {
  const { id: classId, collectionId } = req.params;

  const classData = await Class.findById(classId);
  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est le propriétaire
  if (classData.teacherId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  // Retirer la collection
  classData.collections = classData.collections.filter(
    id => id.toString() !== collectionId
  );
  await classData.save();

  res.json({
    success: true,
    message: 'Collection retirée de la classe avec succès'
  });
});

// Importer une collection partagée dans les collections personnelles de l'étudiant
const importCollectionFromClass = asyncHandler(async (req, res) => {
  const { id: classId } = req.params;
  const { collectionId } = req.body;

  console.log('Import collection - ClassId:', classId, 'CollectionId:', collectionId, 'UserId:', req.user._id);

  // Vérifier que la classe existe
  const classData = await Class.findById(classId);
  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est bien un étudiant de cette classe
  const isStudent = classData.students.some(
    studentId => studentId.toString() === req.user._id.toString()
  );

  if (!isStudent) {
    res.status(403);
    throw new Error('Vous devez être inscrit dans cette classe pour importer des collections');
  }

  // Vérifier que la collection est bien partagée avec cette classe
  if (!classData.collections.includes(collectionId)) {
    res.status(403);
    throw new Error('Cette collection n\'est pas partagée avec cette classe');
  }

  const Collection = require('../models/collectionModel');
  const Flashcard = require('../models/flashcardModel');

  // Récupérer la collection originale avec ses cartes
  const originalCollection = await Collection.findById(collectionId);
  if (!originalCollection) {
    res.status(404);
    throw new Error('Collection non trouvée');
  }

  // Vérifier si l'étudiant a déjà importé cette collection de cette classe
  // Utilisation d'un identifiant unique basé sur l'ID original et la classe
  const importKey = `source_${collectionId}_class_${classId}`;
  const existingImport = await Collection.findOne({
    user: req.user._id,
    tags: { $in: [importKey] }
  });

  if (existingImport) {
    res.status(400);
    throw new Error(`Vous avez déjà importé la collection "${originalCollection.name}" de cette classe`);
  }

  try {
    // Créer une copie de la collection pour l'étudiant
    const importedCollection = new Collection({
      name: originalCollection.name,
      description: `Importée de la classe "${classData.name}" - ${originalCollection.description || ''}`,
      category: originalCollection.category,
      difficulty: originalCollection.difficulty,
      tags: [...(originalCollection.tags || []), 'importé', 'classe', importKey],
      user: req.user._id,
      isPublic: false
    });

    await importedCollection.save();
    console.log('Collection importée créée:', importedCollection._id);

    // Récupérer toutes les cartes de la collection originale
    const originalCards = await Flashcard.find({ collection: collectionId });
    console.log('Cartes à copier:', originalCards.length);

    // Créer des copies de toutes les cartes pour l'étudiant
    const importedCards = [];
    for (const originalCard of originalCards) {
      const importedCard = new Flashcard({
        collection: importedCollection._id,
        question: originalCard.question,
        answer: originalCard.answer,
        difficulty: originalCard.difficulty,
        cardType: originalCard.cardType,
        options: originalCard.options ? [...originalCard.options] : undefined,
        imageUrl: originalCard.imageUrl,
        notes: originalCard.notes,
        tags: [...(originalCard.tags || []), 'importé'],
        user: req.user._id,
        // Réinitialiser les données de révision pour l'étudiant
        status: 'new',
        nextReviewDate: new Date(),
        reviewHistory: [],
        interval: 0,
        easeFactor: 2.5
      });

      await importedCard.save();
      importedCards.push(importedCard);
    }

    console.log('Cartes importées créées:', importedCards.length);

    // Mettre à jour le compteur de cartes de la collection importée
    importedCollection.cardsCount = importedCards.length;
    await importedCollection.save();

    // Peupler les données pour la réponse
    await importedCollection.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: {
        collection: importedCollection,
        cardsImported: importedCards.length,
        originalCollection: {
          name: originalCollection.name,
          cardsCount: originalCards.length
        }
      },
      message: `Collection "${originalCollection.name}" importée avec succès (${importedCards.length} cartes)`
    });

  } catch (error) {
    console.error('Erreur lors de l\'importation:', error);
    res.status(500);
    throw new Error('Erreur lors de l\'importation de la collection');
  }
});

/**
 * @desc    Récupérer les cartes d'une collection partagée avec une classe (aperçu)
 * @route   GET /api/classes/:classId/collections/:collectionId/cards
 * @access  Private (Student only)
 */
const getClassCollectionCards = asyncHandler(async (req, res) => {
  const { classId, collectionId } = req.params;

  // Récupérer la classe et vérifier que l'étudiant en fait partie  
  const classData = await Class.findById(classId);
  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  if (!classData.students.includes(req.user._id)) {
    res.status(403);
    throw new Error('Vous n\'êtes pas inscrit à cette classe');
  }

  // Vérifier que la collection est bien partagée avec cette classe
  if (!classData.collections.includes(collectionId)) {
    res.status(403);
    throw new Error('Cette collection n\'est pas partagée avec cette classe');
  }

  const Flashcard = require('../models/flashcardModel');

  // Récupérer les cartes de la collection (limité pour l'aperçu)
  const cards = await Flashcard.find({ collection: collectionId })
    .select('question answer difficulty cardType options imageUrl notes tags createdAt')
    .sort({ createdAt: 1 })
    .limit(10); // Limité à 10 cartes pour l'aperçu

  res.json({
    success: true,
    count: cards.length,
    data: cards
  });
});

module.exports = {
  createClass,
  getTeacherClasses,
  getStudentClasses,
  getClassById,
  updateClass,
  deleteClass,
  inviteStudents,
  joinClassByCode,
  removeStudent,
  shareCollectionWithClass,
  unshareCollectionFromClass,
  getClassCollections,
  importCollectionFromClass,
  getClassCollectionCards
};
