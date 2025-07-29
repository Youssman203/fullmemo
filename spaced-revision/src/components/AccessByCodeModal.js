import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { FiDownload, FiEye, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useData } from '../contexts/DataContext';

const AccessByCodeModal = ({ show, onHide, onCollectionAccessed }) => {
  const { getCollectionByCode, importCollectionByCode } = useData();
  
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [collection, setCollection] = useState(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState('input'); // 'input', 'preview', 'success'

  // Réinitialiser l'état quand la modal s'ouvre/ferme
  React.useEffect(() => {
    if (show) {
      setCode('');
      setCollection(null);
      setError('');
      setStep('input');
    }
  }, [show]);

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(value);
    setError(''); // Effacer l'erreur lors de la saisie
  };

  const validateCode = (inputCode) => {
    if (!inputCode) return 'Veuillez saisir un code';
    if (inputCode.length !== 6) return 'Le code doit contenir exactement 6 caractères';
    if (!/^[A-Z0-9]{6}$/.test(inputCode)) return 'Le code ne peut contenir que des lettres et des chiffres';
    return null;
  };

  const handleSearchCollection = async () => {
    const validation = validateCode(code);
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Recherche collection avec code:', code);
      const response = await getCollectionByCode(code);
      
      setCollection(response.data);
      setStep('preview');
      
      if (onCollectionAccessed) {
        onCollectionAccessed(response.data);
      }

    } catch (error) {
      console.error('❌ Erreur recherche collection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Code introuvable ou expiré';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCollection = async () => {
    if (!collection) return;

    setImporting(true);

    try {
      console.log('📥 Import collection avec code:', code);
      const response = await importCollectionByCode(code);
      
      setStep('success');
      toast.success(response.data.message || 'Collection importée avec succès !');

      // Appeler le callback pour rafraîchir les collections
      if (onCollectionAccessed) {
        onCollectionAccessed(response.data.collection);
      }

      // Fermer la modal après un délai
      setTimeout(() => {
        onHide();
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur import collection:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'import';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && code.length === 6) {
      handleSearchCollection();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderInputStep = () => (
    <div>
      <div className="text-center mb-4">
        <FiDownload size={48} className="text-primary mb-3" />
        <h5>Accéder à une collection</h5>
        <p className="text-muted">
          Saisissez le code de partage à 6 caractères fourni par votre enseignant
        </p>
      </div>

      <Form.Group className="mb-3">
        <Form.Label className="fw-semibold">Code de partage</Form.Label>
        <Form.Control
          type="text"
          value={code}
          onChange={handleCodeChange}
          onKeyPress={handleKeyPress}
          placeholder="ABC123"
          className="text-center text-uppercase"
          style={{ 
            fontSize: '1.5em', 
            letterSpacing: '0.2em',
            fontFamily: 'monospace'
          }}
          maxLength={6}
          autoFocus
        />
        <Form.Text className="text-muted">
          Le code est composé de 6 lettres et/ou chiffres
        </Form.Text>
      </Form.Group>

      {error && (
        <Alert variant="danger">
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
      )}

      <div className="d-grid">
        <Button
          variant="primary"
          onClick={handleSearchCollection}
          disabled={loading || code.length !== 6}
          size="lg"
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              Recherche...
            </>
          ) : (
            <>
              <FiEye className="me-2" />
              Voir la collection
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div>
      {collection && (
        <Card className="mb-3">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <FiCheck className="me-2" />
              Collection trouvée !
            </h5>
          </Card.Header>
          <Card.Body>
            <h4 className="text-primary">{collection.collection.name}</h4>
            {collection.collection.description && (
              <p className="text-muted mb-3">{collection.collection.description}</p>
            )}
            
            <div className="row g-3 mb-3">
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <strong>Cartes :</strong>
                  <Badge bg="info" className="ms-2">
                    {collection.flashcards?.length || 0}
                  </Badge>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <strong>Enseignant :</strong>
                  <span className="ms-2">{collection.shareCode?.createdBy?.name || 'N/A'}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <strong>Expire le :</strong>
                  <span className="ms-2">{formatDate(collection.shareCode?.expiresAt)}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="d-flex align-items-center">
                  <strong>Permissions :</strong>
                  <div className="ms-2">
                    {collection.shareCode?.permissions?.map(perm => (
                      <Badge key={perm} bg="secondary" className="me-1">
                        {perm === 'view' ? 'Voir' : perm === 'copy' ? 'Copier' : 'Télécharger'}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {collection.shareCode?.permissions?.includes('copy') && (
              <Alert variant="success">
                <FiDownload className="me-2" />
                <strong>Import disponible :</strong> Vous pouvez importer cette collection 
                dans vos collections personnelles pour l'étudier.
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}

      {error && (
        <Alert variant="danger">
          <FiAlertCircle className="me-2" />
          {error}
        </Alert>
      )}
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-4">
      <FiCheck size={64} className="text-success mb-3" />
      <h4 className="text-success">Collection importée !</h4>
      <p className="text-muted">
        La collection "{collection?.collection?.name}" a été ajoutée à vos collections personnelles.
      </p>
      <Alert variant="info">
        Vous pouvez maintenant l'étudier dans la section "Mes Collections".
      </Alert>
    </div>
  );

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>
          <FiDownload className="me-2" />
          {step === 'input' && 'Accès par code'}
          {step === 'preview' && 'Aperçu de la collection'}
          {step === 'success' && 'Import réussi'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 'input' && renderInputStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'success' && renderSuccessStep()}
      </Modal.Body>

      <Modal.Footer>
        {step === 'input' && (
          <Button variant="secondary" onClick={onHide}>
            Annuler
          </Button>
        )}
        
        {step === 'preview' && (
          <>
            <Button variant="secondary" onClick={() => setStep('input')}>
              Retour
            </Button>
            {collection?.shareCode?.permissions?.includes('copy') && (
              <Button
                variant="primary"
                onClick={handleImportCollection}
                disabled={importing}
              >
                {importing ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Import...
                  </>
                ) : (
                  <>
                    <FiDownload className="me-2" />
                    Importer
                  </>
                )}
              </Button>
            )}
          </>
        )}
        
        {step === 'success' && (
          <Button variant="success" onClick={onHide}>
            Terminé
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AccessByCodeModal;
