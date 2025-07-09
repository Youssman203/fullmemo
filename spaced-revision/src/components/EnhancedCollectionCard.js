import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown, Badge, ProgressBar } from 'react-bootstrap';
import { FiLayers, FiClock, FiMoreVertical, FiEdit2, FiTrash2, FiPlay } from 'react-icons/fi';

const EnhancedCollectionCard = ({ collection, onRename, onDelete, viewMode = 'grid' }) => {
  // Calculate a random progress for demo purposes
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
  
  // Default image if none provided
  const imageUrl = collection.imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80';
  
  return (
    <div className={`collection-card ${viewMode === 'list' ? 'list-mode' : ''}`}>
      <div 
        className="collection-card-image"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="collection-card-overlay">
          <h5 className="collection-card-overlay-title">{collection.name}</h5>
        </div>
        
        {collection.cardCount > 0 && (
          <Badge className="collection-card-badge">
            {collection.cardCount} {collection.cardCount === 1 ? 'carte' : 'cartes'}
          </Badge>
        )}
        
        <Dropdown className="collection-card-actions">
          <Dropdown.Toggle variant="light" size="sm" className="rounded-circle p-1" id={`dropdown-${collection.id}`}>
            <FiMoreVertical />
          </Dropdown.Toggle>
          <Dropdown.Menu>
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
      
      <div className="collection-card-body">
        <h5 className="collection-card-title">{collection.name}</h5>
        <p className="collection-card-description">
          {collection.description || 'Aucune description disponible.'}
        </p>
        
        {progress > 0 && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small>Progression</small>
              <small>{progress}%</small>
            </div>
            <div className="collection-card-progress">
              <div 
                className="collection-card-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </>
        )}
        
        <div className="collection-card-meta">
          <div className="collection-card-stats">
            <div className="collection-card-stat">
              <FiLayers className="collection-card-stat-icon" />
              <span>{collection.cardCount || 0}</span>
            </div>
            <div className="collection-card-stat">
              <FiClock className="collection-card-stat-icon" />
              <span>{formatDate(lastStudied)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCollectionCard;
