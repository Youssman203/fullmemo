const mongoose = require('mongoose');

const flashcardSchema = mongoose.Schema({
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  question: {
    type: String,
    required: [true, 'La question est obligatoire'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'La réponse est obligatoire'],
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'learning', 'review', 'mastered'],
    default: 'new'
  },
  nextReviewDate: {
    type: Date,
    default: Date.now
  },
  reviewHistory: [
    {
      date: {
        type: Date,
        default: Date.now
      },
      performance: {
        type: String,
        enum: ['again', 'hard', 'good', 'easy']
      },
      timeSpent: {
        type: Number // en secondes
      }
    }
  ],
  notes: {
    type: String
  },
  tags: [String],
  interval: {
    type: Number,
    default: 0 // en jours
  },
  easeFactor: {
    type: Number,
    default: 2.5
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Support pour différents types de cartes
  cardType: {
    type: String,
    enum: ['basic', 'cloze', 'image', 'multiple-choice'],
    default: 'basic'
  },
  // Pour les questions à choix multiples
  options: [String],
  // Pour les cartes avec image
  imageUrl: String
}, {
  timestamps: true
});

// Middleware pour mettre à jour le compteur de cartes de la collection
flashcardSchema.post('save', async function() {
  try {
    const Collection = mongoose.model('Collection');
    await Collection.findByIdAndUpdate(this.collection, {
      $inc: { cardsCount: 1 }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de cartes:', error);
  }
});

// Middleware pour mettre à jour le compteur de cartes lors de la suppression
// Utilisation de findOneAndDelete qui est la méthode moderne recommandée
flashcardSchema.pre('deleteOne', { document: true, query: false }, async function() {
  try {
    const Collection = mongoose.model('Collection');
    await Collection.findByIdAndUpdate(this.collection, {
      $inc: { cardsCount: -1 }
    });
    console.log('Compteur de cartes mis à jour après suppression');
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de cartes:', error);
  }
});

// Méthode pour calculer le prochain intervalle de révision selon l'algorithme SM-2
flashcardSchema.methods.calculateNextReview = function(performance) {
  let { interval, easeFactor } = this;
  
  switch (performance) {
    case 'again':
      interval = 0.1; // Revoir dans ~2-3 heures
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;
    case 'hard':
      interval = interval * 1.2;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;
    case 'good':
      if (interval === 0) {
        interval = 1; // Premier intervalle de 1 jour
      } else {
        interval = interval * easeFactor;
      }
      break;
    case 'easy':
      if (interval === 0) {
        interval = 2; // Premier intervalle de 2 jours
      } else {
        interval = interval * easeFactor * 1.3;
      }
      easeFactor = easeFactor + 0.15;
      break;
  }

  // Calculer la prochaine date de révision
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + Math.round(interval));

  // Mettre à jour les propriétés
  this.interval = interval;
  this.easeFactor = easeFactor;
  this.nextReviewDate = nextReviewDate;
  
  // Mettre à jour le statut en fonction de l'intervalle
  if (interval < 1) {
    this.status = 'learning';
  } else if (interval < 7) {
    this.status = 'review';
  } else {
    this.status = 'mastered';
  }

  return nextReviewDate;
};

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;
