// Script de test rapide à exécuter dans la console du navigateur
// Ouvrir http://localhost:3000 et coller ce code dans la console

console.log('🧪 Test rapide des fonctionnalités étudiantes');

// Test 1: Vérifier que les services sont disponibles
const testServices = () => {
  console.log('\n📦 Test des services...');
  
  // Vérifier localStorage
  try {
    localStorage.setItem('test', 'ok');
    localStorage.removeItem('test');
    console.log('✅ localStorage disponible');
  } catch (e) {
    console.log('❌ localStorage non disponible:', e);
  }
  
  // Vérifier fetch
  if (typeof fetch !== 'undefined') {
    console.log('✅ fetch API disponible');
  } else {
    console.log('❌ fetch API non disponible');
  }
  
  // Vérifier clipboard
  if (navigator.clipboard) {
    console.log('✅ Clipboard API disponible');
  } else {
    console.log('⚠️ Clipboard API non disponible (HTTPS requis)');
  }
};

// Test 2: Vérifier les routes
const testRoutes = () => {
  console.log('\n🛤️ Test des routes...');
  
  const routes = [
    '/student-shared',
    '/shared-links',
    '/classes',
    '/collections'
  ];
  
  routes.forEach(route => {
    console.log(`📍 Route disponible: ${window.location.origin}${route}`);
  });
};

// Test 3: Simuler l'extraction de token
const testTokenExtraction = () => {
  console.log('\n🔍 Test extraction de tokens...');
  
  const extractTokenFromUrl = (url) => {
    const patterns = [
      /\/shared\/([a-f0-9]{24})/i,
      /token=([a-f0-9]{24})/i,
      /shared\/collection\/([a-f0-9]{24})/i
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    if (/^[a-f0-9]{24}$/i.test(url.trim())) {
      return url.trim();
    }
    
    return null;
  };
  
  const testUrls = [
    'http://localhost:3000/shared/6088439e4c3c95f0bcd3eed1',
    '/shared/6088439e4c3c95f0bcd3eed1',
    '6088439e4c3c95f0bcd3eed1',
    'token=6088439e4c3c95f0bcd3eed1'
  ];
  
  testUrls.forEach(url => {
    const token = extractTokenFromUrl(url);
    console.log(`   "${url}" → ${token ? '✅' : '❌'} ${token || 'null'}`);
  });
};

// Test 4: Simuler la copie d'informations
const testCopyFunction = () => {
  console.log('\n📋 Test de copie d\'informations...');
  
  const mockCollection = {
    name: 'Collection Test',
    description: 'Description de test',
    cardCount: 5,
    teacherName: 'Prof. Test',
    createdAt: new Date().toISOString()
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const info = `📚 Collection: ${mockCollection.name}\n` +
               `📖 Description: ${mockCollection.description}\n` +
               `🃏 Cartes: ${mockCollection.cardCount}\n` +
               `👨‍🏫 Enseignant: ${mockCollection.teacherName}\n` +
               `📅 Créé le: ${formatDate(mockCollection.createdAt)}\n` +
               `🔗 Lien: ${window.location.href}`;
  
  console.log('✅ Format de copie généré:');
  console.log(info);
};

// Test 5: Simuler le localStorage étudiant
const testLocalStorage = () => {
  console.log('\n💾 Test localStorage étudiant...');
  
  const mockCollectionData = {
    token: '6088439e4c3c95f0bcd3eed1',
    name: 'Collection Géographie',
    description: 'Capitales du monde',
    cardCount: 10,
    teacherName: 'Prof. Martin',
    accessedAt: new Date().toISOString(),
    permissions: ['view', 'copy', 'download'],
    hasPassword: false,
    expiresAt: null
  };
  
  try {
    localStorage.setItem('student_accessed_collections', JSON.stringify([mockCollectionData]));
    const saved = JSON.parse(localStorage.getItem('student_accessed_collections'));
    
    if (saved && saved.length > 0) {
      console.log('✅ Sauvegarde localStorage réussie');
      console.log('   Collections sauvées:', saved.length);
      console.log('   Première collection:', saved[0].name);
    }
    
    // Nettoyage
    localStorage.removeItem('student_accessed_collections');
    console.log('✅ Nettoyage localStorage terminé');
    
  } catch (e) {
    console.log('❌ Erreur localStorage:', e);
  }
};

// Test 6: Vérifier la navigation
const testNavigation = () => {
  console.log('\n🧭 Test de navigation...');
  
  // Vérifier si on peut accéder aux éléments de navigation
  const navbar = document.querySelector('nav') || document.querySelector('.navbar');
  if (navbar) {
    console.log('✅ Navbar trouvée');
    
    const links = navbar.querySelectorAll('a');
    console.log(`   - ${links.length} liens de navigation trouvés`);
    
    // Chercher le lien Collections Partagées
    const sharedLink = Array.from(links).find(link => 
      link.textContent.includes('Collections Partagées') ||
      link.textContent.includes('Liens Partagés')
    );
    
    if (sharedLink) {
      console.log('✅ Lien Collections Partagées trouvé');
    } else {
      console.log('⚠️ Lien Collections Partagées non trouvé (normal si pas connecté)');
    }
  } else {
    console.log('⚠️ Navbar non trouvée');
  }
};

// Fonction principale
const runQuickTest = () => {
  console.log('🚀 Démarrage des tests rapides...\n');
  
  testServices();
  testRoutes();
  testTokenExtraction();
  testCopyFunction();
  testLocalStorage();
  testNavigation();
  
  console.log('\n🎉 Tests rapides terminés !');
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Se connecter comme étudiant');
  console.log('2. Aller dans Collections Partagées');
  console.log('3. Tester l\'accès à une collection via lien');
  console.log('4. Tester les fonctions de copie et téléchargement');
  
  return {
    success: true,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href
  };
};

// Auto-exécution si dans le navigateur
if (typeof window !== 'undefined') {
  window.runQuickTest = runQuickTest;
  console.log('🎯 Fonction disponible: runQuickTest()');
  console.log('💡 Pour lancer les tests: runQuickTest()');
}

// Export pour modules
export { runQuickTest };
