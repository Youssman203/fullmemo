import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { Modal, Button, Form, Container, Row, Col, InputGroup, Dropdown } from 'react-bootstrap';
import { FiSearch, FiGrid, FiList, FiFilter, FiPlus } from 'react-icons/fi';
import EnhancedCollectionCard from '../components/EnhancedCollectionCard';
import AddCollectionCard from '../components/AddCollectionCard';
import EmptyCollectionsState from '../components/EmptyCollectionsState';
import '../assets/collections.css';
import '../assets/collections-fix.css'; // Correctifs pour l'affichage des grilles
import '../assets/modern-collections.css'; // Nouveau style inspiré de YouTube

const Collections = () => {
  const { collections, createCollection, updateCollection, deleteCollection } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // Toujours en mode liste
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'name', 'cards'
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Check for dark mode
  useEffect(() => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    setDarkMode(isDarkMode);
  }, []);

  // Filter and sort collections
  useEffect(() => {
    let result = [...collections];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(collection => 
        collection.name.toLowerCase().includes(query) ||
        (collection.description && collection.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'cards':
        result.sort((a, b) => (b.cardCount || 0) - (a.cardCount || 0));
        break;
      case 'recent':
      default:
        // Assuming collections have a lastModified property, or fall back to id for consistent order
        result.sort((a, b) => (b.lastModified || b.id).localeCompare(a.lastModified || a.id));
        break;
    }
    
    setFilteredCollections(result);
  }, [collections, searchQuery, sortBy]);

  const handleAddCollection = () => {
    if (newCollectionName.trim()) {
      // Créer une nouvelle collection avec nom et description
      createCollection({
        name: newCollectionName,
        description: newCollectionDescription
      });
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowAddModal(false);
    }
  };

  const handleRenameCollection = () => {
    if (newCollectionName.trim() && selectedCollection) {
      updateCollection(selectedCollection.id, {
        name: newCollectionName,
        description: newCollectionDescription
      });
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowRenameModal(false);
      setSelectedCollection(null);
    }
  };

  const handleDeleteCollection = () => {
    if (selectedCollection) {
      deleteCollection(selectedCollection.id);
      setShowDeleteModal(false);
      setSelectedCollection(null);
    }
  };

  const openRenameModal = (collection) => {
    setSelectedCollection(collection);
    setNewCollectionName(collection.name);
    setNewCollectionDescription(collection.description || '');
    setShowRenameModal(true);
  };

  const openDeleteModal = (collection) => {
    setSelectedCollection(collection);
    setShowDeleteModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Container className={`collections-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="collections-header">
        <h1 className="collections-title">Mes Collections</h1>
        <p className="collections-subtitle">
          Organisez vos cartes en collections thématiques pour faciliter votre apprentissage
        </p>
      </div>

      {collections.length > 0 ? (
        <>
          <div className="collections-filters">
            <div className="collections-search">
              <FiSearch className="collections-search-icon" />
              <Form.Control
                type="text"
                placeholder="Rechercher dans mes collections..."
                className="collections-search-input"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <Dropdown className="collections-filter-dropdown">
              <Dropdown.Toggle variant="light" id="sort-dropdown">
                <FiFilter className="me-2" />
                {sortBy === 'recent' && 'Plus récentes'}
                {sortBy === 'name' && 'Alphabétique'}
                {sortBy === 'cards' && 'Nombre de cartes'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item active={sortBy === 'recent'} onClick={() => setSortBy('recent')}>
                  Plus récentes
                </Dropdown.Item>
                <Dropdown.Item active={sortBy === 'name'} onClick={() => setSortBy('name')}>
                  Alphabétique
                </Dropdown.Item>
                <Dropdown.Item active={sortBy === 'cards'} onClick={() => setSortBy('cards')}>
                  Nombre de cartes
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            
            {/* Mode liste uniquement - boutons de changement de vue retirés */}
          </div>

          {/* Affichage uniquement en mode liste */}
            <div className="collections-list-view">
              <div className="add-collection-list-item" onClick={() => setShowAddModal(true)}>
                <div className="add-collection-list-icon">
                  <FiPlus size={24} />
                </div>
                <div className="add-collection-list-content">
                  <h4>Créer une nouvelle collection</h4>
                  <p>Ajoutez une nouvelle collection pour organiser vos cartes</p>
                </div>
              </div>
              
              {filteredCollections.length > 0 ? (
                filteredCollections.map(collection => (
                  <div key={collection.id} className="collection-list-item">
                    <EnhancedCollectionCard 
                      collection={collection} 
                      onRename={() => openRenameModal(collection)}
                      onDelete={() => openDeleteModal(collection)}
                      viewMode={viewMode}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-5">
                  <h3>Aucune collection trouvée</h3>
                  <p className="text-muted">
                    Essayez de modifier vos critères de recherche.
                  </p>
                </div>
              )}
            </div>
        </>
      ) : (
        <EmptyCollectionsState onAddCollection={() => setShowAddModal(true)} />
      )}

      {/* Add/Rename Modal */}
      <Modal show={showAddModal || showRenameModal} onHide={() => { setShowAddModal(false); setShowRenameModal(false); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {showAddModal ? 'Créer une nouvelle collection' : 'Modifier la collection'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom de la collection</Form.Label>
              <Form.Control 
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Ex: Vocabulaire Anglais, Formules de Mathématiques..."
                autoFocus
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Description (optionnelle)</Form.Label>
              <Form.Control 
                as="textarea"
                rows={3}
                value={newCollectionDescription}
                onChange={(e) => setNewCollectionDescription(e.target.value)}
                placeholder="Décrivez brièvement le contenu de cette collection"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => { 
            setShowAddModal(false); 
            setShowRenameModal(false); 
            setNewCollectionName('');
            setNewCollectionDescription('');
          }}>
            Annuler
          </Button>
          <Button variant="primary" onClick={showAddModal ? handleAddCollection : handleRenameCollection}>
            {showAddModal ? 'Créer la collection' : 'Enregistrer les modifications'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Êtes-vous sûr de vouloir supprimer la collection <strong>"{selectedCollection?.name}"</strong> ?</p>
          <p className="text-danger">Cette action est irréversible et supprimera également toutes les cartes associées.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleDeleteCollection}>Supprimer</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Collections;
