import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import des composants et services
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Import styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/global.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

