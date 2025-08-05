// backend/models/sessionModel.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  // Références
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  
  // Informations de session
  sessionType: {
    type: String,
    enum: ['revision', 'quiz', 'test'],
    required: true
  },
  
  // Résultats détaillés
  results: {
    totalCards: {
      type: Number,
      required: true,
      default: 0
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    incorrectAnswers: {
      type: Number,
      required: true,
      default: 0
    },
    skippedCards: {
      type: Number,
      default: 0
    },
    scorePercentage: {
      type: Number,
      required: true,
      default: 0
    }
  },
  
  // Détails par carte (pour analyse approfondie)
  cardResults: [{
    cardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true
    },
    question: String,
    userAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean,
    timeSpent: Number, // en secondes
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard']
    }
  }],
  
  // Métadonnées temporelles
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // en secondes
    required: true
  },
  
  // Informations contextuelles
  deviceInfo: {
    userAgent: String,
    platform: String
  },
  
  // Statut et notes
  status: {
    type: String,
    enum: ['completed', 'abandoned', 'interrupted'],
    default: 'completed'
  },
  
  teacherNotes: {
    type: String,
    maxlength: 500
  },
  
  // Évaluation enseignant (optionnel)
  teacherRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
sessionSchema.index({ student: 1, createdAt: -1 });
sessionSchema.index({ teacher: 1, createdAt: -1 });
sessionSchema.index({ collection: 1, createdAt: -1 });
sessionSchema.index({ student: 1, collection: 1 });
sessionSchema.index({ teacher: 1, student: 1 });

// Méthodes virtuelles
sessionSchema.virtual('successRate').get(function() {
  if (this.results.totalCards === 0) return 0;
  return Math.round((this.results.correctAnswers / this.results.totalCards) * 100);
});

sessionSchema.virtual('averageTimePerCard').get(function() {
  if (this.results.totalCards === 0) return 0;
  return Math.round(this.duration / this.results.totalCards);
});

// Méthodes statiques
sessionSchema.statics.getStudentStats = function(studentId, teacherId) {
  return this.aggregate([
    {
      $match: { 
        student: mongoose.Types.ObjectId(studentId),
        teacher: mongoose.Types.ObjectId(teacherId)
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
    },
    {
      $project: {
        sessionType: '$_id',
        totalSessions: 1,
        averageScore: { $round: ['$averageScore', 1] },
        totalTimeSpent: 1,
        lastSession: 1
      }
    }
  ]);
};

sessionSchema.statics.getTeacherOverview = function(teacherId) {
  return this.aggregate([
    { $match: { teacher: mongoose.Types.ObjectId(teacherId) } },
    {
      $group: {
        _id: '$student',
        totalSessions: { $sum: 1 },
        averageScore: { $avg: '$results.scorePercentage' },
        lastSession: { $max: '$createdAt' },
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
    { $unwind: '$studentInfo' },
    {
      $project: {
        studentId: '$_id',
        studentName: '$studentInfo.name',
        studentEmail: '$studentInfo.email',
        totalSessions: 1,
        averageScore: { $round: ['$averageScore', 1] },
        lastSession: 1,
        sessionTypes: 1
      }
    },
    { $sort: { lastSession: -1 } }
  ]);
};

module.exports = mongoose.model('Session', sessionSchema);
