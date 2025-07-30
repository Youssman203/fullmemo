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

    // 🔒 Vérifier si un import est déjà en cours
    if (window.__importing__) {
      toast.warning('Un import est déjà en cours, veuillez patienter...');
      return;
    }

    setImporting(true);
    setError(''); // Effacer les erreurs précédentes

    try {
      console.log('📥 IMPORT COLLECTION STABLE - Code:', code);
      console.log('📋 Collection à importer:', collection.collection.name);
      
      // 🔒 VALIDATION AUTHENTIFICATION SIMPLIFIÉE
      console.log('🔒 Vérification authentification avant import...');
      
      // Vérifier présence du token (validation de base seulement)
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ ERREUR AUTH: Pas de token d\'authentification');
        setError('Vous devez être connecté pour importer une collection');
        toast.error('Connexion requise - Veuillez vous reconnecter');
        setImporting(false);
        return;
      }
      
      console.log('✅ Token présent, tentative d\'import...');
      
      // Optionnel: afficher info utilisateur sans bloquer
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          console.log('👤 Utilisateur connecté:', user.name, '(' + user.email + ')');
          console.log('🎭 Rôle:', user.role);
        }
      } catch (userError) {
        console.warn('⚠️ Info utilisateur non lisible (pas bloquant)');
      }
      
      console.log('✅ PROCÉDURE D\'IMPORT...');
      
      // 🔄 Import avec système ultra-stable
      const response = await importCollectionByCode(code);
      console.log('✅ Import réussi:', response);
      
      setStep('success');
      
      // 🎉 Message de succès personnalisé
      const successMessage = response.data?.message || 
        `Collection "${collection.collection.name}" importée avec succès !`;
      toast.success(successMessage);

      // 🔄 Callback pour notification (pas de refresh, déjà fait dans DataContext)
      if (onCollectionAccessed) {
        console.log('📨 Notification import réussi au parent');
        onCollectionAccessed(response.data?.collection || collection.collection);
      }

      // 🚪 Fermer la modal avec délai plus court pour meilleure UX
      setTimeout(() => {
        console.log('🚪 Fermeture modal après import réussi');
        onHide();
        
        // 🎁 Toast de confirmation finale
        setTimeout(() => {
          toast.info(`Collection "${collection.collection.name}" maintenant disponible dans vos collections !`);
        }, 500);
      }, 1500); // Réduit de 2000ms à 1500ms

    } catch (error) {
      console.error('❌ ERREUR Import collection:', error);
      
      // 📝 Gestion détaillée des erreurs
      let errorMessage = 'Erreur lors de l\'import';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        if (error.message.includes('already imported') || error.message.includes('déjà import')) {
          errorMessage = `Collection "${collection.collection.name}" déjà importée`;
        } else if (error.message.includes('expired') || error.message.includes('expir')) {
          errorMessage = 'Code de partage expiré ou inactif';
        } else if (error.message.includes('en cours')) {
          errorMessage = 'Un autre import est en cours, veuillez patienter';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // 🔄 Rester sur l'étape preview en cas d'erreur
      setStep('preview');
      
    } finally {
      setImporting(false);
      console.log('📝 Import process terminé');
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
