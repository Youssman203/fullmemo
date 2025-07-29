const mongoose = require('mongoose');

const collectionShareCodeSchema = new mongoose.Schema({
  // Code unique à 6 caractères
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    length: 6,
    uppercase: true,
    match: /^[A-Z0-9]{6}$/
  },
  
  // Collection partagée
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  
  // Créateur du code (enseignant)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Configuration simple
  config: {
    // Date d'expiration (par défaut 7 jours)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jours
    },
    
    // Permissions (par défaut view + copy)
    permissions: {
      type: [String],
      enum: ['view', 'copy', 'download'],
      default: ['view', 'copy']
    }
  },
  
  // Statistiques d'utilisation
  stats: {
    // Nombre d'utilisations
    useCount: {
      type: Number,
      default: 0
    },
    
    // Dernière utilisation
    lastUsedAt: {
      type: Date,
      default: null
    },
    
    // Utilisateurs qui ont utilisé le code
    usedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Statut du code
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
collectionShareCodeSchema.index({ code: 1, isActive: 1 });
collectionShareCodeSchema.index({ collection: 1, createdBy: 1 });
collectionShareCodeSchema.index({ 'config.expiresAt': 1 });

// Méthode pour vérifier si le code est valide
collectionShareCodeSchema.methods.isValid = function() {
  // Vérifier si le code est actif
  if (!this.isActive) return false;
  
  // Vérifier l'expiration
  if (this.config.expiresAt && new Date() > this.config.expiresAt) {
    return false;
  }
  
  return true;
};

// Méthode pour enregistrer une utilisation
collectionShareCodeSchema.methods.recordUsage = function(userId) {
  // Incrémenter le compteur
  this.stats.useCount += 1;
  this.stats.lastUsedAt = new Date();
  
  // Ajouter l'utilisateur s'il n'a pas déjà utilisé ce code
  const alreadyUsed = this.stats.usedBy.find(
    usage => usage.user.toString() === userId.toString()
  );
  
  if (!alreadyUsed) {
    this.stats.usedBy.push({
      user: userId,
      usedAt: new Date()
    });
  }
  
  return this.save();
};

// Méthode statique pour générer un code unique
collectionShareCodeSchema.statics.generateUniqueCode = async function() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    // Vérifier l'unicité
    const existing = await this.findOne({ code, isActive: true });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

// Middleware pour nettoyer les codes expirés
collectionShareCodeSchema.statics.cleanupExpiredCodes = async function() {
  const now = new Date();
  await this.updateMany(
    {
      isActive: true,
      'config.expiresAt': { $lt: now }
    },
    {
      isActive: false
    }
  );
};

module.exports = mongoose.model('CollectionShareCode', collectionShareCodeSchema);
