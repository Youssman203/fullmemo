// src/components/RoleTest.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de test pour vérifier le système de rôles
 * À supprimer une fois que tout fonctionne correctement
 */
const RoleTest = () => {
  const { user, isTeacher, isStudent, getUserRole } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="alert alert-info mb-3" style={{ fontSize: '0.9rem' }}>
      <h6 className="mb-2">🧪 Test du Système de Rôles</h6>
      <div className="row">
        <div className="col-md-6">
          <strong>Utilisateur :</strong> {user.name}<br />
          <strong>Email :</strong> {user.email}<br />
          <strong>Rôle :</strong> {user.role || 'Non défini'}
        </div>
        <div className="col-md-6">
          <strong>isTeacher() :</strong> {isTeacher() ? '✅ Oui' : '❌ Non'}<br />
          <strong>isStudent() :</strong> {isStudent() ? '✅ Oui' : '❌ Non'}<br />
          <strong>getUserRole() :</strong> {getUserRole()}
        </div>
      </div>
      
      {isTeacher() && (
        <div className="mt-2 p-2 bg-success text-white rounded">
          🎓 <strong>Fonctionnalités Enseignant Activées</strong>
        </div>
      )}
      
      {isStudent() && (
        <div className="mt-2 p-2 bg-primary text-white rounded">
          👨‍🎓 <strong>Mode Étudiant</strong>
        </div>
      )}
    </div>
  );
};

export default RoleTest;
