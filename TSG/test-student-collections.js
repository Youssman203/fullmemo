const http = require('http');

// Configuration des comptes de test
const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';

// Fonction pour faire une requête HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testStudentCollections() {
  console.log('👨‍🎓 Test de récupération des collections côté étudiant');
  console.log('=' .repeat(60));

  try {
    // 1. Créer un compte étudiant si nécessaire
    console.log('\n1. 📝 Création/connexion compte étudiant');
    
    const registerOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const registerData = {
      name: 'Étudiant Test',
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD,
      role: 'student'
    };

    const registerResponse = await makeRequest(registerOptions, registerData);
    console.log('Statut création compte:', registerResponse.status);
    
    // 2. Connexion étudiant
    console.log('\n2. 🔑 Connexion étudiant');
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Statut connexion:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Échec de la connexion étudiant');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion étudiant réussie');
    console.log('Nom:', loginResponse.data.name);
    console.log('Rôle:', loginResponse.data.role);

    // 3. Récupérer les classes de l'étudiant
    console.log('\n3. 📚 Récupération des classes de l\'étudiant');
    const classesOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes/student',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const classesResponse = await makeRequest(classesOptions);
    console.log('Statut classes:', classesResponse.status);
    
    if (classesResponse.status !== 200) {
      console.log('❌ Erreur récupération classes étudiant');
      console.log('Réponse:', classesResponse.data);
      return;
    }

    const classes = classesResponse.data.data || [];
    console.log('✅ Classes trouvées:', classes.length);
    
    if (classes.length === 0) {
      console.log('⚠️ L\'étudiant n\'est inscrit dans aucune classe');
      console.log('Il faut d\'abord que l\'étudiant rejoigne une classe');
      return;
    }

    // Afficher les classes
    classes.forEach((classe, index) => {
      console.log(`   ${index + 1}. ${classe.name} (ID: ${classe._id})`);
      console.log(`      Enseignant: ${classe.teacher.name}`);
      console.log(`      Collections: ${classe.stats.totalCollections}`);
    });

    // 4. Tester récupération collections pour chaque classe
    console.log('\n4. 🔍 Test récupération collections par classe');
    
    for (let i = 0; i < classes.length; i++) {
      const classe = classes[i];
      console.log(`\n   Classe: ${classe.name} (${classe._id})`);
      
      const collectionsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/classes/${classe._id}/collections`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const collectionsResponse = await makeRequest(collectionsOptions);
      console.log(`   Statut collections: ${collectionsResponse.status}`);
      
      if (collectionsResponse.status === 200) {
        const collectionsData = collectionsResponse.data.data;
        console.log('   ✅ Collections récupérées avec succès');
        console.log('   Structure réponse:', Object.keys(collectionsData));
        console.log('   Classe info:', collectionsData.class?.name);
        console.log('   Collections:', collectionsData.collections?.length || 0);
        
        if (collectionsData.collections?.length > 0) {
          collectionsData.collections.forEach((coll, idx) => {
            console.log(`     ${idx + 1}. ${coll.name} (${coll._id})`);
          });
        }
      } else {
        console.log('   ❌ Erreur récupération collections');
        console.log('   Réponse:', collectionsResponse.data);
      }
    }

    // 5. Rejoindre la classe bac2 où les collections sont partagées
    console.log('\n5. 🎯 Rejoindre la classe bac2 (avec collections partagées)');
    
    // Code d'invitation de la classe bac2
    const inviteCode = '9BONA1'; // Code de la classe bac2
    
    const joinOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/join/${inviteCode}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const joinResponse = await makeRequest(joinOptions);
    console.log('Statut rejoindre classe bac2:', joinResponse.status);
    
    if (joinResponse.status === 200) {
      console.log('✅ Classe bac2 rejointe avec succès');
      console.log('Classe:', joinResponse.data.data.class.name);
      
      // Re-tester la récupération des collections de la classe bac2
      console.log('\n6. 🔄 Test collections classe bac2');
      const bac2ClassId = joinResponse.data.data.class._id;
      
      const bac2CollectionsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/classes/${bac2ClassId}/collections`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const bac2CollectionsResponse = await makeRequest(bac2CollectionsOptions);
      console.log('Statut collections bac2:', bac2CollectionsResponse.status);
      
      if (bac2CollectionsResponse.status === 200) {
        const collectionsData = bac2CollectionsResponse.data.data;
        console.log('✅ Collections bac2 récupérées:');
        console.log('   Classe:', collectionsData.class?.name);
        console.log('   Nombre collections:', collectionsData.collections?.length || 0);
        
        if (collectionsData.collections?.length > 0) {
          collectionsData.collections.forEach((coll, idx) => {
            console.log(`     ${idx + 1}. ${coll.name} (${coll._id})`);
          });
        }
        
        console.log('\n🎉 SUCCÈS ! L\'étudiant peut maintenant voir les collections partagées');
      } else {
        console.log('❌ Erreur récupération collections bac2:', bac2CollectionsResponse.data);
      }
      
    } else if (joinResponse.status === 400 && joinResponse.data.message?.includes('déjà inscrit')) {
      console.log('⚠️ Étudiant déjà inscrit dans la classe bac2');
      
      // Tester directement avec l'ID de la classe bac2
      const bac2ClassId = '68884889e4c3c95f0bcd3eed';
      console.log('\n6. 🔄 Test direct collections bac2');
      
      const bac2CollectionsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/classes/${bac2ClassId}/collections`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const bac2CollectionsResponse = await makeRequest(bac2CollectionsOptions);
      console.log('Statut collections bac2 (direct):', bac2CollectionsResponse.status);
      console.log('Réponse bac2 (direct):', JSON.stringify(bac2CollectionsResponse.data, null, 2));
      
    } else {
      console.log('❌ Échec rejoindre classe bac2');
      console.log('Réponse:', joinResponse.data);
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testStudentCollections();
