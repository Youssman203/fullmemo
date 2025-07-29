const axios = require('axios');

/**
 * Script pour tester l'inscription via l'API comme le ferait le frontend
 */
const testAPIRegistration = async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  console.log('🧪 Test d\'inscription via API...\n');

  try {
    // Test 1: Inscription d'un enseignant
    console.log('📝 Test 1: Inscription d\'un enseignant');
    const teacherData = {
      name: 'Prof. API Test',
      email: 'prof.api.test@example.com',
      password: 'password123',
      role: 'teacher'
    };

    const teacherResponse = await axios.post(`${API_BASE_URL}/users`, teacherData);
    console.log('✅ Réponse API enseignant:');
    console.log(`   Nom: ${teacherResponse.data.name}`);
    console.log(`   Email: ${teacherResponse.data.email}`);
    console.log(`   Rôle: ${teacherResponse.data.role}`);
    console.log(`   Token: ${teacherResponse.data.token ? 'Présent' : 'Absent'}`);

    // Test 2: Inscription d'un étudiant
    console.log('\n📝 Test 2: Inscription d\'un étudiant');
    const studentData = {
      name: 'Étudiant API Test',
      email: 'student.api.test@example.com',
      password: 'password123',
      role: 'student'
    };

    const studentResponse = await axios.post(`${API_BASE_URL}/users`, studentData);
    console.log('✅ Réponse API étudiant:');
    console.log(`   Nom: ${studentResponse.data.name}`);
    console.log(`   Email: ${studentResponse.data.email}`);
    console.log(`   Rôle: ${studentResponse.data.role}`);
    console.log(`   Token: ${studentResponse.data.token ? 'Présent' : 'Absent'}`);

    // Test 3: Connexion avec l'enseignant
    console.log('\n🔐 Test 3: Connexion enseignant');
    const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
      email: teacherData.email,
      password: teacherData.password
    });
    console.log('✅ Réponse connexion enseignant:');
    console.log(`   Nom: ${loginResponse.data.name}`);
    console.log(`   Email: ${loginResponse.data.email}`);
    console.log(`   Rôle: ${loginResponse.data.role}`);
    console.log(`   Token: ${loginResponse.data.token ? 'Présent' : 'Absent'}`);

    // Test 4: Vérification du profil avec token
    console.log('\n👤 Test 4: Récupération du profil');
    const profileResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${loginResponse.data.token}`
      }
    });
    console.log('✅ Réponse profil:');
    console.log(`   Nom: ${profileResponse.data.name}`);
    console.log(`   Email: ${profileResponse.data.email}`);
    console.log(`   Rôle: ${profileResponse.data.role}`);

    console.log('\n🎉 Tous les tests sont réussis !');
    console.log('\n📋 Identifiants de test créés:');
    console.log(`👨‍🏫 Enseignant: ${teacherData.email} / ${teacherData.password}`);
    console.log(`👨‍🎓 Étudiant: ${studentData.email} / ${studentData.password}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response.data.message?.includes('existe déjà')) {
      console.log('ℹ️  Note: Les utilisateurs existent déjà, ce qui est normal pour les tests répétés');
    }
  }
};

// Exécuter le test
if (require.main === module) {
  testAPIRegistration();
}

module.exports = testAPIRegistration;
