export interface BarterRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  offerDescription: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  confirmationCode?: string;
  createdAt: string;
  listing: {
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedValue: number;
  };
}

export interface CreateBarterRequestData {
  listingId: string;
  offerDescription: string;
}