// src/components/ClassCollectionsView.js
import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Button, Badge, Alert, Spinner, Toast, ToastContainer 
} from 'react-bootstrap';
import { 
  FiBook, FiBookOpen, FiUser, FiCalendar, FiArrowLeft, FiPlay, FiDownload, FiCopy, FiShare2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const ClassCollectionsView = ({ classId, className, onBack }) => {
  const { getClassCollections, importCollectionFromClass } = useData();
  const [collections, setCollections] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [importingIds, setImportingIds] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    if (classId) {
      fetchClassCollections();
    }
  }, [classId]);

  const fetchClassCollections = async () => {
    try {
      console.log('🔍 [ClassCollectionsView] Début récupération collections');
      console.log('🔍 [ClassCollectionsView] classId:', classId);
      
      setLoading(true);
      setError('');
      
      console.log('🔍 [ClassCollectionsView] Appel getClassCollections...');
      const response = await getClassCollections(classId);
      
      console.log('🔍 [ClassCollectionsView] Réponse reçue:', response);
      console.log('🔍 [ClassCollectionsView] Structure réponse:', Object.keys(response));
      console.log('🔍 [ClassCollectionsView] response.data:', response.data);
      
      if (response.data) {
        console.log('🔍 [ClassCollectionsView] Classe:', response.data.class);
        console.log('🔍 [ClassCollectionsView] Collections:', response.data.collections);
        console.log('🔍 [ClassCollectionsView] Nombre collections:', response.data.collections?.length);
        
        setClassInfo(response.data.class);
        setCollections(response.data.collections || []);
        
        console.log('✅ [ClassCollectionsView] Données mises à jour avec succès');
      } else {
        console.log('⚠️ [ClassCollectionsView] Pas de data dans la réponse');
      }
      
    } catch (error) {
      console.error('❌ [ClassCollectionsView] Erreur lors de la récupération des collections:', error);
      console.error('❌ [ClassCollectionsView] Type erreur:', typeof error);
      console.error('❌ [ClassCollectionsView] error.response:', error.response);
      console.error('❌ [ClassCollectionsView] error.response?.status:', error.response?.status);
      console.error('❌ [ClassCollectionsView] error.response?.data:', error.response?.data);
      console.error('❌ [ClassCollectionsView] error.message:', error.message);
      
      setError(
        error.response?.data?.message || 
        error.message ||
        'Erreur lors de la récupération des collections de la classe'
      );
    } finally {
      console.log('🔍 [ClassCollectionsView] Fin fetchClassCollections, loading=false');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleImportCollection = async (collectionId, collectionName) => {
    console.log('📎 [Import] Début importation:', collectionId, collectionName);
    
    try {
      // Ajouter l'ID à la liste des importations en cours
      setImportingIds(prev => new Set([...prev, collectionId]));
      
      // Appeler l'API d'importation
      const result = await importCollectionFromClass(classId, collectionId);
      
      console.log('✅ [Import] Résultat:', result);
      
      // Afficher un message de succès
      setToastMessage(`Collection "${collectionName}" importée avec succès ! (${result.cardsImported || 0} cartes)`);
      setToastType('success');
      setShowToast(true);
      
    } catch (error) {
      console.error('❌ [Import] Erreur:', error);
      
      let errorMessage = 'Erreur lors de l\'importation de la collection';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setToastMessage(errorMessage);
      setToastType('error');
      setShowToast(true);
    } finally {
      // Retirer l'ID de la liste des importations en cours
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });
    }
  };

  const handleCopyCollectionInfo = (collection) => {
    const info = `📚 Collection: ${collection.name}\n` +
                 `📖 Description: ${collection.description || 'Aucune description'}\n` +
                 `🃏 Cartes: ${collection.cardCount || 0}\n` +
                 `👨‍🏫 Enseignant: ${collection.user?.name || 'Enseignant'}\n` +
                 `📅 Créé le: ${formatDate(collection.createdAt)}`;

    navigator.clipboard.writeText(info).then(() => {
      setToastMessage('Informations de la collection copiées !');
      setToastType('success');
      setShowToast(true);
    }).catch(() => {
      setToastMessage('Erreur lors de la copie');
      setToastType('danger');
      setShowToast(true);
    });
  };

  const handleDownloadCollectionInfo = (collection) => {
    const data = {
      collection: {
        name: collection.name,
        description: collection.description,
        category: collection.category,
        difficulty: collection.difficulty,
        cardCount: collection.cardCount,
        teacher: collection.user?.name || 'Enseignant',
        createdAt: collection.createdAt,
        classId: classId,
        className: className
      },
      exportedAt: new Date().toISOString(),
      note: 'Informations de collection - Les cartes ne sont pas incluses. Utilisez le bouton Télécharger pour importer la collection complète.'
    };

    const content = JSON.stringify(data, null, 2);
    const filename = `${collection.name.replace(/[^a-zA-Z0-9]/g, '_')}_info.json`;
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    setToastMessage('Informations téléchargées !');
    setToastType('success');
    setShowToast(true);
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Chargement...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header avec navigation retour */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="outline-secondary" onClick={onBack} className="mb-3">
            <FiArrowLeft className="me-2" />
            Retour aux classes
          </Button>
          <h1 className="fw-bold mb-2 d-flex align-items-center">
            <FiBook className="me-3 text-primary" />
            Collections - {classInfo?.name || className}
          </h1>
          <p className="text-muted mb-0">
            Collections partagées par votre enseignant
            {classInfo?.teacher && (
              <span className="ms-2">
                <FiUser className="me-1" />
                {classInfo.teacher.name}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <strong>Erreur :</strong> {error}
          <Button
            variant="link"
            size="sm"
            onClick={fetchClassCollections}
            className="p-0 ms-2"
          >
            Réessayer
          </Button>
        </Alert>
      )}

      {/* Collections partagées */}
      {collections.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <FiBook size={64} className="text-muted mb-3" />
            <h4 className="text-muted mb-3">Aucune collection partagée</h4>
            <p className="text-muted">
              Votre enseignant n'a pas encore partagé de collections avec cette classe.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* Statistiques rapides */}
          <Row className="mb-4 g-3">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiBook size={24} className="text-primary mb-2" />
                  <h4 className="fw-bold mb-1">{collections.length}</h4>
                  <small className="text-muted">Collections disponibles</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiBookOpen size={24} className="text-success mb-2" />
                  <h4 className="fw-bold mb-1">
                    {collections.reduce((total, col) => total + (col.cardCount || 0), 0)}
                  </h4>
                  <small className="text-muted">Cartes à réviser</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiUser size={24} className="text-info mb-2" />
                  <h4 className="fw-bold mb-1">1</h4>
                  <small className="text-muted">Enseignant</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100 text-center">
                <Card.Body>
                  <FiCalendar size={24} className="text-warning mb-2" />
                  <h4 className="fw-bold mb-1">
                    {new Set(collections.map(c => formatDate(c.createdAt))).size}
                  </h4>
                  <small className="text-muted">Dates différentes</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Grille des collections */}
          <Row className="g-4">
            {collections.map((collection) => (
              <Col lg={4} md={6} key={collection._id}>
                <Card className="h-100 border-0 shadow-sm collection-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0 fw-bold text-primary">
                        {collection.name}
                      </h5>
                      <Badge bg="success" className="ms-2">Partagée</Badge>
                    </div>

                    {collection.description && (
                      <p className="text-muted mb-3">
                        {collection.description}
                      </p>
                    )}

                    {/* Informations sur la collection */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <FiBookOpen className="me-1" />
                          Cartes disponibles
                        </small>
                        <small className="fw-bold">{collection.cardCount || 0}</small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">
                          <FiUser className="me-1" />
                          Créé par
                        </small>
                        <small>{collection.user?.name || 'Enseignant'}</small>
                      </div>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">
                          <FiCalendar className="me-1" />
                          Créé le
                        </small>
                        <small>{formatDate(collection.createdAt)}</small>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-flex flex-column gap-2">
                      {/* Ligne 1: Actions principales */}
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          as={Link}
                          to={`/collections/${collection._id}`}
                          variant="primary"
                          size="sm"
                          className="flex-fill d-flex align-items-center justify-content-center"
                          style={{ minWidth: '100px' }}
                        >
                          <FiBookOpen className="me-2" />
                          Voir les cartes
                        </Button>
                        
                        <Button
                          as={Link}
                          to={`/review-cards?collection=${collection._id}`}
                          variant="outline-success"
                          size="sm"
                          className="flex-fill d-flex align-items-center justify-content-center"
                          disabled={!collection.cardCount || collection.cardCount === 0}
                          style={{ minWidth: '90px' }}
                        >
                          <FiPlay className="me-2" />
                          Réviser
                        </Button>
                      </div>

                      {/* Ligne 2: Import et actions */}
                      <div className="d-flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleImportCollection(collection._id, collection.name)}
                          variant="outline-primary"
                          size="sm"
                          className="flex-fill d-flex align-items-center justify-content-center"
                          disabled={importingIds.has(collection._id) || !collection.cardCount || collection.cardCount === 0}
                          style={{ minWidth: '110px' }}
                        >
                          {importingIds.has(collection._id) ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Import...
                            </>
                          ) : (
                            <>
                              <FiDownload className="me-2" />
                              Importer
                            </>
                          )}
                        </Button>

                        <Button
                          onClick={() => handleCopyCollectionInfo(collection)}
                          variant="outline-secondary"
                          size="sm"
                          className="flex-fill d-flex align-items-center justify-content-center"
                          style={{ minWidth: '90px' }}
                        >
                          <FiCopy className="me-2" />
                          Copier infos
                        </Button>
                      </div>

                      {/* Ligne 3: Actions supplémentaires */}
                      <Button
                        onClick={() => handleDownloadCollectionInfo(collection)}
                        variant="outline-info"
                        size="sm"
                        className="d-flex align-items-center justify-content-center"
                      >
                        <FiShare2 className="me-2" />
                        Télécharger les infos
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
      {/* Toast pour les messages d'importation */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastType === 'success' ? 'success' : 'danger'}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastType === 'success' ? '✅ Succès' : '❌ Erreur'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
};

export default ClassCollectionsView;
