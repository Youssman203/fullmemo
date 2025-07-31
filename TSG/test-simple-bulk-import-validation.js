const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDATION IMPORT SIMPLE CSV - Vérification des fichiers\n');

// Chemins des fichiers à vérifier
const filesToCheck = [
  // Backend
  {
    path: './backend/controllers/simpleBulkImportController.js',
    type: 'Backend Controller',
    description: 'Contrôleur pour import simple CSV (Questions/Réponses seulement)'
  },
  {
    path: './backend/routes/simpleBulkImportRoutes.js',
    type: 'Backend Routes',
    description: 'Routes API pour import simple CSV'
  },
  
  // Frontend
  {
    path: './spaced-revision/src/components/SimpleBulkImportModal.js',
    type: 'Frontend Component',
    description: 'Modal React pour import simple CSV'
  },
  
  // Test et documentation
  {
    path: './test-cartes-simple-exemple.csv',
    type: 'Test File',
    description: 'Fichier CSV d\'exemple avec 15 cartes'
  },
  {
    path: './GUIDE_TEST_IMPORT_SIMPLE_CSV.md',
    type: 'Documentation',
    description: 'Guide de test complet pour validation'
  }
];

let allFilesFound = true;
let successCount = 0;

console.log('📁 VÉRIFICATION DES FICHIERS:\n');

filesToCheck.forEach(file => {
  const fullPath = path.resolve(file.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const stats = fs.statSync(fullPath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`✅ ${file.type}: ${file.path}`);
    console.log(`   📝 ${file.description}`);
    console.log(`   📊 Taille: ${sizeKB} KB`);
    console.log(`   📅 Modifié: ${stats.mtime.toLocaleDateString('fr-FR')} ${stats.mtime.toLocaleTimeString('fr-FR')}\n`);
    successCount++;
  } else {
    console.log(`❌ ${file.type}: ${file.path}`);
    console.log(`   🚨 FICHIER MANQUANT: ${file.description}\n`);
    allFilesFound = false;
  }
});

// Vérification de l'intégration dans server.js
console.log('🔗 VÉRIFICATION DES INTÉGRATIONS:\n');

try {
  const serverPath = './backend/server.js';
  if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    // Vérifier l'import des routes
    const hasImport = serverContent.includes('simpleBulkImportRoutes') || 
                     serverContent.includes('./routes/simpleBulkImportRoutes');
    
    // Vérifier l'utilisation des routes
    const hasUsage = serverContent.includes('/api/simple-bulk-import') || 
                    serverContent.includes('simpleBulkImportRoutes');
    
    if (hasImport && hasUsage) {
      console.log('✅ server.js: Routes simple-bulk-import intégrées');
    } else {
      console.log('⚠️ server.js: Routes simple-bulk-import NON intégrées');
      console.log('   📝 Ajouter: const simpleBulkImportRoutes = require(\'./routes/simpleBulkImportRoutes\');');
      console.log('   📝 Ajouter: app.use(\'/api/simple-bulk-import\', simpleBulkImportRoutes);');
      allFilesFound = false;
    }
  } else {
    console.log('❌ server.js: Fichier non trouvé');
    allFilesFound = false;
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification de server.js:', error.message);
  allFilesFound = false;
}

// Vérification de l'intégration dans Collections.js
try {
  const collectionsPath = './spaced-revision/src/pages/Collections.js';
  if (fs.existsSync(collectionsPath)) {
    const collectionsContent = fs.readFileSync(collectionsPath, 'utf8');
    
    const hasImport = collectionsContent.includes('SimpleBulkImportModal');
    const hasState = collectionsContent.includes('showSimpleBulkImportModal');
    const hasButton = collectionsContent.includes('Import Simple CSV') || 
                     collectionsContent.includes('FaFileImport');
    const hasModal = collectionsContent.includes('<SimpleBulkImportModal');
    
    if (hasImport && hasState && hasButton && hasModal) {
      console.log('✅ Collections.js: SimpleBulkImportModal intégré');
    } else {
      console.log('⚠️ Collections.js: SimpleBulkImportModal NON intégré complètement');
      console.log(`   📝 Import: ${hasImport ? '✅' : '❌'}`);
      console.log(`   📝 State: ${hasState ? '✅' : '❌'}`);  
      console.log(`   📝 Button: ${hasButton ? '✅' : '❌'}`);
      console.log(`   📝 Modal: ${hasModal ? '✅' : '❌'}`);
      allFilesFound = false;
    }
  } else {
    console.log('❌ Collections.js: Fichier non trouvé');
    allFilesFound = false;
  }
} catch (error) {
  console.log('❌ Erreur lors de la vérification de Collections.js:', error.message);
  allFilesFound = false;
}

console.log('\n📊 RÉSUMÉ DE LA VALIDATION:\n');

if (allFilesFound) {
  console.log('🎉 VALIDATION RÉUSSIE !');
  console.log(`✅ ${successCount}/${filesToCheck.length} fichiers trouvés`);
  console.log('✅ Intégrations backend et frontend validées');
  console.log('\n🚀 PROCHAINES ÉTAPES:');
  console.log('1. Installer les dépendances backend si nécessaire:');
  console.log('   cd backend && npm install csv-parser xlsx multer');
  console.log('2. Redémarrer le serveur backend (port 5000)');
  console.log('3. Redémarrer le frontend React (port 3000)');
  console.log('4. Suivre le guide: GUIDE_TEST_IMPORT_SIMPLE_CSV.md');
  console.log('5. Se connecter avec prof.martin@example.com');
  console.log('6. Tester l\'import avec test-cartes-simple-exemple.csv');
} else {
  console.log('❌ VALIDATION ÉCHOUÉE !');
  console.log(`⚠️ ${successCount}/${filesToCheck.length} fichiers trouvés`);
  console.log('🔧 Vérifier les fichiers manquants ci-dessus');
  console.log('🔧 Compléter les intégrations manquantes');
}

console.log('\n💡 AIDE ET SUPPORT:');
console.log('📖 Guide complet: GUIDE_TEST_IMPORT_SIMPLE_CSV.md');
console.log('🧪 Fichier test: test-cartes-simple-exemple.csv (15 cartes)');
console.log('🔍 Validation: Relancer ce script après corrections');

// Afficher le contenu du CSV d'exemple si disponible
try {
  const csvPath = './test-cartes-simple-exemple.csv';
  if (fs.existsSync(csvPath)) {
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    console.log(`\n📄 APERÇU DU FICHIER TEST (${lines.length} lignes):`);
    console.log('─'.repeat(50));
    lines.slice(0, 6).forEach((line, index) => {
      if (index === 0) {
        console.log(`📋 ${line} (Header)`);
      } else {
        console.log(`${index}. ${line}`);
      }
    });
    if (lines.length > 6) {
      console.log(`... et ${lines.length - 6} autres cartes`);
    }
  }
} catch (error) {
  console.log('⚠️ Impossible d\'afficher l\'aperçu du CSV:', error.message);
}

console.log('\n' + '='.repeat(70));
console.log('🎯 FONCTIONNALITÉ IMPORT SIMPLE CSV - VALIDATION TERMINÉE');
console.log('='.repeat(70));
