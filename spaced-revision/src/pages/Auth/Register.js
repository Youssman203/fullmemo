// src/pages/Auth/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { Form, Button, InputGroup } from 'react-bootstrap';
import AuthLayout from '../../components/AuthLayout';
import '../../assets/auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('student'); // Nouveau state pour le rôle
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    
    if (!username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!email.trim()) {
      errors.email = 'L\'adresse email est requise';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'L\'adresse email est invalide';
    }
    
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userData = {
        name: username,
        email: email,
        password: password,
        role: role // AllowMultiple le rôle
      };
      
      const newUser = await register(userData);
      if (newUser) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cette adresse email est déjà utilisée ou une erreur est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthLayout 
      title="Créer un compte"
      subtitle="Créez votre compte pour commencer à apprendre"
    >
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="auth-divider">
        <span>ou</span>
      </div>
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <FiUser />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isInvalid={!!validationErrors.username}
            />
          </InputGroup>
          {validationErrors.username && (
            <Form.Text className="text-danger">
              {validationErrors.username}
            </Form.Text>
          )}
        </Form.Group>
        
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
              isInvalid={!!validationErrors.email}
            />
          </InputGroup>
          {validationErrors.email && (
            <Form.Text className="text-danger">
              {validationErrors.email}
            </Form.Text>
          )}
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label className="text-muted mb-2">
            <strong>Je suis un(e) :</strong>
          </Form.Label>
          <div className="d-flex gap-3">
            <Form.Check
              type="radio"
              id="student-role"
              name="role"
              value="student"
              checked={role === 'student'}
              onChange={(e) => setRole(e.target.value)}
              label="Étudiant"
              className="role-option"
            />
            <Form.Check
              type="radio"
              id="teacher-role"
              name="role"
              value="teacher"
              checked={role === 'teacher'}
              onChange={(e) => setRole(e.target.value)}
              label="Enseignant"
              className="role-option"
            />
          </div>
        </Form.Group>
        
        <Form.Group className="mb-4">
          <InputGroup className="password-input-group">
            <InputGroup.Text>
              <FiLock />
            </InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isInvalid={!!validationErrors.password}
            />
            <div 
              className="password-toggle-icon" 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </div>
          </InputGroup>
          {validationErrors.password && (
            <Form.Text className="text-danger">
              {validationErrors.password}
            </Form.Text>
          )}
        </Form.Group>
        
        <Button 
          type="submit" 
          className="auth-submit-btn" 
          disabled={isLoading}
        >
          {isLoading ? 'Création en cours...' : 'Créer mon compte'}
        </Button>
      </Form>
      
      <div className="auth-form-footer">
        Vous avez déjà un compte ? <Link to="/login">Se connecter</Link>
      </div>
      
      <div className="text-center mt-3">
        <Link to="/home" className="text-decoration-none">
          Continuer sans compte
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;
