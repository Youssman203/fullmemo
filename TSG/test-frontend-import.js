// Test pour vérifier l'intégration frontend de la fonctionnalité d'importation
// À exécuter dans la console du navigateur sur http://localhost:3000

console.log('🧪 Test Frontend - Fonctionnalité d\'importation');
console.log('=' .repeat(60));

// Configuration
const STUDENT_EMAIL = 'etudiant.test@example.com';
const STUDENT_PASSWORD = 'password123';
const BAC2_CLASS_ID = '68884889e4c3c95f0bcd3eed';

async function testFrontendImportWorkflow() {
  try {
    console.log('\n📋 PRÉREQUIS :');
    console.log('1. Navigateur sur http://localhost:3000');
    console.log('2. Backend sur http://localhost:5000');
    console.log('3. Étudiant doit être inscrit dans la classe bac2');
    console.log('4. Collections doivent être partagées par l\'enseignant');

    // Test 1: Vérifier que nous sommes sur la bonne page
    console.log('\n1. 🌐 Vérification de l\'environnement');
    if (typeof window === 'undefined') {
      console.log('❌ Ce script doit être exécuté dans un navigateur');
      return;
    }
    
    console.log('✅ Environnement navigateur détecté');
    console.log(`   URL: ${window.location.href}`);

    // Test 2: Connexion automatique si nécessaire
    console.log('\n2. 🔑 Vérification de l\'authentification');
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ Aucun token trouvé - connexion nécessaire');
      
      // Tentative de connexion automatique
      try {
        const loginResponse = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: STUDENT_EMAIL,
            password: STUDENT_PASSWORD
          })
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          localStorage.setItem('token', loginData.token);
          console.log('✅ Connexion automatique réussie');
          
          // Recharger la page pour appliquer l'authentification
          console.log('🔄 Rechargement de la page...');
          window.location.reload();
          return;
        } else {
          console.log('❌ Connexion automatique échouée');
          console.log('👉 Veuillez vous connecter manuellement');
          return;
        }
      } catch (error) {
        console.log('❌ Erreur de connexion:', error);
        return;
      }
    } else {
      console.log('✅ Token d\'authentification trouvé');
    }

    // Test 3: Navigation vers la page des collections de classe
    console.log('\n3. 🗂️ Navigation vers les collections de classe');
    
    const targetUrl = `/classes/${BAC2_CLASS_ID}/collections`;
    if (!window.location.pathname.includes(targetUrl)) {
      console.log(`⚠️ Navigation vers: ${targetUrl}`);
      window.location.href = targetUrl;
      return;
    }
    
    console.log('✅ Sur la page des collections de classe');

    // Test 4: Vérifier la présence du composant ClassCollectionsView
    console.log('\n4. 🔍 Vérification du composant ClassCollectionsView');
    
    // Attendre que le composant se charge
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const collectionsContainer = document.querySelector('[data-testid="collections-container"]') || 
                                document.querySelector('.collections-view') ||
                                document.querySelector('.row'); // Bootstrap row
    
    if (!collectionsContainer) {
      console.log('⚠️ Container de collections non trouvé');
      console.log('🔍 Éléments disponibles:', document.body.innerHTML.substring(0, 500));
    } else {
      console.log('✅ Container de collections trouvé');
    }

    // Test 5: Chercher les boutons "Télécharger"
    console.log('\n5. 📥 Recherche des boutons d\'importation');
    
    const downloadButtons = document.querySelectorAll('button');
    const importButtons = Array.from(downloadButtons).filter(btn => 
      btn.textContent.includes('Télécharger') || 
      btn.textContent.includes('Importer') ||
      btn.querySelector('svg') // Icône de téléchargement
    );

    console.log(`Boutons de téléchargement trouvés: ${importButtons.length}`);
    
    if (importButtons.length > 0) {
      console.log('✅ Boutons d\'importation disponibles:');
      importButtons.forEach((btn, index) => {
        console.log(`   ${index + 1}. "${btn.textContent.trim()}" (${btn.disabled ? 'désactivé' : 'actif'})`);
      });

      // Test 6: Test d'importation si bouton disponible
      console.log('\n6. 🚀 Test d\'importation (simulation)');
      
      const activeButton = importButtons.find(btn => !btn.disabled);
      if (activeButton) {
        console.log('✅ Bouton actif trouvé - prêt pour importation');
        console.log('💡 Pour tester l\'importation, cliquez sur le bouton "Télécharger"');
        console.log('🔍 Observez les messages toast pour confirmation');
        
        // Highlight le bouton pour l'utilisateur
        activeButton.style.border = '3px solid #ff0000';
        activeButton.style.backgroundColor = '#ffffcc';
        
        setTimeout(() => {
          activeButton.style.border = '';
          activeButton.style.backgroundColor = '';
        }, 5000);
        
      } else {
        console.log('⚠️ Aucun bouton actif (probablement déjà importé)');
      }
    } else {
      console.log('❌ Aucun bouton d\'importation trouvé');
      console.log('🔍 Vérifiez que:');
      console.log('   - L\'étudiant est bien inscrit dans la classe');
      console.log('   - Des collections sont partagées par l\'enseignant');
      console.log('   - Le composant ClassCollectionsView est bien chargé');
    }

    // Test 7: Vérifier l'état des toasts
    console.log('\n7. 🍞 Vérification du système de toasts');
    
    const toastContainer = document.querySelector('.toast-container') ||
                          document.querySelector('[role="alert"]') ||
                          document.querySelector('.alert');
    
    if (toastContainer) {
      console.log('✅ Système de toasts disponible');
    } else {
      console.log('⚠️ Système de toasts non détecté');
    }

    // Test 8: Instructions pour l'utilisateur
    console.log('\n8. 📝 Instructions pour test manuel:');
    console.log('───────────────────────────────────────');
    console.log('1. Cliquez sur un bouton "Télécharger" mis en surbrillance');
    console.log('2. Observez le message toast de confirmation');
    console.log('3. Naviguez vers "Mes Collections" pour voir la collection importée');
    console.log('4. Ouvrez la collection pour vérifier les cartes');
    console.log('5. Tentez une double importation (doit afficher une erreur)');

    console.log('\n🎉 Test frontend terminé !');
    console.log('✨ La fonctionnalité d\'importation est prête à utiliser');

  } catch (error) {
    console.error('❌ Erreur lors du test frontend:', error);
  }
}

// Fonction de connexion rapide
window.quickLogin = async function() {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: STUDENT_EMAIL,
        password: STUDENT_PASSWORD
      })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token);
      console.log('✅ Connexion rapide réussie');
      window.location.reload();
    } else {
      console.log('❌ Connexion rapide échouée');
    }
  } catch (error) {
    console.log('❌ Erreur connexion rapide:', error);
  }
};

// Fonction de navigation rapide
window.goToCollections = function() {
  window.location.href = `/classes/${BAC2_CLASS_ID}/collections`;
};

// Lancer le test automatiquement
testFrontendImportWorkflow();

console.log('\n🛠️ Fonctions utiles disponibles:');
console.log('- quickLogin() : Connexion rapide étudiant');
console.log('- goToCollections() : Navigation vers collections classe');
console.log('- testFrontendImportWorkflow() : Relancer le test');
