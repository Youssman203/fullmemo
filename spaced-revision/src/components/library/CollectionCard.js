import React from 'react';
import { getCollectionColor } from '../../utils/colorUtils';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiUser, FiLayers, FiEye } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CollectionCard = ({ collection }) => {
  // Determine category style
  const getCategoryClass = (category) => {
    return `collection-card-category category-${category}`;
  };

  return (
    <Card className="collection-card h-100">
      <div 
        className="modern-collection-header"
        style={{ 
          height: '140px',
          backgroundColor: collection.color || getCollectionColor(collection.title || collection.name),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div className="collection-icon" style={{ fontSize: '2.5rem', color: 'rgba(255, 255, 255, 0.7)' }}>
          <FiLayers />
        </div>
        <Badge 
          className="collection-card-count-badge" 
          bg="light" 
          text="dark"
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '0.8rem',
            padding: '0.35em 0.65em'
          }}
        >
          {collection.cardCount || 0} cartes
        </Badge>
      </div>
      <Card.Body className="collection-card-body">
        <Badge className={getCategoryClass(collection.category)}>
          {collection.categoryLabel}
        </Badge>
        <Card.Title className="collection-card-title">{collection.title}</Card.Title>
        <Card.Text className="collection-card-description">
          {collection.description}
        </Card.Text>
        <div className="collection-card-meta">
          <div className="collection-card-author">
            <FiUser className="collection-card-author-icon" />
            {collection.author}
          </div>
          <div className="collection-card-count">
            <FiLayers className="collection-card-count-icon" />
            {collection.cardCount} cartes
          </div>
        </div>
        <div className="collection-card-actions">
          <small className="text-muted">
            {collection.studiedCount.toLocaleString()} étudiants
          </small>
          <Link to={`/review/${collection.id}`}>
            <Button variant="primary" size="sm">
              <FiEye className="me-1" /> Étudier
            </Button>
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CollectionCard;
