/**
 * Script pour remplacer "Étudiant" par "Apprenant" dans toute l'application
 * Exécuter depuis la racine : node replace-student-by-learner.js
 */

const fs = require('fs');
const path = require('path');

// Configuration des remplacements
const replacements = [
  // Français - Interface utilisateur
  { from: /Étudiant(?!s)/g, to: 'Apprenant' },
  { from: /étudiant(?!s)/g, to: 'apprenant' },
  { from: /Étudiants/g, to: 'Apprenants' },
  { from: /étudiants/g, to: 'apprenants' },
  { from: /ÉTUDIANT(?!S)/g, to: 'APPRENANT' },
  { from: /ÉTUDIANTS/g, to: 'APPRENANTS' },
  
  // Anglais - Code et variables (garder pour compatibilité backend)
  // On ne change pas les noms de variables/fonctions pour éviter de casser l'API
  // Seulement les textes d'interface
];

// Dossiers à traiter
const directories = [
  'spaced-revision/src',
  'backend' // On traitera aussi le backend pour les messages/commentaires
];

// Extensions de fichiers à traiter
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

// Fichiers à exclure
const excludeFiles = [
  'node_modules',
  '.git',
  'package-lock.json',
  'yarn.lock',
  '.env'
];

function shouldProcessFile(filePath) {
  // Exclure les dossiers/fichiers spécifiques
  for (const exclude of excludeFiles) {
    if (filePath.includes(exclude)) return false;
  }
  
  // Vérifier l'extension
  const ext = path.extname(filePath);
  return fileExtensions.includes(ext);
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let changes = [];
    
    // Appliquer chaque remplacement
    for (const replacement of replacements) {
      const matches = content.match(replacement.from);
      if (matches) {
        content = content.replace(replacement.from, replacement.to);
        modified = true;
        changes.push(`${matches.length}x "${replacement.from}" → "${replacement.to}"`);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(`   ${change}`));
    }
    
    return modified;
  } catch (error) {
    console.error(`❌ Erreur traitement ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dirPath) {
  const fullPath = path.join(__dirname, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Dossier non trouvé: ${dirPath}`);
    return 0;
  }
  
  let processedFiles = 0;
  
  function walkDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const itemPath = path.join(currentPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        walkDirectory(itemPath);
      } else if (stat.isFile() && shouldProcessFile(itemPath)) {
        if (processFile(itemPath)) {
          processedFiles++;
        }
      }
    }
  }
  
  walkDirectory(fullPath);
  return processedFiles;
}

// Exécution principale
console.log('🔄 Remplacement "Étudiant" → "Apprenant" dans toute l\'application\n');

let totalModifiedFiles = 0;

for (const dir of directories) {
  console.log(`\n📁 Traitement du dossier: ${dir}`);
  const modifiedFiles = processDirectory(dir);
  totalModifiedFiles += modifiedFiles;
  console.log(`   ${modifiedFiles} fichier(s) modifié(s)`);
}

console.log(`\n🎉 Remplacement terminé !`);
console.log(`📊 Total: ${totalModifiedFiles} fichier(s) modifié(s)`);

if (totalModifiedFiles > 0) {
  console.log('\n📋 Actions recommandées:');
  console.log('1. Vérifiez que l\'application se compile sans erreur');
  console.log('2. Testez les fonctionnalités principales');
  console.log('3. Vérifiez l\'interface utilisateur');
  console.log('4. Redémarrez les serveurs (frontend et backend)');
}
