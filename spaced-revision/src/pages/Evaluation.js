// src/pages/Evaluation.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Modal, Table, ProgressBar, ListGroup } from 'react-bootstrap';
import { FaUser, FaChartLine, FaClock, FaCheckCircle, FaTimesCircle, FaTrophy, FaEye, FaMedal, FaGraduationCap, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import evaluationService from '../services/evaluationService';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import '../styles/Evaluation.css';

const Evaluation = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSessions, setStudentSessions] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [socket, setSocket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialiser WebSocket
  useEffect(() => {
    if (user && user.role === 'teacher') {
      const token = localStorage.getItem('token');
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('✅ WebSocket connecté pour évaluation');
        // Rejoindre la room enseignant
        newSocket.emit('joinTeacherRoom');
      });

      // Écouter les nouvelles sessions d'apprenants en temps réel
      newSocket.on('newStudentSession', (sessionData) => {
        console.log('📊 Nouvelle session reçue:', sessionData);
        toast.info(`📚 ${sessionData.studentName} vient de terminer une session (Score: ${sessionData.score}%)`, {
          position: "top-right",
          autoClose: 5000
        });
        // Rafraîchir les données
        setRefreshKey(prev => prev + 1);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  // Charger les apprenants
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Chargement des apprenants...');
      console.log('👤 Utilisateur connecté:', user);
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');
      
      const response = await evaluationService.getStudentsWithSharedCollections();
      console.log('📊 Réponse API complète:', response);
      console.log('📊 Données reçues:', response.data);
      console.log('📊 Nombre d\'apprenants:', response.data ? response.data.length : 0);
      
      setStudents(response.data || []);
      
      // Charger les statistiques globales
      try {
        const statsResponse = await evaluationService.getEvaluationStats();
        console.log('📈 Stats:', statsResponse.data);
        setStats(statsResponse.data);
      } catch (statsErr) {
        console.error('⚠️ Erreur stats (non critique):', statsErr);
        // On continue même si les stats échouent
      }
    } catch (err) {
      console.error('❌ Erreur complète:', err);
      console.error('❌ Erreur response:', err.response);
      if (err.response && err.response.status === 401) {
        setError('Session expirée. Veuillez vous reconnecter.');
        toast.error('Session expirée');
      } else {
        setError('Impossible de charger les données des apprenants');
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [refreshKey]);

  // Voir les sessions d'un apprenant
  const handleViewStudent = async (student) => {
    try {
      setSelectedStudent(student);
      setLoading(true);
      
      const response = await evaluationService.getStudentSessions(student.student._id);
      setStudentSessions(response.data);
      setShowStudentModal(true);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Impossible de charger les sessions de l\'apprenant');
    } finally {
      setLoading(false);
    }
  };

  // Voir les détails d'une session
  const handleViewSession = async (session) => {
    try {
      setLoading(true);
      const response = await evaluationService.getSessionDetails(session._id);
      setSelectedSession(response.data);
      setShowSessionModal(true);
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Impossible de charger les détails de la session');
    } finally {
      setLoading(false);
    }
  };

  // Évaluer une session
  const handleEvaluateSession = async (sessionId, notes, rating) => {
    try {
      await evaluationService.evaluateSession(sessionId, {
        teacherNotes: notes,
        teacherRating: rating
      });
      toast.success('Session évaluée avec succès');
      
      // Rafraîchir les données
      if (selectedStudent) {
        handleViewStudent(selectedStudent);
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur lors de l\'évaluation');
    }
  };

  // Formater la date
  const formatDate = (date) => {
    return format(new Date(date), 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  // Calculer la couleur selon le score
  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  if (loading && !students.length) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement des données d'évaluation...</p>
      </Container>
    );
  }

  return (
    <Container className="evaluation-container mt-4">
      <Row className="mb-4">
        <Col md={8} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="mb-0">
                  <FaGraduationCap className="me-2" />
                  Classement des Apprenants - Sessions de Révision
                </h3>
                <Button 
                  variant="light" 
                  size="sm" 
                  onClick={loadStudents}
                  className="text-primary"
                >
                  🔄 Actualiser
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">

              {/* Statistiques rapides */}
              {stats && (
                <div className="bg-light p-3 border-bottom">
                  <Row className="text-center">
                    <Col xs={3}>
                      <div>
                        <strong className="text-primary">{stats.totalStudents}</strong>
                        <small className="d-block text-muted">Apprenants</small>
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div>
                        <strong className="text-success">{stats.totalSessions}</strong>
                        <small className="d-block text-muted">Sessions</small>
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div>
                        <strong className="text-info">{stats.averageScore}%</strong>
                        <small className="d-block text-muted">Score Moy.</small>
                      </div>
                    </Col>
                    <Col xs={3}>
                      <div>
                        <strong className="text-warning">{stats.recentActivity}</strong>
                        <small className="d-block text-muted">Actifs (24h)</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {/* Liste de classement des apprenants */}
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-3">Chargement des données...</p>
                </div>
              ) : error ? (
                <Alert variant="danger" className="m-3">
                  {error}
                </Alert>
              ) : students.length === 0 ? (
                <div className="text-center py-5">
                  <FaUserGraduate size={50} className="text-muted mb-3" />
                  <p className="text-muted">Aucun apprenant n'a encore révisé vos collections</p>
                  <small>Les apprenants apparaîtront ici après avoir utilisé vos collections partagées.</small>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {students
                    .sort((a, b) => b.averageScore - a.averageScore) // Trier par score décroissant
                    .map((student, index) => (
                      <ListGroup.Item 
                        key={student.student._id}
                        action
                        onClick={() => handleViewStudent(student)}
                        className="d-flex align-items-center py-3 hover-effect"
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Numéro de classement */}
                        <div className="me-3">
                          {index === 0 && (
                            <FaMedal size={24} className="text-warning" />
                          )}
                          {index === 1 && (
                            <FaMedal size={24} className="text-secondary" />
                          )}
                          {index === 2 && (
                            <FaMedal size={24} style={{ color: '#CD7F32' }} />
                          )}
                          {index > 2 && (
                            <span className="badge bg-secondary rounded-circle" style={{ width: '30px', height: '30px', lineHeight: '22px' }}>
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Nom de l'apprenant */}
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark">
                            {student.student.name}
                          </div>
                          <small className="text-muted">
                            {student.totalSessions} session{student.totalSessions > 1 ? 's' : ''} • 
                            {student.collections.length} collection{student.collections.length > 1 ? 's' : ''}
                          </small>
                        </div>

                        {/* Score et indicateurs */}
                        <div className="text-end">
                          <div>
                            <Badge 
                              bg={getScoreColor(student.averageScore)} 
                              className="px-3 py-2"
                              style={{ fontSize: '0.9rem' }}
                            >
                              {student.averageScore}%
                            </Badge>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {format(new Date(student.lastActivity), 'dd/MM HH:mm', { locale: fr })}
                          </small>
                        </div>
                      </ListGroup.Item>
                    ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal détails apprenant - Historique des sessions */}
      <Modal 
        show={showStudentModal} 
        onHide={() => setShowStudentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {selectedStudent && (
              <>
                <FaUserGraduate className="me-2" />
                Historique - {selectedStudent.student.name}
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {studentSessions && (
            <>
              {/* Statistiques résumées */}
              <Card className="mb-3 border-0 bg-light">
                <Card.Body>
                  <Row className="text-center">
                    <Col xs={4}>
                      <h4 className="text-primary">{studentSessions.stats.averageScore}%</h4>
                      <small className="text-muted">Score Moyen</small>
                    </Col>
                    <Col xs={4}>
                      <h4 className="text-success">{studentSessions.sessions.length}</h4>
                      <small className="text-muted">Sessions Totales</small>
                    </Col>
                    <Col xs={4}>
                      <h4 className="text-info">{Math.round(studentSessions.stats.averageDuration / 60)} min</h4>
                      <small className="text-muted">Durée Moyenne</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Tableau des sessions */}
              <h5 className="mb-3">Historique détaillé des sessions</h5>
              <div className="table-responsive">
                <Table hover className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Collection</th>
                      <th>Score</th>
                      <th>Durée</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentSessions.sessions
                      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                      .map((session) => (
                        <tr key={session._id}>
                          <td>
                            <div>
                              <strong>{format(new Date(session.createdAt), 'dd/MM/yyyy', { locale: fr })}</strong>
                              <small className="d-block text-muted">
                                {format(new Date(session.createdAt), 'HH:mm', { locale: fr })}
                              </small>
                            </div>
                          </td>
                          <td>
                            <div>
                              <strong>{session.collection.name}</strong>
                              <small className="d-block text-muted">
                                {session.sessionType}
                              </small>
                            </div>
                          </td>
                          <td>
                            <Badge 
                              bg={getScoreColor(session.results.scorePercentage)} 
                              className="px-3 py-2"
                            >
                              {session.results.scorePercentage}%
                            </Badge>
                            <small className="d-block text-muted mt-1">
                              {session.results.correctAnswers}/{session.results.totalCards} correctes
                            </small>
                          </td>
                          <td>{Math.round(session.duration / 60)} min</td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => handleViewSession(session)}
                            >
                              <FaEye /> Détails
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>

              {/* Progression graphique */}
              <h5 className="mt-4 mb-3">Évolution des performances</h5>
              <div className="bg-light p-3 rounded">
                {studentSessions.stats.progressOverTime && studentSessions.stats.progressOverTime.length > 0 ? (
                  studentSessions.stats.progressOverTime.slice(-10).map((point, index) => (
                    <div key={index} className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <small>{format(new Date(point.date), 'dd/MM HH:mm', { locale: fr })}</small>
                        <small className="fw-bold">{point.score}%</small>
                      </div>
                      <ProgressBar 
                        now={point.score} 
                        variant={getScoreColor(point.score)}
                        style={{ height: '10px' }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-center">Pas encore de données de progression</p>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStudentModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal détails session */}
      <Modal 
        show={showSessionModal} 
        onHide={() => setShowSessionModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails de la session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSession && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Apprenant:</strong> {selectedSession.student.name}
                </Col>
                <Col md={6}>
                  <strong>Collection:</strong> {selectedSession.collection.name}
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {formatDate(selectedSession.createdAt)}
                </Col>
                <Col md={6}>
                  <strong>Score:</strong>{' '}
                  <Badge bg={getScoreColor(selectedSession.results.scorePercentage)}>
                    {selectedSession.results.scorePercentage}%
                  </Badge>
                </Col>
              </Row>

              <h6 className="mt-4">Résultats par carte</h6>
              <Table responsive size="sm" className="mt-2">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Réponse donnée</th>
                    <th>Réponse correcte</th>
                    <th>Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSession.cardResults.map((result, index) => (
                    <tr key={index}>
                      <td>{result.question}</td>
                      <td>{result.userAnswer || '-'}</td>
                      <td>{result.correctAnswer}</td>
                      <td>
                        {result.isCorrect ? (
                          <FaCheckCircle className="text-success" />
                        ) : (
                          <FaTimesCircle className="text-danger" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Evaluation;
