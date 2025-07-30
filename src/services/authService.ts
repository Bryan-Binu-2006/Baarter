import { User, LoginCredentials, SignupCredentials, AuthResponse } from '../types/auth';

// Mock API - Replace with actual backend endpoints
const API_BASE = 'http://localhost:5000/api';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!credentials.email || !credentials.password) {
      throw new Error('Invalid credentials');
    }

    // Check if user exists in our "database"
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const existingUser = allUsers.find((u: User) => u.email === credentials.email);
    
    console.log('Login - allUsers:', allUsers);
    console.log('Login - existingUser:', existingUser);
    
    if (!existingUser) {
      throw new Error('User not found. Please sign up first.');
    }

    const mockToken = 'mock-jwt-token-' + Date.now();

    // Store current user session
    localStorage.setItem('currentUser', JSON.stringify(existingUser));
    
    console.log('Login - stored currentUser:', existingUser);
    
    return {
      user: existingUser,
      token: mockToken
    };
  }

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error('Invalid signup data');
    }

    // Check if user already exists
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const existingUser = allUsers.find((u: User) => u.email === credentials.email);
    
    if (existingUser) {
      throw new Error('User already exists. Please login instead.');
    }

    const mockUser: User = {
      id: Date.now().toString(),
      email: credentials.email,
      name: credentials.name,
      createdAt: new Date().toISOString()
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    // Add user to our "database"
    allUsers.push(mockUser);
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    
    // Store current user session
    localStorage.setItem('currentUser', JSON.stringify(mockUser));
    
    return {
      user: mockUser,
      token: mockToken
    };
  }

  async verifyToken(token: string): Promise<User> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    if (token.startsWith('mock-jwt-token-')) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (user.id) {
        return user;
      }
    }

    throw new Error('Invalid token');
  }
}

export const authService = new AuthService();