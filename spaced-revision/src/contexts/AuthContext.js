// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Vérifier d'abord si nous avons un token et un utilisateur valides
        if (authService.isAuthenticated()) {
          // Récupérer les données utilisateur depuis le localStorage
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            console.log('Utilisateur trouvé dans le localStorage:', storedUser.name);
            setUser(storedUser);
            
            // Essayer de rafraîchir les données depuis l'API en arrière-plan
            // Mais ne pas échouer si l'API n'est pas disponible
            try {
              const userData = await authService.getUserProfile();
              if (userData && (userData.user || userData)) {
                const freshUser = userData.user || userData;
                console.log('Données utilisateur rafraîchies depuis l\'API');
                setUser(freshUser);
                // Mettre à jour le localStorage avec les nouvelles données
                localStorage.setItem('user', JSON.stringify(freshUser));
              }
            } catch (apiError) {
              // Si l'API échoue, on garde l'utilisateur du localStorage
              console.warn('Impossible de rafraîchir les données depuis l\'API, utilisation du cache local:', apiError.message);
              // Ne pas déconnecter l'utilisateur, juste continuer avec les données en cache
            }
          } else {
            console.log('Aucun utilisateur trouvé dans le localStorage');
            // Si pas d'utilisateur en cache, nettoyer le token aussi
            authService.logout();
          }
        } else {
          console.log('Utilisateur non authentifié');
          // S'assurer que l'état est propre
          setUser(null);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        // En cas d'erreur critique, ne pas déconnecter automatiquement
        // Laisser l'utilisateur décider
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const setSession = (data) => {
    // Pour gérer à la fois le format { user, token } et le format où l'utilisateur est directement à la racine
    const userData = data.user || data;
    const token = data.token;
    
    console.log('Sauvegarde de la session utilisateur:', userData.name);
    
    // Sauvegarder dans le localStorage
    if (token) {
      localStorage.setItem('token', token);
    }
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    // Mettre à jour l'état
    setUser(userData);
    return userData;
  }

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      return setSession(data);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      return setSession(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name, picture, sub } = decoded;
      
      // Pour l'instant, nous n'avons pas implémenté la connexion Google côté serveur,
      // mais vous pourriez ajouter cette fonctionnalité plus tard
      const userData = {
        email,
        name,
        profileImage: picture,
        password: sub, // Mot de passe temporaire basé sur l'ID Google
        isGoogleUser: true
      };
      
      try {
        // Essayer de s'inscrire d'abord
        const data = await authService.register(userData);
        return setSession(data);
      } catch (registerError) {
        // Si l'utilisateur existe déjà, essayer de se connecter
        try {
          const data = await authService.login(email, sub);
          return setSession(data);
        } catch (loginError) {
          console.error("Google authentication failed", loginError);
          return { error: "Authentication failed with Google account" };
        }
      }
    } catch (error) {
      console.error("Google login failed", error);
      return { error: "Failed to process Google authentication" };
    }
  };

  const logout = () => {
    console.log('Déconnexion de l\'utilisateur');
    authService.logout();
    setUser(null);
  };

  // Vérifier périodiquement si le token est encore valide
  useEffect(() => {
    if (!user) return;

    const checkTokenValidity = async () => {
      try {
        // Essayer de faire une requête authentifiée pour vérifier si le token est valide
        await authService.getUserProfile();
      } catch (error) {
        // Si le token est expiré ou invalide, déconnecter l'utilisateur
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.log('Token expiré, déconnexion automatique');
          logout();
        }
      }
    };

    // Vérifier la validité du token toutes les 30 minutes
    const interval = setInterval(checkTokenValidity, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  const updateProfile = async (userData) => {
    try {
      const data = await authService.updateUserProfile(userData);
      const updatedUser = data.user || data;
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Update profile failed:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await authService.deleteUserAccount();
      setUser(null);
    } catch (error) {
      console.error('Delete account failed:', error);
      throw error;
    }
  };

  // Fonctions utilitaires pour les rôles
  const isTeacher = () => {
    return user?.role === 'teacher';
  };

  const isStudent = () => {
    return user?.role === 'student';
  };

  const getUserRole = () => {
    return user?.role || 'student';
  };

  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    register, 
    loginWithGoogle, 
    updateProfile, 
    deleteAccount,
    // Fonctions de rôle
    isTeacher,
    isStudent,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
