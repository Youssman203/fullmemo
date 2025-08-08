// Test pour vérifier que le frontend peut récupérer les données d'évaluation
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testFrontendEvaluation() {
  try {
    console.log('🔍 Test de l\'intégration Frontend-Backend pour l\'évaluation\n');
    
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

    const loginData = await loginResponse.json();
    const token = loginData.token;
    const user = loginData.user;
    
    console.log('✅ Connecté:', user.name);
    console.log('   Role:', user.role);
    console.log('   ID:', user._id);
    
    // 2. Récupérer les collections de l'enseignant
    console.log('\n2️⃣ Récupération des collections de l\'enseignant...');
    const collectionsResponse = await fetch(`${API_URL}/collections`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const collectionsData = await collectionsResponse.json();
    console.log('   Collections trouvées:', collectionsData.data ? collectionsData.data.length : 0);
    
    if (collectionsData.data && collectionsData.data.length > 0) {
      collectionsData.data.forEach(col => {
        console.log(`   - ${col.name} (ID: ${col._id})`);
      });
    }
    
    // 3. Appeler l'endpoint d'évaluation
    console.log('\n3️⃣ Appel de l\'endpoint d\'évaluation...');
    const evaluationResponse = await fetch(`${API_URL}/evaluation/students`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const evaluationData = await evaluationResponse.json();
    
    console.log('\n✅ Réponse de l\'API d\'évaluation:');
    console.log('   Success:', evaluationData.success);
    console.log('   Count:', evaluationData.count);
    console.log('   Apprenants:', evaluationData.data ? evaluationData.data.length : 0);
    
    // 4. Vérifier la structure des données pour le frontend
    if (evaluationData.data && evaluationData.data.length > 0) {
      console.log('\n📊 Structure des données pour le frontend:');
      
      const firstStudent = evaluationData.data[0];
      console.log('\n   Premier apprenant:');
      console.log('   - student (objet):', !!firstStudent.student);
      console.log('     - _id:', firstStudent.student._id);
      console.log('     - name:', firstStudent.student.name);
      console.log('     - email:', firstStudent.student.email);
      console.log('   - collections (array):', Array.isArray(firstStudent.collections));
      console.log('   - totalSessions:', firstStudent.totalSessions);
      console.log('   - averageScore:', firstStudent.averageScore);
      console.log('   - lastActivity:', firstStudent.lastActivity);
      
      // Vérifier que la structure correspond à ce qu'attend le frontend
      console.log('\n✅ Validation de la structure:');
      const isValidStructure = 
        firstStudent.student && 
        firstStudent.student._id && 
        firstStudent.student.name &&
        Array.isArray(firstStudent.collections) &&
        typeof firstStudent.totalSessions === 'number' &&
        typeof firstStudent.averageScore === 'number';
      
      if (isValidStructure) {
        console.log('   ✅ Structure valide pour le frontend');
      } else {
        console.log('   ❌ Structure invalide pour le frontend');
      }
      
      // Afficher les données formatées comme le frontend les afficherait
      console.log('\n📋 Affichage simulé dans le frontend:');
      evaluationData.data.forEach((student, index) => {
        console.log(`\n   ${index + 1}. ${student.student.name}`);
        console.log(`      Email: ${student.student.email}`);
        console.log(`      Sessions totales: ${student.totalSessions}`);
        console.log(`      Score moyen: ${student.averageScore}%`);
        console.log(`      Collections: ${student.collections.map(c => c.name).join(', ')}`);
        console.log(`      Dernière activité: ${new Date(student.lastActivity).toLocaleString('fr-FR')}`);
      });
    } else {
      console.log('\n⚠️ Aucune donnée d\'apprenant à afficher');
    }
    
    // 5. Tester l'endpoint des statistiques
    console.log('\n4️⃣ Test de l\'endpoint des statistiques...');
    const statsResponse = await fetch(`${API_URL}/evaluation/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('   ✅ Statistiques récupérées:');
      console.log('   - Total apprenants:', statsData.data?.totalStudents);
      console.log('   - Total sessions:', statsData.data?.totalSessions);
      console.log('   - Score moyen global:', statsData.data?.averageScore);
    } else {
      console.log('   ⚠️ Endpoint stats non disponible ou erreur');
    }
    
    console.log('\n✅ Test terminé avec succès');
    console.log('\n📝 Recommandations:');
    console.log('1. Vérifier que le frontend est connecté avec le même token');
    console.log('2. Vérifier les logs de la console du navigateur');
    console.log('3. S\'assurer que l\'utilisateur connecté a le rôle "teacher"');
    console.log('4. Vérifier que la page Evaluation.js utilise bien evaluationService');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Lancer le test
testFrontendEvaluation();
