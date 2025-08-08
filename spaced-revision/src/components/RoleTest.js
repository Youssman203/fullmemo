// src/components/RoleTest.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant d'information utilisateur
 */
const RoleTest = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="alert alert-info mb-3" style={{ fontSize: '0.9rem' }}>
      <h6 className="mb-2">👤 Info Utilisateur</h6>
      <div className="row">
        <div className="col-md-12">
          <strong>Utilisateur :</strong> {user.name}<br />
          <strong>Email :</strong> {user.email}<br />
          <strong>Rôle :</strong> {user.role || 'Non défini'}
        </div>
      </div>
    </div>
  );
};

export default RoleTest;
