// Test complet du flux d'évaluation
const mongoose = require('mongoose');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spaced-revision';
const fetch = require('node-fetch');
const API_URL = 'http://localhost:5000/api';

async function testFullFlow() {
  try {
    // 1. Connexion à MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 2. Vérifier/Créer un mot de passe pour Prof. Martin Dupont
    const teacher = await User.findOne({ 
      role: 'teacher',
      name: 'Prof. Martin Dupont'
    });

    if (!teacher) {
      console.log('❌ Prof. Martin Dupont non trouvé');
      return;
    }

    console.log(`👨‍🏫 Enseignant trouvé: ${teacher.name}`);
    console.log(`📧 Email: ${teacher.email}`);

    // 3. Mettre à jour le mot de passe si nécessaire
    const testPassword = 'test123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    
    teacher.password = hashedPassword;
    await teacher.save();
    console.log(`🔑 Mot de passe mis à jour: ${testPassword}\n`);

    // 4. Fermer la connexion MongoDB
    await mongoose.connection.close();

    // 5. Tester la connexion via l'API
    console.log('📡 Test de connexion via l\'API...');
    const loginResponse = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: teacher.email,
        password: testPassword
      })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      throw new Error(`Erreur de connexion: ${loginResponse.status} - ${error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(`✅ Connexion réussie!`);
    console.log(`👤 Utilisateur: ${loginData.user.name}`);
    console.log(`🔑 Token obtenu\n`);

    // 6. Tester l'endpoint d'évaluation
    console.log('📊 Test de /api/evaluation/students...');
    const evaluationResponse = await fetch(`${API_URL}/evaluation/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!evaluationResponse.ok) {
      const error = await evaluationResponse.text();
      throw new Error(`Erreur API: ${evaluationResponse.status} - ${error}`);
    }

    const evaluationData = await evaluationResponse.json();
    
    console.log('✅ Données reçues:');
    console.log(`   - Success: ${evaluationData.success}`);
    console.log(`   - Nombre d'apprenants: ${evaluationData.count}`);
    
    if (evaluationData.data && evaluationData.data.length > 0) {
      console.log('\n📚 Détails des apprenants:');
      evaluationData.data.forEach((student, index) => {
        console.log(`\n${index + 1}. ${student.student.name}`);
        console.log(`   - Sessions: ${student.totalSessions}`);
        console.log(`   - Score moyen: ${student.averageScore}%`);
        console.log(`   - Collections: ${student.collections.map(c => c.name).join(', ')}`);
      });
    } else {
      console.log('\n⚠️ Aucun apprenant trouvé');
    }

    console.log('\n✨ Test complet réussi!');
    console.log('\n📝 Instructions pour tester dans le navigateur:');
    console.log(`1. Aller sur http://localhost:3000/login`);
    console.log(`2. Se connecter avec:`);
    console.log(`   - Email: ${teacher.email}`);
    console.log(`   - Mot de passe: ${testPassword}`);
    console.log(`3. Aller sur la page Évaluation`);
    console.log(`4. Les données devraient s'afficher correctement`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }
}

testFullFlow();
