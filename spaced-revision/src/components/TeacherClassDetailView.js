// src/components/TeacherClassDetailView.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Alert, Spinner, 
  Modal, Table, ListGroup, Form, InputGroup
} from 'react-bootstrap';
import { 
  FiUsers, FiUser, FiBook, FiBookOpen, FiShare2, FiTrash2, 
  FiPlus, FiEye, FiCalendar, FiSettings, FiX, FiCheck
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';

const TeacherClassDetailView = ({ classId, onClose }) => {
  const { 
    collections, 
    shareCollectionWithClass, 
    unshareCollectionFromClass, 
    getClassCollections, 
    getClassById 
  } = useData();
  const [classDetails, setClassDetails] = useState(null);
  const [sharedCollections, setSharedCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    if (classId) {
      fetchClassDetails();
      fetchSharedCollections();
    }
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      setError(''); // Reset error
      console.log('Fetching class details for ID:', classId);
      const response = await getClassById(classId);
      console.log('Class details response:', response);
      setClassDetails(response.data);
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des détails:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur inconnue';
      setError(`Impossible de charger les détails de la classe: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchSharedCollections = async () => {
    try {
      const response = await getClassCollections(classId);
      setSharedCollections(response.data.collections || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des collections partagées:', error);
    }
  };

  const handleShareCollection = async () => {
    if (!selectedCollection) return;

    try {
      setShareLoading(true);
      await shareCollectionWithClass(classId, selectedCollection);
      setShowShareModal(false);
      setSelectedCollection('');
      fetchSharedCollections();
      // Afficher un message de succès
    } catch (error) {
      console.error('Erreur lors du partage:', error);
      setError(error.response?.data?.message || 'Erreur lors du partage de la collection');
    } finally {
      setShareLoading(false);
    }
  };

  const handleUnshareCollection = async (collectionId) => {
    try {
      await unshareCollectionFromClass(classId, collectionId);
      fetchSharedCollections();
    } catch (error) {
      console.error('Erreur lors du retrait du partage:', error);
      setError('Erreur lors du retrait du partage');
    }
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

  // Filtrer les collections non partagées pour le modal
  const availableCollections = collections.filter(collection => 
    !sharedCollections.some(shared => shared._id === collection._id)
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status" className="text-primary">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <Alert variant="danger">
        <strong>Erreur :</strong> Impossible de charger les détails de la classe.
      </Alert>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header avec bouton de fermeture */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiUsers className="me-3 text-primary" />
            {classDetails.name}
          </h1>
          <p className="text-muted mb-0">Gestion détaillée de votre classe</p>
        </div>
        <Button variant="outline-secondary" onClick={onClose}>
          <FiX className="me-2" />
          Fermer
        </Button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          <strong>Erreur :</strong> {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* Informations générales de la classe */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <FiSettings className="me-2 text-primary" />
              <h5 className="mb-0">Informations de la classe</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div>
                    <strong>Nom :</strong>
                    <div className="text-muted">{classDetails.name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <strong>Code d'invitation :</strong>
                    <div>
                      <code className="bg-primary bg-opacity-10 text-primary p-2 rounded">
                        {classDetails.inviteCode}
                      </code>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <strong>Statut :</strong>
                    <div>
                      <Badge bg={classDetails.isActive ? 'success' : 'danger'}>
                        {classDetails.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div>
                    <strong>Créée le :</strong>
                    <div className="text-muted small">{formatDate(classDetails.createdAt)}</div>
                  </div>
                </Col>
                {classDetails.description && (
                  <Col>
                    <div>
                      <strong>Description :</strong>
                      <div className="text-muted">{classDetails.description}</div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Statistiques */}
        <Col lg={6}>
          <Card className="h-100">
            <Card.Header className="d-flex align-items-center">
              <FiUsers className="me-2 text-success" />
              <h5 className="mb-0">Statistiques</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 text-center">
                <Col md={4}>
                  <div className="p-3 bg-primary bg-opacity-10 rounded">
                    <FiUsers size={24} className="text-primary mb-2" />
                    <h4 className="fw-bold mb-1">{classDetails.students?.length || 0}</h4>
                    <small className="text-muted">Étudiants inscrits</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-info bg-opacity-10 rounded">
                    <FiBook size={24} className="text-info mb-2" />
                    <h4 className="fw-bold mb-1">{sharedCollections.length}</h4>
                    <small className="text-muted">Collections partagées</small>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="p-3 bg-warning bg-opacity-10 rounded">
                    <FiBookOpen size={24} className="text-warning mb-2" />
                    <h4 className="fw-bold mb-1">
                      {sharedCollections.reduce((total, col) => total + (col.cardCount || 0), 0)}
                    </h4>
                    <small className="text-muted">Cartes disponibles</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Collections partagées */}
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <FiShare2 className="me-2 text-info" />
                <h5 className="mb-0">Collections partagées ({sharedCollections.length})</h5>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setShowShareModal(true)}
                disabled={availableCollections.length === 0}
              >
                <FiPlus className="me-2" />
                Partager une collection
              </Button>
            </Card.Header>
            <Card.Body>
              {sharedCollections.length === 0 ? (
                <div className="text-center py-4">
                  <FiShare2 size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Aucune collection partagée</h6>
                  <p className="text-muted">
                    Partagez vos collections avec vos étudiants pour qu'ils puissent les réviser.
                  </p>
                  {availableCollections.length > 0 && (
                    <Button variant="outline-primary" onClick={() => setShowShareModal(true)}>
                      <FiPlus className="me-2" />
                      Partager votre première collection
                    </Button>
                  )}
                </div>
              ) : (
                <Row className="g-3">
                  {sharedCollections.map((collection) => (
                    <Col md={6} lg={4} key={collection._id}>
                      <Card className="h-100 border-0 shadow-sm">
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <h6 className="card-title mb-0 fw-bold">{collection.name}</h6>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleUnshareCollection(collection._id)}
                              title="Retirer le partage"
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>
                          {collection.description && (
                            <p className="text-muted small mb-2">{collection.description}</p>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                              <FiBookOpen className="me-1" />
                              {collection.cardCount || 0} cartes
                            </small>
                            <Badge bg="success" className="ms-2">Partagée</Badge>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Liste des étudiants */}
        <Col>
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FiUser className="me-2 text-success" />
              <h5 className="mb-0">Étudiants inscrits ({classDetails.students?.length || 0})</h5>
            </Card.Header>
            <Card.Body>
              {classDetails.students && classDetails.students.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Date d'inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classDetails.students.map((student) => (
                      <tr key={student._id}>
                        <td className="fw-semibold">{student.name}</td>
                        <td className="text-muted">{student.email}</td>
                        <td className="small text-muted">
                          {formatDate(student.joinDate || classDetails.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FiUser size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">Aucun étudiant inscrit</h6>
                  <p className="text-muted">
                    Partagez le code <code>{classDetails.inviteCode}</code> avec vos étudiants
                    pour qu'ils rejoignent la classe.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal pour partager une collection */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Partager une collection</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Sélectionnez une collection à partager avec votre classe "{classDetails.name}".
          </p>
          {availableCollections.length === 0 ? (
            <Alert variant="info">
              <strong>Aucune collection disponible</strong>
              <br />
              Toutes vos collections sont déjà partagées avec cette classe.
            </Alert>
          ) : (
            <Form.Group>
              <Form.Label>Collection à partager</Form.Label>
              <Form.Select
                value={selectedCollection}
                onChange={(e) => setSelectedCollection(e.target.value)}
              >
                <option value="">Sélectionnez une collection...</option>
                {availableCollections.map((collection) => (
                  <option key={collection._id} value={collection._id}>
                    {collection.name} ({collection.cardCount || 0} cartes)
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShareModal(false)}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={handleShareCollection}
            disabled={!selectedCollection || shareLoading}
          >
            {shareLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Partage en cours...
              </>
            ) : (
              <>
                <FiShare2 className="me-2" />
                Partager
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TeacherClassDetailView;
