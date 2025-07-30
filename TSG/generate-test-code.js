/**
 * 🎯 GÉNÉRATEUR DE CODE DE PARTAGE POUR TEST
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
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

async function generateTestCode() {
  console.log('🎯 GÉNÉRATION CODE DE PARTAGE POUR TEST FRONTEND');
  console.log('================================================\n');

  try {
    // 1. Login enseignant
    console.log('1. Connexion enseignant...');
    const login = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/users/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'prof.martin@example.com',
      password: 'password123'
    });

    if (login.status !== 200) {
      console.log('❌ Échec login:', login.status);
      return;
    }

    const token = login.data.token;
    console.log('✅ Enseignant connecté');

    // 2. Créer collection avec cartes
    console.log('\n2. Création collection avec cartes...');
    const collection = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/collections',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      name: 'Collection Test Frontend',
      description: 'Collection pour tester l\'import frontend',
      category: 'education',
      isPublic: false
    });

    if (collection.status !== 201) {
      console.log('❌ Échec création collection:', collection.status);
      return;
    }

    const collectionId = collection.data._id;
    console.log('✅ Collection créée:', collectionId);

    // 3. Ajouter quelques cartes
    console.log('\n3. Ajout de cartes...');
    const cards = [
      { front: 'Qu\'est-ce que JavaScript ?', back: 'Un langage de programmation' },
      { front: 'Qu\'est-ce que React ?', back: 'Une bibliothèque JavaScript pour l\'UI' },
      { front: 'Qu\'est-ce que Node.js ?', back: 'Un runtime JavaScript côté serveur' }
    ];

    for (let i = 0; i < cards.length; i++) {
      const card = await makeRequest({
        hostname: 'localhost',
        port: 5000,
        path: '/api/flashcards',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        ...cards[i],
        collection: collectionId
      });

      if (card.status === 201) {
        console.log(`   ✅ Carte ${i + 1} ajoutée`);
      }
    }

    // 4. Générer code de partage
    console.log('\n4. Génération code de partage...');
    const shareCode = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/share/collections/${collectionId}/generate`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (shareCode.status !== 201) {
      console.log('❌ Échec génération code:', shareCode.status);
      return;
    }

    const code = shareCode.data.data.code;
    
    console.log('\n🎯 CODE DE PARTAGE GÉNÉRÉ:');
    console.log('==========================');
    console.log('📋 Code:', code);
    console.log('📚 Collection:', collection.data.name);
    console.log('🔢 Nombre de cartes:', cards.length);
    console.log('👨‍🏫 Créé par:', login.data.user.name);
    
    console.log('\n📖 INSTRUCTIONS POUR TEST FRONTEND:');
    console.log('====================================');
    console.log('1. Ouvrir l\'application frontend (http://localhost:3000)');
    console.log('2. Se connecter avec un compte étudiant');
    console.log('3. Ouvrir la console navigateur (F12)');
    console.log('4. Copier-coller le contenu de diagnostic-frontend-auth.js');
    console.log('5. Exécuter: diagFrontend.runFullDiagnostic("' + code + '")');
    console.log('6. Ou tester manuellement l\'import avec le code:', code);
    
    console.log('\n🔧 COMMANDES UTILES:');
    console.log('   diagFrontend.testImportWithCode("' + code + '")');
    console.log('   diagFrontend.checkAuthState()');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

generateTestCode().catch(console.error);
