import React, { useState } from 'react';
import { Plus, Users, MapPin, Hash, ArrowRight, Home } from 'lucide-react';
import { useCommunity } from '../contexts/CommunityContext';

export function CommunitySelector() {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { createCommunity, joinCommunity, userCommunities, selectCommunity } = useCommunity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'join') {
        await joinCommunity(formData.code);
      } else {
        await createCommunity({
          name: formData.name,
          location: formData.location,
          description: formData.description
        });
      }
      // Reset form
      setFormData({ name: '', location: '', description: '', code: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectCommunity = (community: any) => {
    selectCommunity(community);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Baarter
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join or create a community to start bartering with your neighbors. 
          Trade goods and services without money in your local area.
        </p>
      </div>

      {userCommunities.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center space-x-2">
                  <Home size={28} />
                  <span>Your Communities</span>
                </h2>
                <p className="text-gray-600 mt-2">Select a community to enter</p>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {userCommunities.length} {userCommunities.length === 1 ? 'community' : 'communities'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCommunities.map((community) => (
                <div 
                  key={community.id} 
                  className="group relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-200 hover:shadow-md cursor-pointer"
                  onClick={() => handleSelectCommunity(community)}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                          <Users className="text-emerald-600" size={28} />
                        </div>
                      </div>
                      <ArrowRight className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={20} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{community.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{community.location}</span>
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">{community.description}</p>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-gray-500">
                          {community.memberCount} members
                        </span>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-mono font-medium">
                          {community.code}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-8 border-b border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {userCommunities.length > 0 ? 'Join Another Community' : 'Get Started'}
            </h2>
            <p className="text-gray-600">
              {userCommunities.length > 0 
                ? 'Expand your network by joining additional communities'
                : 'Create your first community or join an existing one to start bartering'
              }
            </p>
          </div>
        </div>

        <div className="p-8">
          <div className="flex space-x-1 mb-8">
            <button
              onClick={() => setActiveTab('join')}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'join'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Hash size={20} />
                <span>Join Community</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex-1 py-4 px-6 rounded-xl font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Plus size={20} />
                <span>Create Community</span>
              </div>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'join' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Community Code
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                    placeholder="Enter community code (e.g., ABC123)"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Ask a community member for the code to join their group
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Community Name
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                      placeholder="Enter community name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg"
                      placeholder="Enter location (e.g., Downtown Seattle, WA)"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg resize-none"
                    placeholder="Describe your community and what makes it special"
                    required
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {activeTab === 'join' ? <Hash size={20} /> : <Plus size={20} />}
                  <span>{activeTab === 'join' ? 'Join Community' : 'Create Community'}</span>
                </>
              )}
            </button>
          </form>

          {activeTab === 'create' && (
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-3">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="font-medium">1.</span>
                  <span>Your community will be created with a unique code</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium">2.</span>
                  <span>Share the code with neighbors to invite them</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="font-medium">3.</span>
                  <span>Start creating listings and trading with your community</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}