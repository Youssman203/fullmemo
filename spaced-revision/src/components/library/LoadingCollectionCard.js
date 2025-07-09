import React from 'react';
import { Card } from 'react-bootstrap';

const LoadingCollectionCard = () => {
  return (
    <Card className="loading-card h-100">
      <div style={{ height: '140px' }}></div>
      <Card.Body>
        <div className="rounded-pill mb-2" style={{ width: '80px', height: '20px' }}></div>
        <div className="rounded mb-2" style={{ width: '100%', height: '24px' }}></div>
        <div className="rounded mb-3" style={{ width: '100%', height: '40px' }}></div>
        <div className="d-flex justify-content-between mb-3">
          <div className="rounded" style={{ width: '40%', height: '15px' }}></div>
          <div className="rounded" style={{ width: '30%', height: '15px' }}></div>
        </div>
        <div className="d-flex justify-content-between">
          <div className="rounded" style={{ width: '40%', height: '15px' }}></div>
          <div className="rounded" style={{ width: '25%', height: '30px' }}></div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LoadingCollectionCard;
