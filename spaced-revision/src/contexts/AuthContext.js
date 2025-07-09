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
        if (authService.isAuthenticated()) {
          // Récupérer les données utilisateur depuis le localStorage d'abord pour un chargement rapide
          const storedUser = authService.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
          
          // Puis essayer de rafraîchir depuis l'API si possible
          try {
            const userData = await authService.getUserProfile();
            if (userData) {
              setUser(userData.user || userData);
            }
          } catch (apiError) {
            // Si l'API échoue mais que nous avons un utilisateur en cache, on continue
            console.warn('Could not refresh user data from API:', apiError);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, []);

  const setSession = (data) => {
    // Pour gérer à la fois le format { user, token } et le format où l'utilisateur est directement à la racine
    const userData = data.user || data;
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
    authService.logout();
    setUser(null);
  };

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

  const value = { 
    user, 
    loading, 
    login, 
    logout, 
    register, 
    loginWithGoogle, 
    updateProfile, 
    deleteAccount 
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
