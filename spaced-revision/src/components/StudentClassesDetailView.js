// src/components/StudentClassesDetailView.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Alert, Spinner, 
  ProgressBar, ListGroup, Modal, Accordion 
} from 'react-bootstrap';
import { 
  FiUsers, FiUser, FiBook, FiBookOpen, FiPlus, FiEye, FiCalendar,
  FiInfo, FiSettings, FiTrendingUp, FiUserCheck, FiBarChart2 
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import JoinClassModal from './JoinClassModal';

const StudentClassesDetailView = () => {
  const { getStudentClasses } = useData();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const classesData = await getStudentClasses();
      console.log('Classes détaillées récupérées:', classesData);
      setClasses(classesData || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des classes:', error);
      setError(
        error.response?.data?.message || 
        'Erreur lors de la récupération de vos classes'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClassJoined = (newClassData) => {
    fetchStudentClasses();
  };

  const handleShowDetails = (classItem) => {
    setSelectedClass(classItem);
    setShowDetailsModal(true);
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

  const getProgressPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" className="text-primary" size="lg">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-3 text-muted">Chargement de vos classes...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header avec statistiques globales */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiUsers className="me-3 text-primary" />
            Mes Classes Détaillées
          </h1>
          <p className="text-muted mb-0">
            Vue détaillée de toutes vos classes avec statistiques complètes
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowJoinModal(true)}
          className="d-flex align-items-center"
        >
          <FiPlus className="me-2" />
          Rejoindre une classe
        </Button>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Erreur :</strong> {error}
          <Button
            variant="link"
            size="sm"
            onClick={fetchStudentClasses}
            className="p-0 ms-2"
          >
            Réessayer
          </Button>
        </Alert>
      )}

      {/* Statistiques globales */}
      {classes.length > 0 && (
        <Row className="mb-4 g-3">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center class-stats-card stats-card-animate">
              <Card.Body>
                <FiUsers size={32} className="text-primary mb-2" />
                <h3 className="fw-bold mb-1">{classes.length}</h3>
                <p className="text-muted mb-0 small">Classes rejointes</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center class-stats-card stats-card-animate">
              <Card.Body>
                <FiUser size={32} className="text-success mb-2" />
                <h3 className="fw-bold mb-1">
                  {new Set(classes.map(c => c.teacher?.id)).size}
                </h3>
                <p className="text-muted mb-0 small">Enseignants différents</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center class-stats-card stats-card-animate">
              <Card.Body>
                <FiBook size={32} className="text-info mb-2" />
                <h3 className="fw-bold mb-1">
                  {classes.reduce((total, c) => total + (c.stats?.totalCollections || 0), 0)}
                </h3>
                <p className="text-muted mb-0 small">Collections disponibles</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100 text-center class-stats-card stats-card-animate">
              <Card.Body>
                <FiBookOpen size={32} className="text-warning mb-2" />
                <h3 className="fw-bold mb-1">
                  {classes.reduce((total, c) => total + (c.stats?.totalCards || 0), 0)}
                </h3>
                <p className="text-muted mb-0 small">Cartes disponibles</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Liste des classes */}
      {classes.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="empty-state">
              <FiUsers size={64} className="text-muted mb-3" />
              <h4 className="text-muted mb-2">Aucune classe rejointe</h4>
              <p className="text-muted mb-4">
                Vous n'avez encore rejoint aucune classe. Demandez un code d'invitation à votre enseignant
                pour commencer à accéder aux ressources partagées.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowJoinModal(true)}
                className="d-flex align-items-center mx-auto"
              >
                <FiPlus className="me-2" />
                Rejoindre ma première classe
              </Button>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {classes.map((classItem) => (
            <Col lg={6} key={classItem._id}>
              <Card className="h-100 class-detail-card">
                <Card.Header className="class-detail-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 fw-bold">{classItem.name}</h5>
                    <Badge bg="success" className="ms-2">Actif</Badge>
                  </div>
                </Card.Header>

                <Card.Body className="d-flex flex-column">
                  {/* Description */}
                  {classItem.description && (
                    <p className="text-muted mb-3">{classItem.description}</p>
                  )}

                  {/* Informations principales */}
                  <Row className="mb-3 g-2">
                    <Col md={6}>
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <FiUser size={16} className="me-2 text-primary" />
                        <strong className="me-1">Enseignant :</strong>
                      </div>
                      <div className="ms-4">
                        <div className="fw-bold">{classItem.teacher?.name || 'Non spécifié'}</div>
                        <div className="small text-muted">{classItem.teacher?.email}</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <FiCalendar size={16} className="me-2 text-success" />
                        <strong className="me-1">Rejoint le :</strong>
                      </div>
                      <div className="ms-4 small">
                        {formatDate(classItem.joinDate || classItem.createdAt)}
                      </div>
                    </Col>
                  </Row>

                  {/* Statistiques en barres de progression */}
                  <div className="mb-3">
                    <h6 className="fw-semibold mb-3 d-flex align-items-center">
                      <FiBarChart2 className="me-2 text-info" />
                      Statistiques de la classe
                    </h6>

                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">
                          <FiUsers size={14} className="me-1" />
                          Apprenants inscrits
                        </small>
                        <small className="fw-bold">
                          {classItem.stats?.totalStudents || 0} / {classItem.stats?.maxStudents || 50}
                        </small>
                      </div>
                      <ProgressBar 
                        now={getProgressPercentage(
                          classItem.stats?.totalStudents || 0, 
                          classItem.stats?.maxStudents || 50
                        )} 
                        variant="info" 
                        className="progress-sm"
                      />
                    </div>

                    <Row className="g-2">
                      <Col md={6}>
                        <div className="text-center p-2 class-stats-card">
                          <FiBook className="text-primary mb-1" />
                          <div className="fw-bold">{classItem.stats?.totalCollections || 0}</div>
                          <small className="text-muted">Collections</small>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="text-center p-2 class-stats-card">
                          <FiBookOpen className="text-warning mb-1" />
                          <div className="fw-bold">{classItem.stats?.totalCards || 0}</div>
                          <small className="text-muted">Cartes</small>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Code d'invitation */}
                  <div className="mb-3 p-2 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Code d'invitation</small>
                      <code className="fw-bold text-primary">{classItem.inviteCode}</code>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto">
                    <Row className="g-2">
                      <Col>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100"
                          onClick={() => handleShowDetails(classItem)}
                        >
                          <FiEye className="me-2" />
                          Voir détails
                        </Button>
                      </Col>
                      {classItem.stats?.totalCollections > 0 && (
                        <Col>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-100"
                          >
                            <FiBook className="me-2" />
                            Collections
                          </Button>
                        </Col>
                      )}
                    </Row>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal des détails de classe */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" className="class-details-modal">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <FiInfo className="me-2 text-primary" />
            Détails de la classe : {selectedClass?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClass && (
            <div>
              {/* Informations générales */}
              <Card className="mb-3 class-info-section">
                <div className="class-info-header">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FiSettings className="me-2" />
                    Informations générales
                  </h6>
                </div>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <strong>Nom :</strong> {selectedClass.name}
                    </Col>
                    <Col md={6}>
                      <strong>Code d'invitation :</strong> 
                      <code className="ms-2">{selectedClass.inviteCode}</code>
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <strong>Date de création :</strong><br />
                      <small>{formatDate(selectedClass.createdAt)}</small>
                    </Col>
                    <Col md={6}>
                      <strong>Date de rejointe :</strong><br />
                      <small>{formatDate(selectedClass.joinDate)}</small>
                    </Col>
                  </Row>
                  {selectedClass.description && (
                    <Row className="mt-2">
                      <Col>
                        <strong>Description :</strong><br />
                        <p className="text-muted mb-0">{selectedClass.description}</p>
                      </Col>
                    </Row>
                  )}
                </Card.Body>
              </Card>

              {/* Enseignant */}
              <Card className="mb-3 class-info-section">
                <div className="class-info-header">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FiUser className="me-2" />
                    Enseignant
                  </h6>
                </div>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center me-3"
                         style={{ width: '50px', height: '50px' }}>
                      <FiUser size={24} className="text-primary" />
                    </div>
                    <div>
                      <div className="fw-bold">{selectedClass.teacher?.name || 'Non spécifié'}</div>
                      <div className="text-muted small">{selectedClass.teacher?.email}</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Statistiques détaillées */}
              <Card className="mb-3 class-info-section">
                <div className="class-info-header">
                  <h6 className="mb-0 d-flex align-items-center">
                    <FiTrendingUp className="me-2" />
                    Statistiques
                  </h6>
                </div>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="text-center p-3 class-stats-card">
                        <FiUsers size={24} className="text-primary mb-2" />
                        <div className="fw-bold fs-4">{selectedClass.stats?.totalStudents || 0}</div>
                        <div className="small text-muted">Apprenants inscrits</div>
                        <div className="small text-muted">
                          (Max : {selectedClass.stats?.maxStudents || 50})
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-center p-3 class-stats-card">
                        <FiBook size={24} className="text-info mb-2" />
                        <div className="fw-bold fs-4">{selectedClass.stats?.totalCollections || 0}</div>
                        <div className="small text-muted">Collections partagées</div>
                      </div>
                    </Col>
                  </Row>
                  <Row className="g-3 mt-1">
                    <Col md={6}>
                      <div className="text-center p-3 class-stats-card">
                        <FiBookOpen size={24} className="text-warning mb-2" />
                        <div className="fw-bold fs-4">{selectedClass.stats?.totalCards || 0}</div>
                        <div className="small text-muted">Cartes disponibles</div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="text-center p-3 class-stats-card">
                        <FiUserCheck size={24} className="text-success mb-2" />
                        <div className="fw-bold fs-4">
                          {selectedClass.stats?.allowSelfEnrollment ? 'Oui' : 'Non'}
                        </div>
                        <div className="small text-muted">Auto-inscription</div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Camarades de classe */}
              {selectedClass.classmates && selectedClass.classmates.length > 0 && (
                <Card className="class-info-section">
                  <div className="class-info-header">
                    <h6 className="mb-0 d-flex align-items-center">
                      <FiUsers className="me-2" />
                      Camarades de classe ({selectedClass.classmates.length})
                    </h6>
                  </div>
                  <Card.Body>
                    <div>
                      {selectedClass.classmates.map((classmate, index) => (
                        <div key={classmate.id} className="classmate-item d-flex align-items-center">
                          <div className="classmate-avatar me-3">
                            <FiUser size={16} />
                          </div>
                          <div>
                            <div className="fw-semibold">{classmate.name || 'Nom non disponible'}</div>
                            <div className="small text-muted">{classmate.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour rejoindre une classe */}
      <JoinClassModal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        onClassJoined={handleClassJoined}
      />
    </Container>
  );
};

export default StudentClassesDetailView;
