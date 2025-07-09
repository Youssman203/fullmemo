const mongoose = require('mongoose');

const reviewSessionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number // en secondes
  },
  cardsReviewed: [
    {
      flashcard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard'
      },
      performance: {
        type: String,
        enum: ['again', 'hard', 'good', 'easy']
      },
      timeSpent: {
        type: Number // en secondes
      },
      isCorrect: {
        type: Boolean,
        default: false
      }
    }
  ],
  mode: {
    type: String,
    enum: ['classic', 'quiz', 'typing'],
    default: 'classic'
  },
  completed: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  totalCards: {
    type: Number,
    default: 0
  },
  correctCards: {
    type: Number,
    default: 0
  },
  cardTypes: {
    new: { type: Number, default: 0 },
    learning: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    mastered: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Calculer automatiquement la durée et les stats à la fin de la session
reviewSessionSchema.pre('save', function(next) {
  // Calculer la durée si la session est terminée
  if (this.completed && this.endTime) {
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
  }
  
  // Calculer les stats finales
  if (this.completed) {
    this.totalCards = this.cardsReviewed.length;
    this.correctCards = this.cardsReviewed.filter(card => card.isCorrect).length;
    
    if (this.totalCards > 0) {
      this.score = Math.round((this.correctCards / this.totalCards) * 100);
    }
  }
  
  next();
});

const ReviewSession = mongoose.model('ReviewSession', reviewSessionSchema);

module.exports = ReviewSession;
