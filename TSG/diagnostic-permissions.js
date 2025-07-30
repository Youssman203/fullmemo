const fetch = require('node-fetch');

async function diagnosticPermissions() {
  console.log('🔍 Diagnostic des permissions de collection\n');
  
  try {
    // Test 1: Connexion enseignant
    console.log('1. Connexion enseignant...');
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prof.martin@example.com',
        password: 'password123'
      })
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Erreur connexion: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Enseignant connecté');
    console.log('📊 Structure de réponse:', JSON.stringify(loginData, null, 2));
    
    // Vérifier différentes structures possibles
    const userId = loginData.data?._id || loginData.user?._id || loginData._id;
    const userEmail = loginData.data?.email || loginData.user?.email || loginData.email;
    
    console.log(`👤 ID Utilisateur: ${userId}`);
    console.log(`📧 Email: ${userEmail}`);
    
    const token = loginData.token;
    
    // Test 2: Récupération des collections avec détails proprietaire
    console.log('\n2. Récupération des collections...');
    const collectionsResponse = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const collectionsData = await collectionsResponse.json();
    console.log(`✅ ${collectionsData.data.length} collections trouvées\n`);
    
    // Analyser chaque collection
    collectionsData.data.forEach((collection, index) => {
      console.log(`📚 Collection ${index + 1}:`);
      console.log(`   - ID: ${collection._id}`);
      console.log(`   - Nom: ${collection.name}`);
      console.log(`   - Propriétaire: ${collection.user}`);
      console.log(`   - Match utilisateur: ${collection.user === userId ? '✅ OUI' : '❌ NON'}`);
      console.log('');
    });
    
    // Test 3: Essayer de générer un code pour la première collection
    if (collectionsData.data.length > 0) {
      const testCollection = collectionsData.data[0];
      console.log(`3. Test génération code pour: ${testCollection.name}`);
      console.log(`   Collection ID: ${testCollection._id}`);
      console.log(`   Utilisateur connecté: ${userId}`);
      console.log(`   Propriétaire collection: ${testCollection.user}`);
      console.log(`   Match: ${testCollection.user === userId ? 'OUI' : 'NON'}`);
      
      const generateResponse = await fetch(`http://localhost:5000/api/share/collections/${testCollection._id}/generate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expiresInHours: 24,
          permissions: ['view', 'copy']
        })
      });
      
      if (generateResponse.ok) {
        const shareData = await generateResponse.json();
        console.log('✅ Code généré avec succès!');
        console.log(`🔑 Code: ${shareData.data.code}`);
      } else {
        const errorText = await generateResponse.text();
        console.log('❌ Erreur génération:');
        console.log(`   Status: ${generateResponse.status}`);
        console.log(`   Réponse: ${errorText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le diagnostic
diagnosticPermissions();
