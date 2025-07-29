import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Table, InputGroup, Form } from 'react-bootstrap';
import { FiShare2, FiEye, FiDownload, FiCopy, FiTrash2, FiClock, FiLock, FiUsers, FiPlus, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import ShareLinkModal from '../components/ShareLinkModal';

const ManageSharedLinks = () => {
  const { getUserSharedLinks, deactivateSharedLink, collections } = useData();
  const { user } = useAuth();
  
  const [sharedLinks, setSharedLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);

  useEffect(() => {
    loadSharedLinks();
  }, []);

  const loadSharedLinks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getUserSharedLinks();
      setSharedLinks(response.data || []);
    } catch (error) {
      console.error('Erreur chargement liens partagés:', error);
      setError(error.message || 'Erreur lors du chargement des liens partagés');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (shareUrl) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (error) {
      // Fallback pour les navigateurs non compatibles
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Lien copié !');
    }
  };

  const handleDeleteLink = async () => {
    if (!linkToDelete) return;

    try {
      await deactivateSharedLink(linkToDelete._id);
      toast.success('Lien partagé désactivé avec succès');
      setShowDeleteModal(false);
      setLinkToDelete(null);
      loadSharedLinks(); // Recharger la liste
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la désactivation du lien');
    }
  };

  const openCreateModal = (collection) => {
    setSelectedCollection(collection);
    setShowCreateModal(true);
  };

  const handleLinkCreated = () => {
    setShowCreateModal(false);
    setSelectedCollection(null);
    loadSharedLinks(); // Recharger la liste
    toast.success('Nouveau lien de partage créé !');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (link) => {
    if (!link.isActive) {
      return <Badge bg="secondary">Désactivé</Badge>;
    }
    
    if (link.config.expiresAt && new Date(link.config.expiresAt) < new Date()) {
      return <Badge bg="danger">Expiré</Badge>;
    }
    
    if (link.config.maxUses && link.stats.viewCount >= link.config.maxUses) {
      return <Badge bg="warning">Limite atteinte</Badge>;
    }
    
    return <Badge bg="success">Actif</Badge>;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Chargement des liens partagés...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FiShare2 className="me-2" />
                Mes Liens Partagés
              </h2>
              <p className="text-muted">
                Gérez tous vos liens de partage de collections
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Statistiques rapides */}
      {sharedLinks.length > 0 && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-primary">{sharedLinks.length}</h4>
                <small className="text-muted">Liens créés</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-success">
                  {sharedLinks.filter(link => link.isActive).length}
                </h4>
                <small className="text-muted">Liens actifs</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-info">
                  {sharedLinks.reduce((total, link) => total + link.stats.viewCount, 0)}
                </h4>
                <small className="text-muted">Vues totales</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-warning">
                  {sharedLinks.reduce((total, link) => total + link.stats.downloadCount, 0)}
                </h4>
                <small className="text-muted">Téléchargements</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Créer un nouveau lien */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FiPlus className="me-2" />
                Créer un nouveau lien de partage
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-3">Sélectionnez une collection à partager :</p>
              {collections.length > 0 ? (
                <Row>
                  {collections.slice(0, 6).map(collection => (
                    <Col md={4} key={collection._id} className="mb-3">
                      <Card className="h-100">
                        <Card.Body className="d-flex flex-column">
                          <h6 className="card-title">{collection.name}</h6>
                          <p className="card-text text-muted small flex-grow-1">
                            {collection.cardsCount || 0} cartes
                          </p>
                          <Button 
                            size="sm" 
                            variant="primary"
                            onClick={() => openCreateModal(collection)}
                          >
                            <FiShare2 className="me-1" />
                            Partager
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  Vous n'avez pas encore de collections à partager. 
                  Créez d'abord des collections avec des cartes.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Liste des liens partagés */}
      {sharedLinks.length > 0 ? (
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Liens partagés existants</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Collection</th>
                      <th>Statut</th>
                      <th>Permissions</th>
                      <th>Statistiques</th>
                      <th>Créé le</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedLinks.map(link => (
                      <tr key={link._id}>
                        <td>
                          <div>
                            <strong>{link.collection.name}</strong>
                            <br />
                            <small className="text-muted">
                              {link.collection.cardsCount || 0} cartes
                            </small>
                          </div>
                        </td>
                        <td>
                          {getStatusBadge(link)}
                          {link.config.password && (
                            <Badge bg="secondary" className="ms-1">
                              <FiLock size={12} />
                            </Badge>
                          )}
                          {link.config.expiresAt && (
                            <Badge bg="warning" className="ms-1">
                              <FiClock size={12} />
                            </Badge>
                          )}
                          {link.config.maxUses && (
                            <Badge bg="info" className="ms-1">
                              <FiUsers size={12} />
                            </Badge>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {link.config.permissions.map(perm => (
                              <Badge key={perm} bg="light" text="dark">
                                {perm === 'view' && <FiEye className="me-1" size={12} />}
                                {perm === 'copy' && <FiDownload className="me-1" size={12} />}
                                {perm === 'download' && <FiDownload className="me-1" size={12} />}
                                {perm}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div>
                            <FiEye className="me-1" size={14} />
                            {link.stats.viewCount}
                            <span className="ms-2">
                              <FiDownload className="me-1" size={14} />
                              {link.stats.downloadCount}
                            </span>
                          </div>
                        </td>
                        <td>
                          <small>{formatDate(link.createdAt)}</small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleCopyLink(link.shareUrl)}
                              title="Copier le lien"
                            >
                              <FiCopy size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => window.open(link.shareUrl, '_blank')}
                              title="Ouvrir le lien"
                            >
                              <FiExternalLink size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => {
                                setLinkToDelete(link);
                                setShowDeleteModal(true);
                              }}
                              title="Désactiver le lien"
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      ) : (
        <Alert variant="info" className="text-center">
          <h5>Aucun lien partagé</h5>
          <p>Vous n'avez pas encore créé de liens de partage.</p>
          <p>Sélectionnez une collection ci-dessus pour commencer à partager !</p>
        </Alert>
      )}

      {/* Modal de création de lien */}
      <ShareLinkModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        collection={selectedCollection}
        onLinkCreated={handleLinkCreated}
      />

      {/* Modal de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Désactiver le lien partagé</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Êtes-vous sûr de vouloir désactiver ce lien de partage pour la collection 
            <strong> "{linkToDelete?.collection?.name}"</strong> ?
          </p>
          <Alert variant="warning">
            <small>
              <strong>Attention :</strong> Cette action rendra le lien inaccessible. 
              Les personnes qui possèdent ce lien ne pourront plus accéder à la collection.
            </small>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteLink}>
            Désactiver le lien
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageSharedLinks;
