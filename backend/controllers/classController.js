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

  // Retourner la classe mise à jour avec les collections populées
  const updatedClass = await Class.findById(classId)
    .populate('collections', 'name description cardCount')
    .populate('teacherId', 'name email');

  res.json({
    success: true,
    data: updatedClass,
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

/**
 * @desc    Obtenir les collections partagées d'une classe (pour les étudiants)
 * @route   GET /api/classes/:id/collections
 * @access  Private (Students of the class)
 */
const getClassCollections = asyncHandler(async (req, res) => {
  const { id: classId } = req.params;

  const classData = await Class.findById(classId)
    .populate({
      path: 'collections',
      select: 'name description cardCount createdAt',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('teacherId', 'name email');

  if (!classData) {
    res.status(404);
    throw new Error('Classe non trouvée');
  }

  // Vérifier que l'utilisateur est soit l'enseignant soit un étudiant de la classe
  const isTeacher = classData.teacherId._id.toString() === req.user._id.toString();
  const isStudent = classData.students.some(
    studentId => studentId.toString() === req.user._id.toString()
  );

  if (!isTeacher && !isStudent) {
    res.status(403);
    throw new Error('Accès refusé à cette classe');
  }

  res.json({
    success: true,
    data: {
      class: {
        _id: classData._id,
        name: classData.name,
        description: classData.description,
        teacher: classData.teacherId
      },
      collections: classData.collections || []
    }
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
  getClassCollections
};
