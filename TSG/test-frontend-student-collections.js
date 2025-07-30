// Script à exécuter dans la console du navigateur côté étudiant
// Pour diagnostiquer l'erreur de récupération des collections

console.log('🔍 Debug des collections côté frontend étudiant');
console.log('=' .repeat(50));

// Fonction pour tester l'API directement
async function testStudentCollectionsAPI() {
  try {
    // 1. Vérifier le token d'authentification
    const token = localStorage.getItem('token');
    console.log('Token présent:', !!token);
    
    if (!token) {
      console.log('❌ Pas de token d\'authentification');
      return;
    }
    
    // 2. Récupérer les classes de l'étudiant
    console.log('\n1. 📚 Récupération des classes étudiant');
    const classesResponse = await fetch('/api/classes/student', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Statut classes:', classesResponse.status);
    
    if (!classesResponse.ok) {
      const errorText = await classesResponse.text();
      console.log('❌ Erreur classes:', errorText);
      return;
    }
    
    const classesData = await classesResponse.json();
    console.log('✅ Classes récupérées:', classesData);
    
    const classes = classesData.data || [];
    if (classes.length === 0) {
      console.log('⚠️ Aucune classe trouvée');
      return;
    }
    
    // 3. Tester récupération collections pour chaque classe
    console.log('\n2. 🔍 Test récupération collections');
    
    for (const classe of classes) {
      console.log(`\nClasse: ${classe.name} (${classe._id})`);
      
      try {
        const collectionsResponse = await fetch(`/api/classes/${classe._id}/collections`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`Statut collections: ${collectionsResponse.status}`);
        
        if (!collectionsResponse.ok) {
          const errorText = await collectionsResponse.text();
          console.log('❌ Erreur collections:', errorText);
          continue;
        }
        
        const collectionsData = await collectionsResponse.json();
        console.log('✅ Collections récupérées:', collectionsData);
        console.log('Structure:', Object.keys(collectionsData));
        console.log('Nombre de collections:', collectionsData.data?.collections?.length || 0);
        
      } catch (error) {
        console.log('❌ Erreur catch:', error);
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur générale:', error);
  }
}

// 4. Tester l'état React actuel (si dans une page avec useData)
function testReactState() {
  console.log('\n3. 🎯 Test état React (si disponible)');
  
  try {
    // Essayer d'accéder au contexte via les DevTools React
    if (window.React && window.React.version) {
      console.log('React version:', window.React.version);
    }
    
    // Vérifier les erreurs dans la console
    console.log('Vérifiez la console pour d\'autres erreurs...');
    
  } catch (error) {
    console.log('Info React non disponible');
  }
}

// 5. Fonction pour tester un classId spécifique
async function testSpecificClass(classId) {
  console.log(`\n4. 🎯 Test classe spécifique: ${classId}`);
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ Pas de token');
    return;
  }
  
  try {
    const response = await fetch(`/api/classes/${classId}/collections`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Statut:', response.status);
    console.log('Headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Réponse brute:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('JSON parsé:', json);
    } catch (e) {
      console.log('Impossible de parser en JSON');
    }
    
  } catch (error) {
    console.log('❌ Erreur:', error);
  }
}

// Lancer les tests
console.log('Lancement des tests...');
testStudentCollectionsAPI();
testReactState();

// Exposer les fonctions pour utilisation manuelle
window.testStudentCollectionsAPI = testStudentCollectionsAPI;
window.testSpecificClass = testSpecificClass;

console.log('\n💡 Fonctions disponibles:');
console.log('- testStudentCollectionsAPI() : Test complet');
console.log('- testSpecificClass(classId) : Test classe spécifique');
