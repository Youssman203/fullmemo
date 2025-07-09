import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaClipboardList, FaRegLightbulb } from 'react-icons/fa';
import '../assets/plan.css';

const Plan = () => {
  // Cette page est un placeholder pour l'instant
  const hasPlans = false; // À remplacer par une vérification réelle des plans d'étude

  return (
    <div className="plan-container">
      <Container fluid>
        <div className="plan-header">
          <h1 className="plan-title">Plan d'étude</h1>
          <p className="plan-subtitle">Organisez votre apprentissage avec un plan d'étude personnalisé</p>
        </div>

        {hasPlans ? (
          <>
            <Row className="mb-4">
              <Col lg={8} className="mb-3 mb-lg-0">
                <div className="plan-card">
                  <h2 className="plan-card-title">Plan d'étude actuel</h2>
                  <div className="plan-card-content">
                    <p>Votre plan d'étude personnalisé apparaîtra ici.</p>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="plan-card">
                  <h2 className="plan-card-title">Progression</h2>
                  <div className="plan-card-content">
                    <p>Votre progression dans le plan d'étude apparaîtra ici.</p>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3 mb-md-0">
                <div className="plan-card">
                  <h2 className="plan-card-title">Sessions à venir</h2>
                  <div className="plan-card-content">
                    <p>Vos prochaines sessions d'étude apparaîtront ici.</p>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="plan-card">
                  <h2 className="plan-card-title">Recommandations</h2>
                  <div className="plan-card-content">
                    <p>Des recommandations pour améliorer votre apprentissage apparaîtront ici.</p>
                  </div>
                </div>
              </Col>
            </Row>
          </>
        ) : (
          <div className="plan-empty">
            <div className="plan-empty-icon">
              <FaCalendarAlt />
            </div>
            <h2 className="plan-empty-text">Vous n'avez pas encore de plan d'étude</h2>
            <p className="mb-4">Créez votre premier plan d'étude pour organiser vos révisions efficacement</p>
            <Button variant="primary" size="lg">
              <FaClipboardList className="me-2" /> Créer un plan d'étude
            </Button>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Plan;
