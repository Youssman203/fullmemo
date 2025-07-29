// Script rapide à exécuter dans la console du navigateur
// Pour vérifier l'état actuel et tester l'API

console.log('🔍 Test rapide - État navigateur');
console.log('=' .repeat(40));

// 1. Vérifier l'utilisateur connecté
console.log('\n1. 👤 Utilisateur connecté');
const user = localStorage.getItem('user');
const token = localStorage.getItem('token');

if (user) {
  const userData = JSON.parse(user);
  console.log('✅ Utilisateur:', userData.name);
  console.log('   Email:', userData.email);
  console.log('   Rôle:', userData.role);
} else {
  console.log('❌ Pas d\'utilisateur connecté');
}

if (token) {
  console.log('✅ Token présent:', token.substring(0, 20) + '...');
  console.log('   Longueur:', token.length);
} else {
  console.log('❌ Pas de token');
}

// 2. Vérifier l'URL actuelle
console.log('\n2. 🌐 Page actuelle');
console.log('URL:', window.location.href);
console.log('Path:', window.location.pathname);

// 3. Test API direct
console.log('\n3. 🧪 Test API direct');
if (token) {
  fetch('/api/classes/68884889e4c3c95f0bcd3eed/collections', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Statut API:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('✅ API fonctionne');
    console.log('Classe:', data.data?.class?.name);
    console.log('Collections:', data.data?.collections?.length);
  })
  .catch(error => {
    console.log('❌ Erreur API:', error.message);
  });
} else {
  console.log('❌ Impossible de tester sans token');
}

// 4. Fonction pour se connecter rapidement
window.quickLogin = async function() {
  console.log('\n🔑 Connexion rapide étudiant...');
  
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'etudiant.test@example.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role
      }));
      console.log('✅ Connexion réussie');
      console.log('Rafraîchissez la page ou naviguez vers les collections');
    } else {
      console.log('❌ Connexion échouée');
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error);
  }
};

// 5. Fonction pour naviguer vers les collections
window.goToCollections = function() {
  window.location.href = '/classes/68884889e4c3c95f0bcd3eed/collections';
};

// 6. Fonction pour tester le service classService
window.testClassService = async function() {
  console.log('\n🎯 Test du service classService');
  
  if (!token) {
    console.log('❌ Pas de token - utilisez quickLogin() d\'abord');
    return;
  }
  
  try {
    // Simuler l'appel du service
    const response = await fetch('/api/classes/68884889e4c3c95f0bcd3eed/collections', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Service simulé avec succès');
    console.log('Données:', data);
    
    // Simuler ce que fait ClassCollectionsView
    const classInfo = data.data?.class;
    const collections = data.data?.collections || [];
    
    console.log('Parsing ClassCollectionsView:');
    console.log('- classInfo:', classInfo?.name);
    console.log('- collections:', collections.length);
    
    return data;
  } catch (error) {
    console.log('❌ Erreur service:', error.message);
    throw error;
  }
};

console.log('\n💡 Fonctions disponibles:');
console.log('- quickLogin() : Connexion rapide');
console.log('- goToCollections() : Aller aux collections bac2');
console.log('- testClassService() : Tester le service');

console.log('\n🎯 Actions suggérées:');
if (!user || !token) {
  console.log('1. Tapez: quickLogin()');
  console.log('2. Puis: goToCollections()');
} else {
  console.log('1. Tapez: testClassService()');
  console.log('2. Ou: goToCollections()');
}
