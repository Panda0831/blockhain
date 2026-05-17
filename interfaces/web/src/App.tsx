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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage3D />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agri" element={<AgriModule />} />
        <Route path="/land" element={<LandModule />} />
        <Route path="/education" element={<EducationModule />} />
        <Route path="/finance" element={<FinanceModule />} />
        <Route path="/explorer" element={<RegistryExplorer />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
