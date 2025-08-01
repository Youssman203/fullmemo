import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaChalkboardTeacher, FaUserGraduate, FaBook, FaLayerGroup, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import AdminUserManagement from '../components/AdminUserManagement';
import adminService from '../services/adminService';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSystemStats();
  }, []);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getSystemStats();
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
      setError('Impossible de charger les statistiques système');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
        <p className="mt-2">Chargement du tableau de bord...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4">
        <Col>
          <div className="admin-header">
            <h1 className="admin-title">
              <FaChartLine className="me-2" />
              Tableau de bord administrateur
            </h1>
            <p className="admin-subtitle">
              Bienvenue, <strong>{user?.name}</strong> - Gestion complète du système
            </p>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistiques générales */}
      {stats && (
        <Row className="mb-4">
          <Col md={6} lg={3} className="mb-3">
            <Card className="stats-card stats-users">
              <Card.Body>
                <div className="stats-content">
                  <div className="stats-icon">
                    <FaUsers />
                  </div>
                  <div className="stats-info">
                    <h3>{stats.users?.total || 0}</h3>
                    <p>Utilisateurs total</p>
                    <small className="text-success">
                      +{stats.users?.recent || 0} cette semaine
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stats-card stats-teachers">
              <Card.Body>
                <div className="stats-content">
                  <div className="stats-icon">
                    <FaChalkboardTeacher />
                  </div>
                  <div className="stats-info">
                    <h3>{stats.users?.teachers || 0}</h3>
                    <p>Enseignants</p>
                    <small className="text-info">
                      {((stats.users?.teachers / stats.users?.total) * 100).toFixed(1)}% du total
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stats-card stats-students">
              <Card.Body>
                <div className="stats-content">
                  <div className="stats-icon">
                    <FaUserGraduate />
                  </div>
                  <div className="stats-info">
                    <h3>{stats.users?.students || 0}</h3>
                    <p>Étudiants</p>
                    <small className="text-info">
                      {((stats.users?.students / stats.users?.total) * 100).toFixed(1)}% du total
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6} lg={3} className="mb-3">
            <Card className="stats-card stats-resources">
              <Card.Body>
                <div className="stats-content">
                  <div className="stats-icon">
                    <FaLayerGroup />
                  </div>
                  <div className="stats-info">
                    <h3>{stats.resources?.collections || 0}</h3>
                    <p>Collections</p>
                    <small className="text-success">
                      +{stats.resources?.recentCollections || 0} cette semaine
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Détails des ressources */}
      {stats && (
        <Row className="mb-4">
          <Col md={4} className="mb-3">
            <Card className="resource-card">
              <Card.Header>
                <h5>
                  <FaBook className="me-2" />
                  Cartes Flash
                </h5>
              </Card.Header>
              <Card.Body className="text-center">
                <h2 className="text-primary">{stats.resources?.flashcards || 0}</h2>
                <p className="text-muted">Cartes créées au total</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="resource-card">
              <Card.Header>
                <h5>
                  <FaUsers className="me-2" />
                  Classes
                </h5>
              </Card.Header>
              <Card.Body className="text-center">
                <h2 className="text-warning">{stats.resources?.classes || 0}</h2>
                <p className="text-muted">Classes actives</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-3">
            <Card className="resource-card">
              <Card.Header>
                <h5>
                  <FaChartLine className="me-2" />
                  Administrateurs
                </h5>
              </Card.Header>
              <Card.Body className="text-center">
                <h2 className="text-danger">{stats.users?.admins || 0}</h2>
                <p className="text-muted">Comptes administrateurs</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Gestion des utilisateurs */}
      <Row>
        <Col>
          <Card className="management-card">
            <Card.Header>
              <h4>
                <FaUsers className="me-2" />
                Gestion des utilisateurs
              </h4>
            </Card.Header>
            <Card.Body>
              <AdminUserManagement onStatsUpdate={loadSystemStats} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
