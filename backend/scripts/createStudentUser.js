const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Script pour créer un utilisateur étudiant de test
 */
const createStudentUser = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Données de l'étudiant de test
    const studentData = {
      name: 'Marie Dubois',
      email: 'marie.dubois@example.com',
      password: 'password123',
      role: 'student'
    };

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: studentData.email });
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur étudiant existe déjà');
      
      // Mettre à jour le rôle si nécessaire
      if (existingUser.role !== 'student') {
        existingUser.role = 'student';
        await existingUser.save();
        console.log('✅ Rôle mis à jour vers étudiant');
      }
      
      console.log(`👩‍🎓 Étudiant: ${existingUser.name} (${existingUser.email})`);
    } else {
      // Créer le nouvel utilisateur étudiant
      const student = await User.create(studentData);
      console.log('✅ Utilisateur étudiant créé avec succès !');
      console.log(`👩‍🎓 Étudiant: ${student.name} (${student.email})`);
    }

    // Statistiques finales
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });

    console.log('\n📊 Statistiques des utilisateurs :');
    console.log(`   Total utilisateurs : ${totalUsers}`);
    console.log(`   Étudiants : ${studentsCount}`);
    console.log(`   Enseignants : ${teachersCount}`);

    console.log('\n🔑 Identifiants de connexion étudiant :');
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
  console.log('🚀 Création d\'un utilisateur étudiant de test...\n');
  createStudentUser();
}

module.exports = createStudentUser;
