import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Form, Modal, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiCheck, FiFilter, FiSearch } from 'react-icons/fi';
import { getCollectionName } from '../components/CardCollectionDisplay';
import '../assets/flashcards.css';

const Flashcards = () => {
  const { user } = useAuth();
  const { cards, collections, createFlashcard, updateFlashcard, deleteFlashcard, getFlashcardsByCollection } = useData();
  
  // State for card management
  const [allCards, setAllCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for card form
  const [showModal, setShowModal] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [collectionId, setCollectionId] = useState('');
  
  // State for card preview
  const [previewCard, setPreviewCard] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [flipped, setFlipped] = useState(false);
  
  // State for feedback
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  // Initialize data
  useEffect(() => {
    if (cards && cards.length > 0) {
      // Normaliser toutes les cartes pour garantir la cohérence des propriétés
      const normalizedCards = cards.map(card => ({
        ...card,
        // S'assurer que chaque carte a collectionId, même si elle utilise collection
        collectionId: card.collectionId || card.collection
      }));
      
      console.log('Cartes normalisées:', normalizedCards);
      setAllCards(normalizedCards);
      setFilteredCards(normalizedCards);
      
      // Set default collection if available
      if (collections && collections.length > 0 && !collectionId) {
        setCollectionId(collections[0].id || collections[0]._id);
      }
    }
  }, [cards, collections, collectionId]);

  // Filter cards based on collection and search query
  useEffect(() => {
    let result = [...allCards];
    
    // Filter by collection
    if (selectedCollection !== 'all') {
      result = result.filter(card => 
        // Vérifier à la fois collectionId et collection pour être compatible avec les deux formats
        card.collectionId === selectedCollection || card.collection === selectedCollection
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.question.toLowerCase().includes(query) || 
        card.answer.toLowerCase().includes(query)
      );
    }
    
    setFilteredCards(result);
  }, [allCards, selectedCollection, searchQuery]);

  // Reset form fields
  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setEditingCardId(null);
    setFlipped(false);
  };

  // Open modal for new card
  const handleAddCard = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing card
  const handleEditCard = async (cardId) => {
    try {
      // Trouver la carte dans l'état local d'abord
      let cardToEdit = allCards.find(card => card.id === cardId || card._id === cardId);
      
      // Si la carte n'est pas trouvée localement, essayer de la récupérer du serveur
      if (!cardToEdit && cardId) {
        const collectionId = allCards.find(card => card.id === cardId || card._id === cardId)?.collectionId;
        if (collectionId) {
          const cardsFromCollection = await getFlashcardsByCollection(collectionId);
          cardToEdit = cardsFromCollection.find(card => card.id === cardId || card._id === cardId);
        }
      }
      
      if (cardToEdit) {
        setQuestion(cardToEdit.question);
        setAnswer(cardToEdit.answer);
        setCollectionId(cardToEdit.collectionId);
        setEditingCardId(cardId);
        setShowModal(true);
      } else {
        showFeedback('Card not found', 'danger');
      }
    } catch (error) {
      console.error('Error loading card details:', error);
      showFeedback(error.message || 'Failed to load card details', 'danger');
    }
  };

  // Handle card deletion
  const handleDeleteCard = async (cardId) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      try {
        await deleteFlashcard(cardId);
        setAllCards(prevCards => prevCards.filter(card => card.id !== cardId));
        showFeedback('Card deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting card:', error);
        showFeedback(error.message || 'Failed to delete card', 'danger');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question || !answer || !collectionId) {
      showFeedback('Please fill all fields', 'danger');
      return;
    }

    // Le backend attend 'collection' et non 'collectionId'
    const cardData = { 
      question, 
      answer, 
      collection: collectionId // Renommé pour correspondre au modèle du backend
    };
    
    console.log('Données de la carte à créer:', cardData);
    
    console.log('Données de la carte à créer:', cardData);
    
    try {
      if (editingCardId) {
        // Update existing card
        const updatedCard = await updateFlashcard(editingCardId, cardData);
        console.log('Carte mise à jour:', updatedCard);
        setAllCards(prevCards => 
          prevCards.map(card => 
            (card.id === editingCardId || card._id === editingCardId) ? updatedCard : card
          )
        );
        showFeedback('Card updated successfully', 'success');
      } else {
        // Add new card
        console.log('Création d\'une nouvelle carte avec:', cardData);
        const response = await createFlashcard(cardData);
        console.log('Réponse du serveur:', response);
        
        // Extraire la carte créée de la réponse
        const newCard = response.data || response;
        console.log('Nouvelle carte créée:', newCard);
        
        // Normaliser la structure de la carte pour qu'elle soit cohérente avec le reste de l'application
        // Si la carte a une propriété 'collection' mais pas 'collectionId', créer collectionId
        const normalizedCard = {
          ...newCard,
          collectionId: newCard.collectionId || newCard.collection
        };
        
        console.log('Carte normalisée:', normalizedCard);
        
        // Ajouter la nouvelle carte à l'état local
        setAllCards(prevCards => [...prevCards, normalizedCard]);
        showFeedback('Card created successfully', 'success');
      }
    } catch (error) {
      console.error('Error saving flashcard:', error);
      showFeedback(error.message || 'Failed to save card', 'danger');
      return;
    }
    
    // Show preview of the new/updated card
    setPreviewCard({ ...cardData, id: editingCardId || 'new' });
    setShowPreview(true);
    
    // Close modal
    setShowModal(false);
    resetForm();
  };

  // Show feedback message
  const showFeedback = (message, type = 'success') => {
    setFeedback({ show: true, message, type });
    setTimeout(() => setFeedback({ show: false, message: '', type: 'success' }), 3000);
  };

  // Fonction utilitaire pour obtenir le nom d'une collection par son ID
  const getCollectionNameLocal = (cardOrCollectionId) => {
    return getCollectionName(collections, cardOrCollectionId);
  };

  return (
    <Container fluid className="py-4 px-4">
      {/* Header with search and filter */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">My Flashcards</h1>
          <p className="text-muted">Manage and review all your flashcards</p>
        </div>
        <Button 
          variant="primary" 
          className="d-flex align-items-center" 
          onClick={handleAddCard}
        >
          <FiPlus className="me-2" /> Create Card
        </Button>
      </div>

      {/* Feedback Alert */}
      {feedback.show && (
        <Alert variant={feedback.type} className="mb-4">
          {feedback.message}
        </Alert>
      )}

      {/* Search and Filter */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row>
            <Col md={6} className="mb-3 mb-md-0">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiSearch />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-start-0"
                />
              </div>
            </Col>
            <Col md={6}>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FiFilter />
                </span>
                <Form.Select 
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="border-start-0"
                >
                  <option value="all">All Collections</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Card Preview (when a card is just created/updated) */}
      {showPreview && previewCard && (
        <div className="mb-4">
          <Card className="shadow border-primary">
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Card Preview</h5>
              <Button 
                variant="link" 
                className="text-white p-0" 
                onClick={() => setShowPreview(false)}
              >
                <FiX size={20} />
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <Badge bg="info">{getCollectionNameLocal(previewCard.collectionId)}</Badge>
                <Button 
                  variant="link" 
                  className="p-0 text-primary" 
                  onClick={() => setFlipped(!flipped)}
                >
                  {flipped ? 'Show Question' : 'Show Answer'}
                </Button>
              </div>
              <div className="card-preview p-4 bg-light rounded">
                {!flipped ? (
                  <div className="question">
                    <h5 className="mb-0">Question:</h5>
                    <p className="mb-0 mt-2">{previewCard.question}</p>
                  </div>
                ) : (
                  <div className="answer">
                    <h5 className="mb-0">Answer:</h5>
                    <p className="mb-0 mt-2">{previewCard.answer}</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Cards Display */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredCards.length > 0 ? (
          filteredCards.map(card => (
            <Col key={card.id}>
              <Card className="h-100 shadow-sm border-0 card-hover">
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <Badge bg="secondary">{getCollectionNameLocal(card.collectionId)}</Badge>
                    <div className="card-actions">
                      <Button 
                        variant="link" 
                        className="p-1 text-primary" 
                        onClick={() => {
                          setPreviewCard(card);
                          setFlipped(false);
                          setShowPreview(true);
                        }}
                      >
                        <FiEye size={18} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-1 text-warning" 
                        onClick={() => handleEditCard(card.id)}
                      >
                        <FiEdit size={18} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-1 text-danger" 
                        onClick={() => handleDeleteCard(card.id)}
                      >
                        <FiTrash2 size={18} />
                      </Button>
                    </div>
                  </div>
                  <h5 className="card-title text-truncate mb-3">{card.question}</h5>
                  <p className="card-text text-muted text-truncate">
                    {card.answer.length > 100 ? `${card.answer.substring(0, 100)}...` : card.answer}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <div className="text-center py-5">
              <p className="mb-0">No flashcards found. Create your first card!</p>
            </div>
          </Col>
        )}
      </Row>

      {/* Card Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCardId ? 'Edit Card' : 'Create New Card'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="content" className="mb-3">
              <Tab eventKey="content" title="Card Content">
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter your question here"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Answer</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Enter your answer here"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Collection</Form.Label>
                  <Form.Select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    required
                  >
                    <option value="">Select a collection</option>
                    {collections.map(collection => (
                      <option key={collection.id || collection._id} value={collection.id || collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Tab>
              <Tab eventKey="preview" title="Live Preview">
                <div className="card-preview p-4 bg-light rounded mb-3">
                  <h5>Question:</h5>
                  <p className="mb-4">{question || 'Your question will appear here'}</p>
                  <hr />
                  <h5>Answer:</h5>
                  <p className="mb-0">{answer || 'Your answer will appear here'}</p>
                </div>
                {collectionId && (
                  <div className="mt-3">
                    <small className="text-muted">
                      This card will be added to the collection: <strong>{getCollectionNameLocal(collectionId)}</strong>
                    </small>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="d-flex align-items-center">
              <FiCheck className="me-2" /> {editingCardId ? 'Save Changes' : 'Create Card'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Flashcards;
