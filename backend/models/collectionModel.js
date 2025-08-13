const mongoose = require('mongoose');

const collectionSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la collection est obligatoire'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: false,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  imageUrl: {
    type: String,
    default: 'default-collection.jpg'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['math', 'english', 'science', 'history', 'geography', 'art', 'music', 'literature', 'programming', 'other'],
    default: 'other'
  },
  tags: [String],
  lastStudied: {
    type: Date
  },
  cardsCount: {
    type: Number,
    default: 0
  },
  originalTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  sourceCollectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuel pour récupérer les cartes associées à cette collection
collectionSchema.virtual('flashcards', {
  ref: 'Flashcard',
  localField: '_id',
  foreignField: 'collection',
  justOne: false
});

// Middleware pour mettre à jour le nombre de cartes avant de sauvegarder
collectionSchema.pre('save', async function(next) {
  if (!this.isModified('cardsCount')) {
    try {
      const count = await mongoose.model('Flashcard').countDocuments({ collection: this._id });
      this.cardsCount = count;
    } catch (error) {
      console.error('Erreur lors du comptage des cartes:', error);
    }
  }
  next();
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
