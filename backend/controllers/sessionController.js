// backend/controllers/sessionController.js
const Session = require('../models/sessionModel');
const Collection = require('../models/collectionModel');
const User = require('../models/userModel');
const { asyncHandler } = require('../utils/asyncHandler');

// @desc    Créer une nouvelle session
// @route   POST /api/sessions
// @access  Private (Student)
const createSession = asyncHandler(async (req, res) => {
  const {
    collectionId,
    sessionType,
    results,
    cardResults,
    startTime,
    endTime,
    duration,
    deviceInfo,
    status
  } = req.body;

  // Vérifier que la collection existe
  const collection = await Collection.findById(collectionId).populate('user', 'name email');
  if (!collection) {
    return res.status(404).json({
      success: false,
      message: 'Collection non trouvée'
    });
  }

  // Calculer le score en pourcentage
  const scorePercentage = results.totalCards > 0 
    ? Math.round((results.correctAnswers / results.totalCards) * 100)
    : 0;

  // Créer la session
  const session = await Session.create({
    student: req.user._id,
    teacher: collection.user._id, // Le propriétaire de la collection
    collection: collectionId,
    sessionType,
    results: {
      ...results,
      scorePercentage
    },
    cardResults,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    duration,
    deviceInfo,
    status: status || 'completed'
  });

  await session.populate([
    { path: 'student', select: 'name email' },
    { path: 'teacher', select: 'name email' },
    { path: 'collection', select: 'name description' }
  ]);

  console.log(`📊 Session créée: ${session.sessionType} - Score: ${scorePercentage}% (${req.user.name})`);

  // Émettre un événement WebSocket vers l'enseignant
  const io = req.app.get('io');
  if (io) {
    io.to(`teacher_${collection.user._id}`).emit('newStudentSession', {
      studentId: req.user._id,
      studentName: req.user.name,
      collectionName: collection.name,
      sessionType,
      score: scorePercentage,
      sessionId: session._id,
      timestamp: new Date()
    });
    console.log(`📤 Notification envoyée à l'enseignant ${collection.user._id}`);
  }

  res.status(201).json({
    success: true,
    message: 'Session enregistrée avec succès',
    data: session
  });
});

// @desc    Obtenir les sessions d'un apprenant pour un enseignant
// @route   GET /api/sessions/student/:studentId
// @access  Private (Teacher)
const getStudentSessions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { limit = 10, offset = 0, sessionType } = req.query;

  // Vérifier que l'utilisateur est enseignant
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux enseignants'
    });
  }

  // Construire la query
  const query = {
    student: studentId,
    teacher: req.user._id
  };

  if (sessionType) {
    query.sessionType = sessionType;
  }

  // Récupérer les sessions
  const sessions = await Session.find(query)
    .populate('student', 'name email')
    .populate('collection', 'name description')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

  // Compter le total
  const total = await Session.countDocuments(query);

  // Statistiques rapides - calculer manuellement
  const mongoose = require('mongoose');
  const stats = await Session.aggregate([
    { 
      $match: { 
        student: mongoose.Types.ObjectId(studentId),
        teacher: req.user._id
      } 
    },
    {
      $group: {
        _id: '$sessionType',
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$results.scorePercentage' },
        totalTimeSpent: { $sum: '$duration' },
        lastSession: { $max: '$createdAt' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      sessions,
      total,
      stats,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + sessions.length) < total
      }
    }
  });
});

// @desc    Obtenir la vue d'ensemble des apprenants pour un enseignant
// @route   GET /api/sessions/teacher/overview
// @access  Private (Teacher)
const getTeacherOverview = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est enseignant
  if (req.user.role !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Accès réservé aux enseignants'
    });
  }

  try {
    // Récupérer les apprenants qui ont des sessions avec cet enseignant
    const overview = await Session.aggregate([
      { $match: { teacher: req.user._id } },
      {
        $group: {
          _id: '$student',
          totalSessions: { $sum: 1 },
          averageScore: { $avg: '$results.scorePercentage' },
          lastSessionDate: { $max: '$createdAt' },
          sessionTypes: { $addToSet: '$sessionType' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          studentName: '$studentInfo.name',
          studentEmail: '$studentInfo.email',
          totalSessions: 1,
          averageScore: { $round: ['$averageScore', 1] },
          lastSession: '$lastSessionDate',
          sessionTypes: 1
        }
      },
      { $sort: { lastSession: -1 } }
    ]);

    // Statistiques globales
    const globalStats = await Session.aggregate([
      { $match: { teacher: req.user._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          uniqueStudents: { $addToSet: '$student' },
          averageScore: { $avg: '$results.scorePercentage' },
          sessionsByType: {
            $push: '$sessionType'
          }
        }
      },
      {
        $project: {
          totalSessions: 1,
          uniqueStudentsCount: { $size: '$uniqueStudents' },
          averageScore: { $round: ['$averageScore', 1] },
          sessionsByType: 1
        }
      }
    ]);

    const stats = globalStats[0] || {
      totalSessions: 0,
      uniqueStudentsCount: 0,
      averageScore: 0,
      sessionsByType: []
    };

    // Calculer la répartition par type
    const sessionTypeCounts = {};
    if (stats.sessionsByType) {
      stats.sessionsByType.forEach(type => {
        sessionTypeCounts[type] = (sessionTypeCounts[type] || 0) + 1;
      });
    }

    res.json({
      success: true,
      data: {
        students: overview,
        globalStats: {
          ...stats,
          sessionTypeCounts
        }
      }
    });
  } catch (error) {
    console.error('Erreur getTeacherOverview:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données'
    });
  }
});

// @desc    Obtenir les détails d'une session
// @route   GET /api/sessions/:sessionId
// @access  Private
const getSessionDetails = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findById(sessionId)
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .populate('collection', 'name description')
    .populate('cardResults.cardId', 'question answer');

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session non trouvée'
    });
  }

  // Vérifier les permissions
  const isStudent = req.user._id.toString() === session.student._id.toString();
  const isTeacher = req.user._id.toString() === session.teacher._id.toString();

  if (!isStudent && !isTeacher) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé à cette session'
    });
  }

  res.json({
    success: true,
    data: session
  });
});

// @desc    Ajouter une note d'enseignant à une session
// @route   PUT /api/sessions/:sessionId/note
// @access  Private (Teacher)
const addTeacherNote = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { note, rating } = req.body;

  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: 'Session non trouvée'
    });
  }

  // Vérifier que c'est bien l'enseignant propriétaire
  if (session.teacher.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Seul l\'enseignant concerné peut ajouter une note'
    });
  }

  // Mettre à jour
  session.teacherNotes = note;
  if (rating && rating >= 1 && rating <= 5) {
    session.teacherRating = rating;
  }

  await session.save();

  res.json({
    success: true,
    message: 'Note ajoutée avec succès',
    data: {
      teacherNotes: session.teacherNotes,
      teacherRating: session.teacherRating
    }
  });
});

// @desc    Obtenir les sessions récentes pour le dashboard
// @route   GET /api/sessions/recent
// @access  Private
const getRecentSessions = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;
  
  let query = {};
  
  if (req.user.role === 'teacher') {
    query.teacher = req.user._id;
  } else {
    query.student = req.user._id;
  }

  const sessions = await Session.find(query)
    .populate('student', 'name email')
    .populate('teacher', 'name email')
    .populate('collection', 'name')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select('sessionType results.scorePercentage collection createdAt student teacher');

  res.json({
    success: true,
    data: sessions
  });
});

module.exports = {
  createSession,
  getStudentSessions,
  getTeacherOverview,
  getSessionDetails,
  addTeacherNote,
  getRecentSessions
};
