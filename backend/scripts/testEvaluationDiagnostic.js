// Script de diagnostic pour l'API d'évaluation
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testEvaluationDiagnostic() {
  try {
    console.log('🔍 Diagnostic de l\'API d\'évaluation\n');
    console.log('API URL:', API_URL);
    
    // 1. Tester la connexion au serveur
    console.log('1️⃣ Test de connexion au serveur...');
    try {
      const healthResponse = await fetch('http://localhost:5000/', {
        method: 'GET',
        timeout: 5000
      });
      console.log('   ✅ Serveur accessible sur le port 5000');
    } catch (error) {
      console.log('   ❌ Serveur non accessible:', error.message);
      return;
    }

    // 2. Tester la connexion enseignant
    console.log('\n2️⃣ Test de connexion enseignant...');
    const loginPayload = {
      email: 'prof.martin@example.com',
      password: 'password123'
    };
    
    console.log('   Payload:', JSON.stringify(loginPayload));
    
    let loginResponse;
    try {
      loginResponse = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginPayload)
      });
    } catch (error) {
      console.log('   ❌ Erreur de requête:', error.message);
      return;
    }

    console.log('   Status HTTP:', loginResponse.status);
    console.log('   Headers:', loginResponse.headers.raw());
    
    const responseText = await loginResponse.text();
    console.log('   Réponse brute:', responseText.substring(0, 200));
    
    let loginData;
    try {
      loginData = JSON.parse(responseText);
      console.log('   ✅ Réponse JSON valide');
    } catch (error) {
      console.log('   ❌ Réponse non-JSON:', error.message);
      return;
    }

    if (!loginResponse.ok) {
      console.log('   ❌ Erreur de connexion:', loginData.message || 'Erreur inconnue');
      return;
    }

    // Vérifier la structure de la réponse
    if (!loginData.token) {
      console.log('   ❌ Token manquant dans la réponse');
      console.log('   Structure reçue:', Object.keys(loginData));
      return;
    }

    const token = loginData.token;
    const user = loginData.user || {};
    
    console.log('   ✅ Connexion réussie');
    console.log('   Utilisateur:', user.name || 'Nom non disponible');
    console.log('   Email:', user.email || 'Email non disponible');
    console.log('   ID:', user._id || user.id || 'ID non disponible');
    console.log('   Token (début):', token.substring(0, 30) + '...');

    // 3. Tester l'endpoint d'évaluation
    console.log('\n3️⃣ Test de l\'endpoint /api/evaluation/students...');
    
    let evaluationResponse;
    try {
      evaluationResponse = await fetch(`${API_URL}/evaluation/students`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.log('   ❌ Erreur de requête:', error.message);
      return;
    }

    console.log('   Status HTTP:', evaluationResponse.status);
    
    const evalResponseText = await evaluationResponse.text();
    console.log('   Réponse brute (début):', evalResponseText.substring(0, 200));
    
    let evaluationData;
    try {
      evaluationData = JSON.parse(evalResponseText);
      console.log('   ✅ Réponse JSON valide');
    } catch (error) {
      console.log('   ❌ Réponse non-JSON:', error.message);
      return;
    }

    if (!evaluationResponse.ok) {
      console.log('   ❌ Erreur API:', evaluationData.message || 'Erreur inconnue');
      return;
    }

    // Afficher les résultats
    console.log('\n✅ Données d\'évaluation reçues:');
    console.log('   Success:', evaluationData.success);
    console.log('   Count:', evaluationData.count);
    console.log('   Nombre d\'apprenants:', evaluationData.data ? evaluationData.data.length : 0);
    
    if (evaluationData.data && evaluationData.data.length > 0) {
      console.log('\n📊 Liste des apprenants:');
      evaluationData.data.forEach((student, index) => {
        console.log(`\n   ${index + 1}. ${student.student.name}`);
        console.log(`      - Email: ${student.student.email}`);
        console.log(`      - Sessions: ${student.totalSessions}`);
        console.log(`      - Score moyen: ${student.averageScore}%`);
        console.log(`      - Collections: ${student.collections.map(c => c.name).join(', ')}`);
        if (student.sessions && student.sessions.length > 0) {
          console.log(`      - Dernière session: ${new Date(student.sessions[0].createdAt).toLocaleString('fr-FR')}`);
        }
      });
    } else {
      console.log('\n⚠️ Aucun apprenant avec sessions trouvé');
    }

    // Afficher la structure complète pour debug
    console.log('\n📝 Structure complète de la réponse:');
    console.log(JSON.stringify(evaluationData, null, 2));

  } catch (error) {
    console.error('\n❌ Erreur non gérée:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le diagnostic
testEvaluationDiagnostic();
