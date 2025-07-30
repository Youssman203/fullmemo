/**
 * 🔍 DIAGNOSTIC COMPLET PROBLÈME AUTHENTIFICATION
 * À exécuter dans la console du navigateur
 */

console.log('🚨 DIAGNOSTIC COMPLET AUTHENTIFICATION');
console.log('====================================');

// 1. État localStorage
console.log('\n1. 📁 ÉTAT LOCALSTORAGE:');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('   Token existe:', !!token);
console.log('   Token valeur:', token?.substring(0, 50) + '...' || 'null');
console.log('   Token type:', typeof token);
console.log('   User existe:', !!user);
console.log('   User valeur:', user?.substring(0, 100) + '...' || 'null');
console.log('   User type:', typeof user);

// 2. Test isAuthenticated logic
console.log('\n2. 🔒 TEST LOGIQUE isAuthenticated:');
const tokenOK = !!token && token !== 'undefined' && token !== 'null';
const userOK = !!user && user !== 'undefined' && user !== 'null';
const isAuth = tokenOK && userOK;

console.log('   Token OK:', tokenOK);
console.log('   User OK:', userOK);
console.log('   isAuthenticated:', isAuth);

// 3. Si pas authentifié, diagnostiquer pourquoi
if (!isAuth) {
  console.log('\n3. ❌ RAISON NON AUTHENTIFIÉ:');
  if (!token) console.log('   - Pas de token');
  if (token === 'undefined') console.log('   - Token = "undefined"');
  if (token === 'null') console.log('   - Token = "null"');
  if (!user) console.log('   - Pas de données user');
  if (user === 'undefined') console.log('   - User = "undefined"');
  if (user === 'null') console.log('   - User = "null"');
}

// 4. Test validité token si présent
if (token && token !== 'undefined' && token !== 'null') {
  console.log('\n4. 🔍 ANALYSE TOKEN:');
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    
    console.log('   User ID:', payload.id);
    console.log('   Émis le:', new Date(payload.iat * 1000));
    console.log('   Expire le:', new Date(payload.exp * 1000));
    console.log('   Maintenant:', new Date());
    console.log('   Expiré:', isExpired);
    console.log('   Temps restant (min):', Math.floor((payload.exp - now) / 60));
    
    if (isExpired) {
      console.log('   🚨 TOKEN EXPIRÉ - C\'EST LE PROBLÈME !');
    }
  } catch (e) {
    console.log('   ❌ Token malformé:', e.message);
  }
}

// 5. Test user data si présent
if (user && user !== 'undefined' && user !== 'null') {
  console.log('\n5. 👤 ANALYSE USER DATA:');
  try {
    const userData = JSON.parse(user);
    console.log('   Nom:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Rôle:', userData.role);
    console.log('   ID:', userData._id);
  } catch (e) {
    console.log('   ❌ User data malformé:', e.message);
  }
}

// 6. Recommandations
console.log('\n6. 💡 RECOMMANDATIONS:');
if (!isAuth) {
  console.log('   🔧 SOLUTION: Reconnectez-vous');
  console.log('   📧 Email: etudiant.test@example.com');
  console.log('   🔐 Password: password123');
  
  console.log('\n   📋 ÉTAPES:');
  console.log('   1. Aller sur /login');
  console.log('   2. Se connecter avec les identifiants ci-dessus');
  console.log('   3. Revenir tester l\'import');
} else {
  console.log('   ✅ Authentification OK - Le problème est ailleurs');
  console.log('   🔍 Vérifier les logs de l\'import dans la console');
}

// 7. Clear auth si nécessaire
console.log('\n7. 🧹 NETTOYAGE (si nécessaire):');
console.log('   Pour nettoyer complètement:');
console.log('   > localStorage.clear(); sessionStorage.clear(); location.reload();');
