import React from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de debug temporaire pour vérifier les rôles
 * À supprimer une fois les tests terminés
 */
const DebugRole = () => {
  const { user, isTeacher, isStudent, getUserRole } = useAuth();

  // N'afficher que si on est en mode développement
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: '#333',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <div><strong>DEBUG RÔLES</strong></div>
      <div>👤 {user.name}</div>
      <div>📧 {user.email}</div>
      <div>🎯 Rôle: <strong>{getUserRole()}</strong></div>
      <div>👨‍🏫 isTeacher(): {isTeacher() ? '✅' : '❌'}</div>
      <div>👨‍🎓 isStudent(): {isStudent() ? '✅' : '❌'}</div>
      <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.7 }}>
        localStorage: {localStorage.getItem('user') ? 'OK' : 'VIDE'}
      </div>
    </div>
  );
};

export default DebugRole;
