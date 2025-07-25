// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { FiCalendar, FiBookOpen, FiUser, FiTrendingUp, FiClock } from 'react-icons/fi';
import QuoteCarousel from '../components/QuoteCarousel';
import RecentActivity from '../components/RecentActivity';
import StreakCalendar from '../components/StreakCalendar';
import ReviewBox from '../components/ReviewBox';
import '../assets/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || user?.email.split('@')[0];
  
  // Mock data for demonstration
  const mockData = {
    streakDays: 12,
    totalCards: 156,
    cardsToReview: 8,
    completionRate: 78,
    studyTime: 45, // minutes today
    weeklyProgress: [
      { day: 'Mon', cards: 12 },
      { day: 'Tue', cards: 15 },
      { day: 'Wed', cards: 8 },
      { day: 'Thu', cards: 20 },
      { day: 'Fri', cards: 14 },
      { day: 'Sat', cards: 5 },
      { day: 'Sun', cards: 0 }
    ],
    upcomingReviews: 23
  };



  return (
    <div className="dashboard-container bg-light">
      <Container fluid className="py-4 px-4">
        {/* Header */}
        <Row className="mb-4 align-items-center">
          <Col>
            <h1 className="fw-bold mb-0">Bon retour, {userName} !</h1>
            <p className="text-muted mb-0">Prêt à apprendre quelque chose de nouveau aujourd'hui ?</p>
          </Col>
        </Row>

        {/* Stats Overview */}
        <Row className="mb-4 g-3">
          <Col lg={3} md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3 bg-primary bg-opacity-10">
                  <FiCalendar size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-0">Série actuelle</h6>
                  <h3 className="mb-0 fw-bold">{mockData.streakDays} jours</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3 bg-success bg-opacity-10">
                  <FiBookOpen size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-0">Cartes à réviser</h6>
                  <h3 className="mb-0 fw-bold">{mockData.cardsToReview}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3 bg-warning bg-opacity-10">
                  <FiTrendingUp size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="mb-0">Taux de complétion</h6>
                  <h3 className="mb-0 fw-bold">{mockData.completionRate}%</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="d-flex align-items-center">
                <div className="rounded-circle p-3 me-3 bg-info bg-opacity-10">
                  <FiClock size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-0">Temps d'étude</h6>
                  <h3 className="mb-0 fw-bold">{mockData.studyTime} min</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quote Carousel */}
        <Row className="mb-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-4">
                <QuoteCarousel darkMode={false} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Content */}
        <Row className="g-4">
          {/* Left Column */}
          <Col lg={8}>
            {/* Progress Card */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Votre progression</h5>
                  <Link to="/stats" className="text-decoration-none text-dark">
                    Voir détails
                  </Link>
                </div>
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Complétion globale</span>
                    <span>{mockData.completionRate}%</span>
                  </div>
                  <ProgressBar 
                    now={mockData.completionRate} 
                    variant="primary" 
                    className="progress-sm"
                  />
                </div>
                <div className="d-flex justify-content-between weekly-progress">
                  {mockData.weeklyProgress.map((day, index) => (
                    <div key={index} className="text-center">
                      <div 
                        className="progress-bar-vertical bg-light" 
                        style={{ height: '100px' }}
                      >
                        <div 
                          className="progress-bar bg-primary" 
                          role="progressbar" 
                          style={{ height: `${(day.cards / 20) * 100}%` }} 
                          aria-valuenow={day.cards} 
                          aria-valuemin="0" 
                          aria-valuemax="20"
                        ></div>
                      </div>
                      <span className="small">{day.day}</span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
            
            {/* Review Box */}
            <ReviewBox />
          </Col>
          
          {/* Right Column */}
          <Col lg={4}>
            {/* Streak Calendar */}
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Body>
                <StreakCalendar darkMode={false} />
              </Card.Body>
            </Card>
            
            {/* Quick Actions */}
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="card-title mb-3">Actions rapides</h5>
                <div className="d-grid gap-2">
                  <Button variant="primary" className="d-flex align-items-center justify-content-center" as={Link} to="/review">
                    <FiBookOpen className="me-2" /> Commencer la révision ({mockData.cardsToReview})
                  </Button>
                  <Button variant="outline-primary" className="d-flex align-items-center justify-content-center" as={Link} to="/card/new">
                    <FiBookOpen className="me-2" /> Créer une nouvelle carte
                  </Button>
                  <Button variant="outline-secondary" className="d-flex align-items-center justify-content-center" as={Link} to="/library">
                    <FiBookOpen className="me-2" /> Parcourir la bibliothèque
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
