const mongoose = require('mongoose');

const sharedLinkSchema = new mongoose.Schema({
  // Token unique pour le lien
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Collection partagée
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  
  // Créateur du lien (enseignant)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Configuration du partage
  config: {
    // Permissions accordées
    permissions: {
      type: [String],
      enum: ['view', 'copy', 'download'],
      default: ['view', 'copy']
    },
    
    // Date d'expiration (optionnel)
    expiresAt: {
      type: Date,
      default: null
    },
    
    // Nombre maximum d'utilisations (optionnel)
    maxUses: {
      type: Number,
      default: null
    },
    
    // Accès protégé par mot de passe (optionnel)
    password: {
      type: String,
      default: null
    }
  },
  
  // Statistiques d'utilisation
  stats: {
    // Nombre de vues
    viewCount: {
      type: Number,
      default: 0
    },
    
    // Nombre de téléchargements
    downloadCount: {
      type: Number,
      default: 0
    },
    
    // Dernière utilisation
    lastAccessedAt: {
      type: Date,
      default: null
    },
    
    // IPs qui ont accédé (pour éviter les doublons)
    accessedIPs: [{
      ip: String,
      accessedAt: Date,
      userAgent: String
    }]
  },
  
  // Statut du lien
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour les requêtes fréquentes
sharedLinkSchema.index({ token: 1, isActive: 1 });
sharedLinkSchema.index({ collection: 1, createdBy: 1 });
sharedLinkSchema.index({ 'config.expiresAt': 1 });

// Méthode pour vérifier si le lien est valide
sharedLinkSchema.methods.isValid = function() {
  // Vérifier si le lien est actif
  if (!this.isActive) return false;
  
  // Vérifier l'expiration
  if (this.config.expiresAt && new Date() > this.config.expiresAt) {
    return false;
  }
  
  // Vérifier le nombre d'utilisations
  if (this.config.maxUses && this.stats.viewCount >= this.config.maxUses) {
    return false;
  }
  
  return true;
};

// Méthode pour enregistrer un accès
sharedLinkSchema.methods.recordAccess = function(ip, userAgent, action = 'view') {
  // Incrémenter les compteurs
  if (action === 'view') {
    this.stats.viewCount += 1;
  } else if (action === 'download') {
    this.stats.downloadCount += 1;
  }
  
  // Mettre à jour la dernière utilisation
  this.stats.lastAccessedAt = new Date();
  
  // Ajouter l'IP si pas déjà présente récemment (dernières 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentAccess = this.stats.accessedIPs.find(
    access => access.ip === ip && access.accessedAt > oneDayAgo
  );
  
  if (!recentAccess) {
    this.stats.accessedIPs.push({
      ip,
      userAgent,
      accessedAt: new Date()
    });
    
    // Garder seulement les 100 derniers accès
    if (this.stats.accessedIPs.length > 100) {
      this.stats.accessedIPs = this.stats.accessedIPs.slice(-100);
    }
  }
  
  return this.save();
};

// Middleware pour nettoyer les liens expirés
sharedLinkSchema.statics.cleanupExpiredLinks = async function() {
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

module.exports = mongoose.model('SharedLink', sharedLinkSchema);
