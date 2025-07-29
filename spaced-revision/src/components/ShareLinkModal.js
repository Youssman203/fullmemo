import React, { useState } from 'react';
import { Modal, Button, Form, Alert, InputGroup, Spinner, Badge, Tabs, Tab } from 'react-bootstrap';
import { FiCopy, FiShare2, FiEye, FiDownload, FiLock, FiClock, FiUsers } from 'react-icons/fi';
import sharedLinkService from '../services/sharedLinkService';

const ShareLinkModal = ({ show, onHide, collection, onLinkCreated }) => {
  const [loading, setLoading] = useState(false);
  const [sharedLink, setSharedLink] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  // Configuration du partage
  const [config, setConfig] = useState({
    permissions: ['view', 'copy'],
    expiresAt: null,
    maxUses: null,
    password: null
  });

  // Réinitialiser l'état quand la modal s'ouvre
  const handleShow = () => {
    setSharedLink(null);
    setError('');
    setSuccess('');
    setCopied(false);
    setConfig({
      permissions: ['view', 'copy'],
      expiresAt: null,
      maxUses: null,
      password: null
    });
  };

  // Créer le lien de partage
  const handleCreateLink = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Préparer la configuration
      const linkConfig = {
        permissions: config.permissions,
        expiresAt: config.expiresAt || null,
        maxUses: config.maxUses || null,
        password: config.password || null
      };

      console.log('Création du lien avec config:', linkConfig);

      const response = await sharedLinkService.createSharedLink(collection._id, linkConfig);
      
      setSharedLink(response.data);
      setSuccess('Lien de partage créé avec succès !');
      
      if (onLinkCreated) {
        onLinkCreated(response.data);
      }

    } catch (error) {
      console.error('Erreur création lien:', error);
      setError(error.message || 'Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  // Copier le lien dans le presse-papiers
  const handleCopyLink = async () => {
    if (!sharedLink?.shareUrl) return;

    try {
      await navigator.clipboard.writeText(sharedLink.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur copie:', error);
      // Fallback pour les navigateurs qui ne supportent pas l'API clipboard
      const textArea = document.createElement('textarea');
      textArea.value = sharedLink.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Gérer les changements de permissions
  const handlePermissionChange = (permission, checked) => {
    if (checked) {
      setConfig(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    }
  };

  const permissionLabels = {
    view: { icon: FiEye, label: 'Visualiser', desc: 'Voir les cartes et réviser' },
    copy: { icon: FiDownload, label: 'Copier', desc: 'Importer dans ses collections' },
    download: { icon: FiDownload, label: 'Télécharger', desc: 'Exporter au format JSON/CSV' }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      onShow={handleShow}
      size="lg" 
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <FiShare2 className="me-2" />
          Partager "{collection?.name}"
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!sharedLink ? (
          // Configuration du partage
          <Tabs defaultActiveKey="basic" className="mb-3">
            <Tab eventKey="basic" title="Configuration de base">
              <Form>
                <h6 className="mb-3">Permissions accordées</h6>
                {Object.entries(permissionLabels).map(([key, { icon: Icon, label, desc }]) => (
                  <Form.Check
                    key={key}
                    type="checkbox"
                    id={`permission-${key}`}
                    checked={config.permissions.includes(key)}
                    onChange={(e) => handlePermissionChange(key, e.target.checked)}
                    label={
                      <div>
                        <Icon className="me-2" size={16} />
                        <strong>{label}</strong> - {desc}
                      </div>
                    }
                    className="mb-2"
                  />
                ))}
              </Form>
            </Tab>

            <Tab eventKey="advanced" title="Options avancées">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiClock className="me-2" />
                    Date d'expiration (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={config.expiresAt || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, expiresAt: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <Form.Text className="text-muted">
                    Laisser vide pour un lien permanent
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiUsers className="me-2" />
                    Nombre maximum d'utilisations (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Illimité"
                    value={config.maxUses || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, maxUses: e.target.value }))}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FiLock className="me-2" />
                    Mot de passe (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Laisser vide pour un accès libre"
                    value={config.password || ''}
                    onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                  />
                </Form.Group>
              </Form>
            </Tab>
          </Tabs>
        ) : (
          // Affichage du lien créé
          <div>
            <Alert variant="success">
              <FiShare2 className="me-2" />
              {success}
            </Alert>

            <div className="mb-3">
              <Form.Label><strong>Lien de partage généré :</strong></Form.Label>
              <InputGroup>
                <Form.Control
                  readOnly
                  value={sharedLink.shareUrl}
                  className="text-break"
                />
                <Button 
                  variant={copied ? "success" : "outline-secondary"}
                  onClick={handleCopyLink}
                >
                  <FiCopy className="me-1" />
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </InputGroup>
            </div>

            <div className="mb-3">
              <h6>Configuration du lien :</h6>
              <div className="d-flex flex-wrap gap-2">
                {sharedLink.config.permissions.map(permission => (
                  <Badge key={permission} bg="primary">
                    {permissionLabels[permission]?.label || permission}
                  </Badge>
                ))}
                {sharedLink.config.expiresAt && (
                  <Badge bg="warning">
                    <FiClock className="me-1" />
                    Expire le {new Date(sharedLink.config.expiresAt).toLocaleDateString()}
                  </Badge>
                )}
                {sharedLink.config.maxUses && (
                  <Badge bg="info">
                    <FiUsers className="me-1" />
                    Max {sharedLink.config.maxUses} utilisations
                  </Badge>
                )}
                {sharedLink.config.password && (
                  <Badge bg="secondary">
                    <FiLock className="me-1" />
                    Protégé par mot de passe
                  </Badge>
                )}
              </div>
            </div>

            <Alert variant="info">
              <small>
                <strong>Comment partager :</strong>
                <ul className="mb-0 mt-2">
                  <li>Copiez ce lien et partagez-le par email, message, etc.</li>
                  <li>Toute personne avec ce lien pourra accéder à votre collection</li>
                  <li>Les utilisateurs connectés pourront importer la collection</li>
                  <li>Vous pouvez désactiver ce lien à tout moment depuis vos collections</li>
                </ul>
              </small>
            </Alert>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {sharedLink ? 'Fermer' : 'Annuler'}
        </Button>
        {!sharedLink && (
          <Button 
            variant="primary" 
            onClick={handleCreateLink}
            disabled={loading || config.permissions.length === 0}
          >
            {loading && <Spinner as="span" animation="border" size="sm" className="me-2" />}
            Créer le lien
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ShareLinkModal;
