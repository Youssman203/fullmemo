import React from 'react';
import '../assets/auth.css';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      {/* Left side - Image and marketing text */}
      <div className="auth-image-section col-md-6">
        <img 
          src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80" 
          alt="Study background" 
          className="auth-image-bg"
        />
        <div className="auth-image-overlay">
          <div className="auth-marketing-text">
            <h2>Spaced Revision</h2>
            <p>Gérez vos révisions,</p>
            <p>Planifiez vos sessions d'étude,</p>
            <p>Mesurez vos progrès,</p>
            <p>Et progressez à votre rythme !</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="auth-form-section col-md-6">
        <div className="auth-form-container">
          <h1 className="auth-form-title">{title}</h1>
          {subtitle && <p className="auth-form-subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
