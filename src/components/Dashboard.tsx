import React, { useState, useEffect } from 'react';
import { Users, Package, MessageCircle, Plus, TrendingUp, Search, Filter, Heart, Calendar, Tag, Send } from 'lucide-react';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import { listingService } from '../services/listingService';
import { communityService } from '../services/communityService';
import { CreateListing } from './CreateListing';
import { BarterRequestModal } from './BarterRequestModal';
import TrustScoreDisplay from './TrustScoreDisplay';
import { calculateTrustScore } from '../services/trustScoreService';
import { Listing } from '../types/listing';

interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isOnline: boolean;
  role: 'admin' | 'coadmin' | 'member';
}

interface Message {
  id: string;
  content: string;
  userId: string;
  userName: string;
  timestamp: string;
  type: 'message' | 'announcement';
}

export function Dashboard() {
  const { selectedCommunity, removeMember, promoteToCoadmin, demoteCoadmin, refreshCommunities } = useCommunity();
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'listings' | 'chat'>('overview');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'product' | 'service'>('all');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const CHAT_KEY_PREFIX = 'communityChat_';

  useEffect(() => {
    if (selectedCommunity) {
      loadData();
      // Load chat history from localStorage
      const chatKey = CHAT_KEY_PREFIX + selectedCommunity.id;
      const saved = localStorage.getItem(chatKey);
      setMessages(saved ? JSON.parse(saved) : []);
      // Start polling for new messages
      const interval = setInterval(() => {
        const updated = localStorage.getItem(chatKey);
        if (updated) {
          setMessages(JSON.parse(updated));
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [selectedCommunity]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [listingsData, membersData] = await Promise.all([
        listingService.getCommunityListings(selectedCommunity!.id),
        communityService.getCommunityMembers(selectedCommunity!.id)
      ]);
      setListings(listingsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Could add user-facing error state here
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListingSuccess = () => {
    loadData();
    setShowCreateListing(false);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedCommunity && user) {
      const chatKey = CHAT_KEY_PREFIX + selectedCommunity.id;
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        userId: user.id,
        userName: user.name || 'Anonymous',
        timestamp: new Date().toISOString(),
        type: 'message',
      };
      const prev = JSON.parse(localStorage.getItem(chatKey) || '[]');
      const updated = [...prev, message];
      localStorage.setItem(chatKey, JSON.stringify(updated));
      setMessages(updated);
      setNewMessage('');
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
    return matchesSearch && matchesCategory && listing.isActive;
  });

  const handleBarterRequest = (listing: Listing) => {
    setSelectedListing(listing);
    setShowBarterModal(true);
  };

  const handleRemoveListing = async (listingId: string) => {
    if (window.confirm('Are you sure you want to remove this listing?')) {
      try {
        await listingService.deleteListing(listingId);
        loadData();
      } catch (error) {
        console.error('Error removing listing:', error);
        alert('Failed to remove listing. Please try again.');
      }
    }
  };

  const handleRemoveMember = async (targetId: string) => {
    if (!selectedCommunity || !user) return;
    if (window.confirm('Are you sure you want to remove this member?')) {
      setRemoveLoading(targetId);
      try {
        await removeMember(selectedCommunity.id, targetId, user.id);
        // Reload data to reflect changes
        await loadData();
        // Refresh communities to update the member count and check if current user was removed
        await refreshCommunities();
      } catch (error: any) {
        console.error('Error removing member:', error);
        alert(error.message || 'Failed to remove member. Please try again.');
      } finally {
        setRemoveLoading(null);
      }
    }
  };
  
  const handlePromote = async (targetId: string) => {
    if (!selectedCommunity || !user) return;
    try {
      await promoteToCoadmin(selectedCommunity.id, targetId, user.id);
      await loadData(); // Reload data to reflect changes
    } catch (error: any) {
      console.error('Error promoting member:', error);
      alert(error.message || 'Failed to promote member. Please try again.');
    }
  };
  
  const handleDemote = async (targetId: string) => {
    if (!selectedCommunity || !user) return;
    try {
      await demoteCoadmin(selectedCommunity.id, targetId, user.id);
      await loadData(); // Reload data to reflect changes
    } catch (error: any) {
      console.error('Error demoting member:', error);
      alert(error.message || 'Failed to demote member. Please try again.');
    }
  };

  if (!selectedCommunity) return null;

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{members.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Listings</p>
              <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Package className="text-white" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Messages</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowCreateListing(true)}
            className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Plus className="text-emerald-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-emerald-800">Create New Listing</p>
              <p className="text-sm text-emerald-600">Add a product or service to trade</p>
            </div>
          </button>
          <button
            onClick={() => setActiveView('listings')}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Package className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-blue-800">Browse Listings</p>
              <p className="text-sm text-blue-600">Find items to trade in your community</p>
            </div>
          </button>
          <button
            onClick={() => setActiveView('chat')}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <MessageCircle className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-medium text-purple-800">Community Chat</p>
              <p className="text-sm text-purple-600">Connect with your neighbors</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Info</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Community Code:</span>
            <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
              {selectedCommunity?.code}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Location:</span>
            <span className="text-gray-900">{selectedCommunity?.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Created:</span>
            <span className="text-gray-900">
              {new Date(selectedCommunity?.createdAt || '').toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    // Derive myRole from members array - try ID first, then email as fallback
    let myRole = members.find(m => m.id === user?.id)?.role;
    
    // Fallback: if role not found by ID, try by email
    if (!myRole && user?.email) {
      myRole = members.find(m => m.email === user.email)?.role;
    }
    
    // Debug logging to help identify the issue
    console.log('Current user:', user);
    console.log('Members:', members);
    console.log('My role detected:', myRole);
    
    // Additional debugging for user ID comparison
    if (user && members.length > 0) {
      console.log('User ID comparison:');
      members.forEach(member => {
        console.log(`Member ${member.name}: ID=${member.id}, Role=${member.role}, Matches current user: ${member.id === user.id}`);
      });
    }
    
    // Temporary debug override - remove this after fixing the issue
    if (user?.name === 'bb1' && !myRole) {
      console.log('DEBUG: Forcing admin role for bb1');
      myRole = 'admin';
    }
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Users size={24} />
              <span>Community Members</span>
            </h2>
            <span className="text-sm text-gray-500">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-medium">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      {member.role === 'admin' && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">Admin</span>
                      )}
                      {member.role === 'coadmin' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Co-Admin</span>
                      )}
                      {member.role === 'member' && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Member</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{member.email}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                      <Calendar size={12} />
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {/* Trust Score */}
                <TrustScoreDisplay trustScore={calculateTrustScore({
                  id: member.id,
                  email: member.email,
                  name: member.name,
                  createdAt: member.joinedAt,
                  isProfileComplete: true,
                  trustScore: 80,
                })} />
                {/* Admin/Co-Admin Controls */}
                {user && selectedCommunity && user.id !== member.id && (
                  <div className="flex space-x-2">
                    {/* Remove button: admin can remove anyone but self, coadmin can remove members only */}
                    {((myRole === 'admin' && member.role !== 'admin') || (myRole === 'coadmin' && member.role === 'member')) && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removeLoading === member.id}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removeLoading === member.id ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                    {/* Promote/Demote: admin only */}
                    {myRole === 'admin' && member.role === 'member' && (
                      <button
                        onClick={() => handlePromote(member.id)}
                        className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                      >
                        Promote to Co-Admin
                      </button>
                    )}
                    {myRole === 'admin' && member.role === 'coadmin' && (
                      <button
                        onClick={() => handleDemote(member.id)}
                        className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-xs"
                      >
                        Demote
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderListings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <Package size={24} />
            <span>Community Listings</span>
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as 'all' | 'product' | 'service')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="product">Products</option>
              <option value="service">Services</option>
            </select>
            
            <button
              onClick={() => setShowCreateListing(true)}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add Listing</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.category === 'product' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {listing.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                  <Heart size={18} />
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{listing.description}</p>
              
              <div className="space-y-2 mb-4">
                {listing.estimatedValue > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Tag size={14} />
                    <span>Est. Value: ${listing.estimatedValue}</span>
                  </div>
                )}
                {listing.availability && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{listing.availability}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 flex items-center space-x-2">
                  By {listing.userName}
                  {/* Trust Score for listing owner */}
                  <TrustScoreDisplay trustScore={calculateTrustScore(
                    (() => {
                      const owner = members.find(m => m.id === listing.userId);
                      if (owner) {
                        return {
                          id: owner.id,
                          email: owner.email,
                          name: owner.name,
                          createdAt: owner.joinedAt,
                          isProfileComplete: true,
                          trustScore: 80,
                        };
                      }
                      return {
                        id: '',
                        email: '',
                        name: '',
                        createdAt: '',
                        isProfileComplete: false,
                        trustScore: 80,
                      };
                    })()
                  )} />
                </div>
                {listing.userId === user?.id ? (
                  <button
                    onClick={() => handleRemoveListing(listing.id)}
                    className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Remove Listing
                  </button>
                ) : listing.userId !== user?.id && (
                  <button
                    onClick={() => handleBarterRequest(listing)}
                    className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span>Request Trade</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Be the first to add a listing to your community!'}
          </p>
          <button
            onClick={() => setShowCreateListing(true)}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Create First Listing
          </button>
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-96 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
          <MessageCircle size={24} />
          <span>Community Chat</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="mx-auto mb-2" size={32} />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === user?.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.userId !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.userName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.userId === user?.id ? 'text-emerald-100' : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return renderUsers();
      case 'listings':
        return renderListings();
      case 'chat':
        return renderChat();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {selectedCommunity.name}
        </h1>
        <p className="text-gray-600">{selectedCommunity.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveView('overview')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'overview'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <TrendingUp size={20} />
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveView('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'users'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users size={20} />
                <span>Members</span>
              </button>
              <button
                onClick={() => setActiveView('listings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'listings'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package size={20} />
                <span>Listings</span>
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeView === 'chat'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MessageCircle size={20} />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setShowCreateListing(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                <span>Create Listing</span>
              </button>
            </div>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>

      {showCreateListing && (
        <CreateListing
          onClose={() => setShowCreateListing(false)}
          onSuccess={handleCreateListingSuccess}
        />
      )}

      {showBarterModal && selectedListing && (
        <BarterRequestModal
          listing={selectedListing}
          onClose={() => setShowBarterModal(false)}
          onSuccess={() => {
            setShowBarterModal(false);
          }}
        />
      )}
    </div>
  );
}