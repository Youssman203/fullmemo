const http = require('http');

async function diagnosticTest() {
  console.log('🔬 Test de diagnostic détaillé - Importation');
  console.log('=' .repeat(60));

  const STUDENT_EMAIL = 'etudiant.test@example.com';
  const STUDENT_PASSWORD = 'password123';
  const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

  function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = JSON.parse(body);
            resolve({ status: res.statusCode, data: jsonBody });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  try {
    // 1. Connexion
    console.log('\n1. 🔑 Connexion étudiant');
    const loginResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/users/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: STUDENT_EMAIL, password: STUDENT_PASSWORD });

    if (loginResponse.status !== 200) {
      console.log('❌ Connexion échouée');
      return;
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data._id;
    console.log('✅ Connexion réussie');
    console.log(`   User ID: ${userId}`);

    // 2. Vérifier les collections existantes AVANT importation
    console.log('\n2. 📚 Collections existantes AVANT importation');
    const beforeResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Statut collections avant:', beforeResponse.status);
    const collectionsBefore = beforeResponse.data.data || [];
    console.log(`Collections avant: ${collectionsBefore.length}`);

    if (collectionsBefore.length > 0) {
      console.log('Collections existantes:');
      collectionsBefore.forEach((col, i) => {
        console.log(`   ${i+1}. ${col.name} (${col._id}) - ${col.cardsCount || 0} cartes`);
        console.log(`      Description: ${col.description}`);
        console.log(`      Utilisateur: ${col.user}`);
      });
    }

    // 3. Récupérer collections partagées
    console.log('\n3. 📖 Collections partagées disponibles');
    const sharedResponse = await makeRequest({
      hostname: 'localhost', port: 5000, 
      path: `/api/classes/${BAC2_CLASS_ID}/collections`, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const sharedCollections = sharedResponse.data.data.collections;
    console.log(`Collections partagées: ${sharedCollections.length}`);
    
    if (sharedCollections.length === 0) {
      console.log('⚠️ Aucune collection partagée disponible');
      return;
    }

    // Sélectionner une collection avec des cartes
    let targetCollection = sharedCollections.find(col => col.cardCount > 0);
    if (!targetCollection) {
      targetCollection = sharedCollections[0];
    }

    console.log(`🎯 Collection sélectionnée: ${targetCollection.name}`);
    console.log(`   ID: ${targetCollection._id}`);
    console.log(`   Cartes: ${targetCollection.cardCount || 0}`);

    // 4. Vérifier les cartes de la collection source
    console.log('\n4. 🃏 Cartes de la collection source');
    const sourceCardsResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/flashcards/collection/${targetCollection._id}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Statut cartes source:', sourceCardsResponse.status);
    const sourceCards = sourceCardsResponse.data.data || [];
    console.log(`Cartes dans collection source: ${sourceCards.length}`);

    if (sourceCards.length > 0) {
      console.log('Exemples de cartes source:');
      sourceCards.slice(0, 2).forEach((card, i) => {
        console.log(`   ${i+1}. Q: ${card.question.substring(0, 50)}...`);
        console.log(`      R: ${card.answer.substring(0, 50)}...`);
        console.log(`      Collection: ${card.collection}`);
        console.log(`      User: ${card.user}`);
      });
    }

    // 5. Importation
    console.log('\n5. 📥 Importation de la collection');
    const importResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections/import`, method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }, { collectionId: targetCollection._id });

    console.log('Statut importation:', importResponse.status);
    console.log('Réponse importation:', JSON.stringify(importResponse.data, null, 2));

    if (importResponse.status !== 201) {
      console.log('❌ Importation échouée');
      if (importResponse.status === 400 && importResponse.data.message?.includes('déjà importé')) {
        console.log('⚠️ Collection déjà importée - continuons le diagnostic');
      } else {
        return;
      }
    }

    // 6. Vérifier les collections APRÈS importation
    console.log('\n6. 📚 Collections APRÈS importation');
    const afterResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log('Statut collections après:', afterResponse.status);
    const collectionsAfter = afterResponse.data.data || [];
    console.log(`Collections après: ${collectionsAfter.length}`);

    if (collectionsAfter.length > 0) {
      console.log('Collections après importation:');
      collectionsAfter.forEach((col, i) => {
        console.log(`   ${i+1}. ${col.name} (${col._id}) - ${col.cardsCount || 0} cartes`);
        console.log(`      Description: ${col.description}`);
        console.log(`      Utilisateur: ${col.user}`);
        console.log(`      Tags: ${JSON.stringify(col.tags)}`);
      });
    }

    // 7. Vérifier avec une requête directe MongoDB-style
    console.log('\n7. 🔍 Diagnostic approfondi - Recherche toutes collections utilisateur');
    
    // Recherche avec différents paramètres
    const searchQueries = [
      '/api/collections',
      '/api/collections?user=' + userId,
      '/api/collections?importé=true'
    ];

    for (const query of searchQueries) {
      console.log(`\n   Test requête: ${query}`);
      try {
        const searchResponse = await makeRequest({
          hostname: 'localhost', port: 5000, path: query, method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log(`   Statut: ${searchResponse.status}`);
        if (searchResponse.status === 200) {
          const results = searchResponse.data.data || [];
          console.log(`   Résultats: ${results.length} collections`);
          
          const importedResults = results.filter(col => 
            col.description && col.description.includes('Importée')
          );
          console.log(`   Collections importées: ${importedResults.length}`);
        }
      } catch (error) {
        console.log(`   Erreur: ${error.message}`);
      }
    }

    // 8. Si importation réussie, vérifier les cartes importées
    if (importResponse.status === 201) {
      const importedCollectionId = importResponse.data.data.collection._id;
      
      console.log('\n8. 🃏 Vérification cartes de la collection importée');
      console.log(`   ID collection importée: ${importedCollectionId}`);
      
      const importedCardsResponse = await makeRequest({
        hostname: 'localhost', port: 5000,
        path: `/api/flashcards/collection/${importedCollectionId}`, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log('Statut cartes importées:', importedCardsResponse.status);
      
      if (importedCardsResponse.status === 200) {
        const importedCards = importedCardsResponse.data.data || [];
        console.log(`Cartes importées trouvées: ${importedCards.length}`);
        
        if (importedCards.length > 0) {
          console.log('Exemples de cartes importées:');
          importedCards.slice(0, 2).forEach((card, i) => {
            console.log(`   ${i+1}. Q: ${card.question.substring(0, 50)}...`);
            console.log(`      R: ${card.answer.substring(0, 50)}...`);
            console.log(`      Collection: ${card.collection}`);
            console.log(`      User: ${card.user}`);
            console.log(`      Status: ${card.status}`);
            console.log(`      Tags: ${JSON.stringify(card.tags)}`);
          });
        }
      } else {
        console.log('❌ Erreur récupération cartes importées');
        console.log('Réponse:', importedCardsResponse.data);
      }
    }

    console.log('\n🎯 RÉSUMÉ DU DIAGNOSTIC:');
    console.log(`   Collections avant: ${collectionsBefore.length}`);
    console.log(`   Collections après: ${collectionsAfter.length}`);
    console.log(`   Cartes source: ${sourceCards.length}`);
    console.log(`   Statut importation: ${importResponse.status}`);

  } catch (error) {
    console.error('❌ Erreur diagnostic:', error);
  }
}

diagnosticTest();
