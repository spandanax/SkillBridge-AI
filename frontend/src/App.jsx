import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ProfilePage from './pages/dashboard/ProfilePage';
import AssessmentPage from './pages/dashboard/AssessmentPage';
import SkillGapPage from './pages/dashboard/SkillGapPage';
import RoadmapPage from './pages/dashboard/RoadmapPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import ResourcesPage from './pages/dashboard/ResourcesPage';
import GoalsPage from './pages/dashboard/GoalsPage';
import CareerExplorerPage from './pages/CareerExplorerPage';
import CareerDetailPage from './pages/CareerDetailPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Public landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Career explorer - public */}
          <Route path="/careers" element={<CareerExplorerPage />} />
          <Route path="/careers/:slug" element={<CareerDetailPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          {/* Dashboard - protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="assessment" element={<AssessmentPage />} />
            <Route path="skill-gap" element={<SkillGapPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="resources" element={<ResourcesPage />} />
            <Route path="goals" element={<GoalsPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
