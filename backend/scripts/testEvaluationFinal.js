const fetch = require('node-fetch');
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function loginTeacher() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'prof.martin@example.com',
      password: 'password123'
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Connexion réussie');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      console.log('❌ Pas de token dans la réponse');
      return null;
    }
  } catch (error) {
    console.log('❌ Échec de connexion:', error.response?.data?.message || error.message);
    return null;
  }
}

async function testEvaluationAPI() {
  try {
    console.log('🔍 Test final de l\'API d\'évaluation\n');
    
    // 1. Login enseignant
    console.log('1️⃣ Connexion enseignant...');
    const token = await loginTeacher();
    
    if (!token) {
      console.log('❌ Impossible de continuer sans authentification');
      return;
    }
    
    // 2. Récupérer les données d'évaluation
    console.log('\n2️⃣ Récupération des données d\'évaluation...');
    const evalRes = await axios.get(`${API_URL}/evaluation/students`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const evalData = evalRes.data;
    
    if (!evalData.success) {
      console.error('❌ Échec récupération données:', evalData.message);
      return;
    }
    
    console.log('✅ Données récupérées avec succès');
    console.log(`   Nombre d'apprenants: ${evalData.count}`);
    
    // 3. Afficher les détails
    console.log('\n📊 Détails des apprenants:\n');
    evalData.data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.student.name} (${item.student.email})`);
      console.log(`   - Sessions totales: ${item.totalSessions}`);
      console.log(`   - Score moyen: ${item.averageScore}%`);
      console.log(`   - Dernière activité: ${new Date(item.lastActivity).toLocaleString('fr-FR')}`);
      console.log(`   - Collections utilisées:`);
      item.collections.forEach(col => {
        console.log(`     • ${col.name} (${col.sessionsCount} sessions)`);
      });
      console.log('');
    });
    
    // 4. Vérifier la structure pour le frontend
    console.log('🎯 Structure de données pour le frontend:');
    const transformedData = evalData.data.map(item => ({
      studentId: item.student._id,
      studentName: item.student.name,
      studentEmail: item.student.email,
      totalSessions: item.totalSessions,
      averageScore: item.averageScore,
      lastSession: item.lastActivity,
      sessionTypes: ['revision'],
      collections: item.collections
    }));
    
    console.log(JSON.stringify(transformedData[0], null, 2));
    
    console.log('\n✅ Test terminé avec succès !');
    console.log('ℹ️  L\'API backend fonctionne correctement.');
    console.log('ℹ️  Les données sont prêtes pour l\'affichage dans le frontend.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testEvaluationAPI();
