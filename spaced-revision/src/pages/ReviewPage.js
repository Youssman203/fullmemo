// src/pages/ReviewPage.js
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, ProgressBar, Badge } from 'react-bootstrap';
import { FiBook, FiHelpCircle, FiEdit3, FiArrowRight, FiCheck, FiX, FiRotateCw } from 'react-icons/fi';
import '../assets/review.css';

// Review modes
const MODES = {
  SELECT_MODE: 'select_mode',
  SELECT_COLLECTION: 'select_collection',
  CLASSIC_REVIEW: 'classic_review',
  QUIZ_MODE: 'quiz_mode',
  TEST_MODE: 'test_mode',
  COMPLETED: 'completed'
};

const ReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { collections, cards, getCardsByCollection, updateCardReview } = useData();
  
  // Fonction utilitaire pour convertir les valeurs numériques en valeurs d'enum pour la performance
  const convertPerformanceValue = (numericValue) => {
    // Convertir les valeurs numériques en valeurs d'enum acceptées par le backend
    switch (numericValue) {
      case 0:
        return 'again'; // Très difficile / à revoir rapidement
      case 1:
        return 'hard';  // Difficile
      case 2:
        return 'good';  // Correct
      case 3:
      case 4:
        return 'easy';  // Facile
      default:
        return 'good';  // Valeur par défaut
    }
  };

  // State for review flow
  const [currentMode, setCurrentMode] = useState(MODES.SELECT_MODE);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [cardsToReview, setCardsToReview] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // State for quiz mode
  const [quizOptions, setQuizOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  
  // State for test mode
  const [testAnswer, setTestAnswer] = useState('');
  const [testResult, setTestResult] = useState({ show: false, correct: false });
  
  // State for stats
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    skipped: 0,
    total: 0
  });

  // Shuffle cards when collection is selected
  useEffect(() => {
    if (selectedCollection) {
      // Créer une fonction async interne pour récupérer les cartes
      const fetchAndSetCards = async () => {
        try {
          // Récupérer les cartes de façon asynchrone
          const response = await getCardsByCollection(selectedCollection.id);
          
          // Extraire les cartes de la réponse API
          let collectionCards = [];
          if (Array.isArray(response)) {
            collectionCards = response;
          } else if (response.data && Array.isArray(response.data)) {
            collectionCards = response.data;
          } else if (response.flashcards && Array.isArray(response.flashcards)) {
            collectionCards = response.flashcards;
          } else {
            console.error('Format de réponse inattendu:', response);
            collectionCards = [];
          }
          
          // Shuffle the cards
          const shuffled = [...collectionCards].sort(() => Math.random() - 0.5);
          setCardsToReview(shuffled);
          setStats(prev => ({ ...prev, total: shuffled.length }));
        } catch (error) {
          console.error('Erreur lors de la récupération des cartes:', error);
          setCardsToReview([]);
          setStats(prev => ({ ...prev, total: 0 }));
        }
      };
      
      // Exécuter la fonction asynchrone
      fetchAndSetCards();
    }
  }, [selectedCollection, getCardsByCollection]);

  // Generate quiz options when in quiz mode and card changes
  useEffect(() => {
    if (currentMode === MODES.QUIZ_MODE && cardsToReview.length > 0) {
      generateQuizOptions();
    }
  }, [currentCardIndex, currentMode, cardsToReview]);

  // Reset states when moving to a new card
  useEffect(() => {
    setIsFlipped(false);
    setSelectedOption(null);
    setShowQuizResult(false);
    setTestAnswer('');
    setTestResult({ show: false, correct: false });
  }, [currentCardIndex]);

  // Generate multiple choice options for quiz mode
  const generateQuizOptions = () => {
    if (cardsToReview.length === 0) return;
    
    const currentCard = cardsToReview[currentCardIndex];
    const correctAnswer = currentCard.answer;
    
    // Get 3 random wrong answers from other cards
    const otherCards = cards.filter(c => c.id !== currentCard.id);
    const wrongAnswers = otherCards
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.answer);
    
    // Combine correct and wrong answers, then shuffle
    const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    setQuizOptions(options);
  };

  // Handle mode selection
  const handleSelectMode = (mode) => {
    setSelectedMode(mode);
  };

  // Handle collection selection
  const handleSelectCollection = (collection) => {
    setSelectedCollection(collection);
  };

  // Start review with selected mode and collection
  const handleStartReview = () => {
    if (!selectedMode) {
      alert('Veuillez sélectionner un mode de révision');
      return;
    }
    
    if (currentMode === MODES.SELECT_MODE) {
      setCurrentMode(MODES.SELECT_COLLECTION);
    } else if (currentMode === MODES.SELECT_COLLECTION) {
      if (!selectedCollection) {
        alert('Veuillez sélectionner une collection');
        return;
      }
      
      switch (selectedMode) {
        case 'classic':
          setCurrentMode(MODES.CLASSIC_REVIEW);
          break;
        case 'quiz':
          setCurrentMode(MODES.QUIZ_MODE);
          break;
        case 'test':
          setCurrentMode(MODES.TEST_MODE);
          break;
        default:
          setCurrentMode(MODES.CLASSIC_REVIEW);
      }
      
      setCurrentCardIndex(0);
    }
  };

  // Handle card flip in classic mode
  const handleFlipCard = () => {
    setIsFlipped(!isFlipped);
  };

  // Handle quiz option selection
  const handleQuizOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Check quiz answer
  const handleCheckQuizAnswer = () => {
    if (!selectedOption) return;
    
    const currentCard = cardsToReview[currentCardIndex];
    const isCorrect = selectedOption === currentCard.answer;
    
    setShowQuizResult(true);
    updateStats(isCorrect);
    
    // Update spaced repetition algorithm
    const reviewData = {
      performance: convertPerformanceValue(isCorrect ? 2 : 0), // Bonne réponse = good (2), mauvaise = again (0)
      timeSpent: 0
    };
    
    try {
      updateCardReview(currentCard.id || currentCard._id, reviewData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la révision (mode quiz):', error);
    }
  };

  // Check test answer
  const handleCheckTestAnswer = () => {
    if (!testAnswer.trim()) return;
    
    const currentCard = cardsToReview[currentCardIndex];
    // Simple string comparison - could be improved with fuzzy matching
    const isCorrect = testAnswer.trim().toLowerCase() === currentCard.answer.toLowerCase();
    
    setTestResult({ show: true, correct: isCorrect });
    updateStats(isCorrect);
    
    // Update spaced repetition algorithm
    const reviewData = {
      performance: convertPerformanceValue(isCorrect ? 2 : 0), // Bonne réponse = good (2), mauvaise = again (0)
      timeSpent: 0
    };
    
    try {
      updateCardReview(currentCard.id || currentCard._id, reviewData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la révision (mode test):', error);
    }
  };

  // Update stats based on answer correctness
  const updateStats = (isCorrect) => {
    setStats(prev => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect
    }));
  };

  // Handle next card in all modes
  const handleNextCard = (quality = null) => {
    // In classic mode, update the spaced repetition algorithm
    if (currentMode === MODES.CLASSIC_REVIEW && quality !== null) {
      const currentCard = cardsToReview[currentCardIndex];
      // Formater les données pour correspondre à ce qu'attend le backend
      const reviewData = {
        performance: convertPerformanceValue(quality), // Conversion des valeurs numériques en valeurs d'enum
        timeSpent: 0 // Valeur par défaut, à remplacer par un calcul réel si nécessaire
      };
      console.log('Envoi des données de performance:', reviewData);
      try {
        updateCardReview(currentCard.id || currentCard._id, reviewData);
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la révision:', error);
        // Continuer malgré l'erreur pour ne pas bloquer l'expérience utilisateur
      }
    }
    
    if (currentCardIndex < cardsToReview.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session finished
      setCurrentMode(MODES.COMPLETED);
    }
  };

  // Handle skipping a card
  const handleSkipCard = () => {
    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    handleNextCard();
  };

  // Restart review session
  const handleRestartSession = () => {
    setCurrentMode(MODES.SELECT_MODE);
    setSelectedMode(null);
    setSelectedCollection(null);
    setCardsToReview([]);
    setCurrentCardIndex(0);
    setStats({
      correct: 0,
      incorrect: 0,
      skipped: 0,
      total: 0
    });
  };

  // Return to dashboard
  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  // Render mode selection screen
  const renderModeSelection = () => (
    <Container className="py-5">
      <h1 className="text-center mb-4">Choisir un mode de révision</h1>
      <Row className="justify-content-center mb-4">
        <Col md={4} className="mb-4">
          <Card 
            className={`review-mode-card text-center h-100 ${selectedMode === 'classic' ? 'selected' : ''}`}
            onClick={() => handleSelectMode('classic')}
          >
            <Card.Body>
              <div className="review-mode-icon text-primary">
                <FiBook />
              </div>
              <Card.Title>Révision classique</Card.Title>
              <Card.Text>
                Révision traditionnelle avec cartes mémoire et répétition espacée. Retournez les cartes pour révéler les réponses et évaluez votre connaissance.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className={`review-mode-card text-center h-100 ${selectedMode === 'quiz' ? 'selected' : ''}`}
            onClick={() => handleSelectMode('quiz')}
          >
            <Card.Body>
              <div className="review-mode-icon text-success">
                <FiHelpCircle />
              </div>
              <Card.Title>Mode Quiz</Card.Title>
              <Card.Text>
                Questions à choix multiples pour tester vos connaissances. Sélectionnez la bonne réponse parmi les options.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card 
            className={`review-mode-card text-center h-100 ${selectedMode === 'test' ? 'selected' : ''}`}
            onClick={() => handleSelectMode('test')}
          >
            <Card.Body>
              <div className="review-mode-icon text-warning">
                <FiEdit3 />
              </div>
              <Card.Title>Mode Test</Card.Title>
              <Card.Text>
                Écrivez vos réponses et obtenez un retour immédiat. Idéal pour pratiquer le rappel actif.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <div className="d-flex justify-content-center">
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleStartReview}
          disabled={!selectedMode}
          className="d-flex align-items-center"
        >
          Continuer <FiArrowRight className="ms-2" />
        </Button>
      </div>
    </Container>
  );

  // Render collection selection screen
  const renderCollectionSelection = () => (
    <Container className="py-5">
      <h1 className="text-center mb-4">Sélectionner une collection</h1>
      <Row xs={1} md={2} lg={3} className="g-4 mb-4">
        {collections.length > 0 ? (
          collections.map(collection => (
            <Col key={collection.id}>
              <Card 
                className={`collection-card ${selectedCollection?.id === collection.id ? 'selected' : ''}`}
                onClick={() => handleSelectCollection(collection)}
              >
                {collection.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={collection.imageUrl} 
                    alt={collection.name}
                    className="collection-card-img"
                  />
                )}
                <Card.Body>
                  <Card.Title>{collection.name}</Card.Title>
                  <Card.Text className="text-muted">
                    {collection.cards?.length || 0} cartes
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <div className="text-center py-5">
              <p>Aucune collection trouvée. Créez d'abord une collection.</p>
              <Link to="/collections" className="btn btn-primary">Créer une collection</Link>
            </div>
          </Col>
        )}
      </Row>
      <div className="d-flex justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={() => setCurrentMode(MODES.SELECT_MODE)}
        >
          Back
        </Button>
        <Button 
          variant="primary" 
          onClick={handleStartReview}
          disabled={!selectedCollection}
          className="d-flex align-items-center"
        >
          Commencer la révision <FiArrowRight className="ms-2" />
        </Button>
      </div>
    </Container>
  );

  // Render classic review mode
  const renderClassicReview = () => {
    if (cardsToReview.length === 0) {
      return (
        <div className="text-center py-5">
          <p>No cards found in this collection.</p>
          <Button variant="primary" onClick={() => setCurrentMode(MODES.SELECT_COLLECTION)}>Select Another Collection</Button>
        </div>
      );
    }

    const currentCard = cardsToReview[currentCardIndex];
    const progressPercentage = ((currentCardIndex + 1) / cardsToReview.length) * 100;

    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <Badge bg="primary" className="me-2">{selectedCollection.name}</Badge>
            <span className="text-muted">Révision classique</span>
          </h4>
          <div>
            <span className="me-2">{currentCardIndex + 1} of {cardsToReview.length}</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleSkipCard}
            >
              Skip
            </Button>
          </div>
        </div>

        <ProgressBar 
          now={progressPercentage} 
          variant="success" 
          className="mb-4"
        />

        <div className="flashcard-container" onClick={handleFlipCard}>
          <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
            <div className="flashcard-face flashcard-front">
              <div className="text-center">
                <h3>{currentCard.question}</h3>
                <p className="text-muted mt-3">(Cliquez pour retourner)</p>
              </div>
            </div>
            <div className="flashcard-face flashcard-back">
              <div className="text-center">
                <h3>{currentCard.answer}</h3>
              </div>
            </div>
          </div>
        </div>

        {isFlipped && (
          <div className="review-actions">
            <p className="text-center text-muted mb-3">Comment avez-vous connu cette réponse ?</p>
            <div className="d-grid gap-3 d-md-flex justify-content-md-center">
              <Button variant="danger" onClick={() => handleNextCard(0)}>À revoir</Button>
              <Button variant="warning" onClick={() => handleNextCard(1)}>Difficile</Button>
              <Button variant="info" onClick={() => handleNextCard(2)}>Bien</Button>
              <Button variant="success" onClick={() => handleNextCard(3)}>Facile</Button>
            </div>
          </div>
        )}
      </Container>
    );
  };

  // Render quiz mode
  const renderQuizMode = () => {
    if (cardsToReview.length === 0) {
      return (
        <div className="text-center py-5">
          <p>No cards found in this collection.</p>
          <Button variant="primary" onClick={() => setCurrentMode(MODES.SELECT_COLLECTION)}>Select Another Collection</Button>
        </div>
      );
    }

    const currentCard = cardsToReview[currentCardIndex];
    const progressPercentage = ((currentCardIndex + 1) / cardsToReview.length) * 100;

    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <Badge bg="primary" className="me-2">{selectedCollection.name}</Badge>
            <span className="text-muted">Mode Quiz</span>
          </h4>
          <div>
            <span className="me-2">{currentCardIndex + 1} of {cardsToReview.length}</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleSkipCard}
            >
              Skip
            </Button>
          </div>
        </div>

        <ProgressBar 
          now={progressPercentage} 
          variant="success" 
          className="mb-4"
        />

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h3 className="mb-4">{currentCard.question}</h3>
            
            <div className="quiz-options">
              {quizOptions.map((option, index) => (
                <div 
                  key={index}
                  className={`quiz-option ${selectedOption === option ? 'selected' : ''} ${
                    showQuizResult && option === currentCard.answer ? 'correct' : ''
                  } ${
                    showQuizResult && selectedOption === option && option !== currentCard.answer ? 'incorrect' : ''
                  }`}
                  onClick={() => !showQuizResult && handleQuizOptionSelect(option)}
                >
                  <div className="d-flex align-items-center">
                    <div className="me-3">{String.fromCharCode(65 + index)}.</div>
                    <div>{option}</div>
                    {showQuizResult && option === currentCard.answer && (
                      <FiCheck className="ms-auto text-success" size={20} />
                    )}
                    {showQuizResult && selectedOption === option && option !== currentCard.answer && (
                      <FiX className="ms-auto text-danger" size={20} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {!showQuizResult ? (
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={handleSkipCard}
            >
              Passer
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCheckQuizAnswer}
              disabled={!selectedOption}
            >
              Vérifier la réponse
            </Button>
          </div>
        ) : (
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={() => handleNextCard()}
              className="d-flex align-items-center"
            >
              Next Card <FiArrowRight className="ms-2" />
            </Button>
          </div>
        )}
      </Container>
    );
  };

  // Render test mode
  const renderTestMode = () => {
    if (cardsToReview.length === 0) {
      return (
        <div className="text-center py-5">
          <p>No cards found in this collection.</p>
          <Button variant="primary" onClick={() => setCurrentMode(MODES.SELECT_COLLECTION)}>Select Another Collection</Button>
        </div>
      );
    }

    const currentCard = cardsToReview[currentCardIndex];
    const progressPercentage = ((currentCardIndex + 1) / cardsToReview.length) * 100;

    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>
            <Badge bg="primary" className="me-2">{selectedCollection.name}</Badge>
            <span className="text-muted">Mode Test</span>
          </h4>
          <div>
            <span className="me-2">{currentCardIndex + 1} of {cardsToReview.length}</span>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleSkipCard}
            >
              Skip
            </Button>
          </div>
        </div>

        <ProgressBar 
          now={progressPercentage} 
          variant="success" 
          className="mb-4"
        />

        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <h3 className="mb-4">{currentCard.question}</h3>
            
            {!testResult.show ? (
              <Form onSubmit={(e) => { e.preventDefault(); handleCheckTestAnswer(); }}>
                <Form.Group className="mb-3">
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    placeholder="Écrivez votre réponse ici..."
                    value={testAnswer}
                    onChange={(e) => setTestAnswer(e.target.value)}
                    disabled={testResult.show}
                  />
                </Form.Group>
              </Form>
            ) : (
              <div className={`test-result ${testResult.correct ? 'correct' : 'incorrect'}`}>
                <div className="d-flex align-items-center mb-2">
                  {testResult.correct ? (
                    <>
                      <FiCheck className="text-success me-2" size={20} />
                      <strong>Correct !</strong>
                    </>
                  ) : (
                    <>
                      <FiX className="text-danger me-2" size={20} />
                      <strong>Incorrect</strong>
                    </>
                  )}
                </div>
                <p className="mb-0"><strong>Votre réponse :</strong> {testAnswer}</p>
                {!testResult.correct && (
                  <p className="mb-0 mt-2"><strong>Réponse correcte :</strong> {currentCard.answer}</p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {!testResult.show ? (
          <div className="d-flex justify-content-between">
            <Button 
              variant="outline-secondary" 
              onClick={handleSkipCard}
            >
              Skip
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCheckTestAnswer}
              disabled={!testAnswer.trim()}
            >
              Vérifier la réponse
            </Button>
          </div>
        ) : (
          <div className="d-flex justify-content-end">
            <Button 
              variant="primary" 
              onClick={() => handleNextCard()}
              className="d-flex align-items-center"
            >
              Next Card <FiArrowRight className="ms-2" />
            </Button>
          </div>
        )}
      </Container>
    );
  };

  // Render completion screen
  const renderCompletionScreen = () => (
    <Container className="text-center py-5">
      <h1 className="mb-4">Session terminée !</h1>
      <p className="fs-4 mb-4">Vous avez révisé toutes vos cartes. Excellent travail !</p>
      
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h4 className="mb-3">Vos résultats</h4>
          <Row className="text-center">
            <Col>
              <div className="fs-1 text-success">{stats.correct}</div>
              <div className="text-muted">Correct</div>
            </Col>
            <Col>
              <div className="fs-1 text-danger">{stats.incorrect}</div>
              <div className="text-muted">Incorrect</div>
            </Col>
            <Col>
              <div className="fs-1 text-warning">{stats.skipped}</div>
              <div className="text-muted">Passé</div>
            </Col>
            <Col>
              <div className="fs-1">{stats.total}</div>
              <div className="text-muted">Total</div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      <div className="d-flex justify-content-center gap-3">
        <Button 
          variant="outline-primary" 
          size="lg" 
          onClick={handleRestartSession}
          className="d-flex align-items-center"
        >
          <FiRotateCw className="me-2" /> Nouvelle session
        </Button>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleReturnToDashboard}
        >
          Retour au tableau de bord
        </Button>
      </div>
    </Container>
  );

  // Render the appropriate screen based on current mode
  const renderContent = () => {
    switch (currentMode) {
      case MODES.SELECT_MODE:
        return renderModeSelection();
      case MODES.SELECT_COLLECTION:
        return renderCollectionSelection();
      case MODES.CLASSIC_REVIEW:
        return renderClassicReview();
      case MODES.QUIZ_MODE:
        return renderQuizMode();
      case MODES.TEST_MODE:
        return renderTestMode();
      case MODES.COMPLETED:
        return renderCompletionScreen();
      default:
        return renderModeSelection();
    }
  };

  return renderContent();
};

export default ReviewPage;
