// src/components/ReviewBox.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { FiClock, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';

const ReviewBox = () => {
  const { getFlashcardsDueNow } = useData();
  const [reviewData, setReviewData] = useState({
    total: 0,
    difficultCards: 0,
    easyCards: 0,
    cards: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewData = async () => {
      setLoading(true);
      try {
        const data = await getFlashcardsDueNow();
        setReviewData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des cartes à revoir:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewData();
    
    // Actualiser toutes les minutes pour les cartes "difficiles"
    const interval = setInterval(fetchReviewData, 60000);
    
    return () => clearInterval(interval);
  }, [getFlashcardsDueNow]);

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h5 className="card-title mb-3">
            <FiClock className="me-2" />
            À revoir
          </h5>
          <div className="text-center">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            <FiClock className="me-2" />
            À revoir
          </h5>
          <Badge bg="primary" pill>
            {reviewData.total}
          </Badge>
        </div>

        {reviewData.total === 0 ? (
          <div className="text-center py-3">
            <div className="text-muted mb-2">
              <FiBookOpen size={32} />
            </div>
            <p className="text-muted mb-0">
              Aucune carte à revoir pour le moment
            </p>
            <small className="text-muted">
              Revenez plus tard !
            </small>
          </div>
        ) : (
          <>
            <div className="mb-3">
              {reviewData.difficultCards > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-danger bg-opacity-20 p-2 me-2">
                      <FiClock size={16} className="text-danger" />
                    </div>
                    <div>
                      <div className="fw-medium">Cartes difficiles</div>
                      <small className="text-muted">À revoir dans 5 minutes</small>
                    </div>
                  </div>
                  <Badge bg="danger" pill>
                    {reviewData.difficultCards}
                  </Badge>
                </div>
              )}

              {reviewData.easyCards > 0 && (
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-20 p-2 me-2">
                      <FiBookOpen size={16} className="text-success" />
                    </div>
                    <div>
                      <div className="fw-medium">Cartes faciles</div>
                      <small className="text-muted">À revoir après 1 jour</small>
                    </div>
                  </div>
                  <Badge bg="success" pill>
                    {reviewData.easyCards}
                  </Badge>
                </div>
              )}
            </div>

            <div className="d-grid">
              <Button 
                variant="primary" 
                className="d-flex align-items-center justify-content-center"
                as={Link} 
                to="/review"
              >
                <FiBookOpen className="me-2" />
                Commencer la révision
                <FiArrowRight className="ms-2" />
              </Button>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ReviewBox;
