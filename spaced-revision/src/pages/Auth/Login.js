// src/pages/Auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FiEye, FiEyeOff, FiMail, FiLock } from 'react-icons/fi';
import { FaGoogle } from 'react-icons/fa';
import { Form, Button, InputGroup } from 'react-bootstrap';
import AuthLayout from '../../components/AuthLayout';
import '../../assets/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const user = await login(email, password);
      if (user) {
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe invalide.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email ou mot de passe invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    
    try {
      const result = await loginWithGoogle(credentialResponse);
      if (result?.error) {
        setError(result.error);
      } else if (result) {
        navigate('/dashboard');
      } else {
        setError('La connexion avec Google a échoué. Veuillez réessayer.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion avec Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('La connexion avec Google a échoué. Veuillez réessayer.');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout 
      title="Bon retour !"
      subtitle="Connectez-vous pour accéder à votre espace personnel"
    >
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Google Login Button */}
      <button className="auth-google-btn mb-3" onClick={() => document.querySelector('.google-login-button')?.click()}>
        <FaGoogle size={18} />
        <span>Se connecter avec Google</span>
      </button>
      
      {/* Hidden Google Login component */}
      <div style={{ display: 'none' }} className="google-login-button">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
        />
      </div>
      
      <div className="auth-divider">
        <span>ou</span>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FiMail />
            </InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <InputGroup className="password-input-group">
            <InputGroup.Text>
              <FiLock />
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div 
              className="password-toggle-icon" 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </InputGroup>
        </Form.Group>
        
        <div className="d-flex justify-content-end mb-3">
          <Link to="/forgot-password" className="text-decoration-none">
            Mot de passe oublié ?
          </Link>
        </div>
        
        <Button 
          type="submit" 
          className="auth-submit-btn" 
          disabled={isLoading}
        >
          {isLoading ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
      </Form>
      
      <div className="auth-form-footer">
        Vous n'avez pas de compte ? <Link to="/register">Créer un compte</Link>
      </div>
    </AuthLayout>
  );
};

export default Login;
