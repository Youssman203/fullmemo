const fetch = require('node-fetch');

async function testImportVisibility() {
  console.log('👁️ Test visibilité des collections importées\n');
  
  try {
    // Étape 1: Connexion étudiant
    console.log('1. Connexion étudiant...');
    const studentLogin = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'etudiant.test@example.com',
        password: 'password123'
      })
    });
    
    const studentData = await studentLogin.json();
    console.log('✅ Étudiant connecté');
    console.log(`👤 ID: ${studentData._id}`);
    console.log(`📧 Email: ${studentData.email}`);
    
    // Étape 2: Lister TOUTES les collections de l'étudiant
    console.log('\n2. Récupération collections étudiant...');
    const collectionsResponse = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${studentData.token}` }
    });
    
    const collectionsData = await collectionsResponse.json();
    console.log(`📚 Total collections étudiant: ${collectionsData.data.length}\n`);
    
    // Analyser chaque collection
    let importedCount = 0;
    let personalCount = 0;
    
    collectionsData.data.forEach((collection, index) => {
      const isImported = collection.name.includes('(Importé)') || 
                        collection.tags?.includes('importé') ||
                        collection.description?.includes('Importé via le code');
      
      console.log(`${index + 1}. ${collection.name}`);
      console.log(`   📄 Description: ${collection.description?.substring(0, 50) || 'N/A'}...`);
      console.log(`   🏷️  Tags: ${collection.tags?.join(', ') || 'Aucun'}`);
      console.log(`   📊 Cartes: ${collection.cardsCount || 0}`);
      console.log(`   📅 Créé: ${new Date(collection.createdAt).toLocaleDateString('fr-FR')}`);
      console.log(`   🆔 ID: ${collection._id}`);
      console.log(`   👤 Propriétaire: ${collection.user}`);
      console.log(`   📥 Importé: ${isImported ? 'OUI' : 'NON'}`);
      console.log('');
      
      if (isImported) {
        importedCount++;
      } else {
        personalCount++;
      }
    });
    
    // Étape 3: Résumé
    console.log('📊 RÉSUMÉ:');
    console.log(`   📚 Collections personnelles: ${personalCount}`);
    console.log(`   📥 Collections importées: ${importedCount}`);
    console.log(`   🔢 Total: ${collectionsData.data.length}`);
    
    // Étape 4: Vérification spécifique des collections "Geographie"
    console.log('\n3. Recherche collections "Geographie"...');
    const geoCollections = collectionsData.data.filter(c => 
      c.name.toLowerCase().includes('geographie')
    );
    
    if (geoCollections.length > 0) {
      console.log(`✅ ${geoCollections.length} collection(s) Geographie trouvée(s):`);
      geoCollections.forEach((geo, i) => {
        console.log(`   ${i+1}. "${geo.name}" - ${geo.name.includes('Importé') ? 'IMPORTÉE' : 'PERSONNELLE'}`);
      });
    } else {
      console.log('❌ Aucune collection Geographie trouvée');
    }
    
    // Étape 5: Test avec un code existant (si disponible)
    console.log('\n4. Test avec code TLC37O (si encore valide)...');
    try {
      const codeTestResponse = await fetch('http://localhost:5000/api/share/code/TLC37O', {
        headers: { 'Authorization': `Bearer ${studentData.token}` }
      });
      
      if (codeTestResponse.ok) {
        const codeData = await codeTestResponse.json();
        console.log('✅ Code TLC37O valide');
        console.log(`📚 Collection: ${codeData.data.collection.name}`);
        console.log(`📄 Cartes: ${codeData.data.flashcards.length}`);
        
        // Essayer d'importer (peut échouer si déjà importé)
        const importResponse = await fetch('http://localhost:5000/api/share/code/TLC37O/import', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${studentData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (importResponse.ok) {
          const importData = await importResponse.json();
          console.log('✅ Nouvel import réussi:', importData.data.collection.name);
        } else {
          const errorText = await importResponse.text();
          if (errorText.includes('déjà importé')) {
            console.log('⚠️ Collection déjà importée (normal)');
          } else {
            console.log('❌ Erreur import:', errorText);
          }
        }
      } else {
        console.log('❌ Code TLC37O invalide ou expiré');
      }
    } catch (codeError) {
      console.log('❌ Erreur test code:', codeError.message);
    }
    
    console.log('\n🎯 CONCLUSION:');
    if (importedCount > 0) {
      console.log('✅ DES COLLECTIONS IMPORTÉES SONT VISIBLES côté backend');
      console.log('💡 Si elles n\'apparaissent pas dans l\'interface:');
      console.log('   - Vérifier le rafraîchissement frontend');
      console.log('   - Tester avec F5 dans le navigateur');
      console.log('   - Vérifier les logs console dans le navigateur');
    } else {
      console.log('❌ AUCUNE COLLECTION IMPORTÉE VISIBLE');
      console.log('💡 Il faut d\'abord importer une collection avec un code valide');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testImportVisibility();
