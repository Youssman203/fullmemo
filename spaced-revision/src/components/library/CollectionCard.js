import React from 'react';
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
      {collection.imageUrl && (
        <div 
          className="collection-card-image"
          style={{ 
            height: '140px',
            backgroundImage: `url(${collection.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
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
