// src/pages/Classes.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, ListGroup, InputGroup } from 'react-bootstrap';
import { FiPlus, FiUsers, FiBookOpen, FiSettings, FiTrash2, FiCopy, FiMail, FiEye } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import classService from '../services/classService';
import StudentClassesPanel from '../components/StudentClassesPanel';
import TeacherClassDetailView from '../components/TeacherClassDetailView';

const Classes = () => {
  const { isTeacher, isStudent } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showDetailView, setShowDetailView] = useState(false);
  const [detailClassId, setDetailClassId] = useState(null);

  // États pour le formulaire de création
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    maxStudents: 50,
    allowSelfEnrollment: true
  });

  // États pour l'invitation d'étudiants
  const [inviteEmails, setInviteEmails] = useState('');

  useEffect(() => {
    if (isTeacher()) {
      fetchClasses();
    }
  }, [isTeacher]);

  // Si l'utilisateur est un étudiant, afficher le panel des classes d'étudiant
  if (isStudent()) {
    return (
      <Container fluid className="py-4">
        <div className="mb-4">
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiUsers className="me-3 text-primary" />
            Mes Classes
          </h1>
          <p className="text-muted mb-0">
            Gérez vos classes et accédez aux ressources partagées par vos enseignants
          </p>
        </div>
        <StudentClassesPanel />
      </Container>
    );
  }

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classService.getTeacherClasses();
      console.log('Réponse fetchClasses:', response);
      // La réponse peut avoir response.data qui contient les classes
      const classesData = response.data || response || [];
      setClasses(classesData);
    } catch (error) {
      showAlert('error', 'Erreur lors du chargement des classes: ' + error.message);
      console.error('Erreur détaillée:', error);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 5000);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      console.log('Tentative de création avec:', newClass);
      const response = await classService.createClass(newClass);
      console.log('Réponse de création:', response);
      setShowCreateModal(false);
      setNewClass({ name: '', description: '', maxStudents: 50, allowSelfEnrollment: true });
      showAlert('success', 'Classe créée avec succès !');
      fetchClasses();
    } catch (error) {
      showAlert('error', 'Erreur lors de la création de la classe: ' + error.message);
      console.error('Erreur détaillée:', error);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      try {
        await classService.deleteClass(classId);
        showAlert('success', 'Classe supprimée avec succès');
        fetchClasses();
      } catch (error) {
        showAlert('error', 'Erreur lors de la suppression');
        console.error('Erreur:', error);
      }
    }
  };

  const handleInviteStudents = async (e) => {
    e.preventDefault();
    if (!selectedClass || !inviteEmails.trim()) return;

    const emails = inviteEmails
      .split('\n')
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));

    if (emails.length === 0) {
      showAlert('error', 'Veuillez entrer au moins une adresse email valide');
      return;
    }

    try {
      const response = await classService.inviteStudents(selectedClass._id, emails);
      const { invited, alreadyInClass, notFound } = response.data;
      
      let message = `${invited.length} étudiant(s) invité(s) avec succès`;
      if (alreadyInClass.length > 0) {
        message += `, ${alreadyInClass.length} déjà inscrit(s)`;
      }
      if (notFound.length > 0) {
        message += `, ${notFound.length} email(s) non trouvé(s)`;
      }

      showAlert('success', message);
      setShowInviteModal(false);
      setInviteEmails('');
      setSelectedClass(null);
      fetchClasses();
    } catch (error) {
      showAlert('error', 'Erreur lors de l\'invitation des étudiants');
      console.error('Erreur:', error);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    showAlert('success', 'Code d\'invitation copié !');
  };

  const handleCloseDetailView = () => {
    setShowDetailView(false);
    setDetailClassId(null);
    fetchClasses(); // Rafraîchir les classes au cas où des collections ont été partagées
  };

  if (!isTeacher()) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Accès Refusé</h3>
          <p>Cette page est réservée aux enseignants.</p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Si on affiche la vue détaillée, montrer le composant TeacherClassDetailView
  if (showDetailView && detailClassId) {
    return (
      <TeacherClassDetailView 
        classId={detailClassId} 
        onClose={handleCloseDetailView}
      />
    );
  }

  return (
    <Container fluid className="py-4">
      {/* En-tête */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Mes Classes</h2>
              <p className="text-muted mb-0">Gérez vos classes et suivez vos étudiants</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <FiPlus size={18} />
              Nouvelle Classe
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alertes */}
      {alert.show && (
        <Alert variant={alert.type} dismissible onClose={() => setAlert({ show: false })}>
          {alert.message}
        </Alert>
      )}

      {/* Liste des classes */}
      {classes.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiBookOpen size={64} className="text-muted mb-3" />
            <h4>Aucune classe créée</h4>
            <p className="text-muted mb-4">Créez votre première classe pour commencer à enseigner</p>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2 mx-auto"
              style={{ width: 'fit-content' }}
            >
              <FiPlus size={18} />
              Créer ma première classe
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {classes.map((classItem) => (
            <Col lg={6} xl={4} key={classItem._id}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">{classItem.name}</h5>
                      <Badge bg={classItem.isActive ? 'success' : 'secondary'}>
                        {classItem.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="d-flex gap-1">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setSelectedClass(classItem);
                          setShowInviteModal(true);
                        }}
                      >
                        <FiMail size={14} />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteClass(classItem._id)}
                      >
                        <FiTrash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                
                <Card.Body>
                  <p className="text-muted small mb-3">
                    {classItem.description || 'Aucune description'}
                  </p>
                  
                  <div className="d-flex justify-content-between mb-3">
                    <div className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <FiUsers size={16} className="text-primary me-1" />
                        <strong>{classItem.students?.length || 0}</strong>
                      </div>
                      <small className="text-muted">Étudiants</small>
                    </div>
                    <div className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <FiBookOpen size={16} className="text-success me-1" />
                        <strong>{classItem.collections?.length || 0}</strong>
                      </div>
                      <small className="text-muted">Collections</small>
                    </div>
                  </div>

                  <div className="bg-light rounded p-2 mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Code d'invitation</small>
                        <div className="fw-bold text-primary">{classItem.inviteCode}</div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => copyInviteCode(classItem.inviteCode)}
                      >
                        <FiCopy size={14} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-white border-top-0">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => {
                      setDetailClassId(classItem._id);
                      setShowDetailView(true);
                    }}
                  >
                    <FiEye size={14} />
                    Voir les détails
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal de création de classe */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Créer une nouvelle classe</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateClass}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de la classe *</Form.Label>
                  <Form.Control
                    type="text"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    required
                    placeholder="Ex: Mathématiques 3ème"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre max d'étudiants</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="200"
                    value={newClass.maxStudents}
                    onChange={(e) => setNewClass({ ...newClass, maxStudents: parseInt(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                placeholder="Description de la classe (optionnel)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Permettre l'auto-inscription avec code d'invitation"
                checked={newClass.allowSelfEnrollment}
                onChange={(e) => setNewClass({ ...newClass, allowSelfEnrollment: e.target.checked })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit">
              Créer la classe
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal d'invitation d'étudiants */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Inviter des étudiants - {selectedClass?.name}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInviteStudents}>
          <Modal.Body>
            <div className="mb-3">
              <div className="bg-light rounded p-3 mb-3">
                <h6>Code d'invitation de la classe</h6>
                <div className="d-flex justify-content-between align-items-center">
                  <code className="fs-4 text-primary">{selectedClass?.inviteCode}</code>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => copyInviteCode(selectedClass?.inviteCode)}
                  >
                    <FiCopy size={14} className="me-1" />
                    Copier
                  </Button>
                </div>
                <small className="text-muted">
                  Les étudiants peuvent utiliser ce code pour rejoindre la classe
                </small>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Inviter par email</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Entrez les adresses email des étudiants (une par ligne)&#10;exemple@email.com&#10;etudiant2@email.com"
              />
              <Form.Text className="text-muted">
                Entrez une adresse email par ligne. Les étudiants doivent déjà avoir un compte.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" type="submit" disabled={!inviteEmails.trim()}>
              Envoyer les invitations
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Classes;
