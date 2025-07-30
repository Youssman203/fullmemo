#!/usr/bin/env node

// 🚀 VALIDATION COMPLÈTE - DÉPLOIEMENT WEBSOCKET
// ===============================================
// Script de validation pour s'assurer que le système WebSocket est correctement déployé

const fs = require('fs');
const path = require('path');

console.log('🔥 VALIDATION DÉPLOIEMENT WEBSOCKET');
console.log('====================================\n');

// 🔍 ÉTAPE 1: VÉRIFIER LES FICHIERS BACKEND
console.log('📂 ÉTAPE 1: Vérification fichiers backend...');

const backendFiles = [
  'c:/memoire/backend/server.js',
  'c:/memoire/backend/controllers/collectionShareCodeController.js',
  'c:/memoire/backend/package.json'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${path.basename(file)} existe`);
  } else {
    console.log(`❌ ${path.basename(file)} MANQUANT`);
  }
});

// 🔍 ÉTAPE 2: VÉRIFIER CONTENU SERVER.JS
console.log('\n📄 ÉTAPE 2: Vérification contenu server.js...');

try {
  const serverContent = fs.readFileSync('c:/memoire/backend/server.js', 'utf8');
  
  const checks = [
    { pattern: /socket\.io/i, name: 'Import Socket.IO' },
    { pattern: /socketAuth/i, name: 'Middleware auth Socket' },
    { pattern: /user_\$\{.*userId.*\}/i, name: 'Room utilisateur' },
    { pattern: /app\.set\(['"]io['"].*io\)/i, name: 'Export io vers Express' },
    { pattern: /server\.listen/i, name: 'Server HTTP écoute' }
  ];
  
  checks.forEach(check => {
    if (check.pattern.test(serverContent)) {
      console.log(`✅ ${check.name} configuré`);
    } else {
      console.log(`❌ ${check.name} MANQUANT`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lecture server.js:', error.message);
}

// 🔍 ÉTAPE 3: VÉRIFIER CONTROLLER WEBSOCKET
console.log('\n📡 ÉTAPE 3: Vérification controller WebSocket...');

try {
  const controllerContent = fs.readFileSync('c:/memoire/backend/controllers/collectionShareCodeController.js', 'utf8');
  
  const controllerChecks = [
    { pattern: /req\.app\.get\(['"]io['"]\)/i, name: 'Récupération instance io' },
    { pattern: /io\.to\(['"]user_\$\{.*userId.*\}['"]\)/i, name: 'Émission vers room utilisateur' },
    { pattern: /emit\(['"]newCollection['"]/i, name: 'Événement newCollection' }
  ];
  
  controllerChecks.forEach(check => {
    if (check.pattern.test(controllerContent)) {
      console.log(`✅ ${check.name} configuré`);
    } else {
      console.log(`❌ ${check.name} MANQUANT`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lecture controller:', error.message);
}

// 🔍 ÉTAPE 4: VÉRIFIER FICHIERS FRONTEND
console.log('\n🎨 ÉTAPE 4: Vérification fichiers frontend...');

const frontendFiles = [
  'c:/memoire/spaced-revision/src/contexts/DataContext.js',
  'c:/memoire/spaced-revision/package.json'
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${path.basename(file)} existe`);
  } else {
    console.log(`❌ ${path.basename(file)} MANQUANT`);
  }
});

// 🔍 ÉTAPE 5: VÉRIFIER CONTENU DATACONTEXT
console.log('\n⚛️ ÉTAPE 5: Vérification DataContext...');

try {
  const dataContextContent = fs.readFileSync('c:/memoire/spaced-revision/src/contexts/DataContext.js', 'utf8');
  
  const frontendChecks = [
    { pattern: /import.*socket\.io-client/i, name: 'Import socket.io-client' },
    { pattern: /importCollectionByCodeWebSocket/i, name: 'Fonction WebSocket import' },
    { pattern: /socketRef\.current.*io\(/i, name: 'Création connexion Socket' },
    { pattern: /on\(['"]newCollection['"]/i, name: 'Écoute événement newCollection' },
    { pattern: /toast\.success/i, name: 'Notifications toast' },
    { pattern: /socketConnected/i, name: 'État connexion Socket' }
  ];
  
  frontendChecks.forEach(check => {
    if (check.pattern.test(dataContextContent)) {
      console.log(`✅ ${check.name} configuré`);
    } else {
      console.log(`❌ ${check.name} MANQUANT`);
    }
  });
  
} catch (error) {
  console.log('❌ Erreur lecture DataContext:', error.message);
}

// 🔍 ÉTAPE 6: VÉRIFIER DÉPENDANCES
console.log('\n📦 ÉTAPE 6: Vérification dépendances...');

// Backend dependencies
try {
  const backendPackage = JSON.parse(fs.readFileSync('c:/memoire/backend/package.json', 'utf8'));
  
  if (backendPackage.dependencies && backendPackage.dependencies['socket.io']) {
    console.log(`✅ Backend: socket.io v${backendPackage.dependencies['socket.io']}`);
  } else {
    console.log('❌ Backend: socket.io MANQUANT');
  }
} catch (error) {
  console.log('❌ Erreur lecture package.json backend');
}

// Frontend dependencies  
try {
  const frontendPackage = JSON.parse(fs.readFileSync('c:/memoire/spaced-revision/package.json', 'utf8'));
  
  if (frontendPackage.dependencies && frontendPackage.dependencies['socket.io-client']) {
    console.log(`✅ Frontend: socket.io-client v${frontendPackage.dependencies['socket.io-client']}`);
  } else {
    console.log('❌ Frontend: socket.io-client MANQUANT');
  }
} catch (error) {
  console.log('❌ Erreur lecture package.json frontend');
}

// 🔍 RÉSUMÉ FINAL
console.log('\n🎯 RÉSUMÉ VALIDATION');
console.log('====================');
console.log('✅ Si tous les checks sont verts → PRÊT POUR TEST');
console.log('❌ Si des checks sont rouges → CORRIGER AVANT TEST');

console.log('\n📋 PROCHAINES ÉTAPES:');
console.log('1. npm install dans backend ET frontend');
console.log('2. Démarrer backend: cd c:/memoire/backend && npm start');
console.log('3. Démarrer frontend: cd c:/memoire/spaced-revision && npm start');
console.log('4. Exécuter: GUIDE_TEST_WEBSOCKET_REALTIME.md');

console.log('\n🚀 SYSTÈME WEBSOCKET TEMPS RÉEL PRÊT ! 🚀');
