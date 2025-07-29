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

async function testShareCollection() {
  console.log('🧪 Test du partage de collection enseignant → classe');
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
    console.log('Statut:', loginResponse.status);
    
    if (loginResponse.status !== 200) {
      console.log('❌ Échec de la connexion');
      console.log('Réponse:', loginResponse.data);
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ Connexion réussie');
    console.log('Token reçu:', token ? 'OUI' : 'NON');

    // 2. Récupérer les classes de l'enseignant
    console.log('\n2. 📚 Récupération des classes');
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
    
    if (classesResponse.status !== 200 || !classesResponse.data.data?.length) {
      console.log('❌ Aucune classe trouvée');
      console.log('Réponse:', classesResponse.data);
      return;
    }

    const classe = classesResponse.data.data[0];
    console.log('✅ Classe trouvée:', classe.name);
    console.log('ID de la classe:', classe._id);

    // 3. Récupérer les collections de l'enseignant
    console.log('\n3. 📖 Récupération des collections');
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
      console.log('❌ Erreur lors de la récupération des collections');
      console.log('Réponse:', collectionsResponse.data);
      return;
    }

    // Vérifier s'il y a des collections (dans data ou directement)
    const collections = collectionsResponse.data.data || collectionsResponse.data;
    if (!collections || !Array.isArray(collections) || collections.length === 0) {
      console.log('❌ Aucune collection trouvée');
      console.log('Réponse complète:', collectionsResponse.data);
      return;
    }

    const collection = collections[0];
    console.log('✅ Collection trouvée:', collection.name);
    console.log('ID de la collection:', collection._id);
    console.log('Propriétaire de la collection:', collection.user);

    // 4. Partager la collection avec la classe
    console.log('\n4. 🔄 Partage de la collection avec la classe');
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
      collectionId: collection._id
    };

    console.log('Données envoyées:', shareData);
    console.log('URL:', `http://localhost:5000${shareOptions.path}`);

    const shareResponse = await makeRequest(shareOptions, shareData);
    console.log('Statut:', shareResponse.status);
    console.log('Réponse complète:', JSON.stringify(shareResponse.data, null, 2));

    if (shareResponse.status === 200) {
      console.log('✅ Collection partagée avec succès !');
    } else {
      console.log('❌ Échec du partage');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Lancer le test
testShareCollection();
