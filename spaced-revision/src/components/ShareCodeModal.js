import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { FiCopy, FiShare2, FiClock, FiUsers, FiCheck, FiEye, FiDownload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useData } from '../contexts/DataContext';

const ShareCodeModal = ({ show, onHide, collection, onCodeGenerated }) => {
  const { generateShareCode } = useData();
  
  const [loading, setLoading] = useState(false);
  const [shareCode, setShareCode] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Réinitialiser l'état quand la modal s'ouvre
  useEffect(() => {
    if (show) {
      setShareCode(null);
      setError('');
      setCopied(false);
      
      // Générer automatiquement le code si une collection est fournie
      if (collection) {
        handleGenerateCode();
      }
    }
  }, [show, collection]);

  const handleGenerateCode = async () => {
    if (!collection) {
      setError('Aucune collection sélectionnée');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔢 Génération code pour collection:', collection.name);
      const response = await generateShareCode(collection._id || collection.id);
      
      setShareCode(response.data);
      
      if (onCodeGenerated) {
        onCodeGenerated(response.data);
      }

      toast.success('Code de partage généré avec succès !');

    } catch (error) {
      console.error('❌ Erreur génération code:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la génération du code';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!shareCode?.code) return;

    try {
      await navigator.clipboard.writeText(shareCode.code);
      setCopied(true);
      toast.success('Code copié dans le presse-papiers !');
      
      // Réinitialiser l'état "copié" après 3 secondes
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error('Erreur copie:', error);
      toast.error('Erreur lors de la copie du code');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiShare2 className="me-2" />
          Code de partage - {collection?.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert variant="danger" className="mb-3">
            <strong>Erreur :</strong> {error}
          </Alert>
        )}

        {!shareCode ? (
          <div className="text-center py-4">
            <FiShare2 size={48} className="text-muted mb-3" />
            <h5>Génération du code de partage</h5>
            <p className="text-muted">
              Cliquez sur le bouton ci-dessous pour générer un code de partage unique.
            </p>
            <Button 
              variant="primary" 
              onClick={handleGenerateCode}
              disabled={loading}
              size="lg"
            >
              {loading ? 'Génération...' : 'Générer le code'}
            </Button>
          </div>
        ) : (
          <div>
            {/* Code principal */}
            <Card className="mb-3 border-success">
              <Card.Body className="text-center">
                <h3 className="text-success mb-3">
                  <FiShare2 className="me-2" />
                  Code de partage
                </h3>
                
                <div className="mb-3">
                  <div 
                    className="display-4 fw-bold text-primary border rounded p-3 bg-light"
                    style={{ letterSpacing: '0.2em', fontFamily: 'monospace' }}
                  >
                    {shareCode.code}
                  </div>
                </div>

                <InputGroup className="mb-3">
                  <Form.Control
                    value={shareCode.code}
                    readOnly
                    className="text-center fw-bold"
                    style={{ fontSize: '1.2em', letterSpacing: '0.1em' }}
                  />
                  <Button 
                    variant={copied ? "success" : "outline-primary"}
                    onClick={handleCopyCode}
                  >
                    {copied ? (
                      <>
                        <FiCheck className="me-1" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <FiCopy className="me-1" />
                        Copier
                      </>
                    )}
                  </Button>
                </InputGroup>

                <small className="text-muted">
                  Communiquez ce code à vos apprenants pour qu'ils puissent accéder à votre collection
                </small>
              </Card.Body>
            </Card>

            {/* Informations sur le partage */}
            <Card className="mb-3">
              <Card.Header className="bg-light">
                <small className="fw-semibold">Informations du partage</small>
              </Card.Header>
              <Card.Body className="py-2">
                <div className="row g-2">
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FiEye className="me-2 text-muted" size={16} />
                      <small>
                        <strong>Permissions :</strong><br />
                        {shareCode.permissions?.map(perm => (
                          <Badge key={perm} bg="secondary" className="me-1">
                            {perm === 'view' ? 'Voir' : perm === 'copy' ? 'Copier' : 'Télécharger'}
                          </Badge>
                        ))}
                      </small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex align-items-center">
                      <FiClock className="me-2 text-muted" size={16} />
                      <small>
                        <strong>Expire le :</strong><br />
                        {formatDate(shareCode.expiresAt)}
                      </small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Instructions d'utilisation */}
            <Alert variant="info">
              <strong>💡 Comment utiliser ce code :</strong>
              <ol className="mb-0 mt-2">
                <li>Communiquez le code <strong>{shareCode.code}</strong> à vos apprenants</li>
                <li>Les apprenants vont dans "Accéder à une collection"</li>
                <li>Ils saisissent le code et importent votre collection</li>
              </ol>
            </Alert>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Fermer
        </Button>
        {shareCode && (
          <Button 
            variant="primary" 
            onClick={handleGenerateCode}
            disabled={loading}
          >
            Générer un nouveau code
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ShareCodeModal;
