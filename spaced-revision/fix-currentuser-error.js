/**
 * Script de diagnostic et réparation pour l'erreur currentUser persistante
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnostic de l\'erreur currentUser persistante\n');

// 1. Vérifier le contenu exact du fichier Evaluation.js
const evaluationPath = path.join(__dirname, 'src', 'pages', 'Evaluation.js');

try {
  console.log('1️⃣ Lecture du fichier Evaluation.js...');
  const content = fs.readFileSync(evaluationPath, 'utf8');
  
  // Chercher toutes les occurrences de currentUser
  const lines = content.split('\n');
  let foundCurrentUser = false;
  
  lines.forEach((line, index) => {
    if (line.includes('currentUser')) {
      console.log(`❌ Ligne ${index + 1}: ${line.trim()}`);
      foundCurrentUser = true;
    }
  });
  
  if (!foundCurrentUser) {
    console.log('✅ Aucune occurrence de "currentUser" trouvée dans Evaluation.js');
  }
  
  // Vérifier s'il y a des espaces invisibles ou caractères cachés
  const line66 = lines[65]; // Index 65 = ligne 66
  if (line66) {
    console.log(`\n2️⃣ Contenu exact ligne 66:`);
    console.log(`Texte: "${line66}"`);
    console.log(`Longueur: ${line66.length}`);
    console.log(`Codes char:`, line66.split('').map(c => c.charCodeAt(0)));
    
    if (line66.includes('currentUser')) {
      console.log('❌ currentUser trouvé ligne 66 - Correction nécessaire');
      
      // Corriger la ligne
      const correctedLine = line66.replace(/currentUser/g, 'user');
      lines[65] = correctedLine;
      
      // Réécrire le fichier
      const correctedContent = lines.join('\n');
      fs.writeFileSync(evaluationPath, correctedContent, 'utf8');
      console.log('✅ Ligne 66 corrigée automatiquement');
    }
  }
  
} catch (error) {
  console.error('❌ Erreur lecture fichier:', error.message);
}

// 2. Vérifier les autres fichiers suspects
const filesToCheck = [
  'src/pages/Stats.js',
  'src/App.js'
];

console.log('\n3️⃣ Vérification autres fichiers...');

filesToCheck.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('currentUser')) {
        console.log(`❌ currentUser trouvé dans ${filePath}`);
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (line.includes('currentUser')) {
            console.log(`   Ligne ${index + 1}: ${line.trim()}`);
          }
        });
      } else {
        console.log(`✅ ${filePath} - OK`);
      }
    }
  } catch (err) {
    console.log(`⚠️  Impossible de vérifier ${filePath}`);
  }
});

// 3. Nettoyer tous les caches possibles
console.log('\n4️⃣ Nettoyage des caches...');

const cacheDirs = [
  'node_modules/.cache',
  '.eslintcache',
  'build'
];

cacheDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✅ ${dir} supprimé`);
    } catch (err) {
      console.log(`⚠️  Impossible de supprimer ${dir}`);
    }
  } else {
    console.log(`ℹ️  ${dir} n'existe pas`);
  }
});

console.log('\n✅ Diagnostic terminé');
console.log('\n📋 Actions recommandées:');
console.log('1. Relancez le serveur de développement (npm start)');
console.log('2. Si l\'erreur persiste, redémarrez complètement votre éditeur');
console.log('3. Vérifiez qu\'aucun autre processus node n\'est en cours');
