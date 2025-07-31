// src/components/StudentClassesPanel.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import { FiUsers, FiPlus, FiUser, FiCalendar, FiBook, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import JoinClassModal from './JoinClassModal';
import ClassCollectionsView from './ClassCollectionsView';
import CollectionSelectorModal from './CollectionSelectorModal';

const StudentClassesPanel = () => {
  const { getStudentClasses } = useData();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCollectionsView, setShowCollectionsView] = useState(false);
  const [showCollectionSelector, setShowCollectionSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

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

  const handleViewCollections = (classItem) => {
    setSelectedClass(classItem);
    setShowCollectionsView(true);
  };

  const handleViewCollectionsSelector = (classItem) => {
    setSelectedClass(classItem);
    setShowCollectionSelector(true);
  };

  const handleBackToClasses = () => {
    setShowCollectionsView(false);
    setSelectedClass(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Si on affiche la vue des collections, montrer le composant ClassCollectionsView
  if (showCollectionsView && selectedClass) {
    return (
      <ClassCollectionsView 
        classId={selectedClass._id}
        className={selectedClass.name}
        onBack={handleBackToClasses}
      />
    );
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body className="text-center py-4">
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2 mb-0 text-muted">Chargement de vos classes...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <FiUsers className="me-2 text-primary" />
              Mes Classes
            </h5>
            <div className="d-flex gap-2">
              {classes.length > 0 && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  as={Link}
                  to="/classes/details"
                  className="d-flex align-items-center"
                >
                  <FiEye className="me-2" />
                  Vue détaillée
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowJoinModal(true)}
                className="d-flex align-items-center"
              >
                <FiPlus className="me-2" />
                Rejoindre une classe
              </Button>
            </div>
          </div>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
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

          {classes.length === 0 ? (
            <div className="empty-state">
              <FiUsers size={48} className="text-muted mb-3" />
              <h6 className="text-muted mb-2">Aucune classe rejointe</h6>
              <p className="text-muted small mb-3">
                Vous n'avez encore rejoint aucune classe. Demandez un code d'invitation à votre enseignant.
              </p>
              <div className="d-flex flex-column gap-2 align-items-center">
                <Button
                  variant="primary"
                  onClick={() => setShowJoinModal(true)}
                  className="d-flex align-items-center"
                >
                  <FiPlus className="me-2" />
                  Rejoindre ma première classe
                </Button>
                <small className="text-muted">
                  Ou accédez à la <Link to="/classes/details" className="text-decoration-none">vue détaillée</Link> une fois que vous aurez rejoint des classes
                </small>
              </div>
            </div>
          ) : (
            <Row className="g-3">
              {classes.map((classItem) => (
                <Col md={6} lg={4} key={classItem._id}>
                  <Card className="h-100 border border-primary border-opacity-25 hover-shadow class-card">
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0 fw-bold text-primary">
                          {classItem.name}
                        </h6>
                        <Badge bg="success" className="ms-2">
                          Actif
                        </Badge>
                      </div>

                      {classItem.description && (
                        <p className="text-muted small mb-3">
                          {classItem.description}
                        </p>
                      )}

                      <div className="mb-3 flex-grow-1">
                        <div className="d-flex align-items-center text-muted small mb-1">
                          <FiUser size={14} className="me-2" />
                          <strong>Enseignant :</strong>
                          <span className="ms-1">
                            {classItem.teacherId?.name || classItem.teacherId?.email}
                          </span>
                        </div>

                        <div className="d-flex align-items-center text-muted small mb-1">
                          <FiCalendar size={14} className="me-2" />
                          <strong>Rejoint le :</strong>
                          <span className="ms-1">
                            {formatDate(classItem.joinDate || classItem.createdAt)}
                          </span>
                        </div>

                        {classItem.collections && classItem.collections.length > 0 && (
                          <div className="d-flex align-items-center text-muted small">
                            <FiBook size={14} className="me-2" />
                            <strong>Collections :</strong>
                            <span className="ms-1">
                              {classItem.collections.length}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="flex-fill"
                            as={Link}
                            to="/classes/details"
                          >
                            <FiEye className="me-2" size={14} />
                            Détails
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-fill"
                            onClick={() => handleViewCollectionsSelector(classItem)}
                          >
                            <FiBook className="me-2" size={14} />
                            Collections
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      <JoinClassModal
        show={showJoinModal}
        onHide={() => setShowJoinModal(false)}
        onClassJoined={handleClassJoined}
      />
      
      <CollectionSelectorModal
        show={showCollectionSelector}
        onHide={() => setShowCollectionSelector(false)}
        classId={selectedClass?._id}
        className={selectedClass?.name}
      />
    </>
  );
};

export default StudentClassesPanel;
