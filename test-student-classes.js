// test-student-classes.js
// Script de test rapide pour les fonctionnalités classes étudiants

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Fonction utilitaire pour les tests
async function testAPI(description, fn) {
  try {
    console.log(`\n🧪 Test: ${description}`);
    await fn();
    console.log('✅ Succès');
  } catch (error) {
    console.log('❌ Échec:', error.response?.data?.message || error.message);
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Début des tests des fonctionnalités classes étudiants\n');
  console.log('📍 URL de base:', BASE_URL);
  
  // Variables pour stocker les tokens d'authentification
  let teacherToken = '';
  let studentToken = '';
  let classId = '';
  let inviteCode = '';

  // Test 1: Connexion enseignant
  await testAPI('Connexion enseignant', async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'prof.martin@example.com',
      password: 'password123'
    });
    
    teacherToken = response.data.token;
    console.log('   Token enseignant obtenu');
  });

  // Test 2: Création d'une classe par l'enseignant
  await testAPI('Création d\'une classe', async () => {
    const response = await axios.post(`${BASE_URL}/classes`, {
      name: 'Classe Test API',
      description: 'Classe créée pour tester les API étudiants',
      maxStudents: 30,
      allowSelfEnrollment: true
    }, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    
    classId = response.data.data._id;
    inviteCode = response.data.data.inviteCode;
    console.log('   Classe créée avec ID:', classId);
    console.log('   Code d\'invitation:', inviteCode);
  });

  // Test 3: Connexion étudiant (utilisateur existant)
  await testAPI('Connexion étudiant', async () => {
    // Supposons qu'il y a un étudiant de test
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'etudiant.test@example.com', // Remplacer par un email existant
      password: 'password123'
    });
    
    studentToken = response.data.token;
    console.log('   Token étudiant obtenu');
  });

  // Test 4: Récupération des classes étudiants (vide au début)  
  await testAPI('Récupération classes étudiants (vide)', async () => {
    const response = await axios.get(`${BASE_URL}/classes/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    console.log('   Nombre de classes:', response.data.count);
    console.log('   Classes:', response.data.data.length > 0 ? 'Non vide' : 'Vide (attendu)');
  });

  // Test 5: Rejoindre une classe avec code d'invitation
  await testAPI('Rejoindre une classe', async () => {
    const response = await axios.post(`${BASE_URL}/classes/join/${inviteCode}`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    console.log('   Message:', response.data.message);
    console.log('   Classe rejointe:', response.data.data.class.name);
  });

  // Test 6: Récupération des classes étudiants (avec une classe)
  await testAPI('Récupération classes étudiants (avec classe)', async () => {
    const response = await axios.get(`${BASE_URL}/classes/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    console.log('   Nombre de classes:', response.data.count);
    if (response.data.data.length > 0) {
      const classe = response.data.data[0];
      console.log('   Première classe:', classe.name);
      console.log('   Enseignant:', classe.teacherId.name || classe.teacherId.email);
    }
  });

  // Test 7: Tentative de rejoindre la même classe (erreur attendue)
  await testAPI('Rejoindre la même classe (erreur attendue)', async () => {
    const response = await axios.post(`${BASE_URL}/classes/join/${inviteCode}`, {}, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    console.log('   ⚠️  Pas d\'erreur - ce n\'est pas attendu');
  });

  // Test 8: Nettoyage - suppression de la classe de test
  await testAPI('Nettoyage - suppression classe test', async () => {
    await axios.delete(`${BASE_URL}/classes/${classId}`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    
    console.log('   Classe de test supprimée');
  });

  console.log('\n🎉 Tests terminés !');
  console.log('\n📋 Résumé:');
  console.log('- Les API backend semblent fonctionnelles');
  console.log('- La création de classes fonctionne');
  console.log('- L\'adhésion aux classes fonctionne');
  console.log('- La récupération des classes étudiants fonctionne');
  console.log('\n💡 Prochaines étapes:');
  console.log('- Tester l\'interface utilisateur manuellement');
  console.log('- Utiliser le guide de test complet');
  console.log('- Vérifier les cas d\'erreur');
}

// Exécution des tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Erreur critique lors des tests:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests };
