import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LabProvider } from './context/LabContext';

// ***** CRITICAL FIX: Import Axios to configure it globally *****
import axios from 'axios';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetail from './pages/CourseDetail';
import LabPage from './pages/LabPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ProfilePage from './pages/ProfilePage';
import OhmsLawLabStandalone from './pages/OhmsLawLabStandalone';
import LogicGateLabStandalone from './pages/LogicGateLabStandalone';
import ChemistryLabStandalone from './pages/ChemistryLabStandalone';
import CircuitAnalysisLabStandalone from './pages/CircuitAnalysisLabStandalone';
import DoubleSlitLabStandalone from './pages/DoubleSlitLabStandalone';
import PracticePage from './pages/PracticePage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// ***** CRITICAL FIX: Set the base URL for all API requests *****
// This line tells your frontend the address of your backend API on Render.
// It uses the environment variable you set in your frontend's settings on Render.
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

function App() {
  return (
    <AuthProvider>
      <LabProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/courses" element={
                <ProtectedRoute>
                  <CoursesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/course/:id" element={
                <ProtectedRoute>
                  <CourseDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/lab/:courseId/:labId" element={
                <ProtectedRoute>
                  <LabPage />
                </ProtectedRoute>
              } />
              
              <Route path="/teacher-dashboard" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/practice" element={
                <ProtectedRoute>
                  <PracticePage />
                </ProtectedRoute>
              } />
              
              {/* Standalone Lab Routes */}
              <Route path="/ohms-law-lab" element={<OhmsLawLabStandalone />} />
              <Route path="/logic-gate-lab" element={<LogicGateLabStandalone />} />
              <Route path="/chemistry-lab" element={<ChemistryLabStandalone />} />
              <Route path="/circuit-analysis-lab" element={<CircuitAnalysisLabStandalone />} />
              <Route path="/double-slit-lab" element={<DoubleSlitLabStandalone />} />
            </Routes>
            
            {/* Global toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#374151',
                  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </LabProvider>
    </AuthProvider>
  );
}

export default App;
