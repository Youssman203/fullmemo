// src/pages/Profile.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Form, ListGroup, Modal } from 'react-bootstrap';
import { 
  FiEdit2, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiCalendar, 
  FiClock, 
  FiBell, 
  FiBellOff,
  FiUpload,
  FiBarChart2,
  FiBook,
  FiCheckCircle,
  FiSun,
  FiMoon
} from 'react-icons/fi';
import '../assets/profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const { collections } = useData();
  const navigate = useNavigate();
  
  // États pour les modales et paramètres
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Utiliser le contexte de thème
  const { darkMode, toggleDarkMode } = useTheme();
  
  // Données utilisateur
  const totalCards = collections.reduce((sum, coll) => sum + (coll.cards?.length || 0), 0);
  const userAvatar = user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || user?.email}`;
  const userName = user?.name || user?.email?.split('@')[0];
  const joinDate = new Date(user?.joinDate || Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Données d'activité enseignant (simulées)
  const recentCollections = collections
    .sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0))
    .slice(0, 3);
    
  const recentTeachingActivity = [
    { id: 1, date: '08/07/2025', activity: 'Collection "Vocabulaire Anglais" partagée', class: 'Classe 6ème A', students: 25 },
    { id: 2, date: '07/07/2025', activity: 'Évaluation "Mathématiques" créée', class: 'Classe 5ème B', students: 22 },
    { id: 3, date: '05/07/2025', activity: 'Nouvelle classe "Histoire Moderne" créée', class: 'Histoire Moderne', students: 18 }
  ];
  
  // Statistiques enseignant (simulées)
  const teacherStats = {
    totalClasses: 5,
    totalStudents: 127,
    collectionsShared: 24,
    lastActive: 'Aujourd\'hui'
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleEditProfile = () => {
    setShowEditModal(true);
  };
  
  const handleChangePhoto = () => {
    setShowPhotoModal(true);
  };
  
  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <div className="profile-container">
      <Row className="g-4">
        {/* Colonne gauche - Informations personnelles */}
        <Col lg={4}>
          <Card className="profile-card user-info-card">
            <Card.Body className="text-center">
              <div className="profile-image-container">
                <img 
                  src={userAvatar} 
                  alt="Photo de profil" 
                  className="profile-image" 
                />
                <Button 
                  variant="light" 
                  className="change-photo-btn" 
                  onClick={handleChangePhoto}
                >
                  <FiUpload />
                </Button>
              </div>
              
              <h2 className="profile-name mt-3">{userName}</h2>
              <p className="profile-email">{user?.email}</p>
              
              <div className="profile-join-date mb-3">
                <FiCalendar className="me-2" />
                Membre depuis le {joinDate}
              </div>
              
              <Button 
                variant="outline-primary" 
                className="edit-profile-btn mb-3" 
                onClick={handleEditProfile}
              >
                <FiEdit2 className="me-2" /> Modifier le profil
              </Button>
              
              <Card className="stats-card mt-3">
                <Card.Body>
                  <h5 className="section-title"><FiBarChart2 className="me-2" />Statistiques Enseignant</h5>
                  <Row className="stats-row">
                    <Col xs={6} className="stat-item">
                      <div className="stat-number">{teacherStats.totalClasses}</div>
                      <div className="stat-label">Classes</div>
                    </Col>
                    <Col xs={6} className="stat-item">
                      <div className="stat-number">{teacherStats.totalStudents}</div>
                      <div className="stat-label">Apprenants</div>
                    </Col>
                    <Col xs={6} className="stat-item">
                      <div className="stat-number">{collections.length}</div>
                      <div className="stat-label">Collections</div>
                    </Col>
                    <Col xs={6} className="stat-item">
                      <div className="stat-number">{teacherStats.collectionsShared}</div>
                      <div className="stat-label">Partagées</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
          
          {/* Section Paramètres rapides */}
          <Card className="profile-card settings-card mt-4">
            <Card.Body>
              <h5 className="section-title"><FiSettings className="me-2" />Paramètres rapides</h5>
              
              <ListGroup variant="flush" className="quick-settings">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    {notificationsEnabled ? <FiBell className="me-2" /> : <FiBellOff className="me-2" />}
                    Notifications
                  </div>
                  <Form.Check 
                    type="switch"
                    checked={notificationsEnabled}
                    onChange={toggleNotifications}
                  />
                </ListGroup.Item>
                
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    {darkMode ? <FiMoon className="me-2" /> : <FiSun className="me-2" />}
                    Mode {darkMode ? 'sombre' : 'clair'}
                  </div>
                  <Form.Check 
                    type="switch"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                </ListGroup.Item>
                
                <ListGroup.Item action className="d-flex align-items-center">
                  <FiSettings className="me-2" />
                  Paramètres du compte
                </ListGroup.Item>
                
                <ListGroup.Item 
                  action 
                  className="d-flex align-items-center text-danger"
                  onClick={handleLogout}
                >
                  <FiLogOut className="me-2" />
                  Déconnexion
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        
        {/* Colonne droite - Activités et statistiques */}
        <Col lg={8}>
          {/* Section Activités récentes */}
          <Card className="profile-card">
            <Card.Body>
              <h5 className="section-title">
                <FiClock className="me-2" />
                Activités récentes
                <Badge bg="primary" className="ms-2">{teacherStats.lastActive}</Badge>
              </h5>
              
              <h6 className="subsection-title mt-4">
                <FiBook className="me-2" />
                Collections récentes
              </h6>
              
              {recentCollections.length > 0 ? (
                <ListGroup className="recent-collections mb-4">
                  {recentCollections.map((collection) => (
                    <ListGroup.Item 
                      key={collection.id} 
                      action 
                      className="d-flex justify-content-between align-items-center"
                      onClick={() => navigate(`/collections/${collection.id}`)}
                    >
                      <div>
                        <h6 className="mb-0">{collection.name}</h6>
                        <small className="text-muted">
                          {collection.cardCount || 0} cartes
                        </small>
                      </div>
                      <Badge bg="light" text="dark">
                        {new Date(collection.lastModified || Date.now()).toLocaleDateString()}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">Aucune collection récente</p>
              )}
              
              <h6 className="subsection-title mt-4">
                <FiCheckCircle className="me-2" />
                Activités d'enseignement récentes
              </h6>
              
              <ListGroup className="recent-teaching-activities">
                {recentTeachingActivity.map((activity) => (
                  <ListGroup.Item 
                    key={activity.id} 
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 className="mb-0">{activity.activity}</h6>
                      <small className="text-muted">
                        {activity.class} • {activity.students} apprenants
                      </small>
                    </div>
                    <div className="text-end">
                      <Badge bg="primary">
                        Enseignant
                      </Badge>
                      <div><small className="text-muted">{activity.date}</small></div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
          
          {/* Section Progression Enseignant */}
          <Card className="profile-card mt-4">
            <Card.Body>
              <h5 className="section-title">
                <FiBarChart2 className="me-2" />
                Performance d'Enseignement
              </h5>
              
              <Row className="mt-4">
                <Col md={6} className="mb-4">
                  <Card className="progress-card">
                    <Card.Body className="text-center">
                      <h5 className="progress-title">Engagement Apprenants</h5>
                      <div className="progress-circle">
                        <div className="progress-value">89%</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col md={6} className="mb-4">
                  <Card className="progress-card">
                    <Card.Body className="text-center">
                      <h5 className="progress-title">Cartes Créées</h5>
                      <div className="progress-circle streak-circle">
                        <div className="progress-value">{totalCards}</div>
                        <div className="progress-label">total</div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Modal Modifier Profil */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modifier le profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom d'utilisateur</Form.Label>
              <Form.Control type="text" defaultValue={userName} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" defaultValue={user?.email} readOnly />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => setShowEditModal(false)}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Modal Changer Photo */}
      <Modal show={showPhotoModal} onHide={() => setShowPhotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Changer la photo de profil</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <img 
              src={userAvatar} 
              alt="Photo actuelle" 
              className="current-photo mb-3" 
            />
          </div>
          <Form.Group controlId="photoUpload" className="mb-3">
            <Form.Label>Télécharger une nouvelle photo</Form.Label>
            <Form.Control type="file" accept="image/*" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPhotoModal(false)}>
            Annuler
          </Button>
          <Button variant="primary" onClick={() => setShowPhotoModal(false)}>
            Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Profile;
