// Test direct du service sharedLinkService depuis la console navigateur
// À exécuter dans la console sur http://localhost:3000

const testSharedLinkFrontend = async () => {
  console.log('🔍 TEST FRONTEND - Service sharedLinkService');
  console.log('===============================================');
  
  const token = '780dcc7b6711b317db1f95b6d6cadf075817e4f846c982bb313b16287ef6cc2b';
  
  try {
    // Test direct fetch comme fait par sharedLinkService
    console.log('\n📡 Test 1: Fetch direct API');
    const API_BASE = 'http://localhost:5000/api';
    const url = `${API_BASE}/shared/${token}`;
    
    console.log('URL appelée:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('Status:', response.status);
    console.log('OK:', response.ok);
    
    const data = await response.json();
    console.log('Réponse:', data);
    
    if (data.success) {
      console.log('✅ SUCCÈS: Collection trouvée');
      console.log('   - Nom:', data.data.collection.name);
      console.log('   - Cartes:', data.data.flashcards.length);
    } else {
      console.log('❌ ÉCHEC: Réponse non-successful');
    }
    
  } catch (error) {
    console.error('❌ ERREUR:', error);
  }
  
  try {
    // Test via le service sharedLinkService si disponible
    console.log('\n🔧 Test 2: Via sharedLinkService');
    
    if (window.sharedLinkService) {
      const result = await window.sharedLinkService.getSharedCollection(token);
      console.log('✅ Service disponible, résultat:', result);
    } else {
      console.log('⚠️ Service sharedLinkService non disponible sur window');
      
      // Import dynamique si module
      try {
        const module = await import('/src/services/sharedLinkService.js');
        const service = module.default;
        const result = await service.getSharedCollection(token);
        console.log('✅ Import module réussi, résultat:', result);
      } catch (importError) {
        console.log('❌ Import module échoué:', importError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ ERREUR service:', error);
  }
  
  console.log('\n🏁 Test terminé');
};

// Auto-exécution si dans navigateur
if (typeof window !== 'undefined') {
  console.log('Script chargé. Exécutez: testSharedLinkFrontend()');
  window.testSharedLinkFrontend = testSharedLinkFrontend;
} else {
  // Exécution en Node.js
  testSharedLinkFrontend();
}
