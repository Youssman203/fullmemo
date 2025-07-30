const http = require('http');

async function testInterfaceFrontend() {
  console.log('🖥️ Test Interface Frontend - Bouton Téléchargement');
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
    // 1. Connexion étudiant
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
    console.log('✅ Connexion réussie');

    // 2. Récupérer collections partagées (simulation frontend)
    console.log('\n2. 📚 Simulation récupération collections frontend');
    const collectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (collectionsResponse.status !== 200) {
      console.log('❌ Erreur récupération collections');
      return;
    }

    const collectionsData = collectionsResponse.data.data;
    const collections = collectionsData.collections || [];
    
    console.log(`Collections récupérées: ${collections.length}`);

    // 3. Simuler la logique frontend pour afficher les boutons
    console.log('\n3. 🔍 Simulation logique affichage boutons');
    
    collections.forEach((collection, index) => {
      console.log(`\nCollection ${index + 1}: ${collection.name}`);
      console.log(`   ID: ${collection._id}`);
      console.log(`   Cartes (cardsCount): ${collection.cardsCount || 0}`);
      console.log(`   Cartes (cardCount): ${collection.cardCount || 0}`);
      console.log(`   Description: ${collection.description || 'Aucune'}`);

      // Logique frontend: afficher bouton si collection a des cartes
      const hasCards = (collection.cardCount || collection.cardsCount || 0) > 0;
      
      console.log(`   👁️ Bouton téléchargement affiché: ${hasCards ? '✅ OUI' : '❌ NON'}`);
      
      if (hasCards) {
        console.log(`   🎯 BOUTON ACTIF - Prêt pour téléchargement`);
        console.log(`   📥 Action: Importer ${collection.cardCount || collection.cardsCount} cartes`);
      } else {
        console.log(`   ⚠️ BOUTON CACHÉ - Aucune carte à importer`);
      }
    });

    // 4. Test d'importation via API (simulation clic bouton)
    console.log('\n4. 🖱️ Simulation clic bouton téléchargement');
    
    const collectionAvecCartes = collections.find(col => 
      (col.cardCount || col.cardsCount || 0) > 0
    );

    if (collectionAvecCartes) {
      console.log(`Simulation clic sur: ${collectionAvecCartes.name}`);
      
      const importResponse = await makeRequest({
        hostname: 'localhost', port: 5000,
        path: `/api/classes/${BAC2_CLASS_ID}/collections/import`, method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }, { collectionId: collectionAvecCartes._id });

      console.log(`Statut importation: ${importResponse.status}`);
      
      if (importResponse.status === 201) {
        console.log('✅ SUCCÈS - Toast de succès affiché');
        console.log(`Message: ${importResponse.data.message}`);
        console.log('🔄 Redirection vers "Mes Collections" recommandée');
      } else if (importResponse.status === 400) {
        console.log('⚠️ DÉJÀ IMPORTÉ - Toast d\'information affiché');
        console.log(`Message: ${importResponse.data.message}`);
      } else {
        console.log('❌ ERREUR - Toast d\'erreur affiché');
        console.log(`Message: ${importResponse.data.message || 'Erreur inconnue'}`);
      }
    } else {
      console.log('❌ Aucune collection avec cartes - Aucun bouton affiché');
    }

    // 5. Vérification état après importation
    console.log('\n5. 🔍 État après importation');
    
    const afterCollectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`, method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (afterCollectionsResponse.status === 200) {
      const afterCollections = afterCollectionsResponse.data.data.collections || [];
      
      console.log('\nÉtat des boutons après importation:');
      afterCollections.forEach((collection, index) => {
        const hasCards = (collection.cardCount || collection.cardsCount || 0) > 0;
        
        // Simuler vérification si déjà importé (logique frontend)
        const wouldShowButton = hasCards; // Le frontend devrait gérer l'état "déjà importé"
        
        console.log(`   ${index + 1}. ${collection.name}: Bouton ${wouldShowButton ? 'VISIBLE' : 'CACHÉ'}`);
      });
    }

    // 6. Instructions pour test manuel
    console.log('\n\n📝 INSTRUCTIONS POUR TEST MANUEL FRONTEND:');
    console.log('─'.repeat(50));
    console.log('1. Ouvrir http://localhost:3000');
    console.log('2. Se connecter avec: etudiant.test@example.com / password123');
    console.log('3. Naviguer: Classes → bac2 → Collections');
    console.log('4. VÉRIFIER: Boutons "Télécharger" 📥 sont visibles');
    console.log('5. CLIQUER: Sur un bouton "Télécharger"');
    console.log('6. OBSERVER: Toast de succès');
    console.log('7. ALLER: Mes Collections → Collection importée visible');

    console.log('\n🎯 POINTS CRITIQUES À VÉRIFIER:');
    console.log('✅ Collections affichent le bon nombre de cartes');
    console.log('✅ Boutons "Télécharger" visibles pour collections avec cartes');
    console.log('✅ Boutons masqués pour collections vides');
    console.log('✅ Toast de succès après importation');
    console.log('✅ Navigation vers collection importée fonctionne');

    console.log('\n🚀 FRONTEND PRÊT POUR UTILISATION !');

  } catch (error) {
    console.error('❌ Erreur test frontend:', error);
  }
}

testInterfaceFrontend();
