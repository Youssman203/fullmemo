// src/pages/ReviewPage.js
import React, { useState, useEffect } from 'react';
import { getCollectionColor } from '../utils/colorUtils';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { user } = useAuth();
  const { collections, cards, getCardsByCollection, updateCardReview, startReviewSession, updateReviewSession } = useData();
  
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
  const [quizOptionsCache, setQuizOptionsCache] = useState(new Map()); // Cache des options par carte
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

  // State for session tracking
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  // Détecter les sessions spéciales passées via navigation
  useEffect(() => {
    const navigationState = location.state;
    if (navigationState && navigationState.specialSession) {
      console.log('Session spéciale détectée:', navigationState);
      
      // Configurer la session avec les cartes fournies (triées et dédupliquées)
      const providedCards = navigationState.cardsToReview || [];
      
      // Éliminer les doublons avec la même logique robuste
      const seenIds = new Set();
      const uniqueCards = providedCards.filter(card => {
        const cardId = card._id || card.id;
        if (!cardId) {
          console.warn('Carte sans ID trouvée dans la session spéciale:', card);
          return false;
        }
        
        const idString = String(cardId);
        if (seenIds.has(idString)) {
          console.log('Doublon détecté et éliminé dans la session spéciale:', cardId);
          return false;
        }
        
        seenIds.add(idString);
        return true;
      });
      
      // Trier par ordre de création
      const sortedCards = uniqueCards.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.createdDate || 0);
        const dateB = new Date(b.createdAt || b.createdDate || 0);
        return dateA - dateB;
      });
      
      console.log(`Session spéciale: ${providedCards.length} cartes fournies, ${uniqueCards.length} uniques, ${sortedCards.length} triées`);
      
      setSelectedMode(navigationState.mode || 'classic');
      setCardsToReview(sortedCards);
      setCurrentMode(MODES.CLASSIC_REVIEW);
      setCurrentCardIndex(0);
      
      // Démarrer une session de révision
      const startSpecialSession = async () => {
        try {
          const sessionData = {
            mode: navigationState.mode || 'classic',
            specialSession: true,
            title: navigationState.sessionTitle || 'Session spéciale'
          };
          const session = await startReviewSession(sessionData);
          setCurrentSession(session.data || session);
          setSessionStartTime(new Date());
          console.log('Session spéciale démarrée:', session);
        } catch (error) {
          console.error('Erreur lors du démarrage de la session spéciale:', error);
        }
      };
      
      if (navigationState.cardsToReview && navigationState.cardsToReview.length > 0) {
        startSpecialSession();
      }
    }
  }, [location.state, startReviewSession]);

  // Shuffle cards when collection is selected
  useEffect(() => {
    if (selectedCollection) {
      // Créer une fonction async interne pour récupérer les cartes
      const fetchAndSetCards = async () => {
        try {
          console.log('🔍 [ReviewPage] Début récupération cartes pour collection:', selectedCollection);
          console.log('🔍 [ReviewPage] ID utilisé:', selectedCollection._id || selectedCollection.id);
          
          // Récupérer les cartes de façon asynchrone
          const response = await getCardsByCollection(selectedCollection._id || selectedCollection.id);
          console.log('🔍 [ReviewPage] Réponse API cartes:', response);
          
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
          
          console.log('🔍 [ReviewPage] Cartes extraites:', collectionCards.length, 'cartes');
          if (collectionCards.length > 0) {
            console.log('🔍 [ReviewPage] Première carte:', collectionCards[0]);
          }
          
          // Éliminer les doublons basés sur l'ID avec une approche plus robuste
          const seenIds = new Set();
          const uniqueCards = collectionCards.filter(card => {
            const cardId = card._id || card.id;
            if (!cardId) {
              console.warn('Carte sans ID trouvée:', card);
              return false; // Exclure les cartes sans ID
            }
            
            const idString = String(cardId);
            if (seenIds.has(idString)) {
              console.log('Doublon détecté et éliminé:', cardId);
              return false;
            }
            
            seenIds.add(idString);
            return true;
          });
          
          console.log(`Cartes récupérées: ${collectionCards.length}, Cartes uniques: ${uniqueCards.length}`);
          
          // Trier par ordre de création (du plus ancien au plus récent)
          const sortedCards = uniqueCards.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.createdDate || 0);
            const dateB = new Date(b.createdAt || b.createdDate || 0);
            return dateA - dateB; // Tri croissant (plus ancien en premier)
          });
          
          setCardsToReview(sortedCards);
          setStats(prev => ({ ...prev, total: sortedCards.length }));
          console.log('Cartes triées par ordre de création et prêtes pour la révision:', sortedCards.length);
          
          // Log des premières cartes pour vérification
          if (sortedCards.length > 0) {
            console.log('Première carte:', sortedCards[0].question, 'créée le:', sortedCards[0].createdAt);
            if (sortedCards.length > 1) {
              console.log('Dernière carte:', sortedCards[sortedCards.length - 1].question, 'créée le:', sortedCards[sortedCards.length - 1].createdAt);
            }
          }
        } catch (error) {
          console.error('❌ [ReviewPage] Erreur lors de la récupération des cartes:', error);
          console.error('❌ [ReviewPage] Collection ID utilisé:', selectedCollection._id || selectedCollection.id);
          console.error('❌ [ReviewPage] Collection complète:', selectedCollection);
          setCardsToReview([]);
          setStats(prev => ({ ...prev, total: 0 }));
        }
      };
      
      // Exécuter la fonction asynchrone
      fetchAndSetCards();
    }
  }, [selectedCollection, getCardsByCollection]);

  // Reset states when moving to a new card - TOUJOURS EXÉCUTÉ EN PREMIER
  useEffect(() => {
    // Ce code doit être exécuté en premier lors du changement de carte
    if (cardsToReview.length > 0) {
      console.log('Réinitialisation des états pour une nouvelle carte');
      
      // Réinitialiser complètement tous les états du quiz
      setIsFlipped(false);
      setSelectedOption(null);
      setShowQuizResult(false);
      setTestAnswer('');
      setTestResult({ show: false, correct: false });
    }
  }, [currentCardIndex, cardsToReview.length]);

  // Generate quiz options when in quiz mode and card changes - EXÉCUTÉ APRÈS la réinitialisation
  useEffect(() => {
    // S'assurer que cette effet est exécuté APRÈS la réinitialisation des états
    if (currentMode === MODES.QUIZ_MODE && cardsToReview.length > 0) {
      // Petit délai pour s'assurer que les états sont bien réinitialisés
      const timer = setTimeout(() => {
        console.log('Génération des options du quiz pour la nouvelle carte');
        generateQuizOptions();
      }, 50);
      
      // Nettoyage du timer si le composant est démonté
      return () => clearTimeout(timer);
    }
  }, [currentCardIndex, currentMode, cardsToReview]);

  // Generate multiple choice options for quiz mode
  const generateQuizOptions = () => {
    if (cardsToReview.length === 0) return;
    
    const currentCard = cardsToReview[currentCardIndex];
    const cardId = currentCard._id || currentCard.id;
    
    // Vérifier si les options existent déjà dans le cache pour cette carte
    if (quizOptionsCache.has(cardId)) {
      const cachedOptions = quizOptionsCache.get(cardId);
      setQuizOptions(cachedOptions);
      console.log('Options du quiz récupérées depuis le cache pour la carte:', cardId);
      return;
    }
    
    const correctAnswer = currentCard.answer;
    
    // Créer une liste de toutes les cartes sauf la carte actuelle
    const otherCards = cards.filter(c => {
      // Exclure la carte actuelle par ID
      if (c.id && currentCard.id) {
        return c.id !== currentCard.id;
      }
      if (c._id && currentCard._id) {
        return c._id !== currentCard._id;
      }
      // Exclure les cartes qui ont la même réponse que la carte actuelle
      if (c.answer === correctAnswer) {
        return false;
      }
      return true; // Si pas d'ID à comparer mais réponse différente, inclure la carte
    });
    
    // Vérification stricte des doublons: créer un ensemble de réponses uniques
    const uniqueAnswersSet = new Set();
    const uniqueAnswers = [];
    
    // Traitement des réponses pour éliminer les doublons
    otherCards.forEach(card => {
      if (card.answer && card.answer.trim() !== '') {
        // Normaliser la réponse (enlever les espaces superflus, mettre en minuscules)
        const normalizedAnswer = card.answer.trim();
        
        // Vérifier si cette réponse (ou une version très similaire) existe déjà
        if (!uniqueAnswersSet.has(normalizedAnswer.toLowerCase())) {
          uniqueAnswersSet.add(normalizedAnswer.toLowerCase());
          uniqueAnswers.push(card.answer); // Garder la version originale pour l'affichage
        }
      }
    });
    
    // Si nous n'avons pas assez de réponses disponibles (moins de 3)
    if (uniqueAnswers.length < 3) {
      console.warn('Pas assez de réponses uniques disponibles dans les cartes existantes');
      
      // Compléter avec des données de démonstration si nécessaire
      const demoAnswers = [
        'Paris', 'Londres', 'Berlin', 'Madrid', 'Rome', 'Lisbonne', 'Bruxelles', 'Amsterdam',
        'Chat', 'Chien', 'Poisson', 'Oiseau', 'Serpent', 'Tortue', 'Hamster',
        'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift',
        '1492', '1789', '1945', '1969', '2000', '2020'
      ];
      
      // Ajouter des réponses de démo qui ne sont pas égales à la bonne réponse
      for (const demoAnswer of demoAnswers) {
        const normalizedDemo = demoAnswer.trim().toLowerCase();
        const normalizedCorrect = correctAnswer.trim().toLowerCase();
        
        if (normalizedDemo !== normalizedCorrect && !uniqueAnswersSet.has(normalizedDemo)) {
          uniqueAnswersSet.add(normalizedDemo);
          uniqueAnswers.push(demoAnswer);
          
          // S'arrêter quand nous avons exactement 3 réponses alternatives
          if (uniqueAnswers.length >= 3) break;
        }
      }
    }
    
    // Mélanger les réponses possibles
    const shuffledAnswers = uniqueAnswers.sort(() => Math.random() - 0.5);
    
    // Prendre exactement 3 réponses incorrectes pour avoir 4 options au total
    const selectedWrongAnswers = shuffledAnswers.slice(0, 3);
    
    // Vérification finale: s'assurer qu'il n'y a pas de doublons avec la réponse correcte
    const finalWrongAnswers = selectedWrongAnswers.filter(answer => {
      return answer.trim().toLowerCase() !== correctAnswer.trim().toLowerCase();
    });
    
    // Combiner et mélanger les options avec la bonne réponse
    const options = [correctAnswer, ...finalWrongAnswers].sort(() => Math.random() - 0.5);
    
    // Sauvegarder les options dans le cache pour cette carte
    setQuizOptionsCache(prev => {
      const newCache = new Map(prev);
      newCache.set(cardId, options);
      return newCache;
    });
    
    // Définir les options du quiz
    setQuizOptions(options);
    console.log(`Quiz options générées et mises en cache: 4 options au total (1 correcte + 3 distracteurs uniques)`);
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
  const handleStartReview = async () => {
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
      
      // Démarrer une session de révision
      try {
        const sessionData = {
          collection: selectedCollection._id || selectedCollection.id,
          mode: selectedMode
        };
        const session = await startReviewSession(sessionData);
        setCurrentSession(session.data || session);
        setSessionStartTime(new Date());
        console.log('Session de révision démarrée:', session);
      } catch (error) {
        console.error('Erreur lors du démarrage de la session:', error);
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

  // Fonction utilitaire pour normaliser une chaîne de caractères
  const normalizeString = (str) => {
    if (!str) return '';
    
    return str
      .trim() // Supprimer les espaces en début et fin
      .toLowerCase() // Convertir en minuscules
      .normalize('NFD') // Décomposer les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les diacritiques (accents)
      .replace(/[.,;:!?"'()\[\]{}]/g, '') // Supprimer la ponctuation courante
      .replace(/\s+/g, ' ') // Normaliser les espaces multiples en un seul
      .trim(); // Supprimer les espaces résiduels
  };

  // Fonction pour vérifier si deux réponses sont équivalentes
  const areAnswersEquivalent = (userAnswer, correctAnswer) => {
    const normalizedUser = normalizeString(userAnswer);
    const normalizedCorrect = normalizeString(correctAnswer);
    
    // Vérification exacte après normalisation
    if (normalizedUser === normalizedCorrect) {
      return true;
    }
    
    // Vérification de similarité pour les réponses très proches
    // Accepter si la différence de longueur est minime et qu'il y a une correspondance partielle
    if (Math.abs(normalizedUser.length - normalizedCorrect.length) <= 2) {
      // Vérifier si l'une contient l'autre (pour gérer les articles, prépositions, etc.)
      if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
        return true;
      }
      
      // Vérifier la similarité par mots
      const userWords = normalizedUser.split(' ').filter(word => word.length > 2);
      const correctWords = normalizedCorrect.split(' ').filter(word => word.length > 2);
      
      if (userWords.length > 0 && correctWords.length > 0) {
        const commonWords = userWords.filter(word => correctWords.includes(word));
        const similarity = commonWords.length / Math.max(userWords.length, correctWords.length);
        
        // Accepter si au moins 80% des mots importants correspondent
        if (similarity >= 0.8) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Check test answer
  const handleCheckTestAnswer = () => {
    if (!testAnswer.trim()) return;
    
    const currentCard = cardsToReview[currentCardIndex];
    const isCorrect = areAnswersEquivalent(testAnswer, currentCard.answer);
    
    // Log pour debugging
    console.log('Vérification réponse test:', {
      userAnswer: testAnswer,
      correctAnswer: currentCard.answer,
      normalizedUser: normalizeString(testAnswer),
      normalizedCorrect: normalizeString(currentCard.answer),
      isCorrect
    });
    
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
  const handleNextCard = async (quality = null) => {
    // In classic mode, update the spaced repetition algorithm and stats
    if (currentMode === MODES.CLASSIC_REVIEW && quality !== null) {
      const currentCard = cardsToReview[currentCardIndex];
      const performance = convertPerformanceValue(quality);
      
      // Calculer le temps passé sur cette carte (estimation)
      const timeSpent = sessionStartTime ? Math.round((new Date() - sessionStartTime) / cardsToReview.length / 1000) : 0;
      
      // Formater les données pour correspondre à ce qu'attend le backend
      const reviewData = {
        performance,
        timeSpent
      };
      
      console.log('Envoi des données de performance:', reviewData);
      
      try {
        updateCardReview(currentCard.id || currentCard._id, reviewData);
        
        // Ajouter la carte à la session si elle existe
        if (currentSession) {
          const isCorrect = quality === 3; // 3 = Facile, 1 = Difficile
          await updateReviewSession(currentSession._id || currentSession.id, {
            flashcardId: currentCard.id || currentCard._id,
            performance,
            timeSpent,
            isCorrect
          });
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la révision:', error);
        // Continuer malgré l'erreur pour ne pas bloquer l'expérience utilisateur
      }
      
      // Mettre à jour les statistiques : quality 3 = facile (correct), quality 1 = difficile (incorrect)
      const isCorrect = quality === 3; // 3 = Facile, 1 = Difficile
      setStats(prev => ({
        ...prev,
        correct: isCorrect ? prev.correct + 1 : prev.correct,
        incorrect: !isCorrect ? prev.incorrect + 1 : prev.incorrect
      }));
    }
    
    // CORRECTION CRITIQUE : Réinitialiser IMMÉDIATEMENT tous les états pour éviter les fuites visuelles
    // 1. Réinitialiser l'état de retournement de carte (CRITIQUE pour éviter de voir la réponse suivante)
    setIsFlipped(false);
    
    // 2. Réinitialiser tous les autres états
    setSelectedOption(null);
    setShowQuizResult(false);
    setTestAnswer('');
    setTestResult({ show: false, correct: false });
    
    // 3. Passer à la carte suivante ou terminer la session
    if (currentCardIndex < cardsToReview.length - 1) {
      console.log('Passage à la carte suivante, index:', currentCardIndex + 1);
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // Session finished
      console.log('Session terminée, passage à l\'écran de complétion');
      
      // Terminer la session de révision
      if (currentSession) {
        try {
          await updateReviewSession(currentSession._id || currentSession.id, {
            completed: true
          });
          console.log('Session de révision terminée');
        } catch (error) {
          console.error('Erreur lors de la fermeture de la session:', error);
        }
      }
      
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
    setQuizOptionsCache(new Map()); // Nettoyer le cache des options
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
                <div 
                  className="modern-collection-header"
                  style={{
                    backgroundColor: collection.color || getCollectionColor(collection.name),
                    height: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderTopLeftRadius: '0.375rem',
                    borderTopRightRadius: '0.375rem'
                  }}
                >
                  <div className="collection-icon" style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    <i className="fas fa-layer-group"></i>
                  </div>
                  <Badge 
                    className="collection-card-count" 
                    bg="light" 
                    text="dark"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      fontSize: '0.8rem',
                      padding: '0.35em 0.65em'
                    }}
                  >
                    {collection.cardCount || 0} cartes
                  </Badge>
                </div>
                <Card.Body>
                  <Card.Title>{collection.name}</Card.Title>
                  <Card.Text className="text-muted">
                    {collection.cardCount || 0} cartes
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
            {location.state && location.state.specialSession ? (
              <>
                <Badge bg="warning" className="me-2">
                  <FiBook className="me-1" />
                  Session spéciale
                </Badge>
                <span className="text-muted">Cartes à revoir</span>
              </>
            ) : (
              <>
                <Badge bg="primary" className="me-2">{selectedCollection?.name || 'Collection'}</Badge>
                <span className="text-muted">Révision classique</span>
              </>
            )}
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
              <Button variant="danger" onClick={() => handleNextCard(1)}>Difficile</Button>
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
              <div className="text-muted">{selectedMode === 'classic' ? 'Facile' : 'Correct'}</div>
            </Col>
            <Col>
              <div className="fs-1 text-danger">{stats.incorrect}</div>
              <div className="text-muted">{selectedMode === 'classic' ? 'Difficile' : 'Incorrect'}</div>
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
