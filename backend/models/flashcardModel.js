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

// Méthode pour calculer le prochain intervalle de révision selon le système simplifié
flashcardSchema.methods.calculateNextReview = function(performance) {
  const nextReviewDate = new Date();
  
  switch (performance) {
    case 'again':
      // À revoir immédiatement (dans 1 minute)
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
      this.interval = 0.001; // ~1 minute en jours
      this.status = 'learning';
      break;
    case 'hard':
      // Difficile : à revoir dans 5 minutes
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 5);
      this.interval = 0.003; // ~5 minutes en jours
      this.status = 'learning';
      break;
    case 'good':
      // Correct : à revoir dans 1 jour (mode quiz/test)
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);
      this.interval = 1;
      this.status = 'review';
      break;
    case 'easy':
      // Facile : à revoir dans 1 jour (mode révision classique)
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);
      this.interval = 1;
      this.status = 'review';
      break;
  }

  // Mettre à jour les propriétés
  this.nextReviewDate = nextReviewDate;
  
  console.log(`Carte ${this._id} - Performance: ${performance}, Prochaine révision: ${nextReviewDate}`);

  return nextReviewDate;
};

const Flashcard = mongoose.model('Flashcard', flashcardSchema);

module.exports = Flashcard;
