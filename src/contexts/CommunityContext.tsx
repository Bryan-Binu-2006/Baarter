import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { communityService } from '../services/communityService';
import { Community, CreateCommunityData } from '../types/community';
import { useAuth } from './AuthContext';

interface CommunityContextType {
  selectedCommunity: Community | null;
  userCommunities: Community[];
  createCommunity: (data: CreateCommunityData) => Promise<Community>;
  joinCommunity: (code: string) => Promise<Community>;
  selectCommunity: (community: Community | null) => void;
  refreshCommunities: () => Promise<void>;
  loading: boolean;
}

export const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCommunities = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const communities = await communityService.getUserCommunities();
      setUserCommunities(communities);
      // Don't auto-select community - let user choose
      // This was causing the issue where users were taken directly to dashboard
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshCommunities();
    } else {
      // Clear communities when user logs out
      setUserCommunities([]);
      setSelectedCommunity(null);
    }
  }, [isAuthenticated]);

  const createCommunity = async (data: CreateCommunityData) => {
    const community = await communityService.createCommunity(data);
    setUserCommunities(prev => [...prev, community]);
    setSelectedCommunity(community);
    return community;
  };

  const joinCommunity = async (code: string) => {
    const community = await communityService.joinCommunity(code);
    setUserCommunities(prev => [...prev, community]);
    setSelectedCommunity(community);
    return community;
  };

  const selectCommunity = (community: Community | null) => {
    setSelectedCommunity(community);
    // Store selected community in localStorage for persistence
    if (community) {
      localStorage.setItem('selectedCommunityId', community.id);
    } else {
      localStorage.removeItem('selectedCommunityId');
    }
  };

  // Restore selected community on app load
  useEffect(() => {
    const savedCommunityId = localStorage.getItem('selectedCommunityId');
    if (savedCommunityId && userCommunities.length > 0) {
      const savedCommunity = userCommunities.find(c => c.id === savedCommunityId);
      if (savedCommunity) {
        setSelectedCommunity(savedCommunity);
      }
    }
  }, [userCommunities]);

  return (
    <CommunityContext.Provider value={{
      selectedCommunity,
      userCommunities,
      createCommunity,
      joinCommunity,
      selectCommunity,
      refreshCommunities,
      loading
    }}>
      {children}
    </CommunityContext.Provider>
  );
}

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};