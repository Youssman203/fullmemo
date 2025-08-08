// src/pages/ReviewCards.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FiClock, FiBookOpen, FiArrowLeft, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const ReviewCards = () => {
  const navigate = useNavigate();
  const { getFlashcardsDueNow } = useData();
  const [reviewData, setReviewData] = useState({
    total: 0,
    difficultCards: 0,
    easyCards: 0,
    cards: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getFlashcardsDueNow();
        setReviewData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des cartes à revoir:', error);
        setError('Erreur lors du chargement des cartes à revoir');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
  }, [getFlashcardsDueNow]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'À l\'instant';
    } else if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours}h`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days}j`;
    }
  };

  const getCardType = (card) => {
    if (card.interval <= 0.01) {
      return {
        type: 'recent',
        label: 'Récent',
        color: 'warning',
        bgColor: 'bg-warning',
        textColor: 'text-warning',
        description: 'À revoir dans 5 minutes'
      };
    } else {
      return {
        type: 'reviewed',
        label: 'Révisé',
        color: 'info',
        bgColor: 'bg-info',
        textColor: 'text-info',
        description: 'À revoir dans 1 jour'
      };
    }
  };

  const startReviewWithCards = () => {
    // Rediriger vers la page de révision avec les cartes dues
    navigate('/review', { 
      state: { 
        mode: 'classic',
        cardsToReview: reviewData.cards 
      }
    });
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3">Chargement des cartes à réviser...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/home')}>
            Retour au dashboard
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={() => navigate('/home')}
                className="me-3"
              >
                <FiArrowLeft className="me-1" />
                Retour
              </Button>
              <div>
                <h2 className="mb-1">
                  <FiClock className="me-2" />
                  Cartes à réviser
                </h2>
                <p className="text-muted mb-0">
                  {reviewData.total} carte{reviewData.total > 1 ? 's' : ''} en attente de révision
                </p>
              </div>
            </div>
            {reviewData.total > 0 && (
              <Button 
                variant="primary" 
                onClick={startReviewWithCards}
                className="d-flex align-items-center"
              >
                <FiBookOpen className="me-2" />
                Commencer la révision
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="rounded-circle bg-danger bg-opacity-20 p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                <FiClock size={24} className="text-danger" />
              </div>
              <h4 className="mb-1">{reviewData.difficultCards}</h4>
              <p className="text-muted mb-0">Cartes difficiles</p>
              <small className="text-muted">À revoir dans 5 min</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="rounded-circle bg-success bg-opacity-20 p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                <FiTrendingUp size={24} className="text-success" />
              </div>
              <h4 className="mb-1">{reviewData.easyCards}</h4>
              <p className="text-muted mb-0">Cartes faciles</p>
              <small className="text-muted">À revoir dans 1 jour</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="rounded-circle bg-primary bg-opacity-20 p-3 mx-auto mb-3" style={{width: 'fit-content'}}>
                <FiBookOpen size={24} className="text-primary" />
              </div>
              <h4 className="mb-1">{reviewData.total}</h4>
              <p className="text-muted mb-0">Total</p>
              <small className="text-muted">Cartes à réviser</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des cartes */}
      {reviewData.total === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="text-muted mb-3">
              <FiBookOpen size={48} />
            </div>
            <h5>Aucune carte à réviser</h5>
            <p className="text-muted mb-4">
              Toutes vos cartes sont à jour ! Revenez plus tard ou créez de nouvelles cartes.
            </p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/flashcards" className="btn btn-primary">
                Créer une nouvelle carte
              </Link>
              <Link to="/collections" className="btn btn-outline-primary">
                Voir mes collections
              </Link>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0">Liste des cartes</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {reviewData.cards.map((card, index) => {
              const cardType = getCardType(card);
              return (
                <div 
                  key={card._id || card.id} 
                  className={`p-3 border-bottom ${index === reviewData.cards.length - 1 ? 'border-bottom-0' : ''}`}
                >
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="d-flex align-items-start">
                        <div className={`rounded-circle ${cardType.bgColor} bg-opacity-20 p-2 me-3 flex-shrink-0`}>
                          <FiBookOpen size={16} className={cardType.textColor} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{card.question}</h6>
                          <p className="text-muted mb-2 small">{card.answer}</p>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg={cardType.color} className="small">
                              {cardType.label}
                            </Badge>
                            {card.collection && (
                              <span className="text-muted small">
                                {card.collection.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="text-muted small">
                        <FiCalendar className="me-1" />
                        {formatDate(card.nextReviewDate)}
                      </div>
                      <div className="text-muted small mt-1">
                        {cardType.description}
                      </div>
                    </Col>
                    <Col md={3} className="text-end">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => navigate('/review', { 
                          state: { 
                            mode: 'classic',
                            cardsToReview: [card],
                            startIndex: 0
                          }
                        })}
                      >
                        Réviser maintenant
                      </Button>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ReviewCards;
