/**
 * Script pour finaliser l'ajout des boutons "Terminer" dans tous les modes de révision
 * Exécuter depuis le dossier spaced-revision: node src/scripts/finalizeTerminateButtons.js
 */

const fs = require('fs');
const path = require('path');

const reviewPagePath = path.join(__dirname, '..', 'pages', 'ReviewPage.js');

console.log('🎯 Finalisation des boutons "Terminer" dans ReviewPage.js\n');

try {
  let content = fs.readFileSync(reviewPagePath, 'utf8');
  let modifications = 0;

  // 1. Mode Quiz - Avant sélection (avec "Passer")
  const quizBeforePattern = /<div className="d-flex gap-2">\s*<Button\s+variant="outline-secondary"\s+onClick=\{handleSkipCard\}\s*>\s*Passer\s*<\/Button>\s*<Button\s+variant="outline-danger"\s+onClick=\{handleEndSession\}\s+title="Arrêter la session de révision"\s*>\s*Terminer\s*<\/Button>\s*<\/div>/;
  
  if (!quizBeforePattern.test(content)) {
    // Chercher le pattern existant pour le mode quiz avant sélection
    const quizBeforeOldPattern = /(<Button[^>]*variant="outline-secondary"[^>]*onClick=\{handleSkipCard\}[^>]*>\s*Passer\s*<\/Button>\s*<\/div>\s*<Button[^>]*variant="primary"[^>]*onClick=\{handleCheckQuizAnswer\})/;
    
    if (quizBeforeOldPattern.test(content)) {
      content = content.replace(
        quizBeforeOldPattern,
        `<div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={handleSkipCard}
              >
                Passer
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={handleEndSession}
                title="Arrêter la session de révision"
              >
                Terminer
              </Button>
            </div>
            <Button 
              variant="primary" 
              onClick={handleCheckQuizAnswer}`
      );
      modifications++;
      console.log('✅ Bouton "Terminer" ajouté dans le mode quiz (avant sélection)');
    }
  } else {
    console.log('ℹ️  Mode quiz (avant sélection) déjà modifié');
  }

  // 2. Mode Quiz - Après résultat (avec "Next Card")
  const quizAfterPattern = /(<div className="d-flex justify-content-end">\s*<Button[^>]*variant="primary"[^>]*onClick=\{\(\) => handleNextCard\(\)\}[^>]*className="d-flex align-items-center"[^>]*>\s*Next Card <FiArrowRight className="ms-2" \/>\s*<\/Button>\s*<\/div>)/;
  
  if (quizAfterPattern.test(content)) {
    content = content.replace(
      quizAfterPattern,
      `<div className="d-flex justify-content-between">
            <Button 
              variant="outline-danger" 
              onClick={handleEndSession}
              title="Arrêter la session de révision"
            >
              Terminer
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleNextCard()}
              className="d-flex align-items-center"
            >
              Next Card <FiArrowRight className="ms-2" />
            </Button>
          </div>`
    );
    modifications++;
    console.log('✅ Bouton "Terminer" ajouté dans le mode quiz (après résultat)');
  } else {
    console.log('ℹ️  Mode quiz (après résultat) déjà modifié ou pattern non trouvé');
  }

  // 3. Mode Test - Après vérification (alternative si pas déjà fait)
  const testAfterPattern = /(<div className="d-flex justify-content-end">\s*<Button[^>]*variant="primary"[^>]*onClick=\{\(\) => handleNextCard\(\)\}[^>]*className="d-flex align-items-center"[^>]*>\s*Next Card <FiArrowRight className="ms-2" \/>\s*<\/Button>\s*<\/div>)/g;
  
  // Remplacer toutes les occurrences restantes (si il y en a)
  const testMatches = content.match(testAfterPattern);
  if (testMatches && testMatches.length > 0) {
    content = content.replace(
      testAfterPattern,
      `<div className="d-flex justify-content-between">
            <Button 
              variant="outline-danger" 
              onClick={handleEndSession}
              title="Arrêter la session de révision"
            >
              Terminer
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleNextCard()}
              className="d-flex align-items-center"
            >
              Next Card <FiArrowRight className="ms-2" />
            </Button>
          </div>`
    );
    modifications++;
    console.log(`✅ ${testMatches.length} bouton(s) "Terminer" ajouté(s) dans les sections "Next Card"`);
  }

  // Sauvegarder les modifications
  if (modifications > 0) {
    fs.writeFileSync(reviewPagePath, content, 'utf8');
    console.log(`\n🎉 ${modifications} modification(s) appliquée(s) avec succès !`);
  } else {
    console.log('\nℹ️  Aucune modification nécessaire - boutons déjà présents');
  }

  console.log('\n📋 ÉTAT FINAL DES BOUTONS "TERMINER" :');
  console.log('  ✅ Mode Classique : Dans les actions après retournement');
  console.log('  ✅ Mode Test : Avant ET après vérification');
  console.log('  ✅ Mode Quiz : Avant ET après sélection');
  console.log('\n🚀 Les utilisateurs peuvent maintenant arrêter toutes leurs sessions !');

} catch (error) {
  console.error('❌ Erreur:', error.message);
  console.log('\nVérifiez que le fichier ReviewPage.js existe et est accessible.');
}
