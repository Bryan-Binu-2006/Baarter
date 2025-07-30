import React, { useState, useEffect } from 'react';
import { LogOut, ArrowLeft, Bell, Coins } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCommunity } from '../contexts/CommunityContext';
import BarterRequestsModal from './BarterRequestsModal';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/notificationService';
import { getBalance, addCoins, COIN_PRICE_RUPEES } from '../services/coinService';

export function Navigation() {
  const { user, logout } = useAuth();
  const { selectedCommunity, selectCommunity } = useCommunity();
  const [showRequests, setShowRequests] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showBuyCoins, setShowBuyCoins] = useState(false);
  const [buyAmount, setBuyAmount] = useState(10);
  const [buyLoading, setBuyLoading] = useState(false);
  const [coinBalance, setCoinBalance] = useState(user ? getBalance(user.id) : 0);

  useEffect(() => {
    setUnreadCount(notificationService.getUnreadCount());
    const interval = setInterval(() => {
      setUnreadCount(notificationService.getUnreadCount());
    }, 2000);
    // Listen for openBuyCoinsModal event
    const openBuyCoinsListener = () => setShowBuyCoins(true);
    window.addEventListener('openBuyCoinsModal', openBuyCoinsListener);
    return () => {
      clearInterval(interval);
      window.removeEventListener('openBuyCoinsModal', openBuyCoinsListener);
    };
  }, []);

  useEffect(() => {
    if (user) setCoinBalance(getBalance(user.id));
  }, [user]);

  const handleLogout = () => {
    logout();
    selectCommunity(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedCommunityId');
  };

  const handleBackToCommunities = () => {
    selectCommunity(null);
  };

  const handleBuyCoins = () => {
    if (!user) return;
    setBuyLoading(true);
    setTimeout(() => {
      addCoins(user.id, buyAmount);
      setCoinBalance(getBalance(user.id));
      setBuyLoading(false);
      setShowBuyCoins(false);
    }, 1000);
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
                {/* Barter Requests Button */}
                <button
                  onClick={() => setShowRequests(true)}
                  className="flex items-center space-x-1 text-sm text-emerald-600 hover:text-emerald-800 transition-colors ml-2"
                  title="View Barter Requests"
                >
                  <span>Requests</span>
                </button>
                <BarterRequestsModal open={showRequests} onClose={() => setShowRequests(false)} />
                {/* Notification Bell */}
                <button
                  onClick={() => setShowNotifications(true)}
                  className="relative flex items-center text-gray-500 hover:text-emerald-600 transition-colors ml-2"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>
                  )}
                </button>
                <NotificationCenter open={showNotifications} onClose={() => setShowNotifications(false)} />
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
              {/* Coin Balance */}
              <span className="flex items-center ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                <Coins size={16} className="mr-1" />
                {coinBalance} Coins
              </span>
              <button
                onClick={() => setShowBuyCoins(true)}
                className="ml-2 px-2 py-1 bg-emerald-500 text-white rounded hover:bg-emerald-600 text-xs font-semibold"
              >
                Buy Coins
              </button>
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
      {/* Buy Coins Modal */}
      {showBuyCoins && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
            <button onClick={() => setShowBuyCoins(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">&times;</button>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Buy Barter Coins</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">How many coins do you want to buy?</label>
              <input
                type="number"
                min={1}
                value={buyAmount}
                onChange={e => setBuyAmount(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="mb-4 text-sm text-gray-700">
              <span className="font-semibold">1 Coin = 2 Rupees</span> (Demo only, no real payment)
            </div>
            <div className="mb-6 text-lg font-bold text-emerald-700">
              Total: {buyAmount} Coins = {buyAmount * COIN_PRICE_RUPEES} Rupees
            </div>
            <button
              onClick={handleBuyCoins}
              disabled={buyLoading || buyAmount < 1}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {buyLoading ? 'Processing...' : `Buy ${buyAmount} Coins`}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}