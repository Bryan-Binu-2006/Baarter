import { Listing, CreateListingData } from '../types/listing';

const API_BASE = 'http://localhost:5000/api';

class ListingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getCommunityListings(communityId: string): Promise<Listing[]> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get listings from localStorage
    const allListings = JSON.parse(localStorage.getItem('communityListings') || '[]');
    return allListings.filter((listing: Listing) => listing.communityId === communityId);
  }

  async createListing(data: CreateListingData): Promise<Listing> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const mockListing: Listing = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      category: data.category,
      estimatedValue: data.estimatedValue,
      availability: data.availability,
      images: data.images,
      userId: user.id || '1',
      userName: user.name || 'You',
      communityId: data.communityId,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    // Save to localStorage
    const allListings = JSON.parse(localStorage.getItem('communityListings') || '[]');
    allListings.push(mockListing);
    localStorage.setItem('communityListings', JSON.stringify(allListings));

    return mockListing;
  }

  async updateListing(id: string, data: Partial<CreateListingData>): Promise<Listing> {
    // Mock implementation for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would update the listing
    throw new Error('Not implemented');
  }

  async deleteListing(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const allListings = JSON.parse(localStorage.getItem('communityListings') || '[]');
    const updatedListings = allListings.filter((listing: any) => listing.id !== id);
    localStorage.setItem('communityListings', JSON.stringify(updatedListings));
  }
}

export const listingService = new ListingService();