// Test approfondi du partage de collection par code
// Utilisation de fetch natif Node.js

const API_BASE = 'http://localhost:5000/api';

// Comptes de test
const ENSEIGNANT = {
  email: 'prof.martin@example.com',
  password: 'password123'
};

const ETUDIANT = {
  email: 'etudiant.test@example.com', 
  password: 'password123'
};

let enseignantToken = '';
let etudiantToken = '';

// Connexion enseignant
async function connecterEnseignant() {
  try {
    console.log('🧑‍🏫 Connexion enseignant...');
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ENSEIGNANT)
    });
    const data = await response.json();
    
    if (data.success && data.token) {
      enseignantToken = data.token;
      console.log('✅ Enseignant connecté');
      console.log('   Nom:', data.data.name);
      console.log('   Email:', data.data.email);
      console.log('   Rôle:', data.data.role);
      console.log('   ID:', data.data._id);
      return data.data;
    }
  } catch (error) {
    console.error('❌ Erreur connexion enseignant:', error.message);
    throw error;
  }
}

// Connexion étudiant  
async function connecterEtudiant() {
  try {
    console.log('\n👨‍🎓 Connexion étudiant...');
    const response = await axios.post(`${API_BASE}/users/login`, ETUDIANT);
    
    if (response.data.success && response.data.token) {
      etudiantToken = response.data.token;
      console.log('✅ Étudiant connecté');
      console.log('   Nom:', response.data.data.name);
      console.log('   Email:', response.data.data.email);
      console.log('   Rôle:', response.data.data.role);
      console.log('   ID:', response.data.data._id);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Erreur connexion étudiant:', error.response?.data || error.message);
    throw error;
  }
}

// Récupérer collections enseignant
async function getCollectionsEnseignant() {
  try {
    console.log('\n📚 Récupération collections enseignant...');
    const response = await axios.get(`${API_BASE}/collections`, {
      headers: { Authorization: `Bearer ${enseignantToken}` }
    });
    
    let collections = response.data.data || response.data;
    console.log(`✅ ${collections.length} collections trouvées pour l'enseignant`);
    
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (ID: ${collection._id})`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Erreur récupération collections enseignant:', error.response?.data || error.message);
    throw error;
  }
}

// Générer code de partage
async function genererCodePartage(collectionId) {
  try {
    console.log('\n🔢 Génération code de partage...');
    console.log('   Collection ID:', collectionId);
    
    const response = await axios.post(`${API_BASE}/share/collections/${collectionId}/generate`, {}, {
      headers: { Authorization: `Bearer ${enseignantToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Code généré:', response.data.data.code);
      console.log('   Expire le:', new Date(response.data.data.expiresAt).toLocaleString());
      console.log('   Permissions:', response.data.data.permissions);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Erreur génération code:', error.response?.data || error.message);
    throw error;
  }
}

// Tester accès par code (étudiant)
async function testerAccesParCode(code) {
  try {
    console.log('\n🔍 Test accès par code (étudiant)...');
    console.log('   Code:', code);
    
    const response = await axios.get(`${API_BASE}/share/code/${code}`, {
      headers: { Authorization: `Bearer ${etudiantToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Collection accessible via code');
      console.log('   Nom:', response.data.collection.name);
      console.log('   Créateur:', response.data.creator.name);
      console.log('   Cartes:', response.data.flashcards?.length || 0);
      return response.data;
    }
  } catch (error) {
    console.error('❌ Erreur accès par code:', error.response?.data || error.message);
    throw error;
  }
}

// Importer collection par code (étudiant)
async function importerCollectionParCode(code) {
  try {
    console.log('\n📥 Import collection par code (étudiant)...');
    console.log('   Code:', code);
    
    const response = await axios.post(`${API_BASE}/share/code/${code}/import`, {}, {
      headers: { Authorization: `Bearer ${etudiantToken}` }
    });
    
    if (response.data.success) {
      console.log('✅ Collection importée avec succès !');
      console.log('   Nom importée:', response.data.data.collection.name);
      console.log('   ID nouvelle collection:', response.data.data.collection._id);
      console.log('   Owner nouvelle collection:', response.data.data.collection.user);
      console.log('   Cartes importées:', response.data.data.flashcards?.length || 0);
      console.log('   Collection originale:', response.data.data.originalCollection.name);
      console.log('   Créée par:', response.data.data.originalCollection.user);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Erreur import collection:', error.response?.data || error.message);
    throw error;
  }
}

// Vérifier collections étudiant AVANT import
async function verifierCollectionsEtudiantAvant() {
  try {
    console.log('\n📋 Collections étudiant AVANT import...');
    const response = await axios.get(`${API_BASE}/collections`, {
      headers: { Authorization: `Bearer ${etudiantToken}` }
    });
    
    let collections = response.data.data || response.data;
    console.log(`📊 Étudiant a ${collections.length} collections AVANT import`);
    
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (ID: ${collection._id}) - Owner: ${collection.user}`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Erreur vérification collections étudiant:', error.response?.data || error.message);
    throw error;
  }
}

// Vérifier collections étudiant APRÈS import
async function verifierCollectionsEtudiantApres() {
  try {
    console.log('\n📋 Collections étudiant APRÈS import...');
    const response = await axios.get(`${API_BASE}/collections`, {
      headers: { Authorization: `Bearer ${etudiantToken}` }
    });
    
    let collections = response.data.data || response.data;
    console.log(`📊 Étudiant a ${collections.length} collections APRÈS import`);
    
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (ID: ${collection._id}) - Owner: ${collection.user}`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Erreur vérification collections étudiant:', error.response?.data || error.message);
    throw error;
  }
}

// Vérifier collections enseignant APRÈS import
async function verifierCollectionsEnseignantApres() {
  try {
    console.log('\n📋 Collections enseignant APRÈS import...');
    const response = await axios.get(`${API_BASE}/collections`, {
      headers: { Authorization: `Bearer ${enseignantToken}` }
    });
    
    let collections = response.data.data || response.data;
    console.log(`📊 Enseignant a ${collections.length} collections APRÈS import`);
    
    collections.forEach((collection, index) => {
      console.log(`   ${index + 1}. ${collection.name} (ID: ${collection._id}) - Owner: ${collection.user}`);
    });
    
    return collections;
  } catch (error) {
    console.error('❌ Erreur vérification collections enseignant:', error.response?.data || error.message);
    throw error;
  }
}

// Test complet
async function testComplet() {
  try {
    console.log('🧪 TEST COMPLET - Diagnostic Partage Code');
    console.log('='.repeat(45));
    
    // Étape 1: Connexions
    const enseignant = await connecterEnseignant();
    const etudiant = await connecterEtudiant();
    
    // Étape 2: Collections enseignant
    const collectionsEnseignant = await getCollectionsEnseignant();
    
    if (collectionsEnseignant.length === 0) {
      console.log('❌ Aucune collection trouvée pour l\'enseignant');
      return;
    }
    
    // Utiliser la première collection
    const collection = collectionsEnseignant[0];
    
    // Étape 3: Collections étudiant AVANT
    const collectionsEtudiantAvant = await verifierCollectionsEtudiantAvant();
    
    // Étape 4: Générer code
    const codeData = await genererCodePartage(collection._id);
    
    // Étape 5: Tester accès
    await testerAccesParCode(codeData.code);
    
    // Étape 6: Importer
    const importResult = await importerCollectionParCode(codeData.code);
    
    // Étape 7: Vérifications APRÈS
    const collectionsEtudiantApres = await verifierCollectionsEtudiantApres();
    const collectionsEnseignantApres = await verifierCollectionsEnseignantApres();
    
    // Analyse des résultats
    console.log('\n🔍 ANALYSE DES RÉSULTATS');
    console.log('='.repeat(30));
    
    console.log(`📊 Étudiant avant: ${collectionsEtudiantAvant.length} collections`);
    console.log(`📊 Étudiant après: ${collectionsEtudiantApres.length} collections`);
    console.log(`📊 Différence: +${collectionsEtudiantApres.length - collectionsEtudiantAvant.length} collections`);
    
    console.log(`📊 Enseignant après: ${collectionsEnseignantApres.length} collections`);
    
    // Vérifier ownership
    const nouvelleCollection = collectionsEtudiantApres.find(c => 
      c.name.includes('(Importé)') && 
      !collectionsEtudiantAvant.some(ca => ca._id === c._id)
    );
    
    if (nouvelleCollection) {
      console.log('✅ Nouvelle collection trouvée chez l\'étudiant:');
      console.log(`   Nom: ${nouvelleCollection.name}`);
      console.log(`   ID: ${nouvelleCollection._id}`);
      console.log(`   Owner: ${nouvelleCollection.user}`);
      console.log(`   Owner étudiant: ${nouvelleCollection.user === etudiant._id ? '✅ OUI' : '❌ NON'}`);
    } else {
      console.log('❌ PROBLÈME: Nouvelle collection non trouvée chez l\'étudiant !');
    }
    
    // Vérifier si apparue chez enseignant par erreur
    const collectionErroneEnseignant = collectionsEnseignantApres.find(c => 
      c.name.includes('(Importé)')
    );
    
    if (collectionErroneEnseignant) {
      console.log('❌ PROBLÈME DÉTECTÉ: Collection importée apparue chez l\'enseignant !');
      console.log(`   Nom: ${collectionErroneEnseignant.name}`);
      console.log(`   ID: ${collectionErroneEnseignant._id}`);
      console.log(`   Owner: ${collectionErroneEnseignant.user}`);
    } else {
      console.log('✅ OK: Aucune collection importée erronée chez l\'enseignant');
    }
    
    console.log('\n🎯 CONCLUSION');
    console.log('='.repeat(15));
    
    if (nouvelleCollection && nouvelleCollection.user === etudiant._id && !collectionErroneEnseignant) {
      console.log('✅ SUCCÈS: Le partage par code fonctionne correctement !');
    } else {
      console.log('❌ ÉCHEC: Problème détecté dans le partage par code');
      
      if (!nouvelleCollection) {
        console.log('   - Collection non créée chez l\'étudiant');
      } else if (nouvelleCollection.user !== etudiant._id) {
        console.log('   - Mauvais owner pour la collection importée');
      }
      
      if (collectionErroneEnseignant) {
        console.log('   - Collection apparue par erreur chez l\'enseignant');
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur dans le test:', error.message);
  }
}

// Exécuter le test
testComplet();
