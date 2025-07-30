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
  removeMember: (communityId: string, targetUserId: string, actingUserId: string) => Promise<void>;
  promoteToCoadmin: (communityId: string, targetUserId: string, actingUserId: string) => Promise<void>;
  demoteCoadmin: (communityId: string, targetUserId: string, actingUserId: string) => Promise<void>;
  loading: boolean;
}

export const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const refreshCommunities = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const communities = await communityService.getUserCommunities();
      setUserCommunities(communities);
      // If the user is no longer a member or is banned, clear selectedCommunity
      const bannedKey = selectedCommunity ? `banned_${selectedCommunity.id}` : null;
      const banned = bannedKey ? JSON.parse(localStorage.getItem(bannedKey) || '[]') : [];
      const isStillMember = selectedCommunity && communities.some(c => c.id === selectedCommunity.id);
      const isBanned = selectedCommunity && user && banned.includes(user.id);
      if (!isStillMember || isBanned) {
        setSelectedCommunity(null);
        localStorage.removeItem('selectedCommunityId');
      }
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

  const removeMember = async (communityId: string, targetUserId: string, actingUserId: string) => {
    await communityService.removeMember(communityId, targetUserId, actingUserId);
  };
  
  const promoteToCoadmin = async (communityId: string, targetUserId: string, actingUserId: string) => {
    await communityService.promoteToCoadmin(communityId, targetUserId, actingUserId);
  };
  
  const demoteCoadmin = async (communityId: string, targetUserId: string, actingUserId: string) => {
    await communityService.demoteCoadmin(communityId, targetUserId, actingUserId);
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
      removeMember,
      promoteToCoadmin,
      demoteCoadmin,
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