// src/pages/Evaluation.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import evaluationService from '../services/evaluationService';
import StudentSessionsModal from '../components/StudentSessionsModal';

const Evaluation = () => {
  const { user, isTeacher, isStudent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  // Charger les données - Hook appelé avant tout return conditionnel
  useEffect(() => {
    if (isTeacher()) {
      loadTeacherData();
    }
  }, [isTeacher]);

  // Rediriger les apprenants vers le dashboard après les hooks
  if (isStudent()) {
    window.location.href = '/home';
    return null;
  }

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await evaluationService.getStudentsWithSharedCollections();
      console.log('Données d\'évaluation reçues:', response);
      if (response.success) {
        // Transformer les données pour correspondre au format attendu
        const transformedStudents = response.data?.map(item => ({
          studentId: item.student._id,
          studentName: item.student.name,
          studentEmail: item.student.email,
          totalSessions: item.totalSessions,
          averageScore: item.averageScore,
          lastSession: item.lastActivity,
          sessionTypes: ['revision'], // Type par défaut
          collections: item.collections
        })) || [];
        
        setStudents(transformedStudents);
        
        // Calculer les stats globales à partir des données
        const globalStats = {
          uniqueStudentsCount: transformedStudents.length,
          totalSessions: transformedStudents.reduce((sum, s) => sum + s.totalSessions, 0),
          averageScore: transformedStudents.length > 0 
            ? Math.round(transformedStudents.reduce((sum, s) => sum + s.averageScore, 0) / transformedStudents.length)
            : 0
        };
        setGlobalStats(globalStats);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  // Page pour les enseignants
  if (isTeacher()) {
    if (loading) {
      return (
        <Container className="py-4 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
          <p className="mt-2">Chargement des évaluations...</p>
        </Container>
      );
    }

    if (error) {
      return (
        <Container className="py-4">
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
            <Button onClick={loadTeacherData} variant="outline-danger">
              Réessayer
            </Button>
          </Alert>
        </Container>
      );
    }

    return (
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Évaluation des Apprenants</h1>
          <Button 
            variant="outline-primary" 
            onClick={loadTeacherData}
            size="sm"
          >
            🔄 Actualiser
          </Button>
        </div>

        {/* Statistiques globales */}
        {globalStats && (
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <h3 className="text-primary">{globalStats.uniqueStudentsCount || 0}</h3>
                  <p className="text-muted mb-0">Apprenants actifs</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <h3 className="text-info">{globalStats.totalSessions || 0}</h3>
                  <p className="text-muted mb-0">Sessions totales</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <h3 className="text-success">{globalStats.averageScore || 0}%</h3>
                  <p className="text-muted mb-0">Score moyen</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-center gap-1">
                    {globalStats.sessionTypeCounts && Object.entries(globalStats.sessionTypeCounts).map(([type, count]) => (
                      <Badge key={type} bg="secondary" className="small">
                        {type === 'classic' ? 'Classique' : type === 'quiz' ? 'Quiz' : type === 'test' ? 'Test' : type}: {count}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-muted mb-0 mt-1">Types de sessions</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Liste des apprenants */}
        <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Apprenants avec Collections Partagées</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {students.length === 0 ? (
              <div className="text-center py-5">
                <h6 className="text-muted">Aucun apprenant trouvé</h6>
                <p className="text-muted">
                  Les apprenants apparaîtront ici après avoir utilisé vos collections partagées.
                </p>
              </div>
            ) : (
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Apprenant</th>
                    <th>Email</th>
                    <th className="text-center">Sessions</th>
                    <th className="text-center">Score Moyen</th>
                    <th className="text-center">Types</th>
                    <th className="text-center">Dernière Session</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr 
                      key={student.studentId} 
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleStudentClick(student)}
                    >
                      <td>
                        <strong>{student.studentName}</strong>
                      </td>
                      <td className="text-muted">{student.studentEmail}</td>
                      <td className="text-center">
                        <Badge bg="info">{student.totalSessions}</Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={getScoreBadgeVariant(student.averageScore)}>
                          {student.averageScore}%
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          {student.sessionTypes.map((type) => (
                            <Badge key={type} bg="secondary" className="small">
                              {type === 'revision' ? 'Révision' : type === 'quiz' ? 'Quiz' : type}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-center text-muted small">
                        {formatDate(student.lastSession)}
                      </td>
                      <td className="text-center">
                        <Button 
                          size="sm" 
                          variant="outline-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStudentClick(student);
                          }}
                        >
                          Voir détails
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal des sessions d'un apprenant */}
        <StudentSessionsModal
          show={showModal}
          onHide={() => setShowModal(false)}
          student={selectedStudent}
        />
      </Container>
    );
  }

  // Fallback pour autres rôles
  return (
    <Container className="py-4" style={{ minHeight: '400px' }}>
      <h1 className="mb-4">Évaluation</h1>
      <div className="text-center py-5">
        <p className="text-muted fs-5">Accès non autorisé</p>
        <small className="text-muted">Vous n'avez pas les permissions nécessaires</small>
      </div>
    </Container>
  );
};

export default Evaluation;
