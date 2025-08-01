// Test simple des APIs admin sans dépendances externes
console.log('🧪 Test des APIs Admin - Version Simple\n');

const testInstructions = `
📋 TESTS API ADMIN - Instructions Manuelles

🔐 ÉTAPE 1: Se connecter comme admin
Aller sur http://localhost:3000 et ouvrir la console (F12)

🧪 ÉTAPE 2: Exécuter les tests dans la console navigateur

// 1. Vérifier l'authentification admin
console.log('1. Test Auth Admin:');
const userStr = localStorage.getItem('user');
const user = userStr ? JSON.parse(userStr) : null;
console.log('Utilisateur connecté:', user?.name, '- Rôle:', user?.role);
console.log('Est admin:', user?.role === 'admin' ? '✅ OUI' : '❌ NON');

// 2. Test API - Liste des utilisateurs  
console.log('\\n2. Test API Users:');
fetch('/api/admin/users', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Users API:', data.users?.length || 0, 'utilisateurs');
  console.log('Premiers utilisateurs:', data.users?.slice(0,2));
})
.catch(err => console.log('❌ Erreur Users API:', err));

// 3. Test API - Statistiques système
console.log('\\n3. Test API Stats:');
fetch('/api/admin/stats', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('✅ Stats API:');
  console.log('  Total users:', data.totalUsers);
  console.log('  Students:', data.totalStudents);
  console.log('  Teachers:', data.totalTeachers);
  console.log('  Collections:', data.totalCollections);
})
.catch(err => console.log('❌ Erreur Stats API:', err));

// 4. Test Création d'utilisateur (optionnel)
console.log('\\n4. Test Create User (optionnel):');
const testUserData = {
  name: 'Test API User',
  email: 'test-api-' + Date.now() + '@example.com',
  password: 'testpass123',
  role: 'student'
};

fetch('/api/admin/users', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(testUserData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ Create User:', data.user?.name, 'créé avec ID:', data.user?._id);
})
.catch(err => console.log('❌ Erreur Create User:', err));

🎯 RÉSULTATS ATTENDUS:
✅ Auth Admin: OUI
✅ Users API: X utilisateurs  
✅ Stats API: Statistiques complètes
✅ Create User: Nouvel utilisateur créé

❌ Si erreurs:
- Vérifier connexion admin
- Vérifier serveur backend actif (port 5000)
- Vérifier token JWT valide
- Vérifier middleware requireAdmin
`;

console.log(testInstructions);

// Instructions supplémentaires
console.log('\n🚀 ÉTAPES RAPIDES:');
console.log('1. Ouvrir http://localhost:3000/login');
console.log('2. Se connecter: admin@spaced-revision.com / admin123');  
console.log('3. Appuyer F12 pour ouvrir console');
console.log('4. Copier-coller les tests ci-dessus');
console.log('5. Vérifier les résultats ✅');

console.log('\n🎯 URLs Directes:');
console.log('- Login: http://localhost:3000/login');
console.log('- Admin Dashboard: http://localhost:3000/admin');
console.log('- API Users: http://localhost:5000/api/admin/users');
console.log('- API Stats: http://localhost:5000/api/admin/stats');

console.log('\n✅ Tests API prêts à être exécutés !');
console.log('📋 Suivre la checklist: CHECKLIST_ADMIN_TEST.md');
