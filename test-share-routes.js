const fetch = require('node-fetch');

async function testShareRoutes() {
  console.log('🧪 Test des routes de partage par code\n');
  
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
    
    const token = loginData.token;
    
    // Test 2: Récupération d'une collection
    console.log('2. Récupération des collections...');
    const collectionsResponse = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const collectionsData = await collectionsResponse.json();
    console.log(`✅ ${collectionsData.data.length} collections trouvées`);
    
    if (collectionsData.data.length === 0) {
      console.log('❌ Aucune collection disponible pour le test');
      return;
    }
    
    const testCollection = collectionsData.data[0];
    console.log(`📚 Collection de test: ${testCollection.name} (${testCollection._id})`);
    
    // Test 3: Génération d'un code de partage
    console.log('3. Test génération de code de partage...');
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
    
    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.log(`❌ Erreur génération: ${generateResponse.status} - ${errorText}`);
      return;
    }
    
    const shareData = await generateResponse.json();
    console.log('✅ Code de partage généré!');
    console.log(`🔑 Code: ${shareData.data.code}`);
    console.log(`⏰ Expire: ${shareData.data.expiresAt}`);
    console.log(`📝 Permissions: ${shareData.data.config?.permissions?.join(', ') || 'N/A'}`);
    
    // Test 4: Accès via le code
    console.log('4. Test accès via code...');
    const accessResponse = await fetch(`http://localhost:5000/api/share/code/${shareData.data.code}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!accessResponse.ok) {
      const errorText = await accessResponse.text();
      console.log(`❌ Erreur accès: ${accessResponse.status} - ${errorText}`);
      return;
    }
    
    const accessData = await accessResponse.json();
    console.log('✅ Accès via code réussi!');
    console.log(`📚 Collection: ${accessData.data.collection.name}`);
    console.log(`📄 Cartes: ${accessData.data.flashcards.length}`);
    
    console.log('\n🎉 TOUTES LES ROUTES FONCTIONNENT CORRECTEMENT!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Exécuter le test
testShareRoutes();
