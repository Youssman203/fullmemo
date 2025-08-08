// Script pour réinitialiser le mot de passe de l'enseignant
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaced-revision';

async function resetTeacherPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver Prof. Martin Dupont
    const teacher = await User.findOne({ 
      name: 'Prof. Martin Dupont',
      role: 'teacher'
    });

    if (!teacher) {
      console.log('❌ Prof. Martin Dupont non trouvé');
      
      // Lister tous les enseignants
      const allTeachers = await User.find({ role: 'teacher' }).select('name email');
      console.log('\n👨‍🏫 Enseignants disponibles:');
      allTeachers.forEach(t => {
        console.log(`  - ${t.name} (${t.email})`);
      });
      return;
    }

    console.log(`👨‍🏫 Enseignant trouvé: ${teacher.name}`);
    console.log(`📧 Email: ${teacher.email}`);
    console.log(`🆔 ID: ${teacher._id}`);

    // Définir un nouveau mot de passe
    const newPassword = 'password123';
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Mettre à jour le mot de passe
    teacher.password = hashedPassword;
    await teacher.save();
    
    console.log(`\n✅ Mot de passe mis à jour avec succès!`);
    console.log(`🔑 Nouveau mot de passe: ${newPassword}`);
    
    // Vérifier que le hash fonctionne
    const isMatch = await bcrypt.compare(newPassword, teacher.password);
    console.log(`\n🔍 Vérification du hash: ${isMatch ? '✅ OK' : '❌ ERREUR'}`);
    
    console.log('\n📝 Informations de connexion:');
    console.log(`  Email: ${teacher.email}`);
    console.log(`  Mot de passe: ${newPassword}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion fermée');
  }
}

resetTeacherPassword();
