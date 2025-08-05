// Script pour tester l'API d'évaluation
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

const testEvaluationAPI = async () => {
  try {
    console.log('🧪 Test API Évaluation - Début\n');

    // 1. Connexion enseignant
    console.log('1. Connexion enseignant...');
    const loginResponse = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'prof.martin@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Erreur connexion: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Connexion réussie:', loginData.user.name);

    // 2. Test API Teacher Overview
    console.log('\n2. Test API Teacher Overview...');
    const overviewResponse = await fetch(`${API_URL}/sessions/teacher/overview`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!overviewResponse.ok) {
      throw new Error(`Erreur overview: ${overviewResponse.status} - ${await overviewResponse.text()}`);
    }

    const overviewData = await overviewResponse.json();
    console.log('✅ API Overview OK');
    console.log('📊 Données reçues:');
    console.log('   - Success:', overviewData.success);
    console.log('   - Étudiants trouvés:', overviewData.data?.students?.length || 0);
    console.log('   - Stats globales:', overviewData.data?.globalStats ? 'Oui' : 'Non');

    if (overviewData.data?.students?.length > 0) {
      console.log('\n📋 Premier étudiant:');
      const firstStudent = overviewData.data.students[0];
      console.log('   - ID:', firstStudent.studentId);
      console.log('   - Nom:', firstStudent.studentName);
      console.log('   - Email:', firstStudent.studentEmail);
      console.log('   - Sessions:', firstStudent.totalSessions);
      console.log('   - Score moyen:', firstStudent.averageScore + '%');
      console.log('   - Types sessions:', firstStudent.sessionTypes);
      console.log('   - Dernière session:', new Date(firstStudent.lastSession).toLocaleString('fr-FR'));
    }

    if (overviewData.data?.globalStats) {
      console.log('\n📈 Statistiques globales:');
      console.log('   - Étudiants uniques:', overviewData.data.globalStats.uniqueStudentsCount);
      console.log('   - Total sessions:', overviewData.data.globalStats.totalSessions);
      console.log('   - Score moyen:', overviewData.data.globalStats.averageScore + '%');
    }

    console.log('\n🎉 Test API Évaluation - Succès complet !');
    console.log('👉 Les données devraient maintenant s\'afficher dans l\'interface');

  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
};

testEvaluationAPI();
