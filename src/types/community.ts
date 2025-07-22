export interface Community {
  id: string;
  name: string;
  location: string;
  description: string;
  code: string;
  createdAt: string;
  createdBy: string;
  memberCount: number;
}

export interface CreateCommunityData {
  name: string;
  location: string;
  description: string;
}

export interface CommunityMember {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  isAdmin: boolean;
  isOnline: boolean;
}