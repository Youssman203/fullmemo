const http = require('http');

async function diagnosticCompletPartage() {
  console.log('🔬 DIAGNOSTIC COMPLET - Partage Collections et Cartes');
  console.log('=' .repeat(70));

  const TEACHER_EMAIL = 'prof.martin@example.com';
  const TEACHER_PASSWORD = 'password123';
  const STUDENT_EMAIL = 'etudiant.test@example.com';
  const STUDENT_PASSWORD = 'password123';
  const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

  function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const jsonBody = JSON.parse(body);
            resolve({ status: res.statusCode, data: jsonBody });
          } catch (e) {
            resolve({ status: res.statusCode, data: body });
          }
        });
      });
      req.on('error', reject);
      if (data) req.write(JSON.stringify(data));
      req.end();
    });
  }

  try {
    // === PARTIE 1: DIAGNOSTIC CÔTÉ ENSEIGNANT ===
    console.log('\n📚 PARTIE 1: DIAGNOSTIC CÔTÉ ENSEIGNANT');
    console.log('─'.repeat(50));

    // 1. Connexion enseignant
    console.log('\n1.1 🔑 Connexion enseignant');
    const teacherLoginResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/users/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: TEACHER_EMAIL, password: TEACHER_PASSWORD });

    if (teacherLoginResponse.status !== 200) {
      console.log('❌ Connexion enseignant échouée');
      console.log('Réponse:', teacherLoginResponse.data);
      return;
    }

    const teacherToken = teacherLoginResponse.data.token;
    const teacherId = teacherLoginResponse.data._id;
    console.log('✅ Enseignant connecté:', teacherLoginResponse.data.name);
    console.log(`   ID: ${teacherId}`);

    // 2. Collections de l'enseignant
    console.log('\n1.2 📖 Collections de l\'enseignant');
    const teacherCollectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });

    console.log('Statut collections enseignant:', teacherCollectionsResponse.status);
    
    if (teacherCollectionsResponse.status !== 200) {
      console.log('❌ Erreur récupération collections enseignant');
      console.log('Réponse:', teacherCollectionsResponse.data);
      return;
    }

    const teacherCollections = teacherCollectionsResponse.data.data || [];
    console.log(`Collections de l'enseignant: ${teacherCollections.length}`);

    if (teacherCollections.length === 0) {
      console.log('⚠️ PROBLÈME: Aucune collection trouvée pour l\'enseignant');
      console.log('💡 L\'enseignant doit d\'abord créer des collections avec des cartes');
      return;
    }

    // Afficher les collections avec détails
    console.log('\nDétails des collections enseignant:');
    for (let i = 0; i < teacherCollections.length; i++) {
      const collection = teacherCollections[i];
      console.log(`   ${i+1}. ${collection.name} (${collection._id})`);
      console.log(`      Cartes: ${collection.cardsCount || 0}`);
      console.log(`      Description: ${collection.description || 'Aucune'}`);
      console.log(`      Public: ${collection.isPublic ? 'Oui' : 'Non'}`);
      console.log(`      Propriétaire: ${collection.user}`);

      // Vérifier les cartes de chaque collection
      const cardsResponse = await makeRequest({
        hostname: 'localhost', port: 5000,
        path: `/api/flashcards/collection/${collection._id}`, method: 'GET',
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });

      if (cardsResponse.status === 200) {
        const cards = cardsResponse.data.data || [];
        console.log(`      Cartes réelles: ${cards.length}`);
        
        if (cards.length > 0) {
          console.log(`      Première carte: "${cards[0].question}"`);
        } else {
          console.log(`      ⚠️ Aucune carte dans cette collection!`);
        }
      } else {
        console.log(`      ❌ Erreur récupération cartes (${cardsResponse.status})`);
      }
    }

    // Sélectionner une collection avec des cartes pour les tests
    let collectionAvecCartes = null;
    for (const collection of teacherCollections) {
      const cardsResponse = await makeRequest({
        hostname: 'localhost', port: 5000,
        path: `/api/flashcards/collection/${collection._id}`, method: 'GET',
        headers: { 'Authorization': `Bearer ${teacherToken}` }
      });

      if (cardsResponse.status === 200) {
        const cards = cardsResponse.data.data || [];
        if (cards.length > 0) {
          collectionAvecCartes = collection;
          console.log(`\n🎯 Collection sélectionnée pour test: ${collection.name} (${cards.length} cartes)`);
          break;
        }
      }
    }

    if (!collectionAvecCartes) {
      console.log('\n❌ PROBLÈME CRITIQUE: Aucune collection avec des cartes trouvée!');
      console.log('💡 Créons une collection de test...');
      
      // Créer une collection de test
      const testCollectionResponse = await makeRequest({
        hostname: 'localhost', port: 5000, path: '/api/collections', method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' }
      }, {
        name: 'Test Partage',
        description: 'Collection créée pour test du partage',
        category: 'education',
        isPublic: false
      });

      if (testCollectionResponse.status === 201) {
        const newCollection = testCollectionResponse.data;
        console.log(`✅ Collection créée: ${newCollection.name} (${newCollection._id})`);

        // Créer des cartes de test
        const testCards = [
          { question: 'Quelle est la capitale de la France?', answer: 'Paris' },
          { question: 'Combien font 2+2?', answer: '4' },
          { question: 'Quelle est la couleur du ciel?', answer: 'Bleu' }
        ];

        for (const cardData of testCards) {
          const cardResponse = await makeRequest({
            hostname: 'localhost', port: 5000, path: '/api/flashcards', method: 'POST',
            headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' }
          }, {
            collection: newCollection._id,
            question: cardData.question,
            answer: cardData.answer,
            difficulty: 'medium'
          });

          if (cardResponse.status === 201) {
            console.log(`   ✅ Carte créée: ${cardData.question}`);
          } else {
            console.log(`   ❌ Erreur création carte: ${cardResponse.status}`);
          }
        }

        collectionAvecCartes = newCollection;
        console.log(`🎯 Collection de test prête: ${newCollection.name}`);
      } else {
        console.log('❌ Erreur création collection test');
        return;
      }
    }

    // 3. Vérifier la classe et le partage
    console.log('\n1.3 🏫 Détails de la classe');
    const classDetailsResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}`, method: 'GET',
      headers: { 'Authorization': `Bearer ${teacherToken}` }
    });

    if (classDetailsResponse.status !== 200) {
      console.log('❌ Erreur récupération classe');
      return;
    }

    const classData = classDetailsResponse.data.data || classDetailsResponse.data;
    console.log(`Classe: ${classData.name}`);
    console.log(`Enseignant: ${classData.teacher}`);
    console.log(`Étudiants: ${classData.students ? classData.students.length : 0}`);
    console.log(`Collections partagées: ${classData.collections ? classData.collections.length : 0}`);

    if (classData.collections) {
      console.log('Collections déjà partagées:');
      classData.collections.forEach((colId, index) => {
        console.log(`   ${index+1}. ${colId}`);
      });
    }

    // 4. Partager la collection avec la classe
    console.log('\n1.4 📤 Partage de collection avec la classe');
    
    const isAlreadyShared = classData.collections && 
                           classData.collections.includes(collectionAvecCartes._id);

    if (isAlreadyShared) {
      console.log(`✅ Collection "${collectionAvecCartes.name}" déjà partagée`);
    } else {
      console.log(`📤 Partage de "${collectionAvecCartes.name}" avec la classe...`);
      
      const shareResponse = await makeRequest({
        hostname: 'localhost', port: 5000,
        path: `/api/classes/${BAC2_CLASS_ID}/collections`, method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}`, 'Content-Type': 'application/json' }
      }, { collectionId: collectionAvecCartes._id });

      console.log(`Statut partage: ${shareResponse.status}`);
      
      if (shareResponse.status === 200) {
        console.log('✅ Collection partagée avec succès');
      } else {
        console.log('❌ Erreur lors du partage');
        console.log('Réponse:', shareResponse.data);
      }
    }

    // === PARTIE 2: DIAGNOSTIC CÔTÉ ÉTUDIANT ===
    console.log('\n\n👨‍🎓 PARTIE 2: DIAGNOSTIC CÔTÉ ÉTUDIANT');
    console.log('─'.repeat(50));

    // 1. Connexion étudiant
    console.log('\n2.1 🔑 Connexion étudiant');
    const studentLoginResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/users/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: STUDENT_EMAIL, password: STUDENT_PASSWORD });

    if (studentLoginResponse.status !== 200) {
      console.log('❌ Connexion étudiant échouée');
      return;
    }

    const studentToken = studentLoginResponse.data.token;
    const studentId = studentLoginResponse.data._id;
    console.log('✅ Étudiant connecté:', studentLoginResponse.data.name);
    console.log(`   ID: ${studentId}`);

    // 2. Vérifier l'inscription dans la classe
    console.log('\n2.2 🎓 Vérification inscription classe');
    const studentClassesResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/classes/student', method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (studentClassesResponse.status === 200) {
      const studentClasses = studentClassesResponse.data.data || [];
      const isEnrolled = studentClasses.some(cls => cls._id === BAC2_CLASS_ID);
      
      console.log(`Classes de l'étudiant: ${studentClasses.length}`);
      console.log(`Inscrit dans bac2: ${isEnrolled ? 'Oui' : 'Non'}`);

      if (!isEnrolled) {
        console.log('⚠️ PROBLÈME: Étudiant non inscrit dans la classe bac2');
        console.log('💡 L\'étudiant doit rejoindre la classe avec le code 9BONA1');
        
        // Tentative d'inscription automatique
        console.log('📝 Tentative d\'inscription automatique...');
        const joinResponse = await makeRequest({
          hostname: 'localhost', port: 5000, path: '/api/classes/join', method: 'POST',
          headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' }
        }, { classCode: '9BONA1' });

        if (joinResponse.status === 200) {
          console.log('✅ Inscription automatique réussie');
        } else {
          console.log('❌ Inscription automatique échouée');
          console.log('Réponse:', joinResponse.data);
        }
      }
    }

    // 3. Collections partagées visibles par l'étudiant
    console.log('\n2.3 📚 Collections partagées visibles par l\'étudiant');
    const sharedCollectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000,
      path: `/api/classes/${BAC2_CLASS_ID}/collections`, method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    console.log(`Statut collections partagées: ${sharedCollectionsResponse.status}`);

    if (sharedCollectionsResponse.status === 200) {
      const sharedData = sharedCollectionsResponse.data.data;
      const sharedCollections = sharedData.collections || [];
      
      console.log(`Collections partagées trouvées: ${sharedCollections.length}`);

      if (sharedCollections.length === 0) {
        console.log('❌ PROBLÈME: Aucune collection partagée visible pour l\'étudiant');
      } else {
        console.log('\nDétails des collections partagées:');
        for (let i = 0; i < sharedCollections.length; i++) {
          const collection = sharedCollections[i];
          console.log(`   ${i+1}. ${collection.name} (${collection._id})`);
          console.log(`      Cartes: ${collection.cardsCount || collection.cardCount || 0}`);
          console.log(`      Description: ${collection.description || 'Aucune'}`);

          // Tester l'accès aux cartes pour l'étudiant
          const studentCardsResponse = await makeRequest({
            hostname: 'localhost', port: 5000,
            path: `/api/flashcards/collection/${collection._id}`, method: 'GET',
            headers: { 'Authorization': `Bearer ${studentToken}` }
          });

          console.log(`      Accès cartes étudiant: ${studentCardsResponse.status}`);
          
          if (studentCardsResponse.status === 200) {
            const cards = studentCardsResponse.data.data || [];
            console.log(`      Cartes accessibles: ${cards.length}`);
            if (cards.length > 0) {
              console.log(`      Première carte: "${cards[0].question}"`);
            }
          } else if (studentCardsResponse.status === 403) {
            console.log(`      ⚠️ Accès refusé (normal pour collections partagées)`);
          } else {
            console.log(`      ❌ Erreur accès cartes: ${studentCardsResponse.data.message || 'Inconnue'}`);
          }
        }

        // Test d'importation
        console.log('\n2.4 📥 Test d\'importation');
        const targetCollection = sharedCollections[0];
        console.log(`Test importation: ${targetCollection.name}`);

        const importResponse = await makeRequest({
          hostname: 'localhost', port: 5000,
          path: `/api/classes/${BAC2_CLASS_ID}/collections/import`, method: 'POST',
          headers: { 'Authorization': `Bearer ${studentToken}`, 'Content-Type': 'application/json' }
        }, { collectionId: targetCollection._id });

        console.log(`Statut importation: ${importResponse.status}`);
        
        if (importResponse.status === 201) {
          console.log('✅ Importation réussie!');
          console.log(`Collection: ${importResponse.data.data.collection.name}`);
          console.log(`Cartes importées: ${importResponse.data.data.cardsImported}`);
        } else {
          console.log('❌ Erreur importation');
          console.log('Réponse:', importResponse.data);
        }
      }
    } else {
      console.log('❌ Erreur récupération collections partagées');
      console.log('Réponse:', sharedCollectionsResponse.data);
    }

    // 4. Collections personnelles de l'étudiant
    console.log('\n2.5 📖 Collections personnelles de l\'étudiant');
    const studentCollectionsResponse = await makeRequest({
      hostname: 'localhost', port: 5000, path: '/api/collections', method: 'GET',
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    if (studentCollectionsResponse.status === 200) {
      const studentCollections = studentCollectionsResponse.data.data || [];
      console.log(`Collections personnelles: ${studentCollections.length}`);

      const importedCollections = studentCollections.filter(col => 
        col.description && col.description.includes('Importée de la classe')
      );
      console.log(`Collections importées: ${importedCollections.length}`);

      if (importedCollections.length > 0) {
        console.log('Collections importées détectées:');
        importedCollections.forEach((col, index) => {
          console.log(`   ${index+1}. ${col.name} (${col.cardsCount || 0} cartes)`);
        });
      }
    }

    // === RÉSUMÉ ET RECOMMANDATIONS ===
    console.log('\n\n📊 RÉSUMÉ DU DIAGNOSTIC');
    console.log('=' .repeat(70));

    console.log('\n✅ POINTS FONCTIONNELS:');
    console.log('- Connexions enseignant et étudiant: OK');
    console.log('- API routes accessibles: OK');
    
    console.log('\n⚠️ POINTS À VÉRIFIER:');
    console.log('- Collections enseignant avec cartes');
    console.log('- Partage effectif avec la classe');
    console.log('- Inscription étudiant dans la classe');
    console.log('- Visibilité collections partagées côté étudiant');

    console.log('\n💡 ACTIONS RECOMMANDÉES:');
    console.log('1. Vérifier que l\'enseignant a des collections avec des cartes');
    console.log('2. S\'assurer que les collections sont partagées');
    console.log('3. Confirmer inscription étudiant dans la classe');
    console.log('4. Tester l\'interface frontend avec ces données');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }
}

diagnosticCompletPartage();
