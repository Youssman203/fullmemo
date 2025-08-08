// src/services/evaluationService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Configuration axios avec token
const getConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
};

// Récupérer les apprenants avec leurs statistiques
export const getStudentsWithSharedCollections = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/evaluation/students`,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des apprenants:', error);
    throw error;
  }
};

// Récupérer les sessions d'un apprenant
export const getStudentSessions = async (studentId, collectionId = null) => {
  try {
    let url = `${API_URL}/evaluation/students/${studentId}/sessions`;
    if (collectionId) {
      url += `?collectionId=${collectionId}`;
    }
    
    const response = await axios.get(url, getConfig());
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    throw error;
  }
};

// Récupérer les détails d'une session
export const getSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/evaluation/sessions/${sessionId}`,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    throw error;
  }
};

// Évaluer une session
export const evaluateSession = async (sessionId, evaluationData) => {
  try {
    const response = await axios.put(
      `${API_URL}/evaluation/sessions/${sessionId}/evaluate`,
      evaluationData,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'évaluation de la session:', error);
    throw error;
  }
};

// Récupérer les statistiques globales
export const getEvaluationStats = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/evaluation/stats`,
      getConfig()
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export default {
  getStudentsWithSharedCollections,
  getStudentSessions,
  getSessionDetails,
  evaluateSession,
  getEvaluationStats
};
