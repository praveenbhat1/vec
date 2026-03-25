import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DashboardMain from './DashboardMain';
import ResourceInventory from './pages/ResourceInventory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardMain />} />
        <Route path="/resources" element={<ResourceInventory />} />
        {/* Redirect /login to /dashboard for now as per user request to test navigation */}
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
