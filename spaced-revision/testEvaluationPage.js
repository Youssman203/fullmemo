// Script de test automatisé pour la page d'évaluation
// À exécuter dans la console du navigateur après avoir ouvert http://localhost:3000

async function testEvaluationPage() {
  console.log('🧪 Test automatisé de la page d\'évaluation\n');
  
  // 1. Simuler la connexion enseignant
  console.log('1️⃣ Simulation connexion enseignant...');
  
  const userInfo = {
    _id: '6888c9e829249151f341e769',
    name: 'Prof. Martin Dupont',
    email: 'prof.martin@example.com',
    role: 'teacher',
    token: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null
  };
  
  if (!userInfo.token) {
    console.log('❌ Pas de token trouvé. Veuillez vous connecter manuellement d\'abord.');
    console.log('   Email: prof.martin@example.com');
    console.log('   Mot de passe: password123');
    return;
  }
  
  console.log('✅ Token trouvé:', userInfo.token.substring(0, 20) + '...');
  
  // 2. Vérifier l'accès à la page d'évaluation
  console.log('\n2️⃣ Navigation vers /evaluation...');
  
  if (window.location.pathname !== '/evaluation') {
    window.location.href = '/evaluation';
    console.log('⏳ Redirection en cours... Relancez ce script après le chargement.');
    return;
  }
  
  console.log('✅ Sur la page d\'évaluation');
  
  // 3. Attendre le chargement des données
  console.log('\n3️⃣ Vérification des données affichées...');
  
  setTimeout(() => {
    // Vérifier la présence du titre
    const title = document.querySelector('h2');
    if (title && title.textContent.includes('Évaluation')) {
      console.log('✅ Titre trouvé:', title.textContent);
    } else {
      console.log('❌ Titre non trouvé');
    }
    
    // Vérifier les statistiques globales
    const statsCards = document.querySelectorAll('.stats-card');
    if (statsCards.length > 0) {
      console.log('✅ Statistiques globales trouvées:', statsCards.length, 'cartes');
      statsCards.forEach((card, index) => {
        const title = card.querySelector('.text-muted');
        const value = card.querySelector('h3, h4');
        if (title && value) {
          console.log(`   ${index + 1}. ${title.textContent}: ${value.textContent}`);
        }
      });
    } else {
      console.log('❌ Statistiques globales non trouvées');
    }
    
    // Vérifier la liste des apprenants
    const studentRows = document.querySelectorAll('tbody tr');
    const studentCards = document.querySelectorAll('.student-card');
    
    if (studentRows.length > 0) {
      console.log('\n✅ Apprenants trouvés (tableau):', studentRows.length);
      studentRows.forEach((row, index) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          console.log(`   ${index + 1}. ${cells[0].textContent} - ${cells[1].textContent}`);
        }
      });
    } else if (studentCards.length > 0) {
      console.log('\n✅ Apprenants trouvés (cartes):', studentCards.length);
      studentCards.forEach((card, index) => {
        const name = card.querySelector('.card-title');
        if (name) {
          console.log(`   ${index + 1}. ${name.textContent}`);
        }
      });
    } else {
      console.log('❌ Aucun apprenant affiché');
      
      // Vérifier s'il y a un message d'état vide
      const emptyState = document.querySelector('.text-center');
      if (emptyState && emptyState.textContent.includes('Aucun')) {
        console.log('ℹ️  Message d\'état vide:', emptyState.textContent);
      }
    }
    
    // Vérifier les erreurs dans la console
    console.log('\n4️⃣ Vérification des erreurs...');
    const errors = document.querySelectorAll('.alert-danger');
    if (errors.length > 0) {
      console.log('❌ Erreurs trouvées:');
      errors.forEach(error => {
        console.log('   -', error.textContent);
      });
    } else {
      console.log('✅ Aucune erreur affichée');
    }
    
    // Résumé final
    console.log('\n📊 RÉSUMÉ DU TEST');
    console.log('================');
    
    if (studentRows.length > 0 || studentCards.length > 0) {
      console.log('✅ La page d\'évaluation fonctionne correctement');
      console.log('✅ Les données des apprenants sont affichées');
      console.log('ℹ️  Vous pouvez cliquer sur "Voir détails" pour tester les modals');
    } else {
      console.log('⚠️  La page s\'affiche mais aucune donnée n\'est visible');
      console.log('ℹ️  Vérifiez que :');
      console.log('   1. Des sessions ont été créées par des apprenants');
      console.log('   2. L\'API backend fonctionne (testez avec testEvaluationFinal.js)');
      console.log('   3. Le token JWT est valide');
    }
    
    // Test de l'API directement depuis le frontend
    console.log('\n5️⃣ Test direct de l\'API...');
    fetch('http://localhost:5000/api/evaluation/students', {
      headers: {
        'Authorization': `Bearer ${userInfo.token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        console.log('✅ API répond correctement');
        console.log('   Nombre d\'apprenants:', data.count);
        if (data.data && data.data.length > 0) {
          console.log('   Apprenants retournés:');
          data.data.forEach(item => {
            console.log(`     - ${item.student.name} (${item.totalSessions} sessions)`);
          });
        }
      } else {
        console.log('❌ Erreur API:', data.message);
      }
    })
    .catch(err => {
      console.log('❌ Erreur de connexion à l\'API:', err.message);
    });
    
  }, 2000); // Attendre 2 secondes pour le chargement
}

// Instructions
console.log('📝 INSTRUCTIONS D\'UTILISATION');
console.log('============================');
console.log('1. Connectez-vous d\'abord avec le compte enseignant :');
console.log('   Email: prof.martin@example.com');
console.log('   Mot de passe: password123');
console.log('');
console.log('2. Une fois connecté, exécutez : testEvaluationPage()');
console.log('');
console.log('3. Si vous êtes déjà sur /evaluation, le test s\'exécutera immédiatement');
console.log('   Sinon, vous serez redirigé et devrez relancer le test');

// Export pour utilisation
window.testEvaluationPage = testEvaluationPage;
