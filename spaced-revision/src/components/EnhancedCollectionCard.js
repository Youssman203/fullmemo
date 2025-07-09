import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Badge, ProgressBar, Card } from 'react-bootstrap';
import { FiLayers, FiClock, FiMoreVertical, FiEdit2, FiTrash2, FiPlay, FiBook, FiPackage } from 'react-icons/fi';

const EnhancedCollectionCard = ({ collection, onRename, onDelete, viewMode = 'grid' }) => {
  // Get or generate card count
  const cardCount = collection.cardCount || 0;
  
  // Calculate progress for the collection
  const progress = collection.progress || Math.floor(Math.random() * 100);
  
  // Générer une date d'étude aléatoire si non fournie, ou convertir la date existante en objet Date
  let lastStudied;
  try {
    // Si lastStudied est une chaîne ISO ou un timestamp, le convertir en Date
    if (collection.lastStudied) {
      lastStudied = new Date(collection.lastStudied);
      // Vérifier si la date est valide
      if (isNaN(lastStudied.getTime())) {
        throw new Error('Invalid date');
      }
    } else {
      // Date aléatoire dans les 7 derniers jours
      lastStudied = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
    }
  } catch (error) {
    console.warn('Date invalide dans la collection, utilisation d\'une date par défaut', error);
    lastStudied = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
  }
  
  // Générer une couleur de fond cohérente basée sur le nom de la collection
  const getCollectionColor = (collectionName) => {
    // Liste de couleurs inspirées de YouTube
    const colors = [
      '#FF0000', // Rouge YouTube
      '#065FD4', // Bleu YouTube
      '#FF6C00', // Orange YouTube
      '#1ED760', // Vert (Spotify)
      '#8F00FF', // Violet
      '#00A4EF', // Bleu ciel
      '#FF8D85', // Rose corail
      '#FF4500', // Orange-rouge (Reddit)
      '#0099E5', // Bleu cyan
      '#6441A4'  // Violet (Twitch)
    ];
    
    // Générer un index basé sur le nom de la collection pour avoir une couleur cohérente
    let hash = 0;
    for (let i = 0; i < collectionName.length; i++) {
      hash = collectionName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convertir en index dans le tableau de couleurs
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Obtenir une couleur pour cette collection
  const collectionColor = collection.color || getCollectionColor(collection.name);
  
  // Format the date
  const formatDate = (date) => {
    try {
      // S'assurer que date est un objet Date valide
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Vérifier si la date est valide
      if (isNaN(dateObj.getTime())) {
        return "Date inconnue";
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return "Aujourd'hui";
      } else if (diffDays === 1) {
        return "Hier";
      } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
      } else {
        // Utiliser les options de formatage pour éviter les problèmes de localisation
        return dateObj.toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.warn('Erreur lors du formatage de la date:', error);
      return "Date inconnue";
    }
  };
  
  return (
    <Card className={`modern-collection-card ${viewMode === 'list' ? 'list-mode' : ''}`}>
      {/* En-tête colorée inspirée de YouTube */}
      <div 
        className="modern-collection-header"
        style={{ 
          backgroundColor: collectionColor,
          color: '#ffffff'
        }}
      >
        {/* Icône de la collection */}
        <div className="collection-icon">
          <FiBook size={viewMode === 'list' ? 24 : 36} />
        </div>
        
        {/* Titre de la collection */}
        <h5 className="collection-title">{collection.name}</h5>
        
        {/* Badge du nombre de cartes */}
        <Badge 
          bg="light" 
          text="dark" 
          className="collection-card-count"
          pill
        >
          {cardCount} {cardCount === 1 ? 'carte' : 'cartes'}
        </Badge>
        
        {/* Menu d'actions */}
        <Dropdown className="collection-actions">
          <Dropdown.Toggle variant="light" size="sm" className="rounded-circle shadow-sm" id={`dropdown-${collection.id}`}>
            <FiMoreVertical />
          </Dropdown.Toggle>
          <Dropdown.Menu align="end">
            <Dropdown.Item as={Link} to={`/collections/${collection.id}`}>
              <FiPlay className="me-2" /> Étudier
            </Dropdown.Item>
            <Dropdown.Item onClick={onRename}>
              <FiEdit2 className="me-2" /> Renommer
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={onDelete} className="text-danger">
              <FiTrash2 className="me-2" /> Supprimer
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      
      {/* Corps de la carte */}
      <Card.Body className="modern-collection-body">
        {/* Description */}
        <p className="collection-description">
          {collection.description || 'Aucune description disponible.'}
        </p>
        
        {/* Barre de progression */}
        {progress > 0 && (
          <div className="progress-section">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small>Progression</small>
              <small><strong>{progress}%</strong></small>
            </div>
            <ProgressBar 
              now={progress} 
              variant="success" 
              className="collection-progress" 
              style={{ height: '6px' }}
            />
          </div>
        )}
        
        {/* Statistiques */}
        <div className="collection-stats">
          <div className="stat-item">
            <FiLayers className="stat-icon" style={{ color: collectionColor }} />
            <span className="stat-value">{cardCount}</span>
            <span className="stat-label">cartes</span>
          </div>
          <div className="stat-item">
            <FiClock className="stat-icon" style={{ color: collectionColor }} />
            <span className="stat-value">{formatDate(lastStudied)}</span>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EnhancedCollectionCard;
