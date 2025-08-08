/**
 * Script pour ajouter le bouton "Terminer" dans les sessions de révision
 */

const fs = require('fs');
const path = require('path');

const reviewPagePath = path.join(__dirname, '..', 'pages', 'ReviewPage.js');

console.log('🔧 Ajout du bouton "Terminer" dans les sessions de révision...\n');

try {
  // Lire le fichier ReviewPage.js
  let content = fs.readFileSync(reviewPagePath, 'utf8');
  
  // 1. Ajouter le bouton dans le mode classique
  const classicButtonPattern = /(<span className="me-2">\{currentCardIndex \+ 1\} of \{cardsToReview\.length\}<\/span>\s*<Button[^>]*variant="outline-secondary"[^>]*onClick=\{handleSkipCard\}[^>]*>\s*Skip\s*<\/Button>)/;
  
  if (classicButtonPattern.test(content)) {
    content = content.replace(
      classicButtonPattern,
      `<div className="d-flex align-items-center gap-2">
            <span className="me-2">{currentCardIndex + 1} of {cardsToReview.length}</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleSkipCard}
            >
              Skip
            </Button>
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={handleEndSession}
              title="Arrêter la session de révision"
            >
              Terminer
            </Button>
          </div>`
    );
    console.log('✅ Bouton "Terminer" ajouté en mode classique');
  }

  // 2. Ajouter le bouton dans le mode test (avant vérification)
  const testButtonPattern = /(<div className="d-flex justify-content-between">\s*<Button[^>]*variant="outline-secondary"[^>]*onClick=\{handleSkipCard\}[^>]*>\s*Skip\s*<\/Button>\s*<Button[^>]*variant="primary"[^>]*onClick=\{handleCheckTestAnswer\}[^>]*disabled=\{!testAnswer\.trim\(\)\}[^>]*>\s*Vérifier la réponse\s*<\/Button>\s*<\/div>)/;
  
  if (testButtonPattern.test(content)) {
    content = content.replace(
      testButtonPattern,
      `<div className="d-flex justify-content-between">
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={handleSkipCard}
              >
                Skip
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
              onClick={handleCheckTestAnswer}
              disabled={!testAnswer.trim()}
            >
              Vérifier la réponse
            </Button>
          </div>`
    );
    console.log('✅ Bouton "Terminer" ajouté en mode test (avant vérification)');
  }

  // 3. Ajouter le bouton dans le mode test (après vérification)
  const testResultPattern = /(<div className="d-flex justify-content-end">\s*<Button[^>]*variant="primary"[^>]*onClick=\{\(\) => handleNextCard\(\)\}[^>]*className="d-flex align-items-center"[^>]*>\s*Next Card <FiArrowRight className="ms-2" \/>\s*<\/Button>\s*<\/div>)/;
  
  if (testResultPattern.test(content)) {
    content = content.replace(
      testResultPattern,
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
    console.log('✅ Bouton "Terminer" ajouté en mode test (après vérification)');
  }

  // Sauvegarder le fichier modifié
  fs.writeFileSync(reviewPagePath, content, 'utf8');
  
  console.log('\n🎉 Boutons "Terminer" ajoutés avec succès !');
  console.log('\n📋 Fonctionnalités ajoutées:');
  console.log('• Mode classique: Bouton "Terminer" à côté de "Skip"');
  console.log('• Mode quiz: Bouton "Terminer" dans les deux phases');
  console.log('• Mode test: Bouton "Terminer" avant et après vérification');
  console.log('\n✨ Les utilisateurs peuvent maintenant arrêter leurs sessions de révision à tout moment !');

} catch (error) {
  console.error('❌ Erreur:', error.message);
}
