// backend/controllers/evaluationController.js
const Session = require('../models/sessionModel');
const Collection = require('../models/collectionModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Récupérer les apprenants qui ont utilisé les collections partagées de l'enseignant
 * @route   GET /api/evaluation/students
 * @access  Private/Teacher
 */
const getStudentsWithSharedCollections = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  try {
    // 1. Récupérer toutes les collections de l'enseignant (originales ET importées)
    // Collections originales de l'enseignant
    const teacherCollections = await Collection.find({ user: teacherId });
    const originalCollectionIds = teacherCollections.map(c => c._id);

    // Collections importées qui référencent cet enseignant
    const importedCollections = await Collection.find({ originalTeacher: teacherId });
    const importedCollectionIds = importedCollections.map(c => c._id);

    // Combiner toutes les collections
    const allCollectionIds = [...originalCollectionIds, ...importedCollectionIds];

    console.log(`🔍 Collections originales de l'enseignant ${teacherId}:`, originalCollectionIds.length);
    console.log(`📚 Collections importées référençant l'enseignant:`, importedCollectionIds.length);
    console.log(`📊 Total collections à analyser:`, allCollectionIds.length);

    // 2. Récupérer toutes les sessions où l'enseignant est impliqué
    // Soit via ses collections originales, soit comme teacher dans les sessions
    const sessions = await Session.find({
      $or: [
        { collection: { $in: allCollectionIds } },  // Sessions sur toutes les collections
        { teacher: teacherId }  // Sessions où l'enseignant est directement le teacher
      ]
    })
    .populate('student', 'name email')
    .populate('collection', 'name description')
    .sort({ createdAt: -1 });

    console.log(`📊 Sessions trouvées: ${sessions.length}`);

    // 3. Grouper par apprenant avec leurs dernières statistiques
    const studentsMap = new Map();

    sessions.forEach(session => {
      const studentId = session.student._id.toString();
      
      if (!studentsMap.has(studentId)) {
        studentsMap.set(studentId, {
          student: {
            _id: session.student._id,
            name: session.student.name,
            email: session.student.email
          },
          collections: new Map(),
          totalSessions: 0,
          lastActivity: session.createdAt,
          averageScore: 0,
          totalScores: 0
        });
      }

      const studentData = studentsMap.get(studentId);
      studentData.totalSessions++;
      studentData.totalScores += session.results.scorePercentage;
      
      // Mettre à jour la dernière activité
      if (session.createdAt > studentData.lastActivity) {
        studentData.lastActivity = session.createdAt;
      }

      // Ajouter la collection si elle n'existe pas
      const collectionId = session.collection._id.toString();
      if (!studentData.collections.has(collectionId)) {
        studentData.collections.set(collectionId, {
          _id: session.collection._id,
          name: session.collection.name,
          sessionsCount: 0,
          averageScore: 0,
          lastSession: session.createdAt
        });
      }

      const collectionData = studentData.collections.get(collectionId);
      collectionData.sessionsCount++;
      collectionData.lastSession = session.createdAt;
    });

    // 4. Calculer les moyennes et convertir en tableau
    const studentsWithStats = Array.from(studentsMap.values()).map(studentData => {
      studentData.averageScore = studentData.totalSessions > 0 
        ? Math.round(studentData.totalScores / studentData.totalSessions)
        : 0;
      
      studentData.collections = Array.from(studentData.collections.values());
      
      return studentData;
    });

    // 5. Trier par activité récente
    studentsWithStats.sort((a, b) => b.lastActivity - a.lastActivity);

    console.log(`✅ Apprenants avec stats: ${studentsWithStats.length}`);
    if (studentsWithStats.length > 0) {
      console.log('Premier apprenant:', studentsWithStats[0].student.name);
    }

    res.json({
      success: true,
      count: studentsWithStats.length,
      data: studentsWithStats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des apprenants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des apprenants',
      error: error.message
    });
  }
});

// @desc    Récupérer les sessions détaillées d'un apprenant
// @route   GET /api/evaluation/students/:studentId/sessions
// @access  Private/Teacher
const getStudentSessions = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const { studentId } = req.params;
  const { collectionId } = req.query;

  try {
    // Construire la requête pour inclure les sessions où l'enseignant est impliqué
    // soit directement comme teacher, soit via ses collections
    let query;
    
    if (collectionId) {
      // Si une collection spécifique est demandée
      query = {
        student: studentId,
        collection: collectionId,
        teacher: teacherId  // L'enseignant doit être le teacher de la session
      };
    } else {
      // Sinon, toutes les sessions où l'enseignant est impliqué
      query = {
        student: studentId,
        teacher: teacherId  // Sessions où cet enseignant est le teacher
      };
    }

    // Récupérer les sessions
    const sessions = await Session.find(query)
      .populate('collection', 'name description')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    // Calculer les statistiques globales
    const stats = {
      totalSessions: sessions.length,
      averageScore: 0,
      totalCorrect: 0,
      totalIncorrect: 0,
      totalSkipped: 0,
      totalCards: 0,
      averageDuration: 0,
      progressOverTime: []
    };

    if (sessions.length > 0) {
      sessions.forEach(session => {
        stats.totalCorrect += session.results.correctAnswers;
        stats.totalIncorrect += session.results.incorrectAnswers;
        stats.totalSkipped += session.results.skippedCards || 0;
        stats.totalCards += session.results.totalCards;
        stats.averageDuration += session.duration;
        
        // Progression dans le temps
        stats.progressOverTime.push({
          date: session.createdAt,
          score: session.results.scorePercentage,
          type: session.sessionType
        });
      });

      stats.averageScore = Math.round(
        sessions.reduce((acc, s) => acc + s.results.scorePercentage, 0) / sessions.length
      );
      stats.averageDuration = Math.round(stats.averageDuration / sessions.length);
    }

    res.json({
      success: true,
      data: {
        student: sessions[0]?.student || { _id: studentId },
        sessions,
        stats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des sessions',
      error: error.message
    });
  }
});

// @desc    Récupérer les détails d'une session spécifique
// @route   GET /api/evaluation/sessions/:sessionId
// @access  Private/Teacher
const getSessionDetails = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const { sessionId } = req.params;

  try {
    const session = await Session.findOne({
      _id: sessionId,
      teacher: teacherId
    })
    .populate('student', 'name email')
    .populate('collection', 'name description')
    .populate('cardResults.cardId', 'question answer');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session',
      error: error.message
    });
  }
});

// @desc    Ajouter une note ou évaluation à une session
// @route   PUT /api/evaluation/sessions/:sessionId/evaluate
// @access  Private/Teacher
const evaluateSession = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;
  const { sessionId } = req.params;
  const { teacherNotes, teacherRating } = req.body;

  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: sessionId,
        teacher: teacherId
      },
      {
        teacherNotes,
        teacherRating
      },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session non trouvée'
      });
    }

    // Émettre via WebSocket
    if (req.app.get('io')) {
      req.app.get('io').to(`teacher_${teacherId}`).emit('sessionEvaluated', {
        sessionId,
        teacherNotes,
        teacherRating
      });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'évaluation de la session',
      error: error.message
    });
  }
});

// @desc    Récupérer les statistiques globales des évaluations
// @route   GET /api/evaluation/stats
// @access  Private/Teacher
const getEvaluationStats = asyncHandler(async (req, res) => {
  const teacherId = req.user._id;

  try {
    // Récupérer toutes les sessions de l'enseignant
    const sessions = await Session.find({ teacher: teacherId });

    // Calculer les statistiques
    const stats = {
      totalStudents: new Set(sessions.map(s => s.student.toString())).size,
      totalSessions: sessions.length,
      averageScore: 0,
      sessionsByType: {
        revision: 0,
        quiz: 0,
        test: 0
      },
      recentActivity: [],
      topPerformers: []
    };

    if (sessions.length > 0) {
      // Score moyen
      stats.averageScore = Math.round(
        sessions.reduce((acc, s) => acc + s.results.scorePercentage, 0) / sessions.length
      );

      // Sessions par type
      sessions.forEach(session => {
        stats.sessionsByType[session.sessionType]++;
      });

      // Activité récente (dernières 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      stats.recentActivity = sessions
        .filter(s => s.createdAt > oneDayAgo)
        .length;
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

module.exports = {
  getStudentsWithSharedCollections,
  getStudentSessions,
  getSessionDetails,
  evaluateSession,
  getEvaluationStats
};
