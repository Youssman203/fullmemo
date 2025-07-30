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

async function comprehensiveShareTest() {
  console.log('🎯 Test complet du partage de collections');
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
    
    if (loginResponse.status !== 200) {
      console.log('❌ Échec de la connexion');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');

    // 2. Récupérer TOUTES les classes
    console.log('\n2. 📚 Récupération de toutes les classes');
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
    console.log('Statut:', classesResponse.status);
    
    if (classesResponse.status !== 200) {
      console.log('❌ Erreur récupération classes');
      console.log('Réponse:', classesResponse.data);
      return;
    }

    const classes = classesResponse.data.data || [];
    console.log('✅ Classes trouvées:', classes.length);
    
    classes.forEach((classe, index) => {
      console.log(`   ${index + 1}. ${classe.name} (ID: ${classe._id})`);
    });

    if (!classes.length) {
      console.log('❌ Aucune classe trouvée');
      return;
    }

    // 3. Récupérer TOUTES les collections
    console.log('\n3. 📖 Récupération de toutes les collections');
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
    console.log('Statut:', collectionsResponse.status);
    
    if (collectionsResponse.status !== 200) {
      console.log('❌ Erreur récupération collections');
      return;
    }

    const collections = collectionsResponse.data.data || collectionsResponse.data;
    console.log('✅ Collections trouvées:', collections.length);
    
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (ID: ${collection._id})`);
    });

    if (!collections.length) {
      console.log('❌ Aucune collection trouvée');
      return;
    }

    // 4. Pour chaque classe, voir les collections déjà partagées
    console.log('\n4. 🔍 Collections déjà partagées par classe');
    
    for (let i = 0; i < classes.length; i++) {
      const classe = classes[i];
      console.log(`\n   Classe: ${classe.name} (${classe._id})`);
      
      const sharedOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/classes/${classe._id}/collections`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const sharedResponse = await makeRequest(sharedOptions);
      if (sharedResponse.status === 200) {
        const sharedCollections = sharedResponse.data.data?.collections || [];
        console.log(`   Collections partagées: ${sharedCollections.length}`);
        sharedCollections.forEach(coll => {
          console.log(`     - ${coll.name} (${coll._id})`);
        });
      } else {
        console.log(`   Erreur récupération collections partagées: ${sharedResponse.status}`);
      }
    }

    // 5. Essayer de partager une collection non encore partagée
    console.log('\n5. 🔄 Test de partage intelligent');
    
    const classe = classes[0]; // Première classe
    console.log(`Classe sélectionnée: ${classe.name}`);
    
    // Récupérer les collections déjà partagées pour cette classe
    const currentSharedResponse = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${classe._id}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    let alreadyShared = [];
    if (currentSharedResponse.status === 200) {
      alreadyShared = currentSharedResponse.data.data?.collections || [];
    }

    console.log(`Collections déjà partagées: ${alreadyShared.length}`);
    
    // Trouver une collection pas encore partagée
    const availableCollections = collections.filter(coll => 
      !alreadyShared.some(shared => shared._id === coll._id)
    );

    console.log(`Collections disponibles pour partage: ${availableCollections.length}`);

    if (availableCollections.length === 0) {
      console.log('⚠️ Toutes les collections sont déjà partagées');
      
      // Essayons de créer une nouvelle collection
      console.log('\n6. 📝 Création d\'une nouvelle collection pour test');
      const newCollectionOptions = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/collections',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const newCollectionData = {
        name: `Collection Test ${Date.now()}`,
        description: 'Collection créée pour test de partage',
        category: 'other'
      };

      const newCollectionResponse = await makeRequest(newCollectionOptions, newCollectionData);
      console.log('Statut création:', newCollectionResponse.status);
      
      if (newCollectionResponse.status === 201) {
        const newCollection = newCollectionResponse.data.data || newCollectionResponse.data;
        console.log('✅ Nouvelle collection créée:', newCollection.name);
        
        // Essayer de partager la nouvelle collection
        console.log('\n7. 🎯 Partage de la nouvelle collection');
        const shareOptions = {
          hostname: 'localhost',
          port: 5000,
          path: `/api/classes/${classe._id}/collections`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        };

        const shareData = {
          collectionId: newCollection._id
        };

        const shareResponse = await makeRequest(shareOptions, shareData);
        console.log('Statut partage:', shareResponse.status);
        console.log('Réponse partage:', JSON.stringify(shareResponse.data, null, 2));

        if (shareResponse.status === 200) {
          console.log('✅ PARTAGE RÉUSSI !');
        } else {
          console.log('❌ PARTAGE ÉCHOUÉ');
        }
      } else {
        console.log('❌ Échec création collection:', newCollectionResponse.data);
      }
    } else {
      // Partager une collection disponible
      const collectionToShare = availableCollections[0];
      console.log(`Collection à partager: ${collectionToShare.name}`);
      
      const shareOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/classes/${classe._id}/collections`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      };

      const shareData = {
        collectionId: collectionToShare._id
      };

      const shareResponse = await makeRequest(shareOptions, shareData);
      console.log('Statut partage:', shareResponse.status);
      console.log('Réponse partage:', JSON.stringify(shareResponse.data, null, 2));

      if (shareResponse.status === 200) {
        console.log('✅ PARTAGE RÉUSSI !');
      } else {
        console.log('❌ PARTAGE ÉCHOUÉ');
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
comprehensiveShareTest();
