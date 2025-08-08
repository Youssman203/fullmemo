// Script pour corriger l'authentification de l'enseignant
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaced-revision';

async function fixTeacherAuth() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver Prof. Martin Dupont
    let teacher = await User.findOne({ 
      name: 'Prof. Martin Dupont',
      role: 'teacher'
    });

    if (!teacher) {
      console.log('⚠️ Prof. Martin Dupont non trouvé, création...');
      
      // Créer l'enseignant
      const hashedPassword = await bcrypt.hash('password123', 10);
      teacher = await User.create({
        name: 'Prof. Martin Dupont',
        email: 'prof.martin@example.com',
        password: hashedPassword,
        role: 'teacher'
      });
      
      console.log('✅ Enseignant créé');
    } else {
      console.log(`👨‍🏫 Enseignant trouvé: ${teacher.name}`);
      
      // Mettre à jour le mot de passe directement
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.updateOne(
        { _id: teacher._id },
        { $set: { password: hashedPassword } }
      );
      
      console.log('✅ Mot de passe mis à jour');
    }

    // Récupérer l'utilisateur mis à jour
    teacher = await User.findById(teacher._id);
    
    console.log(`\n📧 Email: ${teacher.email}`);
    console.log(`🆔 ID: ${teacher._id}`);
    console.log(`🔑 Mot de passe: password123`);
    
    // Test de vérification
    const testPassword = 'password123';
    const isValid = await bcrypt.compare(testPassword, teacher.password);
    console.log(`\n🔍 Test de vérification: ${isValid ? '✅ OK' : '❌ ÉCHEC'}`);
    
    if (isValid) {
      console.log('\n✨ Authentification configurée avec succès!');
      console.log('\n📝 Pour tester:');
      console.log('1. Aller sur http://localhost:3000/login');
      console.log('2. Se connecter avec:');
      console.log(`   Email: ${teacher.email}`);
      console.log(`   Mot de passe: password123`);
      console.log('3. Aller sur la page Évaluation');
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion fermée');
  }
}

fixTeacherAuth();
