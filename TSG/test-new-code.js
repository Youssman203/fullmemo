const fetch = require('node-fetch');

async function testNewCodeGeneration() {
  console.log('🆕 Test génération nouveau code après correction\n');
  
  try {
    // Connexion
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prof.martin@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const userId = loginData._id;
    
    console.log('✅ Connecté:', loginData.email);
    console.log('🆔 ID Utilisateur:', userId);
    
    // Récupération collections
    const collectionsResponse = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const collectionsData = await collectionsResponse.json();
    const testCollection = collectionsData.data[0];
    
    console.log(`📚 Collection de test: ${testCollection.name}`);
    console.log(`🔗 ID Collection: ${testCollection._id}`);
    console.log(`👤 Propriétaire: ${testCollection.user}`);
    console.log(`✅ Match propriétaire: ${testCollection.user === userId}`);
    
    // Génération nouveau code (avec logs détaillés)
    console.log('\n🔢 Génération nouveau code...');
    const generateResponse = await fetch(`http://localhost:5000/api/share/collections/${testCollection._id}/generate`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expiresInHours: 48,
        permissions: ['view', 'copy', 'download']
      })
    });
    
    console.log('📊 Status:', generateResponse.status);
    
    if (generateResponse.ok) {
      const shareData = await generateResponse.json();
      console.log('✅ SUCCÈS! Code généré:', shareData.data.code);
      console.log('⏰ Expire:', shareData.data.expiresAt);
      console.log('🔒 Permissions:', shareData.data.permissions || 'N/A');
      
      // Test accès immédiat
      console.log('\n🔍 Test accès immédiat...');
      const accessResponse = await fetch(`http://localhost:5000/api/share/code/${shareData.data.code}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (accessResponse.ok) {
        const accessData = await accessResponse.json();
        console.log('✅ Accès confirmé!');
        console.log(`📚 Collection accessible: ${accessData.data.collection.name}`);
        console.log(`📄 Cartes: ${accessData.data.flashcards.length}`);
      } else {
        console.log('❌ Erreur accès:', await accessResponse.text());
      }
      
    } else {
      const errorText = await generateResponse.text();
      console.log('❌ ERREUR:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testNewCodeGeneration();
