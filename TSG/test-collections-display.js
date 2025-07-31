// test-collections-display.js
// Test simple pour vérifier l'affichage des collections dans une classe

const axios = require('axios');

// Configuration
const API_BASE = 'http://localhost:5000/api';

// Token étudiant (copier depuis le navigateur)
const STUDENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ODg1YjdmYjI4YzdmMDM5OGZmNGYwMCIsImlhdCI6MTczODI0MDYwMCwiZXhwIjoxNzQwODMyNjAwfQ.jApRCMxskpsRG6QAiN_IbNVVSTG4QAvfGZw5SyCQKQA';

// ID de la classe "m3" (copier depuis l'URL dans le navigateur)  
const CLASS_ID = '68885b7eb28c7f0398ff4f07';

async function testCollectionsAPI() {
  console.log('🧪 TEST API - Récupération collections classe');
  console.log('=' .repeat(50));
  
  try {
    console.log('📡 Appel API...');
    console.log(`URL: ${API_BASE}/classes/${CLASS_ID}/collections`);
    console.log(`Token: ${STUDENT_TOKEN.substring(0, 20)}...`);
    
    const response = await axios.get(`${API_BASE}/classes/${CLASS_ID}/collections`, {
      headers: {
        'Authorization': `Bearer ${STUDENT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n✅ RÉPONSE API REÇUE:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    const { success, data, message } = response.data;
    
    if (success && data) {
      console.log('\n📊 RÉSUMÉ:');
      console.log(`Classe: ${data.class.name}`);
      console.log(`Collections: ${data.collections.length}`);
      
      if (data.collections.length > 0) {
        console.log('\n📚 COLLECTIONS TROUVÉES:');
        data.collections.forEach((collection, index) => {
          console.log(`${index + 1}. ${collection.name}`);
          console.log(`   - Cartes: ${collection.cardCount || 0}`);
          console.log(`   - Créée par: ${collection.createdBy?.name || 'Inconnu'}`);
          console.log(`   - Créée le: ${new Date(collection.createdAt).toLocaleDateString()}`);
        });
        
        console.log('\n🎉 SUCCESS: Collections récupérées avec succès !');
        console.log('✅ L\'API fonctionne correctement');
        console.log('✅ Le frontend devrait maintenant afficher les collections');
        
      } else {
        console.log('\n⚠️ Aucune collection dans cette classe');
        console.log('Pour tester:');
        console.log('1. Connectez-vous en tant qu\'enseignant');
        console.log('2. Partagez une collection avec cette classe');
        console.log('3. Relancez ce test');
      }
      
    } else {
      console.log('❌ Réponse API inattendue:', response.data);
    }
    
  } catch (error) {
    console.log('\n❌ ERREUR API:');
    
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data?.message || error.response.statusText);
      console.log('Data:', error.response.data);
      
      if (error.response.status === 401) {
        console.log('\n🔧 SOLUTION: Token expiré');
        console.log('1. Ouvrir les DevTools (F12) dans le navigateur');
        console.log('2. Aller dans Application > Local Storage');
        console.log('3. Copier la valeur du token');
        console.log('4. Remplacer STUDENT_TOKEN dans ce script');
      }
      
      if (error.response.status === 403) {
        console.log('\n🔧 SOLUTION: Accès refusé');
        console.log('1. Vérifier que l\'utilisateur est bien étudiant de cette classe');
        console.log('2. Vérifier l\'ID de la classe');
      }
      
    } else {
      console.log('Erreur réseau:', error.message);
      console.log('\n🔧 SOLUTION: Vérifier que le backend tourne sur localhost:5000');
    }
  }
}

// Executer le test
console.log('🚀 Lancement du test...\n');
testCollectionsAPI();
