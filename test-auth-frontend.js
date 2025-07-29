// Script à exécuter dans la console du navigateur sur http://localhost:3000
// Ouvrir F12 > Console > Coller ce script

function testAuthFrontend() {
  console.log('🔍 Test de l\'authentification frontend\n');
  
  // Test 1: Vérifier le localStorage
  console.log('1. État du localStorage:');
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  console.log('Token:', token ? token.substring(0, 20) + '...' : 'AUCUN');
  console.log('User:', user ? JSON.parse(user) : 'AUCUN');
  
  if (!token) {
    console.log('❌ PROBLÈME: Pas de token d\'authentification!');
    console.log('💡 Solution: Connectez-vous d\'abord');
    return;
  }
  
  // Test 2: Décoder le token JWT (basique)
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('\n2. Contenu du token JWT:');
      console.log('ID Utilisateur:', payload.id);
      console.log('Expiration:', new Date(payload.exp * 1000));
      console.log('Valide:', new Date() < new Date(payload.exp * 1000) ? 'OUI' : 'NON');
    }
  } catch (e) {
    console.log('❌ Erreur décodage token:', e.message);
  }
  
  // Test 3: Test API avec le token
  console.log('\n3. Test API collections:');
  fetch('http://localhost:5000/api/collections', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Status API collections:', response.status);
    return response.json();
  })
  .then(data => {
    if (data.success === false) {
      console.log('❌ Erreur API:', data.message);
    } else {
      console.log('✅ Collections récupérées:', data.data?.length || 0);
      if (data.data && data.data.length > 0) {
        const firstCollection = data.data[0];
        console.log('Première collection:', firstCollection.name, firstCollection._id);
        
        // Test 4: Test génération code de partage
        console.log('\n4. Test génération code de partage:');
        fetch(`http://localhost:5000/api/share/collections/${firstCollection._id}/generate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            expiresInHours: 24,
            permissions: ['view', 'copy']
          })
        })
        .then(response => {
          console.log('Status génération code:', response.status);
          return response.json();
        })
        .then(shareData => {
          if (shareData.success) {
            console.log('✅ Code généré:', shareData.data.code);
          } else {
            console.log('❌ Erreur génération:', shareData.message);
          }
        })
        .catch(err => console.log('❌ Erreur requête:', err.message));
      }
    }
  })
  .catch(err => console.log('❌ Erreur connexion API:', err.message));
  
  console.log('\n💡 Instructions:');
  console.log('- Si pas de token: Connectez-vous d\'abord');
  console.log('- Si token expiré: Reconnectez-vous');
  console.log('- Si erreur 403: Vérifiez le rôle utilisateur');
}

// Exécuter le test
testAuthFrontend();
