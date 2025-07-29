const fetch = require('node-fetch');

async function testStudentImport() {
  console.log('🎓 Test import collection par étudiant\n');
  
  try {
    // Étape 1: Connexion enseignant pour obtenir un code
    console.log('1. Connexion enseignant...');
    const teacherLogin = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'prof.martin@example.com',
        password: 'password123'
      })
    });
    
    const teacherData = await teacherLogin.json();
    console.log('✅ Enseignant connecté');
    
    // Obtenir les collections enseignant
    const teacherCollections = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${teacherData.token}` }
    });
    
    const teacherCollectionsData = await teacherCollections.json();
    const sourceCollection = teacherCollectionsData.data.find(c => c.name === 'Geographie');
    
    if (!sourceCollection) {
      console.log('❌ Collection Geographie non trouvée');
      return;
    }
    
    console.log(`📚 Collection source: ${sourceCollection.name} (${sourceCollection._id})`);
    
    // Générer un code de partage
    const generateCode = await fetch(`http://localhost:5000/api/share/collections/${sourceCollection._id}/generate`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${teacherData.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expiresInHours: 24,
        permissions: ['view', 'copy']
      })
    });
    
    const codeData = await generateCode.json();
    console.log(`🔑 Code généré: ${codeData.data.code}`);
    
    // Étape 2: Connexion étudiant
    console.log('\n2. Connexion étudiant...');
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
    console.log(`👤 ID Étudiant: ${studentData._id}`);
    
    // Vérifier collections étudiant AVANT import
    console.log('\n3. Collections étudiant AVANT import...');
    const beforeCollections = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${studentData.token}` }
    });
    
    const beforeData = await beforeCollections.json();
    console.log(`📚 Collections avant: ${beforeData.data.length}`);
    beforeData.data.forEach((col, i) => {
      console.log(`   ${i+1}. ${col.name} (${col._id})`);
    });
    
    // Étape 3: Import par code
    console.log('\n4. Import par code...');
    const importResponse = await fetch(`http://localhost:5000/api/share/code/${codeData.data.code}/import`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${studentData.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (importResponse.ok) {
      const importData = await importResponse.json();
      console.log('✅ Import réussi!');
      console.log(`📚 Collection importée: ${importData.data.collection.name}`);
      console.log(`📄 Cartes importées: ${importData.data.flashcards.length}`);
      console.log(`🆔 ID nouvelle collection: ${importData.data.collection._id}`);
      console.log(`👤 Propriétaire: ${importData.data.collection.user}`);
    } else {
      const errorText = await importResponse.text();
      console.log('❌ Erreur import:', errorText);
      return;
    }
    
    // Étape 4: Vérifier collections étudiant APRÈS import
    console.log('\n5. Collections étudiant APRÈS import...');
    const afterCollections = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${studentData.token}` }
    });
    
    const afterData = await afterCollections.json();
    console.log(`📚 Collections après: ${afterData.data.length}`);
    afterData.data.forEach((col, i) => {
      console.log(`   ${i+1}. ${col.name} (${col._id}) - Propriétaire: ${col.user}`);
    });
    
    // Vérification finale
    const importedCollection = afterData.data.find(c => c.name.includes('Geographie') && c.name.includes('Importé'));
    if (importedCollection) {
      console.log('\n✅ SUCCESS: Collection importée trouvée dans les collections étudiant!');
      console.log(`📚 Nom: ${importedCollection.name}`);
      console.log(`🆔 ID: ${importedCollection._id}`);
      console.log(`👤 Propriétaire: ${importedCollection.user}`);
      console.log(`📊 Cartes: ${importedCollection.cardsCount || 'N/A'}`);
    } else {
      console.log('\n❌ PROBLÈME: Collection importée NON trouvée dans les collections étudiant!');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testStudentImport();
