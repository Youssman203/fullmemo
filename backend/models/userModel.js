const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est obligatoire']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Veuillez fournir un email valide'
    ]
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: 6,
    select: false
  },
  profileImage: {
    type: String,
    default: 'default-profile.jpg'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  preferences: {
    darkMode: {
      type: Boolean,
      default: false
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['fr', 'en'],
      default: 'fr'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, {
  timestamps: true
});

// Middleware pour hasher le mot de passe avant l'enregistrement
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Méthode pour vérifier si le mot de passe fourni correspond à celui stocké
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthode pour générer un token JWT
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.getResetPasswordToken = function() {
  // Générer un token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hasher le token et le stocker dans la base de données
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Définir une expiration
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
