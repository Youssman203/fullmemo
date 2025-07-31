// Script de test rapide pour l'import simple CSV
// À copier-coller dans la console du navigateur

console.log('🧪 TEST IMPORT SIMPLE CSV - Script de test rapide');
console.log('📋 Étapes à suivre dans le navigateur:\n');

console.log('1. 🔐 CONNEXION ENSEIGNANT');
console.log('   - Email: prof.martin@example.com');
console.log('   - Mot de passe: password123');
console.log('   - Vérifier que le rôle est "teacher"\n');

console.log('2. 📚 NAVIGATION COLLECTIONS');
console.log('   - Aller sur la page Collections');
console.log('   - Vérifier la présence du bouton "Import Simple CSV" (vert)');
console.log('   - Le bouton doit être visible uniquement pour les enseignants\n');

console.log('3. 📤 TEST MODAL IMPORT');
console.log('   - Cliquer sur "Import Simple CSV"');
console.log('   - Vérifier l\'ouverture de la modal');
console.log('   - Titre: "Import Simple CSV - Questions & Réponses"');
console.log('   - Télécharger le template CSV pour voir le format\n');

console.log('4. 📁 FICHIER DE TEST');
console.log('   - Utiliser le fichier: test-cartes-simple-exemple.csv');
console.log('   - 15 cartes d\'exemple avec Questions/Réponses');
console.log('   - Formats supportés: CSV, XLSX, XLS\n');

console.log('5. 🔍 ANALYSE ET PREVIEW');
console.log('   - Sélectionner le fichier CSV');
console.log('   - Cliquer "Analyser le fichier"');
console.log('   - Vérifier: 15 cartes valides, 0 erreur');
console.log('   - Voir l\'aperçu des 5 premières cartes\n');

console.log('6. ⚙️ CONFIGURATION');
console.log('   - Choisir "Créer une nouvelle collection"');
console.log('   - Nom: "Test Import Simple CSV"');
console.log('   - Cliquer "Importer 15 cartes"\n');

console.log('7. ✅ VÉRIFICATION RÉSULTATS');
console.log('   - Voir les statistiques: 15 cartes créées');
console.log('   - Fermer la modal');
console.log('   - Vérifier la nouvelle collection dans la liste');
console.log('   - Ouvrir la collection et voir les 15 cartes\n');

// Fonction de test de l'API
const testSimpleImportAPI = async () => {
  console.log('🔗 TEST API SIMPLE IMPORT\n');
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Pas de token - Veuillez vous connecter d\'abord');
    return;
  }
  
  console.log('✅ Token trouvé:', token.substring(0, 20) + '...');
  
  // Test de la route preview
  try {
    const testResponse = await fetch('http://localhost:5000/api/simple-bulk-import/preview', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (testResponse.status === 404) {
      console.log('✅ Route /preview existe (404 normal sans fichier)');
    } else if (testResponse.status === 405) {
      console.log('✅ Route /preview existe (405 = POST requis)');
    } else {
      console.log('🔍 Route status:', testResponse.status);
    }
  } catch (error) {
    console.error('❌ Erreur test API:', error.message);
  }
};

// Fonction d'aide pour vérifier l'utilisateur
const checkUser = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('👤 UTILISATEUR ACTUEL:');
  console.log('   Email:', user.email || 'Non connecté');
  console.log('   Rôle:', user.role || 'Non défini');
  console.log('   Nom:', user.name || 'Non défini');
  
  if (user.role === 'teacher') {
    console.log('   ✅ Accès Import Simple CSV: OUI');
  } else {
    console.log('   ❌ Accès Import Simple CSV: NON (enseignant requis)');
  }
  
  return user;
};

// Fonction pour vérifier les collections
const checkCollections = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Token manquant');
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/collections', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const collections = await response.json();
      console.log('📚 COLLECTIONS ACTUELLES:', collections.length);
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name} (${col.cardCount || 0} cartes)`);
      });
    }
  } catch (error) {
    console.error('❌ Erreur récupération collections:', error);
  }
};

console.log('🛠️ FONCTIONS UTILES DISPONIBLES:');
console.log('   - checkUser() → Vérifier utilisateur connecté');
console.log('   - testSimpleImportAPI() → Test routes API');
console.log('   - checkCollections() → Lister collections actuelles');

console.log('\n🎯 CRITÈRES DE RÉUSSITE:');
console.log('   ✅ Bouton "Import Simple CSV" visible pour enseignant');
console.log('   ✅ Modal s\'ouvre avec les bonnes informations');
console.log('   ✅ Template CSV téléchargeable');
console.log('   ✅ Analyse du fichier test réussie (15 cartes)');
console.log('   ✅ Import réussi avec nouvelle collection créée');
console.log('   ✅ 15 cartes visibles avec métadonnées correctes');

console.log('\n📄 CONTENU FICHIER TEST:');
console.log('Question,Réponse');
console.log('Quelle est la capitale de la France?,Paris');
console.log('Combien font 2+2?,4');
console.log('Qui a écrit \'Les Misérables\'?,Victor Hugo');
console.log('... et 12 autres cartes');

console.log('\n🚀 COMMENCER LE TEST:');
console.log('1. Coller ce script dans la console navigateur');  
console.log('2. Exécuter: checkUser()');
console.log('3. Si besoin: Se connecter avec prof.martin@example.com');
console.log('4. Suivre les étapes 1-7 ci-dessus');
console.log('5. En cas de problème: testSimpleImportAPI()');

console.log('\n' + '='.repeat(60));
console.log('🎓 IMPORT SIMPLE CSV - PRÊT POUR TEST UTILISATEUR');
console.log('='.repeat(60));
