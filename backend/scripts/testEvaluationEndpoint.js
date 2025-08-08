// Test direct de l'endpoint /api/evaluation/students
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testEvaluationEndpoint() {
  try {
    console.log('🔄 Test de l\'endpoint /api/evaluation/students\n');
    
    // 1. Se connecter en tant qu'enseignant
    console.log('1️⃣ Connexion en tant qu\'enseignant...');
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
      const error = await loginResponse.text();
      throw new Error(`Erreur de connexion: ${loginResponse.status} - ${error}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log(`✅ Connecté: ${loginData.user.name} (${loginData.user._id})`);
    console.log(`🔑 Token: ${token.substring(0, 50)}...`);

    // 2. Appeler l'endpoint d'évaluation
    console.log('\n2️⃣ Appel de /api/evaluation/students...');
    const evaluationResponse = await fetch(`${API_URL}/evaluation/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`📡 Status: ${evaluationResponse.status}`);
    
    if (!evaluationResponse.ok) {
      const error = await evaluationResponse.text();
      throw new Error(`Erreur API: ${evaluationResponse.status} - ${error}`);
    }

    const evaluationData = await evaluationResponse.json();
    
    console.log('\n✅ Réponse reçue:');
    console.log('   - Success:', evaluationData.success);
    console.log('   - Count:', evaluationData.count);
    console.log('   - Data length:', evaluationData.data ? evaluationData.data.length : 0);
    
    if (evaluationData.data && evaluationData.data.length > 0) {
      console.log('\n📊 Apprenants trouvés:');
      evaluationData.data.forEach((student, index) => {
        console.log(`\n   ${index + 1}. ${student.student.name} (${student.student._id})`);
        console.log(`      - Email: ${student.student.email}`);
        console.log(`      - Sessions: ${student.totalSessions}`);
        console.log(`      - Score moyen: ${student.averageScore}%`);
        console.log(`      - Collections: ${student.collections.map(c => c.name).join(', ')}`);
        console.log(`      - Dernière activité: ${new Date(student.lastActivity).toLocaleString('fr-FR')}`);
      });
    } else {
      console.log('\n⚠️ Aucun apprenant trouvé dans la réponse');
    }

    console.log('\n📝 Réponse complète (JSON):');
    console.log(JSON.stringify(evaluationData, null, 2));

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testEvaluationEndpoint();
