import { Community, CreateCommunityData, CommunityMember } from '../types/community';

const API_BASE = 'http://localhost:5000/api';

class CommunityService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getUserCommunities(): Promise<Community[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) return [];

    // Get all communities and filter by user membership
    const allCommunities = JSON.parse(localStorage.getItem('allCommunities') || '[]');
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    
    const userCommunityIds = userMemberships
      .filter((membership: any) => membership.userId === currentUser.id)
      .map((membership: any) => membership.communityId);

    return allCommunities.filter((community: Community) => 
      userCommunityIds.includes(community.id)
    );
  }

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      throw new Error('User not authenticated');
    }

    const mockCommunity: Community = {
      id: Date.now().toString(),
      name: data.name,
      location: data.location,
      description: data.description,
      code: this.generateCommunityCode(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      memberCount: 1
    };

    // Save community to global storage
    const allCommunities = JSON.parse(localStorage.getItem('allCommunities') || '[]');
    allCommunities.push(mockCommunity);
    localStorage.setItem('allCommunities', JSON.stringify(allCommunities));

    // Add user as admin member
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    userMemberships.push({
      userId: currentUser.id,
      communityId: mockCommunity.id,
      isAdmin: true,
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));

    return mockCommunity;
  }

  async joinCommunity(code: string): Promise<Community> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (code.length < 4) {
      throw new Error('Invalid community code. Please check the code and try again.');
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!currentUser.id) {
      throw new Error('User not authenticated');
    }

    // Find community by code
    const allCommunities = JSON.parse(localStorage.getItem('allCommunities') || '[]');
    const community = allCommunities.find((c: Community) => c.code.toUpperCase() === code.toUpperCase());
    
    if (!community) {
      throw new Error('Community not found. Please check the code and try again.');
    }

    // Check if already a member
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    const existingMembership = userMemberships.find((m: any) => 
      m.userId === currentUser.id && m.communityId === community.id
    );
    
    if (existingMembership) {
      throw new Error('You are already a member of this community.');
    }

    // Add user as member
    userMemberships.push({
      userId: currentUser.id,
      communityId: community.id,
      isAdmin: false,
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));

    // Update member count
    community.memberCount = userMemberships.filter((m: any) => m.communityId === community.id).length;
    localStorage.setItem('allCommunities', JSON.stringify(allCommunities));

    return community;
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    
    const communityMemberships = userMemberships.filter((m: any) => m.communityId === communityId);
    
    const members: CommunityMember[] = communityMemberships.map((membership: any) => {
      const user = allUsers.find((u: any) => u.id === membership.userId);
      return {
        id: user?.id || membership.userId,
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com',
        joinedAt: membership.joinedAt,
        isAdmin: membership.isAdmin,
        isOnline: Math.random() > 0.5 // Random online status for demo
      };
    });

    return members;
  }

  private generateCommunityCode(): string {
    // Generate a 6-character alphanumeric code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Make sure code is unique
    const allCommunities = JSON.parse(localStorage.getItem('allCommunities') || '[]');
    const existingCodes = allCommunities.map((c: Community) => c.code);
    
    if (existingCodes.includes(result)) {
      return this.generateCommunityCode(); // Recursively generate until unique
    }
    
    return result;
  }
}

export const communityService = new CommunityService();