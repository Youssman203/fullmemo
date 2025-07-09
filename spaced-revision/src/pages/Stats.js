// src/pages/Stats.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { generateStatsData } from '../mock/statsData';
import '../assets/stats.css';

// Import components
import OverviewCard from '../components/stats/OverviewCard';
import ProgressRadarChart from '../components/stats/ProgressRadarChart';
import ReviewLineChart from '../components/stats/ReviewLineChart';
import LevelBarChart from '../components/stats/LevelBarChart';
import StatusPieChart from '../components/stats/StatusPieChart';
import ReviewCalendar from '../components/stats/ReviewCalendar';
import TroubleCardsTable from '../components/stats/TroubleCardsTable';
import PeriodFilter from '../components/stats/PeriodFilter';
import ProgressChart from '../components/ProgressChart';

const Stats = () => {
  const { getReviewHistory } = useData();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [statsData, setStatsData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load stats data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      // In a real app, we would fetch this data from an API
      // For now, we'll use our mock data generator
      const data = generateStatsData(user?.id || '1', period);
      setStatsData(data);
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [user, period]);

  // Check for dark mode preference
  useEffect(() => {
    const isDarkMode = document.body.classList.contains('dark-mode');
    setDarkMode(isDarkMode);
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="stats-container py-4">
        <h1 className="mb-4">Statistiques</h1>
        <PeriodFilter activePeriod={period} onPeriodChange={handlePeriodChange} />
        
        <Row className="g-4">
          <Col xs={12}>
            <div className="stats-loading rounded"></div>
          </Col>
          <Col md={6}>
            <div className="stats-loading rounded"></div>
          </Col>
          <Col md={6}>
            <div className="stats-loading rounded"></div>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className={`stats-container py-4 ${darkMode ? 'dark-mode' : ''}`}>
      <div className="stats-header d-flex justify-content-between align-items-center flex-wrap">
        <h1 className="mb-3 mb-md-0">Statistiques</h1>
        <PeriodFilter activePeriod={period} onPeriodChange={handlePeriodChange} />
      </div>
      
      <Row className="g-4">
        {/* Overview Card */}
        <Col xs={12}>
          <OverviewCard stats={statsData.stats} />
        </Col>
        
        {/* Charts Row 1 */}
        <Col lg={6}>
          <ProgressRadarChart stats={statsData.stats} />
        </Col>
        <Col lg={6}>
          <ReviewLineChart reviewData={statsData.reviewLineData} />
        </Col>
        
        {/* Charts Row 2 */}
        <Col md={6} lg={4}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <Card.Title className="mb-4">Progression globale</Card.Title>
              <ProgressChart />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={4}>
          <LevelBarChart levelData={statsData.levelData} />
        </Col>
        <Col md={12} lg={4}>
          <StatusPieChart statusData={statsData.statusData} />
        </Col>
        
        {/* Calendar and Trouble Cards */}
        <Col lg={6}>
          <ReviewCalendar reviewHistory={statsData.reviewHistory} />
        </Col>
        <Col lg={6}>
          <TroubleCardsTable troubleCards={statsData.troubleCards} />
        </Col>
      </Row>
      
      {/* Recent Activity */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Activité récente</h5>
            </Card.Header>
            <ul className="list-group list-group-flush">
              {statsData.reviewHistory.length > 0 ? (
                statsData.reviewHistory.slice(0, 10).map((item, index) => (
                  <li key={index} className="list-group-item">
                    Révision de "{item.cardQuestion}" le {new Date(item.reviewedAt).toLocaleString()}
                    {item.performance > 1 ? 
                      <span className="badge bg-success ms-2">Réussite</span> : 
                      <span className="badge bg-danger ms-2">Échec</span>
                    }
                  </li>
                ))
              ) : (
                <li className="list-group-item">Aucun historique de révision pour le moment.</li>
              )}
            </ul>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Stats;
