import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Table, ProgressBar, Card, Row, Col } from 'react-bootstrap';
import { FaUpload, FaDownload, FaFileExcel, FaFileCsv, FaCheckCircle, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useData } from '../contexts/DataContext';

const SimpleBulkImportModal = ({ show, onHide, collections = [] }) => {
  const { refreshData } = useData();
  
  // États du composant
  const [step, setStep] = useState('upload'); // upload, preview, import, result
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Configuration d'import
  const [targetCollection, setTargetCollection] = useState('');
  const [createNewCollection, setCreateNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // Réinitialiser lors de l'ouverture
  useEffect(() => {
    if (show) {
      setStep('upload');
      setFile(null);
      setPreviewData(null);
      setImportResult(null);
      setTargetCollection('');
      setCreateNewCollection(false);
      setNewCollectionName('');
    }
  }, [show]);

  // Gérer la sélection de fichier
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      // Vérifier le type de fichier
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
      
      if (!validTypes.includes(fileExtension)) {
        toast.error('Format de fichier non supporté. Utilisez CSV, XLS ou XLSX.');
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB
        toast.error('Fichier trop volumineux (max 10MB).');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Prévisualiser l'import
  const handlePreview = async () => {
    if (!file) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('bulkFile', file);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/simple-bulk-import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setPreviewData(data.data);
        setStep('preview');
        toast.success(`Fichier analysé : ${data.data.validCards} cartes valides sur ${data.data.totalRows}`);
      } else {
        toast.error(data.message || 'Erreur lors de l\'analyse du fichier');
      }
    } catch (error) {
      console.error('Erreur preview:', error);
      toast.error('Erreur lors de l\'analyse du fichier');
    } finally {
      setLoading(false);
    }
  };

  // Effectuer l'import
  const handleImport = async () => {
    if (!file || !previewData) return;
    
    // Validation de la configuration
    if (!createNewCollection && !targetCollection) {
      toast.error('Veuillez sélectionner une collection ou créer une nouvelle collection');
      return;
    }
    
    if (createNewCollection && !newCollectionName.trim()) {
      toast.error('Veuillez saisir un nom pour la nouvelle collection');
      return;
    }
    
    setLoading(true);
    setStep('import');
    
    const formData = new FormData();
    formData.append('bulkFile', file);
    formData.append('createNewCollection', createNewCollection);
    if (createNewCollection) {
      formData.append('newCollectionName', newCollectionName.trim());
    } else {
      formData.append('collectionId', targetCollection);
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/simple-bulk-import/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body:  formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setImportResult(data.data);
        setStep('result');
        toast.success(data.message);
        
        // Rafraîchir les données
        await refreshData();
      } else {
        toast.error(data.message || 'Erreur lors de l\'import');
        setStep('preview');
      }
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  // Télécharger le template CSV simplifié
  const downloadTemplate = () => {
    const csvContent = "Question,Réponse\n" +
                      "Quelle est la capitale de la France?,Paris\n" +
                      "Combien font 2+2?,4\n" +
                      "Qui a écrit 'Les Misérables'?,Victor Hugo\n" +
                      "Quelle est la formule de l'eau?,H2O";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template_simple_cartes.csv';
    link.click();
  };

  // Rendu des différentes étapes
  const renderUploadStep = () => (
    <div className="text-center">
      <div className="mb-4">
        <FaUpload size={48} className="text-primary mb-3" />
        <h5>Importer des cartes depuis un fichier</h5>
        <p className="text-muted">
          <strong>Format simple : Question, Réponse</strong><br/>
          Formats supportés : CSV, Excel (.xlsx, .xls)<br/>
          Taille maximale : 10 MB
        </p>
      </div>
      
      {/* Template download */}
      <div className="mb-4">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={downloadTemplate}
          className="me-2"
        >
          <FaDownload className="me-1" /> Template CSV Simple
        </Button>
        <small className="text-muted d-block mt-1">
          Téléchargez le template avec le format : Question, Réponse
        </small>
      </div>
      
      {/* File upload */}
      <Form.Group className="mb-3">
        <Form.Control
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileSelect}
          className="mb-2"
        />
        {file && (
          <div className="d-flex align-items-center justify-content-center">
            {file.name.endsWith('.csv') ? <FaFileCsv className="me-2 text-success" /> : <FaFileExcel className="me-2 text-success" />}
            <span className="text-success">{file.name}</span>
          </div>
        )}
      </Form.Group>
      
      <Alert variant="info" className="text-start">
        <strong>Format attendu :</strong>
        <ul className="mb-0 mt-2">
          <li><strong>CSV :</strong> Question,Réponse (une ligne par carte)</li>
          <li><strong>Excel :</strong> Colonne A = Question, Colonne B = Réponse</li>
          <li><strong>Difficulté :</strong> Sera définie automatiquement à "Moyen"</li>
          <li><strong>Tags :</strong> "import" sera ajouté automatiquement</li>
        </ul>
      </Alert>
      
      <Button 
        variant="primary" 
        onClick={handlePreview}
        disabled={!file || loading}
      >
        {loading ? <FaSpinner className="spin me-2" /> : null}
        Analyser le fichier
      </Button>
    </div>
  );

  const renderPreviewStep = () => (
    <div>
      <div className="d-flex align-items-center mb-3">
        <FaCheckCircle className="text-success me-2" />
        <h6 className="mb-0">Analyse terminée</h6>
      </div>
      
      {/* Statistiques */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-success">
            <Card.Body className="py-2">
              <div className="h4 text-success mb-1">{previewData?.validCards || 0}</div>
              <small className="text-muted">Cartes valides</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-warning">
            <Card.Body className="py-2">
              <div className="h4 text-warning mb-1">{previewData?.invalidCards || 0}</div>
              <small className="text-muted">Erreurs</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-info">
            <Card.Body className="py-2">
              <div className="h4 text-info mb-1">{previewData?.totalRows || 0}</div>
              <small className="text-muted">Total lignes</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Configuration de destination */}
      <Form.Group className="mb-3">
        <Form.Label>Destination</Form.Label>
        <div className="mb-2">
          <Form.Check
            type="radio"
            id="existing-collection"
            label="Ajouter à une collection existante"
            checked={!createNewCollection}
            onChange={() => setCreateNewCollection(false)}
          />
          {!createNewCollection && (
            <Form.Select 
              className="mt-2" 
              value={targetCollection} 
              onChange={(e) => setTargetCollection(e.target.value)}
            >
              <option value="">Sélectionner une collection...</option>
              {collections.map(collection => (
                <option key={collection._id} value={collection._id}>
                  {collection.name} ({collection.cardCount || 0} cartes)
                </option>
              ))}
            </Form.Select>
          )}
        </div>
        
        <div>
          <Form.Check
            type="radio"
            id="new-collection"
            label="Créer une nouvelle collection"
            checked={createNewCollection}
            onChange={() => setCreateNewCollection(true)}
          />
          {createNewCollection && (
            <Form.Control
              type="text"
              placeholder="Nom de la nouvelle collection"
              className="mt-2"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
            />
          )}
        </div>
      </Form.Group>
      
      {/* Aperçu des données */}
      {previewData?.previewData && previewData.previewData.length > 0 && (
        <div className="mb-3">
          <h6>Aperçu des 5 premières cartes valides :</h6>
          <Table striped bordered size="sm">
            <thead>
              <tr>
                <th>Question</th>
                <th>Réponse</th>
              </tr>
            </thead>
            <tbody>
              {previewData.previewData.map((card, index) => (
                <tr key={index}>
                  <td className="text-truncate" style={{maxWidth: '300px'}}>{card.question}</td>
                  <td className="text-truncate" style={{maxWidth: '200px'}}>{card.answer}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <small className="text-muted">
            Toutes les cartes auront la difficulté "Moyen" et le tag "import"
          </small>
        </div>
      )}
      
      {/* Erreurs */}
      {previewData?.errors && previewData.errors.length > 0 && (
        <Alert variant="warning">
          <FaExclamationTriangle className="me-2" />
          <strong>{previewData.errors.length} erreur(s) détectée(s) :</strong>
          <ul className="mb-0 mt-2">
            {previewData.errors.slice(0, 5).map((error, index) => (
              <li key={index}>
                Ligne {error.row}: {error.errors.join(', ')}
              </li>
            ))}
            {previewData.errors.length > 5 && (
              <li>... et {previewData.errors.length - 5} autres erreurs</li>
            )}
          </ul>
        </Alert>
      )}
      
      <div className="d-flex justify-content-between">
        <Button variant="secondary" onClick={() => setStep('upload')}>
          Retour
        </Button>
        <Button 
          variant="success" 
          onClick={handleImport}
          disabled={loading || (previewData?.validCards || 0) === 0}
        >
          {loading ? <FaSpinner className="spin me-2" /> : null}
          Importer {previewData?.validCards || 0} cartes
        </Button>
      </div>
    </div>
  );

  const renderImportStep = () => (
    <div className="text-center">
      <FaSpinner className="spin text-primary mb-3" size={48} />
      <h5>Import en cours...</h5>
      <p className="text-muted">Veuillez patienter pendant la création des cartes</p>
      <ProgressBar animated now={100} className="mb-3" />
    </div>
  );

  const renderResultStep = () => (
    <div className="text-center">
      <FaCheckCircle className="text-success mb-3" size={48} />
      <h5>Import terminé !</h5>
      
      {importResult && (
        <div className="mt-4">
          <Row>
            <Col md={6}>
              <Card className="border-success">
                <Card.Body className="text-center">
                  <div className="h3 text-success">{importResult.cardsCreated}</div>
                  <div>Cartes créées</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-warning">
                <Card.Body className="text-center">
                  <div className="h3 text-warning">{importResult.errorsCount}</div>
                  <div>Erreurs</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="mt-3">
            <p className="text-muted">
              Collection : <strong>{importResult.collectionName}</strong><br/>
              Fichier traité : {importResult.fileName}
            </p>
          </div>
          
          {importResult.errors && importResult.errors.length > 0 && (
            <Alert variant="warning" className="mt-3 text-start">
              <strong>Erreurs détectées :</strong>
              <ul className="mb-0 mt-2">
                {importResult.errors.slice(0, 3).map((error, index) => (
                  <li key={index}>
                    Ligne {error.row}: {error.errors.join(', ')}
                  </li>
                ))}
                {importResult.errors.length > 3 && (
                  <li>... et {importResult.errors.length - 3} autres erreurs</li>
                )}
              </ul>
            </Alert>
          )}
        </div>
      )}
      
      <div className="mt-4">
        <Button variant="primary" onClick={onHide}>
          Fermer
        </Button>
      </div>
    </div>
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Import Simple CSV - Questions & Réponses
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'import' && renderImportStep()}
        {step === 'result' && renderResultStep()}
      </Modal.Body>
    </Modal>
  );
};

export default SimpleBulkImportModal;
