import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Alert, Spinner, 
  Modal, Form, Toast, ToastContainer, InputGroup
} from 'react-bootstrap';
import { 
  FiBook, FiDownload, FiCopy, FiPlay, FiShare2, 
  FiEye, FiLock, FiUnlock, FiCalendar, FiUser
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import sharedLinkService from '../services/sharedLinkService';

const StudentSharedCollections = () => {
  const { user } = useAuth();
  const [accessedCollections, setAccessedCollections] = useState([]);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [linkToken, setLinkToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCollection, setCurrentCollection] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [importingIds, setImportingIds] = useState(new Set());
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    // Charger les collections accessibles depuis le localStorage
    loadAccessedCollections();
  }, []);

  const loadAccessedCollections = () => {
    const saved = localStorage.getItem('student_accessed_collections');
    if (saved) {
      try {
        setAccessedCollections(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des collections:', error);
      }
    }
  };

  const saveAccessedCollection = (collection) => {
    const existing = accessedCollections.filter(c => c.token !== collection.token);
    const updated = [...existing, collection];
    setAccessedCollections(updated);
    localStorage.setItem('student_accessed_collections', JSON.stringify(updated));
  };

  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const extractTokenFromUrl = (url) => {
    try {
      // Support pour différents formats d'URL
      const patterns = [
        /\/shared\/([a-f0-9]{24})/i,          // /shared/token
        /token=([a-f0-9]{24})/i,               // ?token=...
        /shared\/collection\/([a-f0-9]{24})/i  // /shared/collection/token
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return match[1];
        }
      }
      
      // Si c'est juste un token
      if (/^[a-f0-9]{24}$/i.test(url.trim())) {
        return url.trim();
      }
      
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleAccessLink = async () => {
    if (!linkToken.trim()) {
      setError('Veuillez saisir un lien ou token valide');
      return;
    }

    const token = extractTokenFromUrl(linkToken.trim());
    if (!token) {
      setError('Format de lien invalide. Veuillez vérifier le lien fourni.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await sharedLinkService.getSharedCollection(token, password);
      
      // Sauvegarder la collection accessible
      const collectionData = {
        token,
        name: response.collection?.name || 'Collection partagée',
        description: response.collection?.description || '',
        cardCount: response.flashcards?.length || 0,
        teacherName: response.collection?.user?.name || 'Enseignant',
        accessedAt: new Date().toISOString(),
        permissions: response.permissions || ['view'],
        hasPassword: !!response.hasPassword,
        expiresAt: response.expiresAt,
        collectionData: response // Sauvegarder toutes les données
      };

      saveAccessedCollection(collectionData);
      
      setShowAccessModal(false);
      setLinkToken('');
      setPassword('');
      showToastMessage('Collection accessible avec succès !');
      
    } catch (error) {
      console.error('Erreur accès collection:', error);
      
      if (error.requiresPassword) {
        setShowPasswordModal(true);
        setCurrentCollection({ token });
        setShowAccessModal(false);
        return;
      }
      
      setError(error.message || 'Erreur lors de l\'accès à la collection');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordAccess = async () => {
    if (!password.trim()) {
      setPasswordError('Veuillez saisir le mot de passe');
      return;
    }

    setLoading(true);
    setPasswordError('');

    try {
      const response = await sharedLinkService.getSharedCollection(
        currentCollection.token, 
        password
      );
      
      const collectionData = {
        token: currentCollection.token,
        name: response.collection?.name || 'Collection partagée',
        description: response.collection?.description || '',
        cardCount: response.flashcards?.length || 0,
        teacherName: response.collection?.user?.name || 'Enseignant',
        accessedAt: new Date().toISOString(),
        permissions: response.permissions || ['view'],
        hasPassword: true,
        expiresAt: response.expiresAt,
        collectionData: response
      };

      saveAccessedCollection(collectionData);
      
      setShowPasswordModal(false);
      setCurrentCollection(null);
      setPassword('');
      showToastMessage('Collection accessible avec succès !');
      
    } catch (error) {
      console.error('Erreur mot de passe:', error);
      setPasswordError(error.message || 'Mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const handleImportCollection = async (collection) => {
    if (!user) {
      showToastMessage('Vous devez être connecté pour importer une collection', 'error');
      return;
    }

    setImportingIds(prev => new Set([...prev, collection.token]));

    try {
      const response = await sharedLinkService.downloadSharedCollection(collection.token);
      showToastMessage(`Collection "${collection.name}" importée avec succès !`);
    } catch (error) {
      console.error('Erreur import:', error);
      showToastMessage(error.message || 'Erreur lors de l\'importation', 'error');
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(collection.token);
        return newSet;
      });
    }
  };

  const handleDownloadCollection = (collection) => {
    const collectionData = collection.collectionData;
    if (!collectionData || !collectionData.flashcards) {
      showToastMessage('Données de collection non disponibles', 'error');
      return;
    }

    try {
      sharedLinkService.downloadAsFile(
        collectionData.collection,
        collectionData.flashcards,
        'json'
      );
      showToastMessage('Téléchargement démarré !');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showToastMessage('Erreur lors du téléchargement', 'error');
    }
  };

  const handleCopyLink = (collection) => {
    const url = `${window.location.origin}/shared/${collection.token}`;
    navigator.clipboard.writeText(url).then(() => {
      showToastMessage('Lien copié dans le presse-papiers !');
    }).catch(() => {
      showToastMessage('Erreur lors de la copie', 'error');
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const removeCollection = (token) => {
    const updated = accessedCollections.filter(c => c.token !== token);
    setAccessedCollections(updated);
    localStorage.setItem('student_accessed_collections', JSON.stringify(updated));
    showToastMessage('Collection supprimée de votre liste');
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="d-flex align-items-center">
              <FiShare2 className="me-2 text-primary" />
              Collections Partagées
            </h2>
            <Button 
              variant="primary" 
              onClick={() => setShowAccessModal(true)}
              className="d-flex align-items-center"
            >
              <FiShare2 className="me-2" />
              Accéder à une collection
            </Button>
          </div>

          {accessedCollections.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5">
                <FiBook size={64} className="text-muted mb-3" />
                <h5 className="text-muted">Aucune collection partagée</h5>
                <p className="text-muted mb-4">
                  Vous n'avez encore accédé à aucune collection partagée.
                  <br />
                  Demandez un lien de partage à votre enseignant ou collègue.
                </p>
                <Button 
                  variant="primary" 
                  onClick={() => setShowAccessModal(true)}
                  className="d-flex align-items-center mx-auto"
                >
                  <FiShare2 className="me-2" />
                  Accéder à une collection
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <Row className="g-4">
              {accessedCollections.map((collection) => (
                <Col md={6} lg={4} key={collection.token}>
                  <Card className={`h-100 border-0 shadow-sm ${isExpired(collection.expiresAt) ? 'opacity-75' : ''}`}>
                    <Card.Header className="bg-light border-bottom">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-0 fw-bold text-truncate">{collection.name}</h6>
                        <div className="d-flex align-items-center gap-1">
                          {collection.hasPassword && (
                            <FiLock size={14} className="text-warning" title="Protégé par mot de passe" />
                          )}
                          {isExpired(collection.expiresAt) && (
                            <Badge bg="danger" className="ms-1">Expiré</Badge>
                          )}
                        </div>
                      </div>
                    </Card.Header>

                    <Card.Body className="d-flex flex-column">
                      {collection.description && (
                        <p className="text-muted small mb-3">{collection.description}</p>
                      )}

                      <div className="mb-3 flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <FiBook className="me-1" />
                            Cartes
                          </small>
                          <Badge bg="primary">{collection.cardCount}</Badge>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <FiUser className="me-1" />
                            Enseignant
                          </small>
                          <small>{collection.teacherName}</small>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">
                            <FiCalendar className="me-1" />
                            Accédé le
                          </small>
                          <small>{formatDate(collection.accessedAt)}</small>
                        </div>

                        {collection.expiresAt && (
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Expire le</small>
                            <small className={isExpired(collection.expiresAt) ? 'text-danger' : 'text-warning'}>
                              {formatDate(collection.expiresAt)}
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2">
                          <Button
                            as={Link}
                            to={`/shared/${collection.token}`}
                            variant="primary"
                            size="sm"
                            className="flex-fill d-flex align-items-center justify-content-center"
                            disabled={isExpired(collection.expiresAt)}
                          >
                            <FiEye className="me-2" />
                            Voir
                          </Button>

                          {collection.cardCount > 0 && (
                            <Button
                              as={Link}
                              to={`/shared/${collection.token}?mode=review`}
                              variant="outline-success"
                              size="sm"
                              className="flex-fill d-flex align-items-center justify-content-center"
                              disabled={isExpired(collection.expiresAt)}
                            >
                              <FiPlay className="me-2" />
                              Réviser
                            </Button>
                          )}
                        </div>

                        <div className="d-flex gap-2">
                          <Button
                            onClick={() => handleCopyLink(collection)}
                            variant="outline-secondary"
                            size="sm"
                            className="flex-fill d-flex align-items-center justify-content-center"
                          >
                            <FiCopy className="me-2" />
                            Copier lien
                          </Button>

                          {collection.permissions.includes('download') && (
                            <Button
                              onClick={() => handleDownloadCollection(collection)}
                              variant="outline-info"
                              size="sm"
                              className="flex-fill d-flex align-items-center justify-content-center"
                              disabled={isExpired(collection.expiresAt)}
                            >
                              <FiDownload className="me-2" />
                              Télécharger
                            </Button>
                          )}
                        </div>

                        {user && collection.permissions.includes('copy') && (
                          <Button
                            onClick={() => handleImportCollection(collection)}
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center justify-content-center"
                            disabled={importingIds.has(collection.token) || isExpired(collection.expiresAt)}
                          >
                            {importingIds.has(collection.token) ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Import...
                              </>
                            ) : (
                              <>
                                <FiDownload className="me-2" />
                                Importer dans mes collections
                              </>
                            )}
                          </Button>
                        )}

                        <Button
                          onClick={() => removeCollection(collection.token)}
                          variant="outline-danger"
                          size="sm"
                          className="d-flex align-items-center justify-content-center"
                        >
                          Supprimer de ma liste
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Modal d'accès à une collection */}
      <Modal show={showAccessModal} onHide={() => setShowAccessModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <FiShare2 className="me-2" />
            Accéder à une collection partagée
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Lien ou Token de partage</Form.Label>
              <Form.Control
                type="text"
                placeholder="Collez le lien complet ou juste le token..."
                value={linkToken}
                onChange={(e) => setLinkToken(e.target.value)}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Formats acceptés : URL complète, token seul, ou lien direct
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAccessModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAccessLink}
            disabled={loading || !linkToken.trim()}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Vérification...
              </>
            ) : (
              'Accéder'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de mot de passe */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <FiLock className="me-2" />
            Mot de passe requis
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {passwordError && (
            <Alert variant="danger" className="mb-3">
              {passwordError}
            </Alert>
          )}
          
          <p className="text-muted mb-3">
            Cette collection est protégée par un mot de passe.
          </p>
          
          <Form>
            <Form.Group>
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Saisissez le mot de passe..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordAccess();
                  }
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePasswordAccess}
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Vérification...
              </>
            ) : (
              'Valider'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast notifications */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={4000}
          autohide
          bg={toastType === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastType === 'success' ? '✅ Succès' : '❌ Erreur'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default StudentSharedCollections;
