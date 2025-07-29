const http = require('http');

async function cleanupCollections() {
  console.log('🧹 Nettoyage des collections importées');
  console.log('=' .repeat(50));

  const STUDENT_EMAIL = 'etudiant.test@example.com';
  const STUDENT_PASSWORD = 'password123';

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
    console.log('✅ Connexion réussie');

    // 2. Récupérer toutes les collections
    console.log('\n2. 📚 Récupération des collections');
    const collectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const collections = collectionsResponse.data.data || [];
    console.log(`Collections trouvées: ${collections.length}`);

    // 3. Identifier les collections importées
    const importedCollections = collections.filter(col => 
      col.description && col.description.includes('Importée de la classe')
    );

    console.log(`Collections importées à supprimer: ${importedCollections.length}`);

    // 4. Supprimer les collections importées
    if (importedCollections.length > 0) {
      console.log('\n3. 🗑️ Suppression des collections importées');
      
      for (const collection of importedCollections) {
        console.log(`   Suppression: ${collection.name} (${collection._id})`);
        
        const deleteResponse = await makeRequest({
          hostname: 'localhost', port: 5000, 
          path: `/api/collections/${collection._id}`, method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (deleteResponse.status === 200) {
          console.log(`   ✅ Supprimée: ${collection.name}`);
        } else {
          console.log(`   ❌ Erreur suppression: ${collection.name}`);
          console.log(`   Statut: ${deleteResponse.status}`);
        }
      }
    }

    // 5. Vérification finale
    console.log('\n4. ✅ Vérification finale');
    const finalResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const finalCollections = finalResponse.data.data || [];
    const remainingImported = finalCollections.filter(col => 
      col.description && col.description.includes('Importée de la classe')
    );

    console.log(`Collections restantes: ${finalCollections.length}`);
    console.log(`Collections importées restantes: ${remainingImported.length}`);

    if (remainingImported.length === 0) {
      console.log('🎉 Nettoyage terminé avec succès !');
    } else {
      console.log('⚠️ Certaines collections n\'ont pas pu être supprimées');
    }

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
}

cleanupCollections();
