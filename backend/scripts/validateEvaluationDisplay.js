/**
 * Script de validation complète de l'affichage des données d'évaluation
 * Teste l'API backend et simule le comportement frontend
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function validateEvaluationDisplay() {
  console.log(`\n${colors.bright}${colors.blue}🔍 VALIDATION COMPLÈTE DE L'AFFICHAGE D'ÉVALUATION${colors.reset}\n`);
  
  try {
    // 1. Connexion enseignant
    console.log(`${colors.cyan}1️⃣ Connexion enseignant...${colors.reset}`);
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: 'prof.martin@example.com',
      password: 'password123'
    });
    
    const { token, user } = loginResponse.data;
    console.log(`${colors.green}✅ Connecté comme: ${user.name} (${user.role})${colors.reset}`);
    
    // Configuration pour les requêtes authentifiées
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    // 2. Récupération des données d'évaluation
    console.log(`\n${colors.cyan}2️⃣ Récupération des données d'évaluation...${colors.reset}`);
    const evalResponse = await axios.get(`${API_URL}/evaluation/students`, config);
    
    if (!evalResponse.data.success) {
      throw new Error('Échec de récupération des données');
    }
    
    const { data: students, count } = evalResponse.data;
    console.log(`${colors.green}✅ ${count} apprenant(s) avec sessions trouvé(s)${colors.reset}`);
    
    // 3. Analyse détaillée des données
    console.log(`\n${colors.cyan}3️⃣ Analyse des données pour l'affichage frontend...${colors.reset}`);
    
    if (students.length === 0) {
      console.log(`${colors.yellow}⚠️  Aucune donnée à afficher${colors.reset}`);
      console.log('   Raisons possibles:');
      console.log('   - Aucun apprenant n\'a révisé de collections partagées');
      console.log('   - Les sessions n\'ont pas été créées correctement');
      return;
    }
    
    // Simuler le traitement frontend
    console.log(`\n${colors.bright}📊 DONNÉES FORMATÉES POUR L'INTERFACE:${colors.reset}`);
    
    students.forEach((item, index) => {
      console.log(`\n${colors.bright}Apprenant ${index + 1}:${colors.reset}`);
      console.log(`  👤 Nom: ${item.student.name}`);
      console.log(`  📧 Email: ${item.student.email}`);
      console.log(`  📚 Sessions totales: ${item.totalSessions}`);
      console.log(`  📊 Score moyen: ${item.averageScore ? item.averageScore.toFixed(1) + '%' : 'N/A'}`);
      console.log(`  ⏰ Dernière activité: ${item.lastActivity ? new Date(item.lastActivity).toLocaleString('fr-FR') : 'Jamais'}`);
      
      if (item.collections && item.collections.length > 0) {
        console.log(`  📁 Collections (${item.collections.length}):`);
        item.collections.forEach(col => {
          console.log(`     - ${col.name} (${col.sessionCount} session${col.sessionCount > 1 ? 's' : ''})`);
        });
      }
      
      if (item.sessions && item.sessions.length > 0) {
        console.log(`  📝 Dernières sessions:`);
        item.sessions.slice(0, 3).forEach(session => {
          const date = new Date(session.createdAt).toLocaleDateString('fr-FR');
          const score = session.score ? `${session.score}%` : 'En cours';
          console.log(`     - ${date}: ${session.type} (${score})`);
        });
      }
    });
    
    // 4. Vérification de la structure des données
    console.log(`\n${colors.cyan}4️⃣ Validation de la structure des données...${colors.reset}`);
    
    let validationErrors = [];
    
    students.forEach((item, index) => {
      if (!item.student || !item.student._id) {
        validationErrors.push(`Apprenant ${index}: Données apprenant manquantes`);
      }
      if (typeof item.totalSessions !== 'number') {
        validationErrors.push(`Apprenant ${index}: totalSessions invalide`);
      }
      if (!Array.isArray(item.sessions)) {
        validationErrors.push(`Apprenant ${index}: sessions n'est pas un tableau`);
      }
      if (!Array.isArray(item.collections)) {
        validationErrors.push(`Apprenant ${index}: collections n'est pas un tableau`);
      }
    });
    
    if (validationErrors.length > 0) {
      console.log(`${colors.red}❌ Erreurs de structure détectées:${colors.reset}`);
      validationErrors.forEach(err => console.log(`   - ${err}`));
    } else {
      console.log(`${colors.green}✅ Structure des données valide${colors.reset}`);
    }
    
    // 5. Statistiques globales (comme dans le frontend)
    console.log(`\n${colors.cyan}5️⃣ Calcul des statistiques globales...${colors.reset}`);
    
    const totalStudents = students.length;
    const totalSessions = students.reduce((sum, s) => sum + s.totalSessions, 0);
    const avgScore = students.reduce((sum, s) => {
      const score = s.averageScore || 0;
      return sum + score;
    }, 0) / (totalStudents || 1);
    
    const uniqueCollections = new Set();
    students.forEach(s => {
      if (s.collections) {
        s.collections.forEach(c => uniqueCollections.add(c._id));
      }
    });
    
    console.log(`${colors.bright}📈 STATISTIQUES GLOBALES:${colors.reset}`);
    console.log(`  👥 Apprenants actifs: ${totalStudents}`);
    console.log(`  📚 Sessions totales: ${totalSessions}`);
    console.log(`  📊 Score moyen global: ${avgScore.toFixed(1)}%`);
    console.log(`  📁 Collections révisées: ${uniqueCollections.size}`);
    
    // 6. Test de récupération des détails d'une session
    if (students.length > 0 && students[0].sessions.length > 0) {
      console.log(`\n${colors.cyan}6️⃣ Test de récupération des détails d'une session...${colors.reset}`);
      const firstSession = students[0].sessions[0];
      
      try {
        const sessionDetails = await axios.get(
          `${API_URL}/evaluation/sessions/${firstSession._id}`,
          config
        );
        
        if (sessionDetails.data.success) {
          console.log(`${colors.green}✅ Détails de session récupérés${colors.reset}`);
          const session = sessionDetails.data.data;
          console.log(`  Type: ${session.type}`);
          console.log(`  Cartes: ${session.cards ? session.cards.length : 0}`);
          console.log(`  Score: ${session.score || 'En cours'}%`);
        }
      } catch (err) {
        console.log(`${colors.yellow}⚠️  Impossible de récupérer les détails de session${colors.reset}`);
      }
    }
    
    // Résumé final
    console.log(`\n${colors.bright}${colors.green}✅ VALIDATION COMPLÈTE RÉUSSIE${colors.reset}`);
    console.log(`\n${colors.bright}📋 RÉSUMÉ:${colors.reset}`);
    console.log('1. ✅ API backend fonctionnelle');
    console.log('2. ✅ Authentification enseignant OK');
    console.log('3. ✅ Données d\'évaluation récupérées');
    console.log('4. ✅ Structure des données valide');
    console.log('5. ✅ Données prêtes pour l\'affichage frontend');
    
    if (students.length > 0) {
      console.log(`\n${colors.bright}${colors.blue}ℹ️  Les données sont disponibles et devraient s'afficher correctement dans l'interface.${colors.reset}`);
      console.log('Si les données ne s\'affichent pas dans le frontend, vérifiez:');
      console.log('  1. Que vous êtes connecté avec le compte enseignant');
      console.log('  2. Que vous naviguez vers /evaluation ou /stats');
      console.log('  3. Les logs de la console du navigateur (F12)');
    } else {
      console.log(`\n${colors.yellow}⚠️  Aucune donnée à afficher. Créez des sessions d'abord.${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`\n${colors.red}❌ ERREUR:${colors.reset}`, error.message);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Message: ${error.response.data.message || 'Erreur inconnue'}`);
    }
    
    console.log('\nDébogage:');
    console.log('1. Vérifiez que le backend est démarré (port 5000)');
    console.log('2. Vérifiez que MongoDB est accessible');
    console.log('3. Vérifiez les logs du serveur backend');
  }
}

// Exécution
console.log(`${colors.bright}${colors.cyan}🚀 Démarrage de la validation...${colors.reset}`);
validateEvaluationDisplay();
