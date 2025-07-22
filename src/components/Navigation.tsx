import React from 'react';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';

export function Navigation() {
  const { user, logout } = useAuth();
  const { selectedCommunity, selectCommunity } = useCommunity();

  const handleLogout = () => {
    logout();
    selectCommunity(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCommunityId');
  };

  const handleBackToCommunities = () => {
    selectCommunity(null);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Baarter
            </h1>
            {selectedCommunity && (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-700 font-medium">{selectedCommunity.name}</span>
                </div>
                <button
                  onClick={handleBackToCommunities}
                  className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  title="Switch community"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Switch</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-medium text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <span className="text-gray-700 font-medium">
                {user?.name || user?.email?.split('@')[0]}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}