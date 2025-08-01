console.log('🔐 Script de Test - Connexion Admin\n');

console.log('📋 Instructions pour tester la connexion admin:\n');

console.log('1. 🚀 DÉMARRER LES SERVEURS:');
console.log('   Terminal 1 (Backend):');
console.log('     cd backend && npm start');
console.log('   Terminal 2 (Frontend):');
console.log('     cd spaced-revision && npm start\n');

console.log('2. 🔧 CRÉER/VÉRIFIER LE COMPTE ADMIN:');
console.log('   cd backend');
console.log('   node scripts/createAdminUser.js\n');

console.log('3. 🧪 TESTER LA CONNEXION:');
console.log('   • Aller sur: http://localhost:3000/login');
console.log('   • Email: admin@spaced-revision.com');
console.log('   • Mot de passe: admin123\n');

console.log('4. ✅ RÉSULTAT ATTENDU:');
console.log('   • Badge "👑 ADMINISTRATEUR" visible');
console.log('   • Sidebar avec uniquement 3 liens admin:');
console.log('     - Dashboard Admin');
console.log('     - Gestion Utilisateurs');
console.log('     - Statistiques Système');
console.log('   • Pas d\'éléments étudiants/enseignants\n');

console.log('5. 🔍 SI ÇA NE FONCTIONNE PAS:');
console.log('   • Vérifier les logs dans la console navigateur (F12)');
console.log('   • Vérifier que les serveurs tournent sur ports 5000 et 3000');
console.log('   • Tester avec un autre navigateur (mode privé)\n');

console.log('🎯 Interface Admin Maintenant Séparée:');
console.log('✅ Pas d\'Accueil, Collections, Cartes, Révisions, Statistiques');
console.log('✅ Seulement les fonctions d\'administration');
console.log('✅ Badge "Administrateur" distinct');
