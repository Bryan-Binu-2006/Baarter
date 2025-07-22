export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  // Profile fields
  fullName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  bio?: string;
  isProfileComplete?: boolean;
  trustScore?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}