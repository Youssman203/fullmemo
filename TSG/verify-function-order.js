// verify-function-order.js
// Vérification de l'ordre des fonctions dans CollectionSelectorModal

const fs = require('fs');
const path = require('path');

console.log('🔍 VÉRIFICATION ORDRE DES FONCTIONS');
console.log('=' .repeat(50));

const filePath = path.join(__dirname, 'spaced-revision/src/components/CollectionSelectorModal.js');

if (!fs.existsSync(filePath)) {
  console.log('❌ Fichier CollectionSelectorModal.js non trouvé');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Rechercher les positions importantes
let fetchCallbackPos = -1;
let firstUseEffectPos = -1;
let secondUseEffectPos = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.includes('const fetchClassCollections = useCallback')) {
    fetchCallbackPos = i + 1;
    console.log(`📍 fetchClassCollections définie ligne ${fetchCallbackPos}`);
  }
  
  if (line.includes('useEffect(() => {') && line.includes('fetchClassCollections') === false) {
    if (i < 100 && firstUseEffectPos === -1) { // Premier useEffect dans les 100 premières lignes
      firstUseEffectPos = i + 1;
      console.log(`📍 Premier useEffect ligne ${firstUseEffectPos}`);
    }
  }
  
  if (line.includes('// 🔥 WEBSOCKET')) {
    secondUseEffectPos = i + 1;
    console.log(`📍 WebSocket useEffect ligne ${secondUseEffectPos}`);
  }
}

console.log('\n📊 ANALYSE DE L\'ORDRE:');

if (fetchCallbackPos === -1) {
  console.log('❌ fetchClassCollections useCallback non trouvé');
} else if (firstUseEffectPos === -1) {
  console.log('❌ Premier useEffect non trouvé');
} else if (secondUseEffectPos === -1) {
  console.log('❌ WebSocket useEffect non trouvé');
} else {
  console.log('\nOrdre des éléments:');
  console.log(`1. fetchClassCollections: ligne ${fetchCallbackPos}`);
  console.log(`2. Premier useEffect: ligne ${firstUseEffectPos}`);
  console.log(`3. WebSocket useEffect: ligne ${secondUseEffectPos}`);
  
  if (fetchCallbackPos < firstUseEffectPos && fetchCallbackPos < secondUseEffectPos) {
    console.log('\n✅ ORDRE CORRECT !');
    console.log('✅ fetchClassCollections est définie AVANT les useEffect');
    console.log('✅ L\'erreur "Cannot access before initialization" devrait être corrigée');
    
    // Vérifier les dépendances
    const hasCorrectDeps = content.includes('[show, classId, fetchClassCollections]');
    if (hasCorrectDeps) {
      console.log('✅ Dépendances useEffect correctes');
    } else {
      console.log('⚠️ Vérifier les dépendances du premier useEffect');
    }
    
  } else {
    console.log('\n❌ ORDRE INCORRECT !');
    console.log('❌ fetchClassCollections doit être définie AVANT les useEffect');
  }
}

console.log('\n🚀 STATUS:');
if (fetchCallbackPos > 0 && fetchCallbackPos < firstUseEffectPos) {
  console.log('✅ Le composant devrait maintenant fonctionner sans erreur');
  console.log('✅ Rechargez la page pour tester le sélecteur de collections');
} else {
  console.log('❌ Des ajustements supplémentaires peuvent être nécessaires');
}

console.log('\n📋 PROCHAINES ÉTAPES:');
console.log('1. Rafraîchir la page dans le navigateur (F5)');
console.log('2. Tester l\'ouverture du sélecteur de collections');
console.log('3. Vérifier que les collections s\'affichent correctement');
console.log('4. Tester le WebSocket avec un partage enseignant-étudiant');

console.log('\n' + '=' .repeat(50));
