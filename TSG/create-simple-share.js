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

async function createSimpleShare() {
  console.log('🎯 CRÉATION CODE PARTAGE SIMPLE');
  
  try {
    // Login enseignant
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
      console.log('❌ Login échoué');
      return;
    }

    console.log('✅ Enseignant connecté');
    const token = login.data.token;

    // Créer collection simple
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
      name: 'Test Simple',
      description: 'Test'
    });

    if (collection.status !== 201) {
      console.log('❌ Création collection échouée:', collection.status);
      console.log('Réponse:', collection.data);
      return;
    }

    const collectionId = collection.data._id;
    console.log('✅ Collection créée:', collectionId);

    // Générer code
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

    if (shareCode.status === 201) {
      const code = shareCode.data.data.code;
      console.log('✅ NOUVEAU CODE GÉNÉRÉ:', code);
      console.log('');
      console.log('🧪 TESTEZ MAINTENANT AVEC CE CODE:');
      console.log(`
// Nouveau test avec code frais
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/share/code/${code}/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${token}\`
  }
})
.then(response => {
  console.log('🎯 Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('📊 Résultat:', data);
  if (data.success) {
    console.log('✅ IMPORT RÉUSSI !');
  }
})
.catch(err => console.log('❌ Erreur:', err));
      `);
    } else {
      console.log('❌ Génération code échouée:', shareCode.status);
    }

  } catch (error) {
    console.log('❌ Erreur:', error.message);
  }
}

createSimpleShare();
