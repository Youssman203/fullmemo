const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Script pour créer un utilisateur enseignant de test
 */
const createTeacherUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Données de l'enseignant de test
    const teacherData = {
      name: 'Prof. Martin Dupont',
      email: 'prof.martin@example.com',
      password: 'password123',
      role: 'teacher'
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: teacherData.email });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur enseignant existe déjà');
      
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'teacher') {
        existingUser.role = 'teacher';
        await existingUser.save();
        console.log('✅ Rôle mis à jour vers enseignant');
      }
      
      console.log(`👨‍🏫 Enseignant: ${existingUser.name} (${existingUser.email})`);
    } else {
      // Créer le nouvel utilisateur enseignant
      const teacher = await User.create(teacherData);
      console.log('✅ Utilisateur enseignant créé avec succès !');
      console.log(`👨‍🏫 Enseignant: ${teacher.name} (${teacher.email})`);
    }

    // Statistiques finales
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });

    console.log('\n📊 Statistiques des utilisateurs :');
    console.log(`   Total utilisateurs : ${totalUsers}`);
    console.log(`   Apprenants : ${studentsCount}`);
    console.log(`   Enseignants : ${teachersCount}`);

    console.log('\n🔑 Identifiants de connexion enseignant :');
    console.log(`   Email: ${teacherData.email}`);
    console.log(`   Mot de passe: ${teacherData.password}`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée');
    process.exit(0);
  }
};

// Exécuter le script
if (require.main === module) {
  console.log('🚀 Création d\'un utilisateur enseignant de test...\n');
  createTeacherUser();
}

module.exports = createTeacherUser;
