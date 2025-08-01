const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');
const User = require('../models/userModel');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connecté: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const createAdminUser = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Vérifier si un admin existe déjà
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      console.log('Un administrateur existe déjà:'.yellow);
      console.log(`Email: ${adminExists.email}`.yellow);
      console.log(`Nom: ${adminExists.name}`.yellow);
      process.exit(0);
    }

    // Données de l'administrateur par défaut
    const adminData = {
      name: 'Admin System',
      email: 'admin@spaced-revision.com',
      password: 'admin123',
      role: 'admin'
    };

    // Créer l'administrateur
    const admin = await User.create(adminData);

    console.log('✅ Administrateur créé avec succès!'.green.bold);
    console.log('📧 Email:', admin.email.cyan);
    console.log('🔑 Mot de passe:', 'admin123'.cyan);
    console.log('👤 Nom:', admin.name.cyan);
    console.log('🎯 Rôle:', admin.role.cyan);
    console.log('');
    console.log('⚠️  IMPORTANT: Changez le mot de passe après la première connexion!'.red.bold);

    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création de l\'administrateur:'.red, error);
    process.exit(1);
  }
};

// Exécuter le script
if (require.main === module) {
  createAdminUser();
}

module.exports = createAdminUser;
