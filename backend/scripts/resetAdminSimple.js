const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const User = require('../models/userModel');

const resetAdmin = async () => {
  try {
    console.log('🔧 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('🔍 Recherche de l\'admin...');
    
    // Supprimer l'ancien admin s'il existe
    await User.deleteMany({ role: 'admin' });
    console.log('🗑️ Anciens comptes admin supprimés');
    
    // Créer un nouveau compte admin
    console.log('🔧 Création d\'un nouveau compte admin...');
    const adminData = {
      name: 'Admin System',
      email: 'admin@spaced-revision.com',
      password: 'admin123',
      role: 'admin'
    };
    
    const admin = await User.create(adminData);
    console.log('✅ Nouveau compte admin créé !');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nom: ${admin.name}`);
    console.log(`   ID: ${admin._id}`);
    
    console.log('\n🎯 IDENTIFIANTS ADMIN:');
    console.log('   Email: admin@spaced-revision.com');
    console.log('   Mot de passe: admin123');
    console.log('\n🚀 Prêt pour la connexion !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    mongoose.disconnect();
  }
};

resetAdmin();
