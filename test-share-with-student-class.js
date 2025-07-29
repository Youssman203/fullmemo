const http = require('http');

// Configuration des comptes de test
const TEACHER_EMAIL = 'prof.martin@example.com';
const TEACHER_PASSWORD = 'password123';

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

async function shareCollectionWithStudentClass() {
  console.log('👨‍🏫 Partage de collection avec classe d\'étudiant');
  console.log('=' .repeat(60));

  try {
    // 1. Connexion enseignant
    console.log('\n1. 🔑 Connexion enseignant');
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
      email: TEACHER_EMAIL,
      password: TEACHER_PASSWORD
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log('Statut connexion:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Échec connexion enseignant');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion enseignant réussie');

    // 2. Récupérer les classes de l'enseignant
    console.log('\n2. 📚 Récupération classes enseignant');
    const classesOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/classes',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const classesResponse = await makeRequest(classesOptions);
    console.log('Statut classes:', classesResponse.status);
    
    if (classesResponse.status !== 200) {
      console.log('❌ Erreur récupération classes');
      return;
    }

    const classes = classesResponse.data.data || [];
    console.log('✅ Classes trouvées:', classes.length);
    
    if (classes.length === 0) {
      console.log('❌ Aucune classe trouvée');
      return;
    }

    // Trouver une classe avec des étudiants
    let targetClass = null;
    for (const classe of classes) {
      console.log(`   - ${classe.name} (${classe.stats.totalStudents} étudiants)`);
      if (classe.stats.totalStudents > 0) {
        targetClass = classe;
      }
    }

    if (!targetClass) {
      console.log('❌ Aucune classe avec étudiants trouvée');
      return;
    }

    console.log(`🎯 Classe sélectionnée: ${targetClass.name} (${targetClass._id})`);

    // 3. Récupérer les collections de l'enseignant
    console.log('\n3. 📖 Récupération collections enseignant');
    const collectionsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/collections',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const collectionsResponse = await makeRequest(collectionsOptions);
    console.log('Statut collections:', collectionsResponse.status);
    
    if (collectionsResponse.status !== 200) {
      console.log('❌ Erreur récupération collections');
      return;
    }

    const collections = collectionsResponse.data.data || [];
    console.log('✅ Collections trouvées:', collections.length);

    if (collections.length === 0) {
      console.log('❌ Aucune collection trouvée');
      return;
    }

    // Sélectionner une collection à partager
    const targetCollection = collections[0];
    console.log(`🎯 Collection sélectionnée: ${targetCollection.name} (${targetCollection._id})`);

    // 4. Partager la collection avec la classe
    console.log('\n4. 🤝 Partage de la collection');
    const shareOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${targetClass._id}/collections`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const shareData = {
      collectionId: targetCollection._id
    };

    const shareResponse = await makeRequest(shareOptions, shareData);
    console.log('Statut partage:', shareResponse.status);
    
    if (shareResponse.status === 200) {
      console.log('✅ Collection partagée avec succès');
      console.log('Message:', shareResponse.data.message);
    } else if (shareResponse.status === 400 && shareResponse.data.message?.includes('déjà partagée')) {
      console.log('⚠️ Collection déjà partagée');
    } else {
      console.log('❌ Erreur partage:', shareResponse.data);
    }

    // 5. Vérifier les collections partagées
    console.log('\n5. 🔍 Vérification collections partagées');
    const sharedOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${targetClass._id}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const sharedResponse = await makeRequest(sharedOptions);
    console.log('Statut vérification:', sharedResponse.status);
    
    if (sharedResponse.status === 200) {
      const sharedData = sharedResponse.data.data;
      console.log('✅ Collections partagées récupérées');
      console.log('Nombre de collections:', sharedData.collections?.length || 0);
      
      if (sharedData.collections?.length > 0) {
        sharedData.collections.forEach((coll, idx) => {
          console.log(`   ${idx + 1}. ${coll.name} (${coll._id})`);
        });
      }
    } else {
      console.log('❌ Erreur vérification:', sharedResponse.data);
    }

    console.log('\n🎉 Test terminé. L\'étudiant devrait maintenant voir les collections partagées.');
    console.log(`Classe: ${targetClass.name}`);
    console.log(`Collection: ${targetCollection.name}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
shareCollectionWithStudentClass();
