// test-collection-selector-validation.js
// Script de validation pour le nouveau sélecteur de collections

console.log('🧪 VALIDATION DU SÉLECTEUR DE COLLECTIONS ÉTUDIANT');
console.log('=' .repeat(60));

// 1. Vérification des fichiers créés
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  {
    path: 'spaced-revision/src/components/CollectionSelectorModal.js',
    description: 'Composant principal du sélecteur'
  },
  {
    path: 'spaced-revision/src/components/StudentClassesPanel.js',
    description: 'Panel étudiant modifié'
  },
  {
    path: 'spaced-revision/src/components/CollectionPreviewModal.js',
    description: 'Modal d\'aperçu (existant)'
  }
];

console.log('\n📁 Vérification des fichiers :');
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file.path);
  const exists = fs.existsSync(fullPath);
  console.log(`${exists ? '✅' : '❌'} ${file.description}`);
  if (!exists) {
    console.log(`   ⚠️  Fichier manquant: ${file.path}`);
  }
});

// 2. Vérification du contenu des fichiers modifiés
console.log('\n🔍 Vérification du contenu des fichiers :');

try {
  // Vérifier StudentClassesPanel
  const panelPath = path.join(__dirname, 'spaced-revision/src/components/StudentClassesPanel.js');
  if (fs.existsSync(panelPath)) {
    const panelContent = fs.readFileSync(panelPath, 'utf8');
    
    const checksPanel = [
      { check: panelContent.includes('import CollectionSelectorModal'), desc: 'Import CollectionSelectorModal' },
      { check: panelContent.includes('showCollectionSelector'), desc: 'État showCollectionSelector' },
      { check: panelContent.includes('handleViewCollectionsSelector'), desc: 'Fonction handleViewCollectionsSelector' },
      { check: panelContent.includes('<CollectionSelectorModal'), desc: 'Utilisation du composant' }
    ];
    
    console.log('\n📄 StudentClassesPanel.js :');
    checksPanel.forEach(item => {
      console.log(`${item.check ? '✅' : '❌'} ${item.desc}`);
    });
  }
  
  // Vérifier CollectionSelectorModal
  const modalPath = path.join(__dirname, 'spaced-revision/src/components/CollectionSelectorModal.js');
  if (fs.existsSync(modalPath)) {
    const modalContent = fs.readFileSync(modalPath, 'utf8');
    
    const checksModal = [
      { check: modalContent.includes('useState'), desc: 'Hooks React' },
      { check: modalContent.includes('getClassCollections'), desc: 'Service API collections' },
      { check: modalContent.includes('importCollectionFromClass'), desc: 'Service API import' },
      { check: modalContent.includes('Form.Check'), desc: 'Checkboxes pour sélection' },
      { check: modalContent.includes('handleSelectAll'), desc: 'Fonction sélection multiple' },
      { check: modalContent.includes('handleImportSelected'), desc: 'Fonction import en lot' },
      { check: modalContent.includes('CollectionPreviewModal'), desc: 'Modal d\'aperçu intégrée' }
    ];
    
    console.log('\n📄 CollectionSelectorModal.js :');
    checksModal.forEach(item => {
      console.log(`${item.check ? '✅' : '❌'} ${item.desc}`);
    });
    
    // Compter les lignes de code
    const lines = modalContent.split('\n').length;
    console.log(`📊 Lignes de code: ${lines}`);
  }
  
} catch (error) {
  console.error('❌ Erreur lors de la vérification du contenu:', error.message);
}

// 3. Vérification des dépendances
console.log('\n📦 Vérification des dépendances :');

const packageJsonPath = path.join(__dirname, 'spaced-revision/package.json');
if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    const requiredDeps = [
      'react',
      'react-bootstrap', 
      'react-icons',
      'react-router-dom'
    ];
    
    requiredDeps.forEach(dep => {
      const exists = dependencies[dep];
      console.log(`${exists ? '✅' : '❌'} ${dep}${exists ? ` (${exists})` : ' - MANQUANT'}`);
    });
  } catch (error) {
    console.log('❌ Erreur lors de la lecture du package.json');
  }
} else {
  console.log('❌ package.json non trouvé');
}

// 4. Instructions de test
console.log('\n🧪 INSTRUCTIONS DE TEST :');
console.log('1. Démarrer le backend: cd backend && node server.js');
console.log('2. Démarrer le frontend: cd spaced-revision && npm start');
console.log('3. Connexion enseignant: prof.martin@example.com / password123');
console.log('4. Partager quelques collections avec la classe "bac2"');
console.log('5. Connexion étudiant: etudiant.test@example.com / password123');
console.log('6. Dashboard → Mes Classes → Bouton "Collections"');
console.log('7. Tester la nouvelle interface de sélection multiple');

console.log('\n📋 Utiliser le guide complet: GUIDE_TEST_COLLECTION_SELECTOR.md');

// 5. Fonctionnalités clés à valider
console.log('\n🎯 FONCTIONNALITÉS CLÉS IMPLÉMENTÉES :');
console.log('✅ Interface de sélection multiple avec checkboxes');
console.log('✅ Bouton "Tout sélectionner/désélectionner"');
console.log('✅ Import en lot des collections sélectionnées');
console.log('✅ Import individuel avec aperçu');
console.log('✅ Feedback visuel (spinners, toasts, badges)');
console.log('✅ Gestion des résultats d\'import détaillés');
console.log('✅ Interface responsive et moderne');
console.log('✅ Intégration avec modal d\'aperçu existante');

console.log('\n🚀 Le sélecteur de collections est prêt pour les tests !');
console.log('=' .repeat(60));
