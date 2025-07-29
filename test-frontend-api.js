// Script de test pour la console du navigateur
// Copier-coller dans la console du navigateur pour tester l'API frontend

async function testFrontendAPI() {
  console.log('🧪 Test de l\'API frontend');
  
  try {
    // Vérifier si on est connecté
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    console.log('Token présent:', !!token);
    console.log('Utilisateur:', user);
    
    if (!token) {
      console.error('❌ Aucun token trouvé. Connectez-vous d\'abord');
      return;
    }
    
    if (user.role !== 'teacher') {
      console.error('❌ Utilisateur n\'est pas enseignant');
      return;
    }
    
    // Test de l'API des classes
    console.log('\n1. Test récupération des classes...');
    const API_URL = 'http://localhost:5000/api';
    
    const classesResponse = await fetch(`${API_URL}/classes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!classesResponse.ok) {
      throw new Error(`Erreur HTTP ${classesResponse.status}`);
    }
    
    const classesData = await classesResponse.json();
    console.log('Classes récupérées:', classesData);
    
    if (!classesData.data || classesData.data.length === 0) {
      console.error('❌ Aucune classe trouvée');
      return;
    }
    
    // Test de l'API getClassById
    const testClassId = classesData.data[0]._id;
    console.log(`\n2. Test getClassById pour classe: ${testClassId}`);
    
    const classDetailResponse = await fetch(`${API_URL}/classes/${testClassId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', classDetailResponse.status);
    console.log('Response ok:', classDetailResponse.ok);
    
    if (!classDetailResponse.ok) {
      const errorText = await classDetailResponse.text();
      console.error('Erreur response:', errorText);
      throw new Error(`Erreur HTTP ${classDetailResponse.status}: ${errorText}`);
    }
    
    const classDetailData = await classDetailResponse.json();
    console.log('✅ Détails de classe récupérés:', classDetailData);
    
    // Test avec le service frontend
    console.log('\n3. Test avec le service classService...');
    
    // Vérifier si classService est disponible
    if (typeof window.classService !== 'undefined') {
      try {
        const serviceResult = await window.classService.getClassById(testClassId);
        console.log('✅ Service result:', serviceResult);
      } catch (serviceError) {
        console.error('❌ Erreur service:', serviceError);
      }
    } else {
      console.log('ℹ️ classService non disponible dans window (normal en production)');
    }
    
    console.log('\n🎉 Tests terminés');
    
  } catch (error) {
    console.error('❌ Erreur dans le test:', error);
  }
}

// Lancer le test
testFrontendAPI();
