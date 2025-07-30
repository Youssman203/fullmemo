// 🔍 DIAGNOSTIC IMMÉDIAT - Copier-coller dans la console du navigateur

console.log('🚨 DIAGNOSTIC AUTHENTIFICATION IMMÉDIAT');
console.log('=====================================');

// Vérification rapide
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('✅ Statut connexion:');
console.log('   Token présent:', !!token);
console.log('   User présent:', !!user);

if (!token || !user) {
  console.log('');
  console.log('❌ VOUS N\'ÊTES PAS CONNECTÉ !');
  console.log('');
  console.log('🔧 ACTIONS IMMÉDIATES:');
  console.log('1. Aller sur la page de connexion');
  console.log('2. Utiliser ces identifiants:');
  console.log('   📧 Email: etudiant.test@example.com');
  console.log('   🔐 Password: password123');
  console.log('3. Ignorer les erreurs Google OAuth');
  console.log('4. Une fois connecté, revenir ici');
  console.log('');
  console.log('⚠️ Les erreurs "Utilisateur non authentifié" viennent de là !');
} else {
  console.log('');
  console.log('✅ CONNECTÉ ! Analysons le token...');
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    
    console.log('👤 Utilisateur:', JSON.parse(user).name);
    console.log('⏰ Token expire le:', new Date(payload.exp * 1000));
    console.log('🚨 Token expiré:', isExpired);
    
    if (isExpired) {
      console.log('');
      console.log('❌ TOKEN EXPIRÉ - RECONNEXION REQUISE');
      console.log('🔄 Reconnectez-vous avec: etudiant.test@example.com');
    } else {
      console.log('');
      console.log('✅ TOKEN VALIDE - PRÊT POUR IMPORT');
      console.log('🎯 Code de test: I44WPL');
    }
  } catch (e) {
    console.log('❌ Token corrompu:', e.message);
  }
}
