// Script de test pour vérifier l'API getClassById depuis le navigateur
// À exécuter dans la console du navigateur sur http://localhost:3000

async function testFrontendClassDetails() {
  console.log('🧪 Test des détails de classe côté frontend');
  console.log('=' .repeat(50));

  try {
    // 1. Récupérer le token depuis localStorage
    console.log('\n1. 🔑 Vérification du token');
    const token = localStorage.getItem('token');
    console.log('Token trouvé:', token ? 'OUI' : 'NON');
    
    if (!token) {
      console.log('❌ Aucun token trouvé - veuillez vous connecter d\'abord');
      return;
    }

    // 2. Récupérer les classes de l'enseignant
    console.log('\n2. 📚 Récupération des classes enseignant');
    const classesResponse = await fetch('/api/classes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const classesData = await classesResponse.json();
    console.log('Statut:', classesResponse.status);
    console.log('Réponse:', classesData);

    if (!classesResponse.ok || !classesData.data?.length) {
      console.log('❌ Aucune classe trouvée');
      return;
    }

    const classe = classesData.data[0];
    console.log('✅ Classe trouvée:', classe.name);
    console.log('ID de la classe:', classe._id);

    // 3. Tester l'API getClassById
    console.log('\n3. 🔍 Test getClassById');
    const classDetailResponse = await fetch(`/api/classes/${classe._id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const classDetailData = await classDetailResponse.json();
    console.log('Statut:', classDetailResponse.status);
    console.log('Réponse complète:', classDetailData);

    if (classDetailResponse.ok) {
      console.log('✅ Détails de classe récupérés avec succès !');
      console.log('Nom:', classDetailData.data?.name);
      console.log('Enseignant:', classDetailData.data?.teacher?.name);
      console.log('Nombre d\'étudiants:', classDetailData.data?.students?.length);
      console.log('Nombre de collections:', classDetailData.data?.collections?.length);
    } else {
      console.log('❌ Échec de la récupération des détails');
    }

    // 4. Tester avec le service classService
    console.log('\n4. 🔧 Test avec classService');
    
    // Vérifier si classService est disponible
    if (typeof window !== 'undefined' && window.classService) {
      try {
        const serviceResult = await window.classService.getClassById(classe._id);
        console.log('✅ ClassService.getClassById réussi:', serviceResult);
      } catch (error) {
        console.log('❌ ClassService.getClassById échoué:', error.message);
      }
    } else {
      console.log('⚠️ ClassService non disponible dans window');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }
}

// Instructions d'utilisation
console.log(`
🎯 INSTRUCTIONS:
1. Ouvrez votre navigateur sur http://localhost:3000
2. Connectez-vous en tant qu'enseignant (prof.martin@example.com / password123)
3. Ouvrez la console développeur (F12)
4. Collez ce script dans la console et appuyez sur Entrée
5. Exécutez: testFrontendClassDetails()
`);

// Lancer automatiquement le test si dans un navigateur
if (typeof window !== 'undefined') {
  testFrontendClassDetails();
}
