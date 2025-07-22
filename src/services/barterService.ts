import { BarterRequest, CreateBarterRequestData } from '../types/barter';

const API_BASE = 'http://localhost:5000/api';

class BarterService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async createBarterRequest(data: CreateBarterRequestData): Promise<BarterRequest> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockRequest: BarterRequest = {
      id: Date.now().toString(),
      listingId: data.listingId,
      requesterId: '1',
      requesterName: 'Demo User',
      ownerId: '2',
      ownerName: 'Bob Smith',
      offerDescription: data.offerDescription,
      status: 'pending',
      createdAt: new Date().toISOString(),
      listing: {
        id: data.listingId,
        title: 'Vintage Bicycle',
        description: 'A beautiful vintage bicycle...',
        category: 'product',
        estimatedValue: 150
      }
    };

    return mockRequest;
  }

  async getMyRequests(): Promise<BarterRequest[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        id: '1',
        listingId: '1',
        requesterId: '1',
        requesterName: 'Demo User',
        ownerId: '2',
        ownerName: 'Bob Smith',
        offerDescription: 'I can offer web design services in exchange for the bicycle.',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        listing: {
          id: '1',
          title: 'Vintage Bicycle',
          description: 'A beautiful vintage bicycle...',
          category: 'product',
          estimatedValue: 150
        }
      }
    ];
  }

  async getRequestsForMyListings(): Promise<BarterRequest[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    return [];
  }

  async respondToRequest(requestId: string, accept: boolean): Promise<BarterRequest> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const confirmationCode = accept ? Math.random().toString(36).substring(2, 8).toUpperCase() : undefined;

    return {
      id: requestId,
      listingId: '1',
      requesterId: '2',
      requesterName: 'Bob Smith',
      ownerId: '1',
      ownerName: 'Demo User',
      offerDescription: 'Guitar lessons in exchange',
      status: accept ? 'accepted' : 'rejected',
      confirmationCode,
      createdAt: new Date().toISOString(),
      listing: {
        id: '1',
        title: 'Web Development Services',
        description: 'Professional web development...',
        category: 'service',
        estimatedValue: 500
      }
    };
  }

  async completeBarter(requestId: string, confirmationCode: string): Promise<BarterRequest> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (confirmationCode.length < 6) {
      throw new Error('Invalid confirmation code');
    }

    return {
      id: requestId,
      listingId: '1',
      requesterId: '1',
      requesterName: 'Demo User',
      ownerId: '2',
      ownerName: 'Bob Smith',
      offerDescription: 'Guitar lessons in exchange',
      status: 'completed',
      confirmationCode,
      createdAt: new Date().toISOString(),
      listing: {
        id: '1',
        title: 'Web Development Services',
        description: 'Professional web development...',
        category: 'service',
        estimatedValue: 500
      }
    };
  }
}

export const barterService = new BarterService();