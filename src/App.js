// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext'; // Importing useAuth here
import { AuthCheck } from './components/AuthCheck'; // Auth validation logic
import { BackgroundScanProvider } from './components/BackgroundScanContext';
import { PersistentScanStatus } from './components/PersistentScanStatus';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';
import ScanResultsPage from './components/ScanResultsPage';
import ModifyProjectForm from './components/ModifyProjectForm';
import ProjectModificationHistory from './components/ProjectModificationHistory'
import ShareProjectsForm from './components/ShareProjectsForm';
import ScanHistoryPage from './components/ScanHistoryPage'; 

import './index.css';



const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();
  
  // Wrap the protected content with BackgroundScanProvider only if user is authenticated
  if (user) {
    return (
      <BackgroundScanProvider>
        {element}
        <PersistentScanStatus />
      </BackgroundScanProvider>
    );
  }
  
  return <Navigate to="/dashboard" />;
};

// Layout component to wrap authenticated routes with BackgroundScanProvider
const AuthenticatedLayout = ({ children }) => {
  return (
    <BackgroundScanProvider>
      {children}
      <PersistentScanStatus />
    </BackgroundScanProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Base URL redirect */}
          <Route path="/" element={<ProtectedRoute element={<LoginForm />} />} />
          {/* Login route */}
          <Route path="/login" element={<AuthCheck><LoginForm /></AuthCheck>} />
          {/* Dashboard route */}
          <Route path="/dashboard" element={<AuthCheck><AuthenticatedLayout><Dashboard /></AuthenticatedLayout></AuthCheck>} />
          <Route path="/scan-results/:projectId" element={<AuthCheck><AuthenticatedLayout><ScanResultsPage /></AuthenticatedLayout></AuthCheck>} />
          <Route path="/modify-project/:projectId" element={<AuthCheck><AuthenticatedLayout><ModifyProjectForm /></AuthenticatedLayout></AuthCheck>} />
          <Route path="/modify-history/:projectId" element={<AuthCheck><AuthenticatedLayout><ProjectModificationHistory /></AuthenticatedLayout></AuthCheck>} />
          <Route path="/share-projects" element={<AuthCheck><AuthenticatedLayout><ShareProjectsForm /></AuthenticatedLayout></AuthCheck>} />
          <Route path="/scan-history/:projectId" element={<ScanHistoryPage />} />
          
          {/* Redirect any undefined routes to login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

