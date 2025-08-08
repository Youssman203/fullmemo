import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaUserTag, 
  FaEdit,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUserCog
} from 'react-icons/fa';

const EditUserModal = ({ show, onHide, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'student'
      });
      setErrors({});
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    // Validation du rôle
    if (!['student', 'teacher', 'admin'].includes(formData.role)) {
      newErrors.role = 'Rôle invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role
      });
      
      setErrors({});
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      role: 'student'
    });
    setErrors({});
    onHide();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'teacher': return <FaChalkboardTeacher className="text-primary" />;
      case 'student': return <FaUserGraduate className="text-success" />;
      case 'admin': return <FaUserCog className="text-danger" />;
      default: return <FaUserGraduate className="text-success" />;
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case 'teacher':
        return {
          label: 'Enseignant',
          description: 'Peut créer des collections, des classes et gérer ses apprenants',
          variant: 'primary'
        };
      case 'student':
        return {
          label: 'Apprenant',
          description: 'Peut rejoindre des classes et accéder aux collections partagées',
          variant: 'success'
        };
      case 'admin':
        return {
          label: 'Administrateur',
          description: 'Accès complet à la gestion du système et des utilisateurs',
          variant: 'danger'
        };
      default:
        return {
          label: 'Apprenant',
          description: 'Peut rejoindre des classes et accéder aux collections partagées',
          variant: 'success'
        };
    }
  };

  if (!user) return null;

  const roleInfo = getRoleInfo(formData.role);

  return (
    <Modal show={show} onHide={handleClose} size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className="me-2" />
          Modifier l'utilisateur
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(errors).length > 0 && (
            <Alert variant="danger">
              Veuillez corriger les erreurs ci-dessous
            </Alert>
          )}

          {/* Informations actuelles */}
          <Alert variant="light" className="mb-3">
            <div className="d-flex align-items-center">
              {getRoleIcon(user.role)}
              <div className="ms-2">
                <strong>{user.name}</strong>
                <div className="text-muted small">
                  ID: {user._id?.slice(-8)} • Inscrit le {new Date(user.joinDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          </Alert>

          <Row>
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-1" />
                  Nom complet *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Jean Dupont"
                  isInvalid={!!errors.name}
                  disabled={loading}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUserTag className="me-1" />
                  Rôle *
                </Form.Label>
                <Form.Select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  isInvalid={!!errors.role}
                  disabled={loading}
                >
                  <option value="student">Apprenant</option>
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.role}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>
              <FaEnvelope className="me-1" />
              Adresse email *
            </Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemple@email.com"
              isInvalid={!!errors.email}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              L'email sert d'identifiant de connexion
            </Form.Text>
          </Form.Group>

          {/* Affichage du rôle sélectionné */}
          <Alert variant={roleInfo.variant} className="mb-0">
            <div className="d-flex align-items-center">
              {getRoleIcon(formData.role)}
              <div className="ms-2">
                <strong>{roleInfo.label}</strong>
                <div className="small">{roleInfo.description}</div>
              </div>
            </div>
          </Alert>

          {/* Statistiques utilisateur */}
          {user.stats && (
            <div className="mt-3">
              <h6>Statistiques actuelles:</h6>
              <Row>
                <Col>
                  <Badge bg="info" className="me-2">
                    {user.stats.collections} collection{user.stats.collections !== 1 ? 's' : ''}
                  </Badge>
                  <Badge bg="secondary">
                    {user.stats.classes} classe{user.stats.classes !== 1 ? 's' : ''}
                  </Badge>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Mise à jour...
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Mettre à jour
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
