// src/pages/StudentClassesPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Breadcrumb } from 'react-bootstrap';
import { FiUsers, FiPlus, FiUser, FiCalendar, FiBook, FiHome, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import JoinClassModal from '../components/JoinClassModal';

const StudentClassesPage = () => {
  const { getStudentClasses } = useData();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      setError('');
      const classesData = await getStudentClasses();
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
    // Rafraîchir la liste des classes
    fetchStudentClasses();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item as={Link} to="/dashboard">
          <FiHome className="me-1" />
          Tableau de bord
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          <FiUsers className="me-1" />
          Mes Classes
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiUsers className="me-3 text-primary" />
            Mes Classes
          </h1>
          <p className="text-muted mb-0">
            Gérez vos classes et accédez aux ressources partagées par vos enseignants
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-secondary" 
            as={Link} 
            to="/dashboard"
            className="d-flex align-items-center"
          >
            <FiArrowLeft className="me-2" />
            Retour
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowJoinModal(true)}
            className="d-flex align-items-center"
          >
            <FiPlus className="me-2" />
            Rejoindre une classe
          </Button>
        </div>
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

      {/* Statistiques rapides */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiUsers size={32} className="text-primary mb-2" />
              <h3 className="fw-bold mb-1">{classes.length}</h3>
              <p className="text-muted mb-0">Classes rejointes</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiUser size={32} className="text-success mb-2" />
              <h3 className="fw-bold mb-1">
                {new Set(classes.map(c => c.teacherId?._id)).size}
              </h3>
              <p className="text-muted mb-0">Enseignants différents</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="text-center">
              <FiBook size={32} className="text-info mb-2" />
              <h3 className="fw-bold mb-1">
                {classes.reduce((total, c) => total + (c.collections?.length || 0), 0)}
              </h3>
              <p className="text-muted mb-0">Collections disponibles</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
            <Col lg={6} xl={4} key={classItem._id}>
              <Card className="h-100 border-0 shadow-sm class-card hover-shadow">
                <Card.Body className="d-flex flex-column">
                  {/* Header de la carte */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="card-title mb-0 fw-bold text-primary">
                      {classItem.name}
                    </h5>
                    <Badge bg="success">
                      Actif
                    </Badge>
                  </div>

                  {/* Description */}
                  {classItem.description && (
                    <p className="text-muted mb-3">
                      {classItem.description}
                    </p>
                  )}

                  {/* Informations */}
                  <div className="mb-4 flex-grow-1">
                    <div className="d-flex align-items-center text-muted mb-2">
                      <FiUser size={16} className="me-2 text-primary" />
                      <strong className="me-2">Enseignant :</strong>
                      <span>
                        {classItem.teacherId?.name || classItem.teacherId?.email || 'Non spécifié'}
                      </span>
                    </div>

                    <div className="d-flex align-items-center text-muted mb-2">
                      <FiCalendar size={16} className="me-2 text-success" />
                      <strong className="me-2">Rejoint le :</strong>
                      <span>
                        {formatDate(classItem.joinDate || classItem.createdAt)}
                      </span>
                    </div>

                    {classItem.collections && classItem.collections.length > 0 && (
                      <div className="d-flex align-items-center text-muted">
                        <FiBook size={16} className="me-2 text-info" />
                        <strong className="me-2">Collections :</strong>
                        <span>
                          {classItem.collections.length} disponible{classItem.collections.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto">
                    <Row className="g-2">
                      <Col>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="w-100"
                          // onClick={() => navigate(`/classes/${classItem._id}`)}
                        >
                          Voir détails
                        </Button>
                      </Col>
                      {classItem.collections && classItem.collections.length > 0 && (
                        <Col>
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-100"
                            // onClick={() => navigate(`/classes/${classItem._id}/collections`)}
                          >
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

      {/* Modal pour rejoindre une classe */}
      <JoinClassModal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        onClassJoined={handleClassJoined}
      />
    </Container>
  );
};

export default StudentClassesPage;
