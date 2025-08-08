// src/components/StudentSessionsModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Table, Badge, Button, Spinner, Alert, Tabs, Tab, Form, InputGroup } from 'react-bootstrap';
import sessionService from '../services/sessionService';

const StudentSessionsModal = ({ show, onHide, student }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState([]);
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedSessionType, setSelectedSessionType] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (show && student) {
      loadStudentData();
    }
  }, [show, student, selectedSessionType]);

  const loadStudentData = async () => {
    if (!student) return;

    try {
      setLoading(true);
      setError(null);

      const options = {
        limit: 20,
        offset: 0
      };

      if (selectedSessionType) {
        options.sessionType = selectedSessionType;
      }

      const response = await sessionService.getStudentSessions(student.studentId, options);
      
      if (response.success) {
        setSessions(response.data.sessions || []);
        setStats(response.data.stats || []);
      }
    } catch (error) {
      console.error('Erreur chargement sessions apprenant:', error);
      setError('Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = async (session) => {
    try {
      const response = await sessionService.getSessionDetails(session._id);
      if (response.success) {
        setSelectedSession(response.data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Erreur chargement détails session:', error);
    }
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

  const renderStats = () => {
    if (stats.length === 0) {
      return (
        <div className="text-center py-3">
          <p className="text-muted">Aucune statistique disponible</p>
        </div>
      );
    }

    return (
      <div className="row g-3">
        {stats.map((stat) => (
          <div key={stat._id} className="col-md-4">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <h6 className="card-title">{sessionService.formatSessionType(stat._id)}</h6>
                <div className="mb-2">
                  <Badge bg="info" className="me-2">{stat.totalSessions} sessions</Badge>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Score moyen: </small>
                  <Badge bg={getScoreBadgeVariant(stat.averageScore)}>
                    {Math.round(stat.averageScore)}%
                  </Badge>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Temps total: </small>
                  <span className="fw-bold">{sessionService.formatDuration(stat.totalTimeSpent)}</span>
                </div>
                <div>
                  <small className="text-muted">
                    Dernière: {formatDate(stat.lastSession)}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSessions = () => {
    if (loading) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <p className="mt-2 mb-0">Chargement...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="outline-danger" onClick={loadStudentData}>
              Réessayer
            </Button>
          </div>
        </Alert>
      );
    }

    if (sessions.length === 0) {
      return (
        <div className="text-center py-4">
          <h6 className="text-muted">Aucune session trouvée</h6>
          <p className="text-muted mb-0">
            {selectedSessionType 
              ? `Aucune session de type "${sessionService.formatSessionType(selectedSessionType)}" trouvée.`
              : 'Cet apprenant n\'a pas encore effectué de sessions.'
            }
          </p>
        </div>
      );
    }

    return (
      <Table hover responsive size="sm">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Collection</th>
            <th className="text-center">Score</th>
            <th className="text-center">Durée</th>
            <th className="text-center">Cartes</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session._id} style={{ cursor: 'pointer' }} onClick={() => handleSessionClick(session)}>
              <td className="small">{formatDate(session.createdAt)}</td>
              <td>
                <Badge bg="secondary" className="small">
                  {sessionService.formatSessionType(session.sessionType)}
                </Badge>
              </td>
              <td className="small">{session.collection?.name || 'Collection supprimée'}</td>
              <td className="text-center">
                <Badge bg={getScoreBadgeVariant(session.results.scorePercentage)}>
                  {session.results.scorePercentage}%
                </Badge>
              </td>
              <td className="text-center small">
                {sessionService.formatDuration(session.duration)}
              </td>
              <td className="text-center">
                <span className="small">
                  {session.results.correctAnswers}/{session.results.totalCards}
                </span>
              </td>
              <td className="text-center">
                <Button 
                  size="sm" 
                  variant="outline-primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSessionClick(session);
                  }}
                >
                  Détails
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  if (!student) return null;

  return (
    <>
      {/* Modal principale */}
      <Modal show={show} onHide={onHide} size="lg" scrollable>
        <Modal.Header closeButton>
          <Modal.Title>
            Sessions de {student.studentName}
            <small className="text-muted d-block">{student.studentEmail}</small>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab eventKey="recent" title="Sessions récentes">
              <div className="mb-3">
                <InputGroup size="sm">
                  <InputGroup.Text>Filtrer par type:</InputGroup.Text>
                  <Form.Select 
                    value={selectedSessionType} 
                    onChange={(e) => setSelectedSessionType(e.target.value)}
                  >
                    <option value="">Tous les types</option>
                    <option value="revision">Révision</option>
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                  </Form.Select>
                </InputGroup>
              </div>
              {renderSessions()}
            </Tab>
            
            <Tab eventKey="stats" title="Statistiques">
              {renderStats()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal détails session */}
      <Modal 
        show={showDetails} 
        onHide={() => setShowDetails(false)} 
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Détails de la session
            {selectedSession && (
              <small className="text-muted d-block">
                {sessionService.formatSessionType(selectedSession.sessionType)} - {formatDate(selectedSession.createdAt)}
              </small>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSession && (
            <div>
              {/* Résumé de la session */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center">
                      <h4 className={`text-${getScoreBadgeVariant(selectedSession.results.scorePercentage) === 'danger' ? 'danger' : getScoreBadgeVariant(selectedSession.results.scorePercentage) === 'warning' ? 'warning' : 'success'}`}>
                        {selectedSession.results.scorePercentage}%
                      </h4>
                      <p className="mb-0">Score final</p>
                      <small className="text-muted">
                        {sessionService.getScoreLabel(selectedSession.results.scorePercentage)}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center">
                      <h4 className="text-info">{sessionService.formatDuration(selectedSession.duration)}</h4>
                      <p className="mb-0">Durée totale</p>
                      <small className="text-muted">
                        ~{Math.round(selectedSession.duration / selectedSession.results.totalCards)}s par carte
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails par carte */}
              {selectedSession.cardResults && selectedSession.cardResults.length > 0 && (
                <div>
                  <h6>Détail par carte ({selectedSession.cardResults.length} cartes)</h6>
                  <Table hover responsive size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Question</th>
                        <th>Réponse donnée</th>
                        <th>Réponse correcte</th>
                        <th className="text-center">Résultat</th>
                        <th className="text-center">Temps</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.cardResults.map((cardResult, index) => (
                        <tr key={index}>
                          <td className="small" style={{ maxWidth: '200px' }}>
                            {cardResult.question?.substring(0, 50)}
                            {cardResult.question?.length > 50 && '...'}
                          </td>
                          <td className="small">{cardResult.userAnswer || 'Non répondu'}</td>
                          <td className="small">{cardResult.correctAnswer}</td>
                          <td className="text-center">
                            {cardResult.isCorrect ? (
                              <Badge bg="success">✓</Badge>
                            ) : (
                              <Badge bg="danger">✗</Badge>
                            )}
                          </td>
                          <td className="text-center small">
                            {cardResult.timeSpent ? `${cardResult.timeSpent}s` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StudentSessionsModal;
