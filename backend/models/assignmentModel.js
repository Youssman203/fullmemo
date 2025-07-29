const mongoose = require('mongoose');

const assignmentSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Le titre du devoir est obligatoire'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'L\'ID de la classe est obligatoire']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID de l\'enseignant est obligatoire']
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: [true, 'L\'ID de la collection est obligatoire']
  },
  dueDate: {
    type: Date,
    required: [true, 'La date limite est obligatoire']
  },
  isGraded: {
    type: Boolean,
    default: false
  },
  maxScore: {
    type: Number,
    default: 100,
    min: 1
  },
  settings: {
    allowRetries: {
      type: Boolean,
      default: true
    },
    maxRetries: {
      type: Number,
      default: 3,
      min: 1
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true
    },
    timeLimit: {
      type: Number, // en minutes
      default: null
    }
  },
  studentSubmissions: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    attempts: [{
      score: {
        type: Number,
        min: 0
      },
      totalQuestions: {
        type: Number,
        min: 1
      },
      correctAnswers: {
        type: Number,
        min: 0
      },
      timeSpent: {
        type: Number, // en secondes
        min: 0
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      answers: [{
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true
        },
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        timeSpent: Number // en secondes
      }]
    }],
    bestScore: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'overdue'],
      default: 'not_started'
    },
    firstAttemptAt: Date,
    lastAttemptAt: Date
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
assignmentSchema.index({ classId: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ 'studentSubmissions.studentId': 1 });

// Méthode pour calculer les statistiques du devoir
assignmentSchema.methods.getStats = function() {
  const totalStudents = this.studentSubmissions.length;
  const completedSubmissions = this.studentSubmissions.filter(
    sub => sub.status === 'completed'
  ).length;
  
  const scores = this.studentSubmissions
    .filter(sub => sub.bestScore !== undefined)
    .map(sub => sub.bestScore);
  
  const averageScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0;
  
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  
  return {
    totalStudents,
    completedSubmissions,
    completionRate: totalStudents > 0 ? (completedSubmissions / totalStudents) * 100 : 0,
    averageScore: Math.round(averageScore * 100) / 100,
    maxScore,
    minScore,
    totalScores: scores.length
  };
};

// Méthode pour ajouter une soumission d'étudiant
assignmentSchema.methods.addStudentSubmission = async function(studentId) {
  const existingSubmission = this.studentSubmissions.find(
    sub => sub.studentId.equals(studentId)
  );
  
  if (!existingSubmission) {
    this.studentSubmissions.push({
      studentId,
      attempts: [],
      status: 'not_started'
    });
    await this.save();
  }
  
  return this;
};

// Méthode pour enregistrer une tentative
assignmentSchema.methods.recordAttempt = async function(studentId, attemptData) {
  const submission = this.studentSubmissions.find(
    sub => sub.studentId.equals(studentId)
  );
  
  if (!submission) {
    throw new Error('Soumission d\'étudiant non trouvée');
  }
  
  // Ajouter la tentative
  submission.attempts.push(attemptData);
  
  // Mettre à jour le meilleur score
  const newScore = (attemptData.correctAnswers / attemptData.totalQuestions) * this.maxScore;
  if (!submission.bestScore || newScore > submission.bestScore) {
    submission.bestScore = newScore;
  }
  
  // Mettre à jour les dates
  if (!submission.firstAttemptAt) {
    submission.firstAttemptAt = new Date();
  }
  submission.lastAttemptAt = new Date();
  
  // Mettre à jour le statut
  submission.status = 'completed';
  
  await this.save();
  return this;
};

// Vérifier si le devoir est en retard
assignmentSchema.virtual('isOverdue').get(function() {
  return new Date() > this.dueDate;
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
