// src/components/CollectionSelectorModal.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, Row, Col, Card, Button, Badge, Alert, Spinner, Form, Toast, ToastContainer 
} from 'react-bootstrap';
import { 
  FiBook, FiUser, FiCalendar, FiDownload, FiCheck, FiX, FiEye, FiCheckSquare, FiSquare
} from 'react-icons/fi';
import { useData } from '../contexts/DataContext';
import CollectionPreviewModal from './CollectionPreviewModal';

const CollectionSelectorModal = ({ show, onHide, classId, className }) => {
  const { getClassCollections, importCollectionFromClass } = useData();
  const [collections, setCollections] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCollections, setSelectedCollections] = useState(new Set());
  const [importingIds, setImportingIds] = useState(new Set());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [importResults, setImportResults] = useState({});
  
  // États pour la modal d'aperçu
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Définir fetchClassCollections en premier avec useCallback
  const fetchClassCollections = useCallback(async () => {
    if (!classId) return;
    
    try {
      console.log('🔍 [CollectionSelector] Récupération collections classe:', classId);
      
      setLoading(true);
      setError('');
      
      const response = await getClassCollections(classId);
      
      if (response.data) {
        console.log('✅ [CollectionSelector] Collections récupérées:', response.data.collections?.length);
        setClassInfo(response.data.class);
        setCollections(response.data.collections || []);
      }
      
    } catch (error) {
      console.error('❌ [CollectionSelector] Erreur:', error);
      setError(
        error.response?.data?.message || 
        error.message ||
        'Erreur lors de la récupération des collections'
      );
    } finally {
      setLoading(false);
    }
  }, [classId, getClassCollections]);

  useEffect(() => {
    if (show && classId) {
      fetchClassCollections();
    }
  }, [show, classId, fetchClassCollections]);
  
  // 🔥 WEBSOCKET - Écoute des nouvelles collections partagées
  useEffect(() => {
    if (!show || !classId) return;
    
    const handleNewSharedCollection = (event) => {
      const { collection, classInfo } = event.detail;
      
      console.log('🎓 [CollectionSelector] Nouvelle collection partagée reçue:', collection.name);
      console.log('🎓 [CollectionSelector] Classe cible:', classInfo.name, '| Classe actuelle:', classInfo._id, 'vs', classId);
      
      // Vérifier si c'est pour notre classe actuelle
      if (classInfo._id === classId) {
        console.log('✅ [CollectionSelector] Rafraîchissement automatique de la liste...');
        
        // Ajouter la nouvelle collection à la liste existante
        setCollections(prevCollections => {
          // Vérifier si la collection existe déjà (éviter les doublons)
          const exists = prevCollections.some(c => c._id === collection._id);
          if (exists) {
            console.log('⚠️ [CollectionSelector] Collection déjà présente, pas d\'ajout');
            return prevCollections;
          }
          
          console.log('🆕 [CollectionSelector] Nouvelle collection ajoutée à la liste');
          return [...prevCollections, collection];
        });
        
        // Optionnel : Rafraîchir complètement pour être sûr
        setTimeout(() => {
          console.log('🔄 [CollectionSelector] Rafraîchissement complet pour sécurité...');
          fetchClassCollections();
        }, 1000);
      }
    };
    
    // Écouter l'événement personnalisé
    window.addEventListener('newSharedCollection', handleNewSharedCollection);
    
    console.log('👂 [CollectionSelector] Écoute des événements newSharedCollection activée');
    
    // Nettoyage
    return () => {
      window.removeEventListener('newSharedCollection', handleNewSharedCollection);
      console.log('🗺️ [CollectionSelector] Écoute des événements désactivée');
    };
  }, [show, classId, fetchClassCollections]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSelectCollection = (collectionId) => {
    setSelectedCollections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCollections.size === collections.length) {
      // Tout désélectionner
      setSelectedCollections(new Set());
    } else {
      // Tout sélectionner
      setSelectedCollections(new Set(collections.map(c => c._id)));
    }
  };

  const handleImportSelected = async () => {
    if (selectedCollections.size === 0) {
      setToastMessage('Veuillez sélectionner au moins une collection à importer');
      setToastType('error');
      setShowToast(true);
      return;
    }

    const collectionsToImport = collections.filter(c => selectedCollections.has(c._id));
    
    console.log('📥 [CollectionSelector] Import de', collectionsToImport.length, 'collections');
    
    // Marquer toutes les collections comme en cours d'importation
    setImportingIds(prev => new Set([...prev, ...selectedCollections]));
    
    const results = {};
    let successCount = 0;
    let errorCount = 0;

    for (const collection of collectionsToImport) {
      try {
        console.log('📎 [CollectionSelector] Import:', collection.name);
        
        const result = await importCollectionFromClass(classId, collection._id);
        
        if (result && result.success) {
          results[collection._id] = { success: true, message: result.message };
          successCount++;
          console.log('✅ [CollectionSelector] Import réussi:', collection.name);
        } else {
          throw new Error(result?.message || 'Erreur lors de l\'importation');
        }
        
      } catch (error) {
        console.error('❌ [CollectionSelector] Erreur import:', collection.name, error);
        results[collection._id] = { 
          success: false, 
          message: error.response?.data?.message || error.message || 'Erreur inconnue'
        };
        errorCount++;
      }
    }

    // Retirer les IDs des importations en cours
    setImportingIds(prev => {
      const newSet = new Set(prev);
      selectedCollections.forEach(id => newSet.delete(id));
      return newSet;
    });

    // Sauvegarder les résultats pour affichage
    setImportResults(results);

    // Afficher le résumé
    let message = '';
    if (successCount > 0 && errorCount === 0) {
      message = `✅ ${successCount} collection(s) importée(s) avec succès !`;
      setToastType('success');
    } else if (successCount > 0 && errorCount > 0) {
      message = `⚠️ ${successCount} réussie(s), ${errorCount} échec(s). Voir détails ci-dessous.`;
      setToastType('warning');
    } else {
      message = `❌ Échec de l'importation de ${errorCount} collection(s)`;
      setToastType('error');
    }
    
    setToastMessage(message);
    setShowToast(true);

    // Désélectionner les collections importées avec succès
    setSelectedCollections(prev => {
      const newSet = new Set(prev);
      Object.entries(results).forEach(([id, result]) => {
        if (result.success) {
          newSet.delete(id);
        }
      });
      return newSet;
    });
  };

  const handleImportSingle = async (collectionId, collectionName) => {
    try {
      setImportingIds(prev => new Set([...prev, collectionId]));
      
      const result = await importCollectionFromClass(classId, collectionId);
      
      if (result && result.success) {
        setToastMessage(`✅ Collection "${collectionName}" importée avec succès !`);
        setToastType('success');
        setShowToast(true);
        
        // Retirer de la sélection si elle était sélectionnée
        setSelectedCollections(prev => {
          const newSet = new Set(prev);
          newSet.delete(collectionId);
          return newSet;
        });
      } else {
        throw new Error(result?.message || 'Erreur lors de l\'importation');
      }
      
    } catch (error) {
      console.error('❌ Erreur import simple:', error);
      setToastMessage(`❌ Erreur lors de l'importation de "${collectionName}": ${error.response?.data?.message || error.message}`);
      setToastType('error');
      setShowToast(true);
    } finally {
      setImportingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(collectionId);
        return newSet;
      });
    }
  };

  const handlePreviewCollection = (collection) => {
    setSelectedCollection(collection);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedCollection(null);
  };

  const handleImportFromPreview = (collectionId, collectionName) => {
    handleClosePreview();
    handleImportSingle(collectionId, collectionName);
  };

  const handleClose = () => {
    // Réinitialiser les états
    setSelectedCollections(new Set());
    setImportResults({});
    setError('');
    onHide();
  };

  return (
    <>
      <Modal 
        show={show} 
        onHide={handleClose} 
        size="xl" 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FiBook className="me-2" />
            Collections disponibles - {className}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 mb-0">Chargement des collections...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">
              <strong>Erreur :</strong> {error}
            </Alert>
          ) : collections.length === 0 ? (
            <Alert variant="info" className="text-center">
              <FiBook size={48} className="text-muted mb-3" />
              <h5>Aucune collection disponible</h5>
              <p className="mb-0">
                Cette classe ne contient aucune collection partagée pour le moment.
              </p>
            </Alert>
          ) : (
            <>
              {/* En-tête avec sélection multiple */}
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <Form.Check
                    type="checkbox"
                    id="select-all"
                    checked={selectedCollections.size === collections.length && collections.length > 0}
                    onChange={handleSelectAll}
                    className="me-3"
                  />
                  <span className="fw-bold">
                    {selectedCollections.size === collections.length && collections.length > 0 
                      ? 'Tout désélectionner' 
                      : 'Tout sélectionner'
                    }
                  </span>
                  <Badge bg="secondary" className="ms-2">
                    {selectedCollections.size} / {collections.length} sélectionnée(s)
                  </Badge>
                </div>
                
                <Button
                  variant="primary"
                  onClick={handleImportSelected}
                  disabled={selectedCollections.size === 0 || importingIds.size > 0}
                  className="d-flex align-items-center"
                >
                  {importingIds.size > 0 ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <FiDownload className="me-2" />
                      Importer la sélection ({selectedCollections.size})
                    </>
                  )}
                </Button>
              </div>

              {/* Affichage des résultats d'importation */}
              {Object.keys(importResults).length > 0 && (
                <Alert variant="info" className="mb-3">
                  <h6>📊 Résultats des importations :</h6>
                  <div className="small">
                    {collections
                      .filter(c => importResults[c._id])
                      .map(collection => (
                        <div key={collection._id} className="d-flex align-items-center mb-1">
                          {importResults[collection._id].success ? (
                            <FiCheck className="text-success me-2" />
                          ) : (
                            <FiX className="text-danger me-2" />
                          )}
                          <span className="me-2">{collection.name}:</span>
                          <span className={importResults[collection._id].success ? 'text-success' : 'text-danger'}>
                            {importResults[collection._id].message}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </Alert>
              )}

              {/* Liste des collections */}
              <Row className="g-3">
                {collections.map((collection) => (
                  <Col md={6} lg={4} key={collection._id}>
                    <Card className={`h-100 border ${selectedCollections.has(collection._id) ? 'border-primary border-2' : 'border-secondary border-opacity-25'}`}>
                      <Card.Body className="d-flex flex-column">
                        {/* Header avec checkbox */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Form.Check
                            type="checkbox"
                            id={`collection-${collection._id}`}
                            checked={selectedCollections.has(collection._id)}
                            onChange={() => handleSelectCollection(collection._id)}
                            className="me-2"
                          />
                          <div className="flex-grow-1">
                            <h6 className="card-title mb-1 fw-bold text-primary">
                              {collection.name}
                            </h6>
                            {collection.description && (
                              <p className="text-muted small mb-0">
                                {collection.description.length > 80 
                                  ? `${collection.description.substring(0, 80)}...` 
                                  : collection.description
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Informations de la collection */}
                        <div className="mb-3 flex-grow-1">
                          <div className="d-flex align-items-center text-muted small mb-2">
                            <FiBook size={14} className="me-2" />
                            <strong>Cartes :</strong>
                            <Badge bg="info" className="ms-2">
                              {collection.cardCount || 0}
                            </Badge>
                          </div>

                          {collection.createdBy && (
                            <div className="d-flex align-items-center text-muted small mb-2">
                              <FiUser size={14} className="me-2" />
                              <span>Par: {collection.createdBy.name || collection.createdBy.email}</span>
                            </div>
                          )}

                          <div className="d-flex align-items-center text-muted small">
                            <FiCalendar size={14} className="me-2" />
                            <span>Créée le: {formatDate(collection.createdAt)}</span>
                          </div>

                          {/* Statut d'importation */}
                          {importResults[collection._id] && (
                            <div className={`mt-2 p-2 rounded small ${importResults[collection._id].success ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                              {importResults[collection._id].success ? (
                                <FiCheck className="me-1" />
                              ) : (
                                <FiX className="me-1" />
                              )}
                              {importResults[collection._id].message}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-2">
                          <Button
                            onClick={() => handlePreviewCollection(collection)}
                            variant="outline-info"
                            size="sm"
                            className="flex-fill"
                          >
                            <FiEye className="me-1" size={14} />
                            Aperçu
                          </Button>

                          <Button
                            onClick={() => handleImportSingle(collection._id, collection.name)}
                            variant="outline-primary"
                            size="sm"
                            className="flex-fill"
                            disabled={importingIds.has(collection._id) || !collection.cardCount || collection.cardCount === 0}
                          >
                            {importingIds.has(collection._id) ? (
                              <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Import...
                              </>
                            ) : (
                              <>
                                <FiDownload className="me-1" size={14} />
                                Importer
                              </>
                            )}
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="text-muted small">
              {collections.length > 0 && (
                <>
                  Total: {collections.length} collection(s) | 
                  Sélectionnées: {selectedCollections.size} | 
                  En cours: {importingIds.size}
                </>
              )}
            </div>
            <div>
              <Button variant="secondary" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Toast pour les messages d'importation */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg={toastType === 'success' ? 'success' : toastType === 'warning' ? 'warning' : 'danger'}
        >
          <Toast.Header>
            <strong className="me-auto">
              {toastType === 'success' ? '✅ Succès' : toastType === 'warning' ? '⚠️ Partiellement réussi' : '❌ Erreur'}
            </strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>
      
      {/* Modal d'aperçu de collection */}
      <CollectionPreviewModal
        show={showPreviewModal}
        onHide={handleClosePreview}
        collection={selectedCollection}
        classInfo={classInfo}
        onImport={handleImportFromPreview}
        isImporting={selectedCollection ? importingIds.has(selectedCollection._id) : false}
      />
    </>
  );
};

export default CollectionSelectorModal;
