import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage3D from './LandingPage3D';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import AgriModule from './AgriModule';
import LandModule from './LandModule';
import EducationModule from './EducationModule';
import FinanceModule from './FinanceModule';
import RegistryExplorer from './RegistryExplorer';
import Profile from './Profile';
import MinerModule from './MinerModule';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem('user');
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage3D />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/agri" element={<ProtectedRoute><AgriModule /></ProtectedRoute>} />
        <Route path="/land" element={<ProtectedRoute><LandModule /></ProtectedRoute>} />
        <Route path="/education" element={<ProtectedRoute><EducationModule /></ProtectedRoute>} />
        <Route path="/finance" element={<ProtectedRoute><FinanceModule /></ProtectedRoute>} />
        <Route path="/explorer" element={<ProtectedRoute><RegistryExplorer /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/miner" element={<ProtectedRoute><MinerModule /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
