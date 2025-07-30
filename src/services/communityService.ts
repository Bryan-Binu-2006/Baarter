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
    const newMembership = {
      userId: currentUser.id,
      communityId: mockCommunity.id,
      role: 'admin',
      joinedAt: new Date().toISOString()
    };
    userMemberships.push(newMembership);
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));
    
    console.log('createCommunity - currentUser:', currentUser);
    console.log('createCommunity - newMembership:', newMembership);
    console.log('createCommunity - all userMemberships:', userMemberships);

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

    // Check if banned
    const bannedKey = `banned_${community.id}`;
    const banned = JSON.parse(localStorage.getItem(bannedKey) || '[]');
    if (banned.includes(currentUser.id)) {
      throw new Error('You have been removed from this community and cannot rejoin.');
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
      role: 'member',
      joinedAt: new Date().toISOString()
    });
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));

    // Update member count
    const communityMembers = userMemberships.filter((m: any) => m.communityId === community.id);
    community.memberCount = communityMembers.length;
    localStorage.setItem('allCommunities', JSON.stringify(allCommunities));

    return community;
  }

  async getCommunityMembers(communityId: string): Promise<CommunityMember[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    
    console.log('getCommunityMembers - allUsers:', allUsers);
    console.log('getCommunityMembers - userMemberships:', userMemberships);
    console.log('getCommunityMembers - communityId:', communityId);
    
    const communityMemberships = userMemberships.filter((m: any) => m.communityId === communityId);
    
    console.log('getCommunityMembers - communityMemberships:', communityMemberships);
    
    const members: CommunityMember[] = communityMemberships.map((membership: any) => {
      const user = allUsers.find((u: any) => u.id === membership.userId);
      console.log('getCommunityMembers - mapping membership:', membership, 'to user:', user);
      return {
        id: membership.userId, // Use the membership userId as the member id
        name: user?.name || 'Unknown User',
        email: user?.email || 'unknown@example.com',
        joinedAt: membership.joinedAt,
        role: membership.role || (membership.isAdmin ? 'admin' : 'member'),
        isOnline: Math.random() > 0.5 // Random online status for demo
      };
    });

    console.log('getCommunityMembers - final members:', members);
    return members;
  }

  async removeMember(communityId: string, targetUserId: string, actingUserId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for consistency
    
    console.log('removeMember called with:', { communityId, targetUserId, actingUserId });
    
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    const acting = userMemberships.find((m: any) => m.userId === actingUserId && m.communityId === communityId);
    const target = userMemberships.find((m: any) => m.userId === targetUserId && m.communityId === communityId);
    
    console.log('Found memberships:', { acting, target });
    
    if (!acting) throw new Error('You are not a member of this community');
    if (!target) throw new Error('Target user is not a member of this community');
    
    // Check permissions
    if (acting.role === 'admin') {
      // Admin can remove anyone except themselves
      if (targetUserId === actingUserId) throw new Error('Admin cannot remove themselves');
    } else if (acting.role === 'coadmin') {
      // Coadmin can remove members only
      if (target.role !== 'member') throw new Error('Coadmin can only remove regular members');
    } else {
      throw new Error('Insufficient permissions to remove members');
    }
    
    // Remove from memberships
    const updated = userMemberships.filter((m: any) => !(m.userId === targetUserId && m.communityId === communityId));
    localStorage.setItem('userMemberships', JSON.stringify(updated));
    
    // Add to banned list
    const bannedKey = `banned_${communityId}`;
    const banned = JSON.parse(localStorage.getItem(bannedKey) || '[]');
    if (!banned.includes(targetUserId)) {
      banned.push(targetUserId);
      localStorage.setItem(bannedKey, JSON.stringify(banned));
    }
    
    // Remove all listings by this user in this community
    const allListings = JSON.parse(localStorage.getItem('communityListings') || '[]');
    const filteredListings = allListings.filter((listing: any) => !(listing.userId === targetUserId && listing.communityId === communityId));
    localStorage.setItem('communityListings', JSON.stringify(filteredListings));
    
    // Update member count in community
    const allCommunities = JSON.parse(localStorage.getItem('allCommunities') || '[]');
    const communityIndex = allCommunities.findIndex((c: any) => c.id === communityId);
    if (communityIndex !== -1) {
      const communityMembers = updated.filter((m: any) => m.communityId === communityId);
      allCommunities[communityIndex].memberCount = communityMembers.length;
      localStorage.setItem('allCommunities', JSON.stringify(allCommunities));
    }
    
    console.log('Member removed successfully');
  }

  async promoteToCoadmin(communityId: string, targetUserId: string, actingUserId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for consistency
    
    console.log('promoteToCoadmin called with:', { communityId, targetUserId, actingUserId });
    
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    const acting = userMemberships.find((m: any) => m.userId === actingUserId && m.communityId === communityId);
    const target = userMemberships.find((m: any) => m.userId === targetUserId && m.communityId === communityId);
    
    console.log('Found memberships:', { acting, target });
    
    if (!acting) throw new Error('You are not a member of this community');
    if (!target) throw new Error('Target user is not a member of this community');
    
    if (acting.role !== 'admin') throw new Error('Only admin can promote to coadmin');
    if (target.role === 'admin') throw new Error('Cannot promote admin');
    if (target.role === 'coadmin') throw new Error('User is already a coadmin');
    
    // Update the target's role
    target.role = 'coadmin';
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));
    
    console.log('Member promoted successfully');
  }

  async demoteCoadmin(communityId: string, targetUserId: string, actingUserId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Add delay for consistency
    
    const userMemberships = JSON.parse(localStorage.getItem('userMemberships') || '[]');
    const acting = userMemberships.find((m: any) => m.userId === actingUserId && m.communityId === communityId);
    const target = userMemberships.find((m: any) => m.userId === targetUserId && m.communityId === communityId);
    
    if (!acting) throw new Error('You are not a member of this community');
    if (!target) throw new Error('Target user is not a member of this community');
    
    if (acting.role !== 'admin') throw new Error('Only admin can demote coadmin');
    if (target.role !== 'coadmin') throw new Error('Target is not a coadmin');
    
    // Update the target's role
    target.role = 'member';
    localStorage.setItem('userMemberships', JSON.stringify(userMemberships));
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