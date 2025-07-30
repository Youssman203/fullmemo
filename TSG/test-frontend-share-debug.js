// Script de débogage pour tester le partage de collection côté frontend
// À coller dans la console du navigateur sur http://localhost:3000

async function debugFrontendShare() {
  console.log('🔍 DEBUG - Test du partage de collection côté frontend');
  console.log('=' .repeat(60));

  try {
    // 1. Vérifier le token
    console.log('\n1. 🔑 Vérification du token');
    const token = localStorage.getItem('token');
    console.log('Token présent:', token ? 'OUI' : 'NON');
    console.log('Token value:', token);
    
    if (!token) {
      console.log('❌ Pas de token - connectez-vous d\'abord');
      return;
    }

    // 2. Récupérer les classes
    console.log('\n2. 📚 Récupération des classes');
    const classesResponse = await fetch('/api/classes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!classesResponse.ok) {
      const error = await classesResponse.text();
      console.log('❌ Erreur classes:', error);
      return;
    }

    const classesData = await classesResponse.json();
    console.log('Classes trouvées:', classesData.data?.length || 0);
    
    if (!classesData.data?.length) {
      console.log('❌ Aucune classe trouvée');
      return;
    }

    const classe = classesData.data[0];
    console.log('✅ Classe sélectionnée:', classe.name, '(ID:', classe._id, ')');

    // 3. Récupérer les collections
    console.log('\n3. 📖 Récupération des collections');
    const collectionsResponse = await fetch('/api/collections', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!collectionsResponse.ok) {
      const error = await collectionsResponse.text();
      console.log('❌ Erreur collections:', error);
      return;
    }

    const collectionsData = await collectionsResponse.json();
    const collections = collectionsData.data || collectionsData;
    console.log('Collections trouvées:', collections.length);
    
    if (!collections.length) {
      console.log('❌ Aucune collection trouvée');
      return;
    }

    const collection = collections[0];
    console.log('✅ Collection sélectionnée:', collection.name, '(ID:', collection._id, ')');

    // 4. Test du partage avec logs détaillés
    console.log('\n4. 🔄 Test du partage de collection');
    console.log('URL:', `/api/classes/${classe._id}/collections`);
    console.log('Données à envoyer:', { collectionId: collection._id });

    const shareResponse = await fetch(`/api/classes/${classe._id}/collections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collectionId: collection._id
      })
    });

    console.log('Statut réponse:', shareResponse.status);
    console.log('Headers réponse:', Object.fromEntries(shareResponse.headers.entries()));

    const shareText = await shareResponse.text();
    console.log('Réponse brute:', shareText);

    try {
      const shareData = JSON.parse(shareText);
      console.log('Réponse JSON:', shareData);
      
      if (shareResponse.ok) {
        console.log('✅ Partage réussi !');
        console.log('Message:', shareData.message);
      } else {
        console.log('❌ Partage échoué');
        console.log('Erreur:', shareData.message);
        console.log('Stack:', shareData.stack);
      }
    } catch (parseError) {
      console.log('❌ Impossible de parser la réponse JSON:', parseError.message);
    }

    // 5. Test avec classService si disponible
    console.log('\n5. 🔧 Test avec classService');
    if (window.classService) {
      try {
        console.log('Appel classService.shareCollectionWithClass...');
        const serviceResult = await window.classService.shareCollectionWithClass(classe._id, collection._id);
        console.log('✅ ClassService réussi:', serviceResult);
      } catch (serviceError) {
        console.log('❌ ClassService échoué:', serviceError);
        console.log('Error message:', serviceError.message);
        console.log('Error response:', serviceError.response);
        console.log('Error stack:', serviceError.stack);
      }
    } else {
      console.log('⚠️ ClassService non disponible');
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.error('Stack:', error.stack);
  }
}

// Message d'instruction
console.log(`
🎯 INSTRUCTIONS DE DEBUG:
1. Connectez-vous en tant qu'enseignant (prof.martin@example.com / password123)
2. Ouvrez la console développeur (F12)
3. Exécutez: debugFrontendShare()
4. Analysez les logs pour identifier l'erreur
`);

// Lancer automatiquement si dans le navigateur
if (typeof window !== 'undefined') {
  debugFrontendShare();
}
