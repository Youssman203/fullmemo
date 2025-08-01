const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Charger les variables d'environnement
dotenv.config();

const User = require('../models/userModel');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

const verifyAndCreateAdmin = async () => {
  try {
    await connectDB();
    
    console.log('🔍 Vérification du compte administrateur...\n');
    
    // Chercher un admin existant
    let admin = await User.findOne({ role: 'admin' });
    
    if (admin) {
      console.log('📋 Administrateur trouvé:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nom: ${admin.name}`);
      console.log(`   ID: ${admin._id}`);
      console.log(`   Créé le: ${admin.createdAt}\n`);
      
      // Tester le mot de passe
      console.log('🔐 Test du mot de passe admin123...');
      const isPasswordValid = await admin.matchPassword('admin123');
      
      if (isPasswordValid) {
        console.log('✅ Mot de passe admin123 correct !');
      } else {
        console.log('❌ Mot de passe admin123 incorrect !');
        console.log('🔧 Réinitialisation du mot de passe...');
        
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        await admin.save();
        
        console.log('✅ Mot de passe réinitialisé à admin123');
      }
    } else {
      console.log('❌ Aucun administrateur trouvé');
      console.log('🔧 Création d\'un nouveau compte admin...');
      
      const adminData = {
        name: 'Admin System',
        email: 'admin@spaced-revision.com',
        password: 'admin123',
        role: 'admin'
      };
      
      admin = await User.create(adminData);
      console.log('✅ Administrateur créé avec succès !');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Nom: ${admin.name}`);
    }
    
    console.log('\n🎯 IDENTIFIANTS ADMIN CONFIRMÉS:');
    console.log('   Email: admin@spaced-revision.com');
    console.log('   Mot de passe: admin123');
    console.log('   Rôle: admin');
    
    console.log('\n🚀 PROCHAINES ÉTAPES:');
    console.log('1. Démarrer le frontend: cd spaced-revision && npm start');
    console.log('2. Aller sur: http://localhost:3000/login');
    console.log('3. Se connecter avec les identifiants ci-dessus');
    console.log('4. Vérifier l\'accès à /admin');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.disconnect();
  }
};

verifyAndCreateAdmin();
