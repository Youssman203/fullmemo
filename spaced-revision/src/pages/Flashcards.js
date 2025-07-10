import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Container, Row, Col, Card, Button, Form, Modal, Tab, Tabs, Badge, Alert } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiX, FiCheck, FiFilter, FiSearch } from 'react-icons/fi';
import { getCollectionName } from '../components/CardCollectionDisplay';
import '../assets/flashcards.css';

const Flashcards = () => {
  // Récupération des données depuis le contexte
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
      console.log('==== DEBUG: ANALYSE DES DONNÉES ====');
      console.log('COLLECTIONS DISPONIBLES:', collections);
      
      // Afficher les structures des premières cartes pour inspection
      console.log('STRUCTURE DES 3 PREMIÈRES CARTES:');
      cards.slice(0, 3).forEach((card, index) => {
        console.log(`CARTE ${index + 1}:`, {
          id: card.id || card._id,
          question: card.question,
          collectionId: card.collectionId,
          collection: card.collection,
          typeofCollection: typeof card.collection
        });
      });
      
      // Normaliser toutes les cartes pour garantir la cohérence des propriétés
      const normalizedCards = cards.map(card => {
        let collectionIdValue = null;
        
        // Déterminer la bonne valeur pour collectionId
        if (card.collectionId) {
          collectionIdValue = card.collectionId;
        } else if (card.collection) {
          if (typeof card.collection === 'string' || typeof card.collection === 'number') {
            collectionIdValue = card.collection;
          } else if (typeof card.collection === 'object' && card.collection !== null) {
            collectionIdValue = card.collection._id || card.collection.id;
          }
        }
        
        // Créer une carte normalisée avec les bonnes propriétés
        const standardizedCard = {
          ...card,
          collectionId: collectionIdValue ? String(collectionIdValue) : '',
          // Préserver l'objet collection original pour garantir la compatibilité
          originalCollection: card.collection
        };
        
        return standardizedCard;
      });
      
      // Log quelques cartes normalisées pour vérification
      console.log('CARTES APRÈS NORMALISATION (3 premières):');
      normalizedCards.slice(0, 3).forEach((card, index) => {
        console.log(`CARTE NORMALISÉE ${index + 1}:`, {
          id: card.id || card._id,
          question: card.question,
          collectionId: card.collectionId,
          originalCollection: card.originalCollection
        });
      });
      
      // Vérifier si les cartes peuvent être associées à une collection
      console.log('VÉRIFICATION DES ASSOCIATIONS CARTE-COLLECTION:');
      normalizedCards.slice(0, 3).forEach((card, index) => {
        const cardCollectionId = card.collectionId;
        
        // Chercher la collection correspondante
        const matchingCollection = collections.find(c => {
          const collectionIds = [c._id, c.id, String(c._id), String(c.id)].filter(Boolean);
          return collectionIds.includes(cardCollectionId);
        });
        
        console.log(`CARTE ${index + 1} - Association:`, {
          cardQuestion: card.question.substring(0, 20),
          cardCollectionId,
          matchFound: !!matchingCollection,
          collectionName: matchingCollection ? matchingCollection.name : 'Non trouvée'
        });
      });
      
      setAllCards(normalizedCards);
      setFilteredCards(normalizedCards);
      
      // Set default collection if available
      if (collections && collections.length > 0 && !collectionId) {
        setCollectionId(collections[0].id || collections[0]._id);
      }
      
      console.log('==== FIN DEBUG ====');
    }
  }, [cards, collections, collectionId]);

  // Filter cards based on collection and search query
  useEffect(() => {
      console.log('FILTRAGE DES CARTES - DEBUG:');
    console.log('Collection sélectionnée:', selectedCollection);
    console.log('Nombre total de cartes:', allCards.length);
    
    // Fonction pour extraire TOUS les identifiants de collection possibles d'une carte
    const extractCardCollectionIds = (card) => {
      const ids = [];
      
      // Cas 1: collectionId simple
      if (card.collectionId) {
        ids.push(String(card.collectionId));
      }
      
      // Cas 2: originalCollection (notre propriété ajoutée lors de la normalisation)
      if (card.originalCollection) {
        if (typeof card.originalCollection === 'string' || typeof card.originalCollection === 'number') {
          ids.push(String(card.originalCollection));
        } else if (typeof card.originalCollection === 'object' && card.originalCollection !== null) {
          if (card.originalCollection._id) ids.push(String(card.originalCollection._id));
          if (card.originalCollection.id) ids.push(String(card.originalCollection.id));
        }
      }
      
      // Cas 3: collection (pour la compatibilité avec le code existant)
      if (card.collection && card.collection !== card.originalCollection) {
        if (typeof card.collection === 'string' || typeof card.collection === 'number') {
          ids.push(String(card.collection));
        } else if (typeof card.collection === 'object' && card.collection !== null) {
          if (card.collection._id) ids.push(String(card.collection._id));
          if (card.collection.id) ids.push(String(card.collection.id));
        }
      }
      
      return ids;
    };
    
    let result = [...allCards];
    
    // Filtrer par collection
    if (selectedCollection && selectedCollection !== 'all') {
      const selectedIdStr = String(selectedCollection);
      console.log('ID de collection sélectionnée (normalisé):', selectedIdStr);
      
      // Filtrer les cartes
      result = result.filter(card => {
        const cardCollectionIds = extractCardCollectionIds(card);
        
        // Déboguer les 3 premières cartes pour comprendre le filtrage
        if (result.indexOf(card) < 3) {
          console.log(`Vérification de filtrage - Carte ${result.indexOf(card) + 1}:`, {
            question: card.question.substring(0, 20),
            extractedIds: cardCollectionIds,
            matchAvecSelection: cardCollectionIds.includes(selectedIdStr)
          });
        }
        
        return cardCollectionIds.includes(selectedIdStr);
      });
      
      console.log(`Filtrage terminé: ${result.length}/${allCards.length} cartes correspondent`);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      
      result = result.filter(card => 
        (card.question && card.question.toLowerCase().includes(query)) || 
        (card.answer && card.answer.toLowerCase().includes(query))
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
  const getCollectionNameLocal = (card) => {
    // Si l'argument est une carte complète
    if (typeof card === 'object' && card !== null) {
      // Utiliser l'ID de collection approprié (collectionId ou collection)
      const collectionId = card.collectionId || card.collection;
      return getCollectionName(collections, collectionId);
    } 
    // Si l'argument est directement un ID de collection
    return getCollectionName(collections, card);
  };

  return (
    <Container fluid className="py-4 px-4">
      {/* Header with search and filter */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-0">Mes Cartes</h1>
          <p className="text-muted">Gérer et réviser toutes vos cartes</p>
        </div>
        <Button 
          variant="primary" 
          className="d-flex align-items-center" 
          onClick={handleAddCard}
        >
          <FiPlus className="me-2" /> Créer une carte
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
                  placeholder="Rechercher des cartes..."
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
                  data-testid="collection-filter"
                >
                  <option value="all">Toutes les collections</option>
                  {collections.map(collection => {
                    // Utiliser l'ID dans le format approprié (_id ou id)
                    const collectionId = collection._id || collection.id;
                    return (
                      <option 
                        key={collectionId} 
                        value={String(collectionId)}
                      >
                        {collection.name}
                      </option>
                    );
                  })}
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
              <h5 className="mb-0">Aperçu de la carte</h5>
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
                  {flipped ? 'Voir la question' : 'Voir la réponse'}
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
                    <h5 className="mb-0">Réponse:</h5>
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
                    <Badge bg="primary" className="collection-badge">
                      {(() => {
                        // Réutilisation de la même fonction que dans le filtrage
                        const getCardCollectionIds = (card) => {
                          const ids = [];
                          
                          // Cas 1: collectionId simple
                          if (card.collectionId) {
                            ids.push(String(card.collectionId));
                          }
                          
                          // Cas 2: originalCollection (notre propriété ajoutée lors de la normalisation)
                          if (card.originalCollection) {
                            if (typeof card.originalCollection === 'string' || typeof card.originalCollection === 'number') {
                              ids.push(String(card.originalCollection));
                            } else if (typeof card.originalCollection === 'object' && card.originalCollection !== null) {
                              if (card.originalCollection._id) ids.push(String(card.originalCollection._id));
                              if (card.originalCollection.id) ids.push(String(card.originalCollection.id));
                            }
                          }
                          
                          // Cas 3: collection (pour la compatibilité avec le code existant)
                          if (card.collection && card.collection !== card.originalCollection) {
                            if (typeof card.collection === 'string' || typeof card.collection === 'number') {
                              ids.push(String(card.collection));
                            } else if (typeof card.collection === 'object' && card.collection !== null) {
                              if (card.collection._id) ids.push(String(card.collection._id));
                              if (card.collection.id) ids.push(String(card.collection.id));
                            }
                          }
                          
                          return ids;
                        };

                        // Obtenir tous les identifiants possibles pour cette carte
                        const cardCollectionIds = getCardCollectionIds(card);
                        
                        // Si pas d'IDs de collection trouvés, retourner "Inconnu"
                        if (cardCollectionIds.length === 0) {
                          return "Inconnu";
                        }
                        
                        // Chercher une collection correspondante
                        for (const collection of collections) {
                          // Obtenir tous les identifiants possibles de la collection
                          const collectionIds = [];
                          
                          // ID principal
                          if (collection._id) collectionIds.push(String(collection._id));
                          if (collection.id) collectionIds.push(String(collection.id));
                          
                          // Vérifier si l'un des IDs de collection correspond à l'un des IDs de la carte
                          const hasMatch = cardCollectionIds.some(cardId => 
                            collectionIds.some(collId => cardId === collId)
                          );
                          
                          if (hasMatch) {
                            return collection.name; // Retourner le nom dès qu'une correspondance est trouvée
                          }
                        }
                        
                        // Si aucune correspondance n'est trouvée
                        return "Inconnu";
                      })()}
                    </Badge>
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
              <p className="mb-0">Aucune carte trouvée. Créez votre première carte !</p>
            </div>
          </Col>
        )}
      </Row>

      {/* Card Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingCardId ? 'Modifier la carte' : 'Créer une nouvelle carte'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Tabs defaultActiveKey="content" className="mb-3">
              <Tab eventKey="content" title="Contenu de la carte">
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Saisissez votre question ici"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Réponse</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Saisissez votre réponse ici"
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
                    <option value="">Sélectionner une collection</option>
                    {collections.map(collection => (
                      <option key={collection.id || collection._id} value={collection.id || collection._id}>
                        {collection.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Tab>
              <Tab eventKey="preview" title="Aperçu en direct">
                <div className="card-preview p-4 bg-light rounded mb-3">
                  <h5>Question:</h5>
                  <p className="mb-4">{question || 'Votre question apparaîtra ici'}</p>
                  <hr />
                  <h5>Réponse:</h5>
                  <p className="mb-0">{answer || 'Votre réponse apparaîtra ici'}</p>
                </div>
                {collectionId && (
                  <div className="mt-3">
                    <small className="text-muted">
                      Cette carte sera ajoutée à la collection : <strong>{getCollectionNameLocal(collectionId)}</strong>
                    </small>
                  </div>
                )}
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" className="d-flex align-items-center">
              <FiCheck className="me-2" /> {editingCardId ? 'Enregistrer les modifications' : 'Créer la carte'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Flashcards;
