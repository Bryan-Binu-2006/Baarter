export interface BarterRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  ownerId: string;
  ownerName: string;
  offerDescription: string;
  offerValue: number;
  offerType: 'product' | 'service';
  status: 'pending' | 'owner_accepted' | 'both_accepted' | 'rejected' | 'completed';
  ownerConfirmationCode?: string;
  requesterConfirmationCode?: string;
  ownerConfirmed?: boolean;
  requesterConfirmed?: boolean;
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
  offerValue: number;
  offerType: 'product' | 'service';
}