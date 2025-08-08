/**
 * Test simple et direct de l'API d'évaluation
 */

const axios = require('axios');

async function testEvaluation() {
  console.log('\n🧪 Test Simple API Évaluation\n');
  
  try {
    // 1. Connexion
    console.log('1. Connexion enseignant...');
    const loginRes = await axios.post('http://localhost:5000/api/users/login', {
      email: 'prof.martin@example.com',
      password: 'password123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Token obtenu:', token.substring(0, 30) + '...');
    
    // 2. Récupération données évaluation
    console.log('\n2. Récupération données évaluation...');
    const evalRes = await axios.get('http://localhost:5000/api/evaluation/students', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Réponse reçue:');
    console.log('   Success:', evalRes.data.success);
    console.log('   Nombre apprenants:', evalRes.data.count);
    
    if (evalRes.data.data && evalRes.data.data.length > 0) {
      console.log('\n📊 Données apprenants:');
      evalRes.data.data.forEach((item, i) => {
        console.log(`\n   Apprenant ${i + 1}:`);
        if (item.student) {
          console.log(`   - Nom: ${item.student.name || 'N/A'}`);
          console.log(`   - Email: ${item.student.email || 'N/A'}`);
        }
        console.log(`   - Sessions: ${item.totalSessions || 0}`);
        console.log(`   - Score moyen: ${item.averageScore ? item.averageScore + '%' : 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  Aucune donnée d\'apprenant trouvée');
      console.log('   Cela peut être normal si aucun apprenant n\'a fait de session');
    }
    
    console.log('\n✅ Test terminé avec succès!');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

testEvaluation();
