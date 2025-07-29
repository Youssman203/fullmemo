import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaHome, FaSyncAlt, FaBook, FaClone, FaLayerGroup, FaUserCircle, FaSignOutAlt, FaChartBar, FaBars, FaTimes, FaUsers, FaUserPlus, FaEye } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Fermer le menu mobile quand la taille de l'écran change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);
  
  // Fermer le menu mobile après avoir cliqué sur un lien
  const handleNavLinkClick = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Échec de la déconnexion', error);
    }
  };

  const userName = user?.name || user?.email.split('@')[0];
  const userPicture = user?.picture;

  if (!user) {
    return null; // Don't render sidebar if not logged in
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="brand-container">
          <span className={`role-badge ${isTeacher() ? 'teacher' : 'student'}`}>
            {isTeacher() ? '👨‍🏫 Enseignant' : '👨‍🎓 Étudiant'}
          </span>
        </div>
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
      <nav className={`sidebar-nav ${mobileMenuOpen ? 'mobile-visible' : ''}`}>
        <NavLink to="/home" className="sidebar-link" onClick={handleNavLinkClick}>
          <FaHome /><span>Accueil</span>
        </NavLink>
        <NavLink to="/collections" className="sidebar-link" onClick={handleNavLinkClick}>
          <FaLayerGroup /><span>Collections</span>
        </NavLink>
        <NavLink to="/flashcards" className="sidebar-link" onClick={handleNavLinkClick}>
          <FaClone /><span>Cartes</span>
        </NavLink>
        <NavLink to="/review" className="sidebar-link" onClick={handleNavLinkClick}>
          <FaSyncAlt /><span>Révisions</span>
        </NavLink>
        <NavLink to="/stats" className="sidebar-link" onClick={handleNavLinkClick}>
          <FaChartBar /><span>Statistiques</span>
        </NavLink>
        
        {/* Liens spécifiques aux enseignants */}
        {isTeacher() && (
          <NavLink to="/classes" className="sidebar-link" onClick={handleNavLinkClick}>
            <FaUsers /><span>Mes Classes</span>
          </NavLink>
        )}
        
        {/* Liens spécifiques aux étudiants */}
        {isStudent() && (
          <>
            <NavLink to="/classes" className="sidebar-link" onClick={handleNavLinkClick}>
              <FaUsers /><span>Mes Classes</span>
            </NavLink>
            <NavLink to="/classes/details" className="sidebar-link" onClick={handleNavLinkClick}>
              <FaEye /><span>Classes Détaillées</span>
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/profile" className="sidebar-link" onClick={handleNavLinkClick}>
          {userPicture ? (
            <img src={userPicture} alt={userName} className="sidebar-avatar" />
          ) : (
            <FaUserCircle />
          )}
          <span>{userName}</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-link logout-button">
          <FaSignOutAlt /><span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
