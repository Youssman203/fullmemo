// src/components/CollectionPreviewModal.js
import React, { useState, useEffect } from 'react';
import { 
  Modal, Button, Card, Badge, Spinner, Alert, Table, ListGroup 
} from 'react-bootstrap';
import { 
  FiBook, FiBookOpen, FiUser, FiCalendar, FiLayers, FiDownload, FiEye, FiClock 
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';

const CollectionPreviewModal = ({ 
  show, 
  onHide, 
  collection, 
  classInfo,
  onImport, 
  isImporting = false 
}) => {
  const { getClassCollectionCards } = useData();
  const [cards, setCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (show && collection) {
      // Reset les cartes quand on change de collection
      setCards([]);
      setShowCards(false);
    }
  }, [show, collection]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadCards = async () => {
    if (!collection._id || !classInfo._id || cards.length > 0) return;
    
    try {
      setLoadingCards(true);
      console.log('📖 Chargement cartes:', { classId: classInfo._id, collectionId: collection._id });
      
      const response = await getClassCollectionCards(classInfo._id, collection._id);
      console.log('✅ Cartes chargées:', response);
      
      setCards(response.data || []);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cartes:', error);
      // En cas d'erreur, on affiche un message plutôt que de laisser vide
      setCards([]);
    } finally {
      setLoadingCards(false);
    }
  };

  const toggleCardsView = () => {
    if (!showCards && cards.length === 0) {
      loadCards();
    }
    setShowCards(!showCards);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'facile': return 'success';
      case 'moyen': return 'warning';
      case 'difficile': return 'danger';
      default: return 'secondary';
    }
  };

  if (!collection) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FiBook className="me-2 text-primary" />
          Aperçu de la Collection
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Informations de la collection */}
        <Card className="mb-4">
          <Card.Header className="bg-primary text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{collection.name}</h5>
              <Badge bg="light" text="dark" pill>
                {collection.cardCount || 0} cartes
              </Badge>
            </div>
          </Card.Header>
          
          <Card.Body>
            <div className="row">
              <div className="col-md-8">
                <h6 className="text-muted mb-2">Description</h6>
                <p className="mb-3">
                  {collection.description || 'Aucune description disponible.'}
                </p>
                
                <div className="d-flex flex-wrap gap-3 small text-muted">
                  <div className="d-flex align-items-center">
                    <FiUser className="me-1" />
                    <strong>Créateur:</strong> {collection.createdBy?.name || 'Enseignant'}
                  </div>
                  <div className="d-flex align-items-center">
                    <FiCalendar className="me-1" />
                    <strong>Créée le:</strong> {formatDate(collection.createdAt)}
                  </div>
                  <div className="d-flex align-items-center">
                    <FiClock className="me-1" />
                    <strong>Modifiée le:</strong> {formatDate(collection.updatedAt)}
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="border rounded p-3 bg-light">
                  <h6 className="text-muted mb-2">Statistiques</h6>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span><FiLayers className="me-2" />Cartes:</span>
                    <Badge bg="primary">{collection.cardCount || 0}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span><FiBook className="me-2" />Matière:</span>
                    <Badge bg="secondary">{collection.subject || 'Général'}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <span><FiUser className="me-2" />Niveau:</span>
                    <Badge bg="info">{collection.level || 'Tous niveaux'}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Informations de la classe */}
        {classInfo && (
          <Card className="mb-4">
            <Card.Header className="bg-secondary text-white">
              <h6 className="mb-0">Partagée par la classe</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{classInfo.name}</strong>
                  <p className="mb-0 text-muted small">{classInfo.description}</p>
                </div>
                <div className="text-end">
                  <div className="small text-muted">Enseignant</div>
                  <strong>{classInfo.teacher?.name || 'Enseignant'}</strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Aperçu des cartes */}
        <Card>
          <Card.Header 
            className="d-flex justify-content-between align-items-center cursor-pointer"
            onClick={toggleCardsView}
            style={{ cursor: 'pointer' }}
          >
            <h6 className="mb-0 d-flex align-items-center">
              <FiEye className="me-2" />
              Aperçu des cartes ({collection.cardCount || 0})
            </h6>
            <Button variant="outline-primary" size="sm">
              {showCards ? 'Masquer' : 'Voir les cartes'}
            </Button>
          </Card.Header>
          
          {showCards && (
            <Card.Body style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {loadingCards ? (
                <div className="text-center py-4">
                  <Spinner animation="border" className="me-2" />
                  Chargement des cartes...
                </div>
              ) : cards.length > 0 ? (
                <ListGroup variant="flush">
                  {cards.slice(0, 5).map((card, index) => (
                    <ListGroup.Item key={card._id} className="px-0">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="fw-semibold mb-1">
                            {card.question}
                          </div>
                          <div className="text-muted small">
                            {card.answer}
                          </div>
                        </div>
                        <Badge bg={getDifficultyColor(card.difficulty)} className="ms-2">
                          {card.difficulty}
                        </Badge>
                      </div>
                    </ListGroup.Item>
                  ))}
                  {cards.length > 5 && (
                    <ListGroup.Item className="px-0 text-center text-muted">
                      <small>... et {cards.length - 5} cartes supplémentaires</small>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              ) : (
                <Alert variant="info" className="mb-0">
                  <FiBookOpen className="me-2" />
                  Cette collection ne contient aucune carte.
                </Alert>
              )}
            </Card.Body>
          )}
        </Card>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
        
        <Button 
          variant="primary" 
          onClick={() => onImport(collection._id, collection.name)}
          disabled={isImporting || !collection.cardCount || collection.cardCount === 0}
          className="d-flex align-items-center"
        >
          {isImporting ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Importation...
            </>
          ) : (
            <>
              <FiDownload className="me-2" />
              Importer cette collection
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CollectionPreviewModal;
