import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { FiArrowLeft, FiUser, FiCalendar, FiDownload, FiEye, FiLock, FiBookOpen, FiShare2, FiCopy } from 'react-icons/fi';
import { toast } from 'react-toastify';
import sharedLinkService from '../services/sharedLinkService';
import FlashcardDisplay from '../components/FlashcardDisplay';
import { useAuth } from '../contexts/AuthContext';

const SharedCollection = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [sharedLink, setSharedLink] = useState(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [importing, setImporting] = useState(false);

  // Gestion du mot de passe
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordAttempts, setPasswordAttempts] = useState(0);

  // Mode révision
  const [showReview, setShowReview] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  useEffect(() => {
    loadSharedCollection();
  }, [token]);

  const loadSharedCollection = async (attemptPassword = null) => {
    console.log('🔍 SharedCollection - Début loadSharedCollection');
    console.log('   Token:', token);
    console.log('   Password:', attemptPassword ? '[FOURNI]' : '[AUCUN]');
    
    setLoading(true);
    setError('');

    try {
      console.log('📡 Appel sharedLinkService.getSharedCollection...');
      const response = await sharedLinkService.getSharedCollection(token, attemptPassword);
      
      console.log('✅ Réponse reçue:', response);
      console.log('   Data structure:', {
        hasData: !!response.data,
        hasCollection: !!response.data?.collection,
        hasFlashcards: !!response.data?.flashcards,
        hasSharedLink: !!response.data?.sharedLink,
        collectionName: response.data?.collection?.name,
        flashcardsCount: response.data?.flashcards?.length
      });
      
      setCollection(response.data.collection);
      setFlashcards(response.data.flashcards || []);
      setSharedLink(response.data.sharedLink);
      setRequiresPassword(false);
      setShowPasswordModal(false);
      
      console.log('✅ État mis à jour avec succès');
      
    } catch (error) {
      console.error('❌ Erreur chargement collection partagée:', error);
      console.error('   Type d\'erreur:', typeof error);
      console.error('   Properties:', Object.keys(error));
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
      
      if (error.requiresPassword) {
        console.log('🔐 Mot de passe requis');
        setRequiresPassword(true);
        setShowPasswordModal(true);
        setPasswordAttempts(prev => prev + 1);
      } else {
        const errorMessage = error.message || 'Lien de partage introuvable ou expiré';
        console.log('❌ Définition erreur:', errorMessage);
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      console.log('🏁 loadSharedCollection terminé');
    }
  };

  const handlePasswordSubmit = () => {
    if (!password.trim()) {
      toast.error('Veuillez entrer le mot de passe');
      return;
    }
    loadSharedCollection(password);
  };

  const handleDownload = async (format = 'import') => {
    if (!sharedLink?.permissions?.includes('copy') && !sharedLink?.permissions?.includes('download')) {
      toast.error('Téléchargement non autorisé pour cette collection');
      return;
    }

    setDownloading(true);

    try {
      if (format === 'import' && user) {
        // Import dans les collections personnelles
        const response = await sharedLinkService.downloadSharedCollection(token, password);
        toast.success(response.message || 'Collection importée avec succès !');
        
        // Rediriger vers les collections après un délai
        setTimeout(() => {
          navigate('/collections');
        }, 2000);

      } else {
        // Téléchargement de fichier
        const fileInfo = sharedLinkService.downloadAsFile(collection, flashcards, format);
        toast.success(`Fichier téléchargé : ${fileInfo.filename}`);
      }

    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast.error(error.message || 'Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour importer une collection');
      return;
    }

    if (!sharedLink?.permissions?.includes('copy')) {
      toast.error('Import non autorisé pour cette collection');
      return;
    }

    setImporting(true);

    try {
      const response = await sharedLinkService.downloadSharedCollection(token, password);
      toast.success(response.message || 'Collection importée avec succès dans vos collections !');
      
      // Rediriger vers les collections après un délai
      setTimeout(() => {
        navigate('/collections');
      }, 2000);
    } catch (error) {
      console.error('Erreur importation:', error);
      toast.error(error.message || 'Erreur lors de l\'importation');
    } finally {
      setImporting(false);
    }
  };

  const handleCopyInfo = () => {
    if (!collection) {
      toast.error('Aucune collection à copier');
      return;
    }

    const info = `📚 Collection: ${collection.name}\n` +
                 `📖 Description: ${collection.description || 'Aucune description'}\n` +
                 `🃏 Cartes: ${flashcards.length}\n` +
                 `👨‍🏫 Créé par: ${collection.user?.name || 'Enseignant'}\n` +
                 `📅 Créé le: ${formatDate(collection.createdAt)}\n` +
                 `🔗 Lien: ${window.location.href}`;

    navigator.clipboard.writeText(info).then(() => {
      toast.success('Informations de la collection copiées dans le presse-papiers !');
    }).catch(() => {
      toast.error('Erreur lors de la copie');
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const startReview = () => {
    if (flashcards.length === 0) {
      toast.error('Aucune carte disponible pour la révision');
      return;
    }
    setCurrentCardIndex(0);
    setShowReview(true);
  };

  const nextCard = () => {
    setCurrentCardIndex(prev => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setCurrentCardIndex(prev => prev === 0 ? flashcards.length - 1 : prev - 1);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement de la collection...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Row className="justify-content-center">
          <Col md={8}>
            <Alert variant="danger">
              <h5>Erreur d'accès</h5>
              <p>{error}</p>
              <Button variant="outline-danger" onClick={() => navigate('/')}>
                <FiArrowLeft className="me-2" />
                Retour à l'accueil
              </Button>
            </Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (showReview && flashcards[currentCardIndex]) {
    return (
      <Container className="mt-4">
        <Button 
          variant="outline-secondary" 
          className="mb-3"
          onClick={() => setShowReview(false)}
        >
          <FiArrowLeft className="me-2" />
          Retour à la collection
        </Button>
        
        <FlashcardDisplay
          card={flashcards[currentCardIndex]}
          onNext={nextCard}
          onPrevious={prevCard}
          currentIndex={currentCardIndex}
          totalCards={flashcards.length}
          mode="preview"
        />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Navigation */}
      <Button 
        variant="outline-secondary" 
        className="mb-4"
        onClick={() => navigate('/')}
      >
        <FiArrowLeft className="me-2" />
        Retour à l'accueil
      </Button>

      {/* En-tête de la collection */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex align-items-center">
                <FiShare2 className="me-2" size={24} />
                <h4 className="mb-0">Collection Partagée</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h2 className="mb-3">{collection?.name}</h2>
                  {collection?.description && (
                    <p className="text-muted mb-3">{collection.description}</p>
                  )}
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {collection?.category && (
                      <Badge bg="secondary">{collection.category}</Badge>
                    )}
                    {collection?.difficulty && (
                      <Badge bg="info">{collection.difficulty}</Badge>
                    )}
                    {collection?.tags?.map(tag => (
                      <Badge key={tag} bg="light" text="dark">#{tag}</Badge>
                    ))}
                  </div>

                  <div className="d-flex align-items-center text-muted">
                    <FiUser className="me-2" />
                    <span className="me-4">Par {collection?.createdBy?.name}</span>
                    <FiCalendar className="me-2" />
                    <span>Partagé le {new Date(sharedLink?.createdAt).toLocaleDateString()}</span>
                  </div>
                </Col>
                
                <Col md={4} className="text-end">
                  <div className="mb-3">
                    <h5 className="text-primary">{flashcards.length}</h5>
                    <small className="text-muted">cartes disponibles</small>
                  </div>
                  
                  <div className="text-muted small">
                    <div>Vues : {sharedLink?.stats?.viewCount || 0}</div>
                    <div>Téléchargements : {sharedLink?.stats?.downloadCount || 0}</div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <h5 className="mb-3">Actions disponibles</h5>
              <div className="d-flex flex-wrap gap-2">
                {sharedLink?.permissions?.includes('view') && flashcards.length > 0 && (
                  <Button 
                    variant="primary" 
                    onClick={startReview}
                  >
                    <FiBookOpen className="me-2" />
                    Réviser les cartes
                  </Button>
                )}

                {sharedLink?.permissions?.includes('copy') && user && (
                  <>
                    <Button 
                      variant="outline-primary" 
                      onClick={handleImport}
                      disabled={importing || !user}
                      className="me-2"
                    >
                      {importing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Importation...
                        </>
                      ) : (
                        <>
                          <FiDownload className="me-2" />
                          Importer dans mes collections
                        </>
                      )}
                    </Button>

                    <Button 
                      variant="outline-secondary" 
                      onClick={handleCopyInfo}
                      className="me-2"
                    >
                      <FiCopy className="me-2" />
                      Copier les infos
                    </Button>
                  </>
                )}

                {!user && (
                  <Alert variant="info" className="mb-0">
                    <small>
                      Connectez-vous pour importer cette collection dans vos collections personnelles
                    </small>
                  </Alert>
                )}

                {sharedLink?.permissions?.includes('download') && (
                  <>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => handleDownload('json')}
                      disabled={downloading}
                    >
                      <FiDownload className="me-2" />
                      Télécharger JSON
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => handleDownload('csv')}
                      disabled={downloading}
                    >
                      <FiDownload className="me-2" />
                      Télécharger CSV
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des cartes (aperçu) */}
      {flashcards.length > 0 && (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FiEye className="me-2" />
                  Aperçu des cartes ({flashcards.length})
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {flashcards.slice(0, 6).map((card, index) => (
                    <Col md={6} lg={4} key={index} className="mb-3">
                      <Card className="h-100 border-light">
                        <Card.Body className="p-3">
                          <h6 className="card-title text-truncate">{card.question}</h6>
                          <p className="card-text text-muted small text-truncate">
                            {card.answer}
                          </p>
                          {card.difficulty && (
                            <Badge bg="light" text="dark" className="small">
                              {card.difficulty}
                            </Badge>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
                {flashcards.length > 6 && (
                  <Alert variant="light" className="text-center mb-0">
                    Et {flashcards.length - 6} autres cartes...
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Modal mot de passe */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FiLock className="me-2" />
            Collection protégée
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Cette collection est protégée par un mot de passe.</p>
          {passwordAttempts > 1 && (
            <Alert variant="warning">
              Mot de passe incorrect. Veuillez réessayer.
            </Alert>
          )}
          <Form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
            <InputGroup>
              <Form.Control
                type="password"
                placeholder="Entrez le mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              <Button type="submit" variant="primary">
                Accéder
              </Button>
            </InputGroup>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SharedCollection;
