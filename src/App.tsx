import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { Navigation } from './components/Navigation';
import { AuthForm } from './components/AuthForm';
import { CommunitySelector } from './components/CommunitySelector';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useCommunity } from './hooks/useCommunity';
import ProfileSetup from './components/ProfileSetup';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BarterConfirmPage from './components/BarterConfirmPage';

function AppContent() {
  const { user, isAuthenticated, isProfileComplete } = useAuth();
  const { selectedCommunity } = useCommunity();
  const [currentView, setCurrentView] = useState<'auth' | 'community' | 'dashboard'>('auth');
  const [profileUser, setProfileUser] = useState(user);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('auth');
    } else if (!selectedCommunity) {
      setCurrentView('community');
    } else {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, selectedCommunity]);

  // Show profile setup if authenticated but not complete
  if (isAuthenticated && !isProfileComplete && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
        <main className="container mx-auto px-4 py-8">
          <ProfileSetup user={user} onComplete={() => window.location.reload()} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      {isAuthenticated && <Navigation />}
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'auth' && <AuthForm />}
        {currentView === 'community' && <CommunitySelector />}
        {currentView === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CommunityProvider>
          <Routes>
            <Route path="/confirm-barter/:id" element={<BarterConfirmPage />} />
            <Route path="*" element={<AppContent />} />
          </Routes>
        </CommunityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;