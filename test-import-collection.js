const http = require('http');

// Configuration des comptes de test
const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';
const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

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

async function testImportCollectionWorkflow() {
  console.log('📥 Test du workflow d\'importation de collections');
  console.log('=' .repeat(60));

  try {
    // 1. Connexion étudiant
    console.log('\n1. 🔑 Connexion étudiant');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginResponse = await makeRequest(loginOptions, {
      email: STUDENT_EMAIL,
      password: STUDENT_PASSWORD
    });

    console.log('Statut connexion:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Connexion échouée');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie:', loginResponse.data.name);

    // 2. Récupérer les collections partagées
    console.log('\n2. 📚 Récupération collections partagées');
    
    const collectionsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const collectionsResponse = await makeRequest(collectionsOptions);
    console.log('Statut collections:', collectionsResponse.status);
    
    if (collectionsResponse.status !== 200) {
      console.log('❌ Erreur récupération collections');
      console.log('Réponse:', collectionsResponse.data);
      return;
    }

    const sharedCollections = collectionsResponse.data.data.collections;
    console.log('✅ Collections partagées trouvées:', sharedCollections.length);
    
    if (sharedCollections.length === 0) {
      console.log('⚠️ Aucune collection partagée disponible');
      return;
    }

    // Sélectionner la première collection pour l'importation
    const targetCollection = sharedCollections[0];
    console.log(`🎯 Collection sélectionnée: ${targetCollection.name} (${targetCollection._id})`);
    console.log(`   Cartes: ${targetCollection.cardCount || 0}`);

    // 3. Vérifier les collections actuelles de l'étudiant (avant importation)
    console.log('\n3. 📖 Collections actuelles de l\'étudiant');
    
    const userCollectionsOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/collections',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };

    const userCollectionsResponse = await makeRequest(userCollectionsOptions);
    console.log('Statut collections utilisateur:', userCollectionsResponse.status);
    
    const userCollectionsBefore = userCollectionsResponse.data.data || [];
    console.log('Collections avant importation:', userCollectionsBefore.length);

    // 4. Importer la collection
    console.log('\n4. 📥 Importation de la collection');
    
    const importOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections/import`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const importData = {
      collectionId: targetCollection._id
    };

    const importResponse = await makeRequest(importOptions, importData);
    console.log('Statut importation:', importResponse.status);
    
    if (importResponse.status === 201) {
      console.log('✅ Importation réussie !');
      console.log('Message:', importResponse.data.message);
      console.log('Collection importée:', importResponse.data.data.collection.name);
      console.log('Cartes importées:', importResponse.data.data.cardsImported);
      console.log('ID nouvelle collection:', importResponse.data.data.collection._id);
      
    } else if (importResponse.status === 400 && importResponse.data.message?.includes('déjà importé')) {
      console.log('⚠️ Collection déjà importée');
      console.log('Message:', importResponse.data.message);
      
    } else {
      console.log('❌ Erreur importation');
      console.log('Statut:', importResponse.status);
      console.log('Réponse:', importResponse.data);
      return;
    }

    // 5. Vérifier les collections après importation
    console.log('\n5. 🔍 Vérification après importation');
    
    const userCollectionsAfterResponse = await makeRequest(userCollectionsOptions);
    const userCollectionsAfter = userCollectionsAfterResponse.data.data || [];
    
    console.log('Collections après importation:', userCollectionsAfter.length);
    console.log('Nouvelles collections:', userCollectionsAfter.length - userCollectionsBefore.length);

    // Afficher les collections importées
    const importedCollections = userCollectionsAfter.filter(collection => 
      collection.description && collection.description.includes('Importée de la classe')
    );

    console.log('\n📋 Collections importées identifiées:');
    importedCollections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (${collection._id})`);
      console.log(`      Cartes: ${collection.cardsCount || 0}`);
      console.log(`      Description: ${collection.description}`);
    });

    // 6. Vérifier les cartes de la collection importée (si nouvelle importation)
    if (importResponse.status === 201) {
      const importedCollectionId = importResponse.data.data.collection._id;
      
      console.log('\n6. 🃏 Vérification des cartes importées');
      
      const cardsOptions = {
        hostname: 'localhost',
        port: 5000,
        path: `/api/flashcards/collection/${importedCollectionId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };

      const cardsResponse = await makeRequest(cardsOptions);
      console.log('Statut cartes:', cardsResponse.status);
      
      if (cardsResponse.status === 200) {
        const cards = cardsResponse.data.data || [];
        console.log('✅ Cartes trouvées:', cards.length);
        
        if (cards.length > 0) {
          console.log('Exemples de cartes importées:');
          cards.slice(0, 3).forEach((card, index) => {
            console.log(`   ${index + 1}. Q: ${card.question}`);
            console.log(`      R: ${card.answer}`);
            console.log(`      Statut: ${card.status}`);
          });
        }
      }
    }

    // 7. Test de double importation (doit échouer)
    console.log('\n7. 🚫 Test double importation (doit échouer)');
    
    const doubleImportResponse = await makeRequest(importOptions, importData);
    console.log('Statut double importation:', doubleImportResponse.status);
    
    if (doubleImportResponse.status === 400) {
      console.log('✅ Double importation correctement bloquée');
      console.log('Message:', doubleImportResponse.data.message);
    } else {
      console.log('⚠️ Double importation pas bloquée (unexpected)');
    }

    console.log('\n🎉 Test d\'importation terminé avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   Collections partagées disponibles: ${sharedCollections.length}`);
    console.log(`   Collections utilisateur avant: ${userCollectionsBefore.length}`);
    console.log(`   Collections utilisateur après: ${userCollectionsAfter.length}`);
    console.log(`   Collections importées: ${importedCollections.length}`);

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testImportCollectionWorkflow();
