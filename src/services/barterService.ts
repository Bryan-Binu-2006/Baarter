import { BarterRequest, CreateBarterRequestData } from '../types/barter';
import { Listing } from '../types/listing';

const API_BASE = 'http://localhost:5000/api';

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

class BarterService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Helper to get all barter requests from localStorage
  private getAllRequests(): BarterRequest[] {
    return JSON.parse(localStorage.getItem('barterRequests') || '[]');
  }

  // Helper to save all barter requests to localStorage
  private saveAllRequests(requests: BarterRequest[]) {
    localStorage.setItem('barterRequests', JSON.stringify(requests));
  }

  async createBarterRequest(data: CreateBarterRequestData): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    // Get the actual listing from localStorage to get owner info
    const allListings: Listing[] = JSON.parse(localStorage.getItem('communityListings') || '[]');
    const listing = allListings.find(l => l.id === data.listingId);
    if (!listing) throw new Error('Listing not found');
    const ownerId = listing.userId;
    const ownerName = listing.userName;
    const request: BarterRequest = {
      id: Date.now().toString(),
      listingId: data.listingId,
      requesterId: user.id,
      requesterName: user.name,
      ownerId,
      ownerName,
      offerDescription: data.offerDescription,
      offerValue: data.offerValue,
      offerType: data.offerType,
      status: 'pending',
      createdAt: new Date().toISOString(),
      listing: {
        id: listing.id,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        estimatedValue: listing.estimatedValue
      },
    };
    const all = this.getAllRequests();
    all.push(request);
    this.saveAllRequests(all);
    return request;
  }

  async getMyRequests(): Promise<BarterRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.getAllRequests().filter(r => r.requesterId === user.id);
  }

  async getRequestsForMyListings(): Promise<BarterRequest[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return this.getAllRequests().filter(r => r.ownerId === user.id);
  }

  async respondToRequest(requestId: string, accept: boolean): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = this.getAllRequests();
    const idx = all.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');
    if (!accept) {
      all[idx].status = 'rejected';
    } else {
      all[idx].status = 'owner_accepted';
      all[idx].ownerConfirmationCode = generateCode();
      all[idx].requesterConfirmationCode = generateCode();
      all[idx].ownerConfirmed = false;
      all[idx].requesterConfirmed = false;
    }
    this.saveAllRequests(all);
    return all[idx];
  }

  async requesterConfirm(requestId: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = this.getAllRequests();
    const idx = all.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');
    if (all[idx].status === 'owner_accepted') {
      all[idx].status = 'both_accepted';
    }
    this.saveAllRequests(all);
    return all[idx];
  }

  async completeBarter(requestId: string, userType: 'owner' | 'requester', code: string): Promise<BarterRequest> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const all = this.getAllRequests();
    const idx = all.findIndex(r => r.id === requestId);
    if (idx === -1) throw new Error('Request not found');
    const req = all[idx];
    if (userType === 'owner') {
      if (code !== req.requesterConfirmationCode) throw new Error('Invalid confirmation code');
      req.ownerConfirmed = true;
    } else {
      if (code !== req.ownerConfirmationCode) throw new Error('Invalid confirmation code');
      req.requesterConfirmed = true;
    }
    // Mark as completed if both confirmed
    if (req.ownerConfirmed && req.requesterConfirmed) {
      req.status = 'completed';
      // Remove the listing from localStorage
      const allListings = JSON.parse(localStorage.getItem('communityListings') || '[]');
      const updatedListings = allListings.filter((listing: any) => listing.id !== req.listingId);
      localStorage.setItem('communityListings', JSON.stringify(updatedListings));
    }
    this.saveAllRequests(all);
    return req;
  }
}

export const barterService = new BarterService();