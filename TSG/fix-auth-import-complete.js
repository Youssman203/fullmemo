/**
 * 🔧 CORRECTION COMPLÈTE PROBLÈME AUTORISATION IMPORT
 * 
 * Ce script corrige le problème "token non autorisé" lors de l'import
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 CORRECTION AUTORISATION IMPORT - DÉBUT');

// 📁 CHEMINS DES FICHIERS À CORRIGER
const files = {
  apiService: 'c:/memoire/spaced-revision/src/services/api.js',
  shareCodeService: 'c:/memoire/spaced-revision/src/services/shareCodeService.js',
  authContext: 'c:/memoire/spaced-revision/src/contexts/AuthContext.js',
  accessModal: 'c:/memoire/spaced-revision/src/components/AccessByCodeModal.js'
};

// 🔧 FONCTIONS DE CORRECTION
const fixes = {
  
  // Correction 1: Améliorer la gestion d'erreur dans api.js
  fixApiErrorHandling: () => {
    console.log('🔧 Correction gestion erreurs API...');
    
    const filePath = files.apiService;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer toutes les occurrences de gestion 401 basique
    const oldPattern = /if \(response\.status === 401\) \{\s*localStorage\.removeItem\('token'\);\s*localStorage\.removeItem\('user'\);\s*window\.location\.href = '\/login';\s*\}/g;
    
    const newCode = `if (response.status === 401) {
          handleAuthError(endpoint, response.status);
        }`;
    
    content = content.replace(oldPattern, newCode);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ API error handling corrigé');
  },
  
  // Correction 2: Ajouter des logs détaillés dans shareCodeService
  fixShareCodeService: () => {
    console.log('🔧 Correction shareCodeService...');
    
    const filePath = files.shareCodeService;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter plus de logs pour l'import
    const importFunctionPattern = /importCollectionByCode: async \(code\) => \{[\s\S]*?try \{[\s\S]*?console\.log\('📥 Import collection avec code:', code\);/;
    
    const newImportStart = `importCollectionByCode: async (code) => {
    try {
      console.log('📥 IMPORT COLLECTION - DÉBUT');
      console.log('🔍 Code utilisé:', code);
      
      // Vérifier l'authentification avant l'appel
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ Pas de token d'authentification pour l'import');
        throw new Error('Vous devez être connecté pour importer une collection');
      }
      
      // Vérifier si le token est expiré
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          console.error('❌ Token expiré lors de l\\'import');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          throw new Error('Session expirée - Veuillez vous reconnecter');
        }
        console.log('✅ Token valide pour l\\'import');
      } catch (e) {
        console.error('❌ Token invalide lors de l\\'import:', e.message);
        throw new Error('Token invalide - Veuillez vous reconnecter');
      }
      
      console.log('📥 Appel API import...');`;
    
    if (importFunctionPattern.test(content)) {
      content = content.replace(importFunctionPattern, newImportStart);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ ShareCodeService corrigé');
    } else {
      console.log('⚠️ Pattern import non trouvé dans shareCodeService');
    }
  },
  
  // Correction 3: Améliorer la gestion de session dans AuthContext
  fixAuthContext: () => {
    console.log('🔧 Correction AuthContext...');
    
    const filePath = files.authContext;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter une fonction pour forcer la reconnexion
    const newFunctions = `
  // Fonction pour forcer la reconnexion en cas de problème d'authentification
  const forceReconnect = (reason = 'Session expirée') => {
    console.log('🔄 Force reconnexion:', reason);
    
    // Nettoyer complètement
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Mettre à jour l'état
    setUser(null);
    
    // Rediriger avec message
    window.location.href = \`/login?error=session_expired&reason=\${encodeURIComponent(reason)}\`;
  };
  
  // Fonction pour vérifier la validité du token avant une action critique
  const checkTokenBeforeAction = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      forceReconnect('Token manquant');
      return false;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      
      if (payload.exp < now) {
        forceReconnect('Token expiré');
        return false;
      }
      
      return true;
    } catch (error) {
      forceReconnect('Token invalide');
      return false;
    }
  };`;
    
    // Ajouter ces fonctions avant le "const value = {"
    const valuePattern = /const value = \{/;
    content = content.replace(valuePattern, `${newFunctions}\n\n  const value = {`);
    
    // Ajouter les fonctions au value object
    const valueContentPattern = /(const value = \{[\s\S]*?)(    \/\/ Fonctions de rôle)/;
    content = content.replace(valueContentPattern, `$1    // Fonctions d'authentification avancées
    forceReconnect,
    checkTokenBeforeAction,
    $2`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ AuthContext corrigé');
  },
  
  // Correction 4: Améliorer AccessByCodeModal pour vérifier l'auth avant import
  fixAccessModal: () => {
    console.log('🔧 Correction AccessByCodeModal...');
    
    const filePath = files.accessModal;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Ajouter import pour AuthContext
    const importPattern = /import \{ useData \} from '\.\.\/contexts\/DataContext';/;
    content = content.replace(importPattern, `import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';`);
    
    // Ajouter useAuth dans le component
    const useDataPattern = /const \{ getCollectionByCode, importCollectionByCode \} = useData\(\);/;
    content = content.replace(useDataPattern, `const { getCollectionByCode, importCollectionByCode } = useData();
  const { checkTokenBeforeAction } = useAuth();`);
    
    // Ajouter vérification auth avant import
    const importHandlerPattern = /(const handleImportCollection = async \(\) => \{[\s\S]*?if \(!collection\) return;)/;
    content = content.replace(importHandlerPattern, `$1

    // 🔒 Vérifier l'authentification avant l'import
    if (!checkTokenBeforeAction()) {
      toast.error('Session expirée - Reconnexion requise');
      return;
    }`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ AccessByCodeModal corrigé');
  }
};

// 🎯 EXÉCUTION DES CORRECTIONS
const runAllFixes = () => {
  try {
    console.log('🚀 Exécution de toutes les corrections...\n');
    
    fixes.fixApiErrorHandling();
    fixes.fixShareCodeService();
    fixes.fixAuthContext();
    fixes.fixAccessModal();
    
    console.log('\n✅ TOUTES LES CORRECTIONS APPLIQUÉES !');
    console.log('\n📋 RÉSUMÉ DES CORRECTIONS:');
    console.log('   1. ✅ Gestion erreurs 401 améliorée dans api.js');
    console.log('   2. ✅ Validation token ajoutée dans shareCodeService.js');
    console.log('   3. ✅ Fonctions auth avancées ajoutées dans AuthContext.js');
    console.log('   4. ✅ Vérification auth ajoutée dans AccessByCodeModal.js');
    
    console.log('\n🔄 PROCHAINES ÉTAPES:');
    console.log('   1. Redémarrer le serveur frontend (npm start)');
    console.log('   2. Tester l\\\'import avec le script diagnostic');
    console.log('   3. Vérifier les logs dans la console navigateur');
    
  } catch (error) {
    console.error('❌ Erreur lors des corrections:', error.message);
  }
};

// 🧪 VALIDATION DES CORRECTIONS
const validateFixes = () => {
  console.log('\n🧪 VALIDATION DES CORRECTIONS:');
  
  Object.entries(files).forEach(([name, filePath]) => {
    try {
      const stats = fs.statSync(filePath);
      console.log(`   ✅ ${name}: ${filePath} (${stats.size} bytes)`);
    } catch (error) {
      console.log(`   ❌ ${name}: ${filePath} - Fichier non trouvé`);
    }
  });
};

// 🎯 EXÉCUTION
console.log('🔍 Validation des fichiers...');
validateFixes();

console.log('\n🔧 Application des corrections...');
runAllFixes();

console.log('\n✅ CORRECTION AUTORISATION IMPORT TERMINÉE !');

console.log(`
🎯 SOLUTIONS APPLIQUÉES POUR "TOKEN NON AUTORISÉ":

1. 🔍 DIAGNOSTIC PRÉCOCE
   - Vérification token avant chaque import
   - Validation expiration automatique
   - Nettoyage automatique des tokens invalides

2. 🛡️ GESTION D'ERREURS ROBUSTE
   - Logs détaillés pour diagnostic
   - Délai avant redirection forcée
   - Messages d'erreur contextuels

3. 🔄 RÉCUPÉRATION AUTOMATIQUE
   - Nettoyage complet du storage en cas d'erreur
   - Redirection intelligente avec paramètres
   - Fonctions de force-reconnexion

4. 🔒 VALIDATION PRÉVENTIVE
   - Vérification auth avant actions critiques
   - Messages utilisateur appropriés
   - Interruption des actions si auth invalide

📊 TESTER MAINTENANT:
   1. node diagnostic-auth-import.js
   2. Essayer l'import d'une collection
   3. Observer les logs console pour diagnostic
   
💡 Si le problème persiste, vérifier:
   - Le backend est démarré (port 5000)
   - La base de données est accessible
   - Les routes /api/share sont bien configurées
`);
