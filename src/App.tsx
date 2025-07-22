import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CommunityProvider } from './contexts/CommunityContext';
import { Navigation } from './components/Navigation';
import { AuthForm } from './components/AuthForm';
import { CommunitySelector } from './components/CommunitySelector';
import { Dashboard } from './components/Dashboard';
import { useAuth } from './hooks/useAuth';
import { useCommunity } from './hooks/useCommunity';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const { selectedCommunity } = useCommunity();
  const [currentView, setCurrentView] = useState<'auth' | 'community' | 'dashboard'>('auth');

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('auth');
    } else if (!selectedCommunity) {
      setCurrentView('community');
    } else {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated, selectedCommunity]);

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
    <AuthProvider>
      <CommunityProvider>
        <AppContent />
      </CommunityProvider>
    </AuthProvider>
  );
}

export default App;