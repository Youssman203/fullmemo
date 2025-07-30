/**
 * 🔍 VÉRIFICATION AUTHENTIFICATION FRONTEND
 * À exécuter dans la console du navigateur
 */

console.log('🔍 DIAGNOSTIC AUTHENTIFICATION FRONTEND');
console.log('========================================');

// 1. Vérifier le localStorage
console.log('\n1. État du localStorage:');
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token présent:', !!token);
console.log('User présent:', !!user);

if (token) {
  console.log('Token (50 premiers caractères):', token.substring(0, 50) + '...');
  
  // Décoder le token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('📊 Token info:');
    console.log('   User ID:', payload.id);
    console.log('   Émis le:', new Date(payload.iat * 1000));
    console.log('   Expire le:', new Date(payload.exp * 1000));
    console.log('   Maintenant:', new Date());
    console.log('   ⏰ Expiré:', payload.exp < Math.floor(Date.now() / 1000));
    
    const minutesLeft = Math.floor((payload.exp - Math.floor(Date.now() / 1000)) / 60);
    console.log('   ⏱️ Temps restant:', minutesLeft, 'minutes');
  } catch (e) {
    console.log('❌ Erreur décodage token:', e.message);
  }
} else {
  console.log('❌ Aucun token trouvé - UTILISATEUR NON CONNECTÉ');
}

if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('👤 Utilisateur connecté:');
    console.log('   Nom:', userData.name);
    console.log('   Email:', userData.email);
    console.log('   Rôle:', userData.role);
  } catch (e) {
    console.log('❌ Erreur parsing user:', e.message);
  }
} else {
  console.log('❌ Aucunes données utilisateur - CONNEXION REQUISE');
}

// 2. Instructions selon l'état
console.log('\n📋 INSTRUCTIONS:');

if (!token || !user) {
  console.log('🚨 VOUS DEVEZ VOUS CONNECTER !');
  console.log('1. Utiliser ces identifiants de test:');
  console.log('   Email: etudiant.test@example.com');
  console.log('   Password: password123');
  console.log('2. Ou créer un nouveau compte étudiant');
  console.log('3. Une fois connecté, relancer ce diagnostic');
} else {
  console.log('✅ Utilisateur connecté - Prêt pour test d\'import');
  console.log('🔄 Vous pouvez maintenant tester l\'import de collection');
}

// 3. Test API si connecté
if (token) {
  console.log('\n2. Test de connexion API...');
  
  const API_URL = 'http://localhost:5000/api';
  
  fetch(`${API_URL}/users/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => {
    console.log('📡 Test API Profile status:', response.status);
    
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('✅ API fonctionne - Utilisateur:', data.name);
    console.log('🎯 Prêt pour test d\'import avec code: I44WPL');
  })
  .catch(error => {
    console.log('❌ Erreur API:', error.message);
    if (error.message.includes('401')) {
      console.log('🚨 Token invalide - Reconnexion requise');
    }
  });
}
