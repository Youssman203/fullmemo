const http = require('http');

// Fonction pour faire des requêtes HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test complet : créer classe et étudiant qui rejoint
async function testCompletClasses() {
  try {
    console.log('🎯 Test complet du système de classes\n');
    
    // 1. Connexion enseignant
    console.log('1. Connexion enseignant...');
    const teacherLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'prof.test@example.com',
      password: 'password123'
    });
    
    if (teacherLogin.status !== 200) {
      console.error('❌ Échec connexion enseignant');
      return;
    }
    
    const teacherToken = teacherLogin.data.token;
    console.log('✅ Enseignant connecté:', teacherLogin.data.email);
    
    // 2. Créer une classe
    console.log('\n2. Création d\'une classe...');
    const createClass = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes',
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teacherToken}`
      }
    }, {
      name: 'Classe de Test Complète',
      description: 'Une classe pour tester toutes les fonctionnalités étudiants',
      maxStudents: 30,
      allowSelfEnrollment: true
    });
    
    if (createClass.status !== 201) {
      console.error('❌ Échec création classe:', createClass.data?.message);
      return;
    }
    
    const classe = createClass.data.data;
    console.log('✅ Classe créée:', classe.name);
    console.log('   Code d\'invitation:', classe.inviteCode);
    console.log('   ID:', classe._id);
    
    // 3. Connexion étudiant
    console.log('\n3. Connexion étudiant...');
    const studentLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'etudiant.test@example.com',
      password: 'password123'
    });
    
    if (studentLogin.status !== 200) {
      console.error('❌ Échec connexion étudiant');
      return;
    }
    
    const studentToken = studentLogin.data.token;
    console.log('✅ Étudiant connecté:', studentLogin.data.email);
    
    // 4. Étudiant rejoint la classe
    console.log('\n4. Étudiant rejoint la classe...');
    const joinClass = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/join/${classe.inviteCode}`,
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    if (joinClass.status !== 200) {
      console.error('❌ Échec rejoindre classe:', joinClass.data?.message);
      return;
    }
    
    console.log('✅ Étudiant a rejoint la classe avec succès');
    console.log('   Message:', joinClass.data.message);
    
    // 5. Récupérer les classes de l'étudiant
    console.log('\n5. Récupération des classes de l\'étudiant...');
    const studentClasses = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/student',
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    if (studentClasses.status !== 200) {
      console.error('❌ Échec récupération classes:', studentClasses.data?.message);
      return;
    }
    
    console.log('✅ Classes récupérées avec succès');
    console.log('   Nombre de classes:', studentClasses.data.count);
    
    if (studentClasses.data.data && studentClasses.data.data.length > 0) {
      const classeDetails = studentClasses.data.data[0];
      console.log('\n📚 Détails de la classe:');
      console.log('   - Nom:', classeDetails.name);
      console.log('   - Description:', classeDetails.description);
      console.log('   - Code:', classeDetails.inviteCode);
      console.log('   - Enseignant:', classeDetails.teacher?.name);
      console.log('   - Email enseignant:', classeDetails.teacher?.email);
      console.log('   - Statistiques:');
      console.log('     * Étudiants:', classeDetails.stats?.totalStudents);
      console.log('     * Collections:', classeDetails.stats?.totalCollections);
      console.log('     * Cartes:', classeDetails.stats?.totalCards);
      console.log('     * Max étudiants:', classeDetails.stats?.maxStudents);
      console.log('     * Auto-inscription:', classeDetails.stats?.allowSelfEnrollment);
      console.log('   - Camarades:', classeDetails.classmates?.length || 0);
      
      console.log('\n🎉 Test complet réussi ! L\'API fonctionne parfaitement.');
      console.log('   L\'étudiant peut maintenant voir tous les détails de sa classe.');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCompletClasses();
