import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { FiAward, FiTrendingUp, FiCheckCircle, FiCalendar } from 'react-icons/fi';

const OverviewCard = ({ stats }) => {
  // Determine user level based on score
  const getUserLevel = (score) => {
    if (score < 40) return { text: 'Débutant', color: 'warning', icon: '🟡' };
    if (score < 75) return { text: 'Avancé', color: 'success', color: '🟢' };
    return { text: 'Expert', color: 'primary', icon: '🔵' };
  };

  const userLevel = getUserLevel(stats.score);

  return (
    <Card className="shadow-sm h-100">
      <Card.Body>
        <Card.Title className="d-flex justify-content-between align-items-center mb-4">
          <span>Performance Globale</span>
          <Badge bg={userLevel.color} className="fs-6 px-3 py-2">
            {userLevel.icon} {userLevel.text}
          </Badge>
        </Card.Title>
        
        <Row className="text-center g-3">
          <Col xs={6} md={3}>
            <div className="p-3 rounded-3 bg-light">
              <div className="fs-1 fw-bold text-primary">{stats.score}</div>
              <div className="text-muted small">Score global</div>
              <div className="mt-2 text-primary">
                <FiAward size={20} />
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="p-3 rounded-3 bg-light">
              <div className="fs-1 fw-bold text-success">{stats.masteredPercentage}%</div>
              <div className="text-muted small">Cartes maîtrisées</div>
              <div className="mt-2 text-success">
                <FiCheckCircle size={20} />
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="p-3 rounded-3 bg-light">
              <div className="fs-1 fw-bold text-info">{stats.totalCards}</div>
              <div className="text-muted small">Total cartes</div>
              <div className="mt-2 text-info">
                <FiTrendingUp size={20} />
              </div>
            </div>
          </Col>
          
          <Col xs={6} md={3}>
            <div className="p-3 rounded-3 bg-light">
              <div className="fs-1 fw-bold text-warning">{stats.activeDaysPercentage}%</div>
              <div className="text-muted small">Assiduité</div>
              <div className="mt-2 text-warning">
                <FiCalendar size={20} />
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-4">
          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Moyenne de bonnes réponses</span>
            <span className="fw-bold">{stats.correctAnswersAvg}%</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className="progress-bar bg-success" 
              role="progressbar" 
              style={{ width: `${stats.correctAnswersAvg}%` }}
              aria-valuenow={stats.correctAnswersAvg} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default OverviewCard;
