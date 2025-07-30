// Test spécifique pour diagnostic ownership des collections importées
console.log('🔍 DIAGNOSTIC OWNERSHIP - Collections Importées');
console.log('='.repeat(55));

console.log('\n📋 PROBLÈME RAPPORTÉ:');
console.log('  "Collection importée par étudiant apparaît chez enseignant"');

console.log('\n🎯 POINTS DE VÉRIFICATION:');
console.log('1. Nouvelle collection créée avec user: userId (étudiant)');
console.log('2. Route /api/collections retourne les bonnes collections pour chaque utilisateur');
console.log('3. Frontend rafraîchit correctement après import');
console.log('4. Cache frontend ne mélange pas les utilisateurs');

console.log('\n🔧 BACKEND - Points à vérifier:');
console.log('- Ligne 235 de importCollectionByCode: user: userId');
console.log('- req.user._id doit être l\'ID de l\'étudiant');
console.log('- Collection.save() doit utiliser le bon owner');

console.log('\n🎨 FRONTEND - Points à vérifier:');
console.log('- DataContext.getUserCollections() utilise le bon token');
console.log('- handleCollectionAccessed() rafraîchit bien');
console.log('- Cache de collections pas partagé entre sessions');

console.log('\n⚠️  HYPOTHÈSES POSSIBLES:');

console.log('\n1. 🔑 PROBLÈME DE TOKEN:');
console.log('   - Enseignant et étudiant partagent le même token');
console.log('   - Token JWT contient mauvais user._id');
console.log('   - localStorage contient token d\'un autre utilisateur');

console.log('\n2. 🗄️  PROBLÈME DE SESSION:');
console.log('   - Utilisateur connecté comme enseignant au lieu d\'étudiant');
console.log('   - Session utilisateur pas mise à jour après changement');
console.log('   - AuthContext retourne mauvais utilisateur');

console.log('\n3. 🔄 PROBLÈME DE CACHE:');
console.log('   - DataContext garde les collections en mémoire');
console.log('   - Pas de clear du cache entre utilisateurs');
console.log('   - Collections mélangées entre sessions');

console.log('\n4. 🌐 PROBLÈME DE RAFRAÎCHISSEMENT:');
console.log('   - getUserCollections() pas appelé côté bon utilisateur');
console.log('   - Callback handleCollectionAccessed pas déclenché');
console.log('   - Interface pas mise à jour après import');

console.log('\n📝 TESTS À EFFECTUER:');

console.log('\n🔍 A. Vérifier Token et Session:');
console.log('   1. Console navigateur: localStorage.getItem("token")');
console.log('   2. Décodage JWT pour voir user._id');
console.log('   3. Vérifier AuthContext.user');
console.log('   4. Confirmer qui est connecté réellement');

console.log('\n🔍 B. Tester API Backend Direct:');
console.log('   1. Import via Postman/curl avec token étudiant');
console.log('   2. Vérifier owner de la nouvelle collection');
console.log('   3. Appeler /api/collections avec token étudiant');
console.log('   4. Appeler /api/collections avec token enseignant');

console.log('\n🔍 C. Tracer Frontend:');
console.log('   1. Logs dans importCollectionByCode()');
console.log('   2. Logs dans handleCollectionAccessed()');
console.log('   3. Logs dans getUserCollections()');
console.log('   4. Vérifier qui appelle le rafraîchissement');

console.log('\n💡 SOLUTIONS POTENTIELLES:');

console.log('\n✅ Si problème de token:');
console.log('   - Forcer déconnexion/reconnexion');
console.log('   - Clear localStorage');
console.log('   - Vérifier création token JWT');

console.log('\n✅ Si problème de session:');
console.log('   - Vérifier AuthContext.user');
console.log('   - Forcer mise à jour session');
console.log('   - Séparer sessions navigateur');

console.log('\n✅ Si problème de cache:');
console.log('   - Clear cache DataContext à la déconnexion');
console.log('   - Forcer re-fetch après import');
console.log('   - Isoler cache par utilisateur');

console.log('\n✅ Si problème de rafraîchissement:');
console.log('   - Appeler refreshData() au lieu de getUserCollections()');
console.log('   - Forcer re-render du composant');
console.log('   - Vérifier callback onCollectionAccessed');

console.log('\n🎯 SCRIPT DE TEST MANUEL:');
console.log('```javascript');
console.log('// Dans console navigateur côté étudiant:');
console.log('// 1. Vérifier utilisateur connecté');
console.log('console.log("Token:", localStorage.getItem("token"));');
console.log('console.log("User:", JSON.parse(localStorage.getItem("user") || "{}"));');
console.log('');
console.log('// 2. Tester API collections directement');
console.log('fetch("/api/collections", {');
console.log('  headers: { Authorization: "Bearer " + localStorage.getItem("token") }');
console.log('}).then(r => r.json()).then(console.log);');
console.log('```');

console.log('\n🚀 PROCHAINES ÉTAPES:');
console.log('1. Exécuter script manuel côté étudiant');
console.log('2. Comparer avec côté enseignant');
console.log('3. Identifier la différence');
console.log('4. Appliquer le correctif approprié');

console.log('\n' + '='.repeat(55));
console.log('✅ Diagnostic terminé - Tests manuels requis');
