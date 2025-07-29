const mongoose = require('mongoose');
const User = require('../models/userModel');
require('dotenv').config();

/**
 * Script pour tester la création d'utilisateurs avec différents rôles
 */
const testRoleCreation = async () => {
  try {
    // Connexion à la base de données
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connexion à MongoDB réussie');

    // Test 1: Créer un enseignant avec rôle explicite
    const teacherData = {
      name: 'Prof. Test Rôle',
      email: 'test.role.teacher@example.com',
      password: 'password123',
      role: 'teacher'
    };

    // Supprimer s'il existe déjà
    await User.deleteOne({ email: teacherData.email });

    const teacher = await User.create(teacherData);
    console.log('✅ Enseignant créé:');
    console.log(`   Nom: ${teacher.name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   Rôle: ${teacher.role}`);
    console.log(`   ID: ${teacher._id}`);

    // Test 2: Créer un étudiant avec rôle explicite
    const studentData = {
      name: 'Étudiant Test Rôle',
      email: 'test.role.student@example.com',
      password: 'password123',
      role: 'student'
    };

    // Supprimer s'il existe déjà
    await User.deleteOne({ email: studentData.email });

    const student = await User.create(studentData);
    console.log('\n✅ Étudiant créé:');
    console.log(`   Nom: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Rôle: ${student.role}`);
    console.log(`   ID: ${student._id}`);

    // Test 3: Créer un utilisateur sans rôle (doit être 'student' par défaut)
    const defaultUserData = {
      name: 'Utilisateur Par Défaut',
      email: 'test.default@example.com',
      password: 'password123'
      // Pas de rôle spécifié
    };

    // Supprimer s'il existe déjà
    await User.deleteOne({ email: defaultUserData.email });

    const defaultUser = await User.create(defaultUserData);
    console.log('\n✅ Utilisateur par défaut créé:');
    console.log(`   Nom: ${defaultUser.name}`);
    console.log(`   Email: ${defaultUser.email}`);
    console.log(`   Rôle: ${defaultUser.role} (devrait être 'student')`);
    console.log(`   ID: ${defaultUser._id}`);

    // Vérification finale
    const allTestUsers = await User.find({
      email: { $in: [teacherData.email, studentData.email, defaultUserData.email] }
    });

    console.log('\n📊 Résumé des tests:');
    allTestUsers.forEach(user => {
      const status = user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓';
      console.log(`   ${status} ${user.name}: ${user.role}`);
    });

    // Statistiques globales
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: 'student' });
    const teachersCount = await User.countDocuments({ role: 'teacher' });

    console.log('\n📈 Statistiques globales:');
    console.log(`   Total utilisateurs: ${totalUsers}`);
    console.log(`   Étudiants: ${studentsCount}`);
    console.log(`   Enseignants: ${teachersCount}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    process.exit(1);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log('\n🔒 Connexion fermée');
    process.exit(0);
  }
};

// Exécuter le test
if (require.main === module) {
  console.log('🧪 Test de création d\'utilisateurs avec rôles...\n');
  testRoleCreation();
}

module.exports = testRoleCreation;
