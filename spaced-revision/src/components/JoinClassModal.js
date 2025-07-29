// src/components/JoinClassModal.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FiUsers, FiKey } from 'react-icons/fi';
import { useData } from '../contexts/DataContext';

const JoinClassModal = ({ show, onHide, onClassJoined }) => {
  const { joinClassByCode } = useData();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('Veuillez saisir un code d\'invitation');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await joinClassByCode(inviteCode.trim().toUpperCase());
      
      setSuccess(response.message || 'Vous avez rejoint la classe avec succès !');
      setInviteCode('');
      
      // Notifier le parent du succès
      if (onClassJoined) {
        onClassJoined(response);
      }
      
      // Fermer la modal après 2 secondes
      setTimeout(() => {
        onHide();
        setSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Erreur lors de l\'adhésion à la classe:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Erreur lors de l\'adhésion à la classe'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setInviteCode('');
      setError('');
      setSuccess('');
      onHide();
    }
  };

  const formatInviteCode = (value) => {
    // Convertir en majuscules et limiter à 6 caractères
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  };

  const handleInputChange = (e) => {
    const formattedValue = formatInviteCode(e.target.value);
    setInviteCode(formattedValue);
    
    // Réinitialiser les messages d'erreur
    if (error) setError('');
  };

  return (
    <Modal show={show} onHide={handleClose} centered className="join-class-modal">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center">
          <FiUsers className="me-2 text-primary" />
          Rejoindre une classe
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Erreur :</strong> {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-3">
            <strong>Succès :</strong> {success}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              <FiKey className="me-2" />
              Code d'invitation
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: ABC123"
              value={inviteCode}
              onChange={handleInputChange}
              disabled={loading}
              className="text-uppercase fw-bold text-center"
              style={{ 
                fontSize: '1.1rem', 
                letterSpacing: '0.2em',
                fontFamily: 'monospace'
              }}
              maxLength={6}
              autoFocus
            />
            <Form.Text className="text-muted">
              Saisissez le code à 6 caractères fourni par votre enseignant
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Le code est insensible à la casse
            </small>
            <div>
              <Button 
                variant="secondary" 
                onClick={handleClose}
                disabled={loading}
                className="me-2"
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading || !inviteCode.trim()}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Connexion...
                  </>
                ) : (
                  <>
                    <FiUsers className="me-2" />
                    Rejoindre
                  </>
                )}
              </Button>
            </div>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default JoinClassModal;
