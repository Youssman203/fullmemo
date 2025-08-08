// src/pages/StudentClassesDetailPage.js
import React from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiHome, FiUsers } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import StudentClassesDetailView from '../components/StudentClassesDetailView';

const StudentClassesDetailPage = () => {
  const { isStudent } = useAuth();

  // Vérifier que l'utilisateur est un apprenant
  if (!isStudent()) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h3>Accès Refusé</h3>
          <p>Cette page est réservée aux apprenants.</p>
          <Link to="/home" className="btn btn-primary">
            Retour au tableau de bord
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Container fluid className="py-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item as={Link} to="/home">
            <FiHome className="me-1" />
            Tableau de bord
          </Breadcrumb.Item>
          <Breadcrumb.Item as={Link} to="/classes">
            <FiUsers className="me-1" />
            Mes Classes
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Vue détaillée
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Composant principal */}
        <StudentClassesDetailView />
      </Container>
    </div>
  );
};

export default StudentClassesDetailPage;
