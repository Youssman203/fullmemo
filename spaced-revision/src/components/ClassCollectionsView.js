// src/components/ClassCollectionsView.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Alert, Spinner 
} from 'react-bootstrap';
import { 
  FiBook, FiBookOpen, FiUser, FiCalendar, FiArrowLeft, FiPlay
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const ClassCollectionsView = ({ classId, className, onBack }) => {
  const { getClassCollections } = useData();
  const [collections, setCollections] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classId) {
      fetchClassCollections();
    }
  }, [classId]);

  const fetchClassCollections = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getClassCollections(classId);
      setClassInfo(response.data.class);
      setCollections(response.data.collections || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des collections:', error);
      setError(
        error.response?.data?.message || 
        'Erreur lors de la récupération des collections de la classe'
      );
    } finally {
      setLoading(false);
    }
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
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header avec navigation retour */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={onBack} className="mb-3">
            <FiArrowLeft className="me-2" />
            Retour aux classes
          </Button>
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiBook className="me-3 text-primary" />
            Collections - {classInfo?.name || className}
          </h1>
          <p className="text-muted mb-0">
            Collections partagées par votre enseignant
            {classInfo?.teacher && (
              <span className="ms-2">
                <FiUser className="me-1" />
                {classInfo.teacher.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Erreur :</strong> {error}
          <Button
            variant="link"
            size="sm"
            onClick={fetchClassCollections}
            className="p-0 ms-2"
          >
            Réessayer
          </Button>
        </Alert>
      )}

      {/* Collections partagées */}
      {collections.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiBook size={64} className="text-muted mb-3" />
            <h4 className="text-muted mb-3">Aucune collection partagée</h4>
            <p className="text-muted">
              Votre enseignant n'a pas encore partagé de collections avec cette classe.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Statistiques rapides */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiBook size={24} className="text-primary mb-2" />
                  <h4 className="fw-bold mb-1">{collections.length}</h4>
                  <small className="text-muted">Collections disponibles</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiBookOpen size={24} className="text-success mb-2" />
                  <h4 className="fw-bold mb-1">
                    {collections.reduce((total, col) => total + (col.cardCount || 0), 0)}
                  </h4>
                  <small className="text-muted">Cartes à réviser</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiUser size={24} className="text-info mb-2" />
                  <h4 className="fw-bold mb-1">1</h4>
                  <small className="text-muted">Enseignant</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiCalendar size={24} className="text-warning mb-2" />
                  <h4 className="fw-bold mb-1">
                    {new Set(collections.map(c => formatDate(c.createdAt))).size}
                  </h4>
                  <small className="text-muted">Dates différentes</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Grille des collections */}
          <Row className="g-4">
            {collections.map((collection) => (
              <Col lg={4} md={6} key={collection._id}>
                <Card className="h-100 border-0 shadow-sm collection-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 fw-bold text-primary">
                        {collection.name}
                      </h5>
                      <Badge bg="success" className="ms-2">Partagée</Badge>
                    </div>

                    {collection.description && (
                      <p className="text-muted mb-3">
                        {collection.description}
                      </p>
                    )}

                    {/* Informations sur la collection */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <FiBookOpen className="me-1" />
                          Cartes disponibles
                        </small>
                        <small className="fw-bold">{collection.cardCount || 0}</small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <FiUser className="me-1" />
                          Créé par
                        </small>
                        <small>{collection.user?.name || 'Enseignant'}</small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <FiCalendar className="me-1" />
                          Créé le
                        </small>
                        <small>{formatDate(collection.createdAt)}</small>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      <Button
                        as={Link}
                        to={`/collections/${collection._id}`}
                        variant="primary"
                        size="sm"
                        className="flex-fill d-flex align-items-center justify-content-center"
                      >
                        <FiBookOpen className="me-2" />
                        Voir les cartes
                      </Button>
                      
                      <Button
                        as={Link}
                        to={`/review-cards?collection=${collection._id}`}
                        variant="outline-success"
                        size="sm"
                        className="flex-fill d-flex align-items-center justify-content-center"
                        disabled={!collection.cardCount || collection.cardCount === 0}
                      >
                        <FiPlay className="me-2" />
                        Réviser
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default ClassCollectionsView;
