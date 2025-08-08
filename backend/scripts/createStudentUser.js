const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Script pour créer un utilisateur apprenant de test
 */
const createStudentUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Données de l'apprenant de test
    const studentData = {
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      password: 'password123',
      role: 'student'
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: studentData.email });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur apprenant existe déjà');
      
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'student') {
        existingUser.role = 'student';
        await existingUser.save();
        console.log('✅ Rôle mis à jour vers apprenant');
      }
      
      console.log(`👩‍🎓 Apprenant: ${existingUser.name} (${existingUser.email})`);
    } else {
      // Créer le nouvel utilisateur apprenant
      const student = await User.create(studentData);
      console.log('✅ Utilisateur apprenant créé avec succès !');
      console.log(`👩‍🎓 Apprenant: ${student.name} (${student.email})`);
    }

    // Statistiques finales
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });

    console.log('\n📊 Statistiques des utilisateurs :');
    console.log(`   Total utilisateurs : ${totalUsers}`);
    console.log(`   Apprenants : ${studentsCount}`);
    console.log(`   Enseignants : ${teachersCount}`);

    console.log('\n🔑 Identifiants de connexion apprenant :');
    console.log(`   Email: ${studentData.email}`);
    console.log(`   Mot de passe: ${studentData.password}`);

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
  console.log('🚀 Création d\'un utilisateur apprenant de test...\n');
  createStudentUser();
}

module.exports = createStudentUser;
