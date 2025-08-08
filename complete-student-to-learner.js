/**
 * Script amélioré pour remplacer "Étudiant" par "Apprenant" dans toute l'application
 */

const fs = require('fs');
const path = require('path');

// Configuration des remplacements - Interface utilisateur seulement
const replacements = [
  // Français - Textes d'interface
  { from: /Étudiant(?!s)/g, to: 'Apprenant', description: 'Étudiant → Apprenant' },
  { from: /étudiant(?!s)/g, to: 'apprenant', description: 'étudiant → apprenant' },
  { from: /Étudiants/g, to: 'Apprenants', description: 'Étudiants → Apprenants' },
  { from: /étudiants/g, to: 'apprenants', description: 'étudiants → apprenants' },
  
  // Messages spécifiques
  { from: /"Étudiant"/g, to: '"Apprenant"', description: '"Étudiant" → "Apprenant"' },
  { from: /"étudiant"/g, to: '"apprenant"', description: '"étudiant" → "apprenant"' },
  { from: /"Étudiants"/g, to: '"Apprenants"', description: '"Étudiants" → "Apprenants"' },
  { from: /"étudiants"/g, to: '"apprenants"', description: '"étudiants" → "apprenants"' },
  
  // Dans les commentaires
  { from: /\/\/.*Étudiant/g, to: (match) => match.replace('Étudiant', 'Apprenant'), description: 'Commentaires Étudiant' },
  { from: /\/\*.*Étudiant.*\*\//g, to: (match) => match.replace('Étudiant', 'Apprenant'), description: 'Commentaires blocs Étudiant' },
];

// Dossiers à traiter
const searchPaths = [
  'spaced-revision/src',
  'backend/controllers',
  'backend/models',
  'backend/routes'
];

function processFileContent(filePath, content) {
  let modified = false;
  let changes = [];
  let newContent = content;
  
  for (const replacement of replacements) {
    const beforeLength = newContent.length;
    
    if (typeof replacement.to === 'function') {
      newContent = newContent.replace(replacement.from, replacement.to);
    } else {
      newContent = newContent.replace(replacement.from, replacement.to);
    }
    
    if (newContent.length !== beforeLength) {
      modified = true;
      const matches = content.match(replacement.from) || [];
      changes.push(`${matches.length}x ${replacement.description}`);
    }
  }
  
  return { modified, newContent, changes };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { modified, newContent, changes } = processFileContent(filePath, content);
    
    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(`   ${change}`));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ ${filePath}: ${error.message}`);
    return false;
  }
}

function findFiles(dirPath, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const files = [];
  
  function walk(currentPath) {
    try {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.startsWith('.')) {
          walk(fullPath);
        } else if (stat.isFile() && extensions.includes(path.extname(item))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore les erreurs d'accès
    }
  }
  
  if (fs.existsSync(dirPath)) {
    walk(dirPath);
  }
  
  return files;
}

// Exécution
console.log('🎯 Remplacement terminologique "Étudiant" → "Apprenant"\n');

let totalFiles = 0;
let modifiedFiles = 0;

for (const searchPath of searchPaths) {
  const fullPath = path.join(__dirname, searchPath);
  console.log(`📁 Analyse: ${searchPath}`);
  
  const files = findFiles(fullPath);
  totalFiles += files.length;
  
  for (const file of files) {
    if (processFile(file)) {
      modifiedFiles++;
    }
  }
  
  console.log(`   ${files.length} fichiers analysés\n`);
}

console.log(`🎉 Terminé !`);
console.log(`📊 ${modifiedFiles}/${totalFiles} fichiers modifiés`);
console.log('\n💡 Redémarrez les serveurs pour voir les changements');
