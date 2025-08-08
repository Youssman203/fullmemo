const mongoose = require('mongoose');

const classSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom de la classe est obligatoire'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La description ne peut pas dépasser 500 caractères']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'ID de l\'enseignant est obligatoire']
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  inviteCode: {
    type: String,
    unique: true,
    uppercase: true,
    minlength: 6,
    maxlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowSelfEnrollment: {
      type: Boolean,
      default: true
    },
    maxStudents: {
      type: Number,
      default: 50,
      min: 1,
      max: 200
    }
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
classSchema.index({ teacherId: 1 });
classSchema.index({ inviteCode: 1 });
classSchema.index({ students: 1 });

// Méthode pour générer un code d'invitation unique
classSchema.statics.generateInviteCode = async function() {
  let code;
  let exists = true;
  
  while (exists) {
    // Générer un code de 6 caractères alphanumériques
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Vérifier si le code existe déjà
    const existingClass = await this.findOne({ inviteCode: code });
    exists = !!existingClass;
  }
  
  return code;
};

// Méthode pour ajouter un apprenant à la classe
classSchema.methods.addStudent = async function(studentId) {
  if (!this.students.includes(studentId)) {
    this.students.push(studentId);
    await this.save();
  }
  return this;
};

// Méthode pour retirer un apprenant de la classe
classSchema.methods.removeStudent = async function(studentId) {
  this.students = this.students.filter(id => !id.equals(studentId));
  await this.save();
  return this;
};

// Méthode pour vérifier si un utilisateur est apprenant de cette classe
classSchema.methods.hasStudent = function(studentId) {
  return this.students.some(id => id.equals(studentId));
};

// Middleware pour générer automatiquement le code d'invitation
classSchema.pre('save', async function(next) {
  try {
    if (this.isNew && !this.inviteCode) {
      this.inviteCode = await this.constructor.generateInviteCode();
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
