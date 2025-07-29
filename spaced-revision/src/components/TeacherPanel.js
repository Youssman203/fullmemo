// src/components/TeacherPanel.js
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, ListGroup } from 'react-bootstrap';
import { FiUsers, FiBookOpen, FiPlus, FiEye, FiSettings } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import classService from '../services/classService';

const TeacherPanel = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeClasses: 0
  });

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      const response = await classService.getTeacherClasses();
      const classesData = response.data || [];
      
      setClasses(classesData);
      
      // Calculer les statistiques
      const totalStudents = classesData.reduce((total, cls) => total + (cls.students?.length || 0), 0);
      const activeClasses = classesData.filter(cls => cls.isActive).length;
      
      setStats({
        totalClasses: classesData.length,
        totalStudents,
        activeClasses
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données enseignant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-4">
        <Card.Body>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="teacher-panel">
      {/* En-tête Enseignant Simplifié */}
      <Card className="border-0 shadow-sm text-center py-5">
        <Card.Body>
          <div className="mb-4">
            <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
              👨‍🏫
            </div>
            <h2 className="mb-2 fw-bold">Bienvenue, Enseignant !</h2>
            <p className="text-muted mb-4">Bienvenue dans votre espace pédagogique. Accompagnez vos étudiants dans leur parcours d'apprentissage</p>
          </div>
          
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button 
              variant="primary"
              size="lg"
              as={Link}
              to="/classes"
              className="d-flex align-items-center gap-2 px-4"
            >
              <FiPlus size={20} />
              Créer une Classe
            </Button>
            
            <Button 
              variant="outline-primary"
              size="lg"
              as={Link}
              to="/classes"
              className="d-flex align-items-center gap-2 px-4"
            >
              <FiBookOpen size={20} />
              Mes Classes
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeacherPanel;
