import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPlatform from './pages/ChatPlatform';
import OnboardingPage from './pages/OnboardingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import './index.css';

function App() {
  useEffect(() => {
    // Set dark theme on app load
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <ChatProvider>
            <Router>
              <div className="min-h-screen bg-gray-950 text-gray-100">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route 
                    path="/onboarding" 
                    element={
                      <ProtectedRoute>
                        <OnboardingPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat" 
                    element={
                      <ProtectedRoute>
                        <ChatPlatform />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/chat/:conversationId" 
                    element={
                      <ProtectedRoute>
                        <ChatPlatform />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                <Toaster
                  position="top-right"
                  toastOptions={{
                    className: 'bg-gray-800 text-gray-100 border border-gray-700',
                    duration: 4000,
                    style: {
                      background: '#1f2937',
                      color: '#f3f4f6',
                      border: '1px solid #374151'
                    }
                  }}
                />
              </div>
            </Router>
          </ChatProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;