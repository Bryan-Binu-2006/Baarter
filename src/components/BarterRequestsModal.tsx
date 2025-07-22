import React, { useEffect, useState } from 'react';
import { barterService } from '../services/barterService';
import { BarterRequest } from '../types/barter';
import { useAuth } from '../hooks/useAuth';
import BarterChatModal from './BarterChatModal';
import { notificationService } from '../services/notificationService';

interface BarterRequestsModalProps {
  open: boolean;
  onClose: () => void;
}

const BarterRequestsModal: React.FC<BarterRequestsModalProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const [myRequests, setMyRequests] = useState<BarterRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BarterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [codeInputs, setCodeInputs] = useState<{ [id: string]: string }>({});
  const [codeLoading, setCodeLoading] = useState<{ [id: string]: boolean }>({});
  const [codeError, setCodeError] = useState<{ [id: string]: string }>({});
  const [chatRequest, setChatRequest] = useState<BarterRequest | null>(null);
  const [hiddenRequests, setHiddenRequests] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadRequests();
      // Load hidden requests from localStorage
      const hidden = JSON.parse(localStorage.getItem('hiddenBarterRequests') || '[]');
      setHiddenRequests(hidden);
    }
    // eslint-disable-next-line
  }, [open]);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const [mine, incoming] = await Promise.all([
        barterService.getMyRequests(),
        barterService.getRequestsForMyListings(),
      ]);
      setMyRequests(mine);
      setIncomingRequests(incoming);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId: string, accept: boolean) => {
    setLoading(true);
    try {
      const updated = await barterService.respondToRequest(requestId, accept);
      await loadRequests();
      // Notify requester
      if (accept) {
        notificationService.add('barter', `Your barter request for "${updated.listing.title}" was accepted!`);
      } else {
        notificationService.add('barter', `Your barter request for "${updated.listing.title}" was declined.`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  const handleRequesterConfirm = async (requestId: string) => {
    setCodeLoading((prev) => ({ ...prev, [requestId]: true }));
    setCodeError((prev) => ({ ...prev, [requestId]: '' }));
    try {
      const updated = await barterService.requesterConfirm(requestId);
      await loadRequests();
      // Notify both parties
      notificationService.add('barter', `Both parties accepted the barter for "${updated.listing.title}". Chat is now unlocked!`);
    } catch (err: any) {
      setCodeError((prev) => ({ ...prev, [requestId]: err.message || 'Failed to confirm' }));
    } finally {
      setCodeLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleComplete = async (requestId: string, userType: 'owner' | 'requester') => {
    setCodeLoading((prev) => ({ ...prev, [requestId]: true }));
    setCodeError((prev) => ({ ...prev, [requestId]: '' }));
    try {
      const updated = await barterService.completeBarter(requestId, userType, codeInputs[requestId] || '');
      await loadRequests();
      setCodeInputs((prev) => ({ ...prev, [requestId]: '' }));
      if (updated.status === 'completed') {
        notificationService.add('barter', `Barter for "${updated.listing.title}" is completed!`);
      }
    } catch (err: any) {
      setCodeError((prev) => ({ ...prev, [requestId]: err.message || 'Invalid code' }));
    } finally {
      setCodeLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleHideRequest = (id: string) => {
    const updated = [...hiddenRequests, id];
    setHiddenRequests(updated);
    localStorage.setItem('hiddenBarterRequests', JSON.stringify(updated));
  };

  if (!open) return null;

  // Filter out hidden requests
  const visibleIncoming = incomingRequests.filter(req => !hiddenRequests.includes(req.id));
  const visibleMyRequests = myRequests.filter(req => !hiddenRequests.includes(req.id));

  // Helper to render status and actions for a request
  function renderStatus(req: BarterRequest, isOwner: boolean) {
    if (req.status === 'pending') {
      return isOwner ? (
        <>
          <button onClick={() => handleRespond(req.id, true)} className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Accept</button>
          <button onClick={() => handleRespond(req.id, false)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">Decline</button>
        </>
      ) : (
        <span className="text-yellow-600 font-semibold">Pending</span>
      );
    }
    if (req.status === 'owner_accepted') {
      return isOwner ? (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">Share this code with the requester:</div>
          <div className="font-mono text-lg bg-gray-100 rounded px-2 py-1 inline-block mb-1">{req.ownerConfirmationCode}</div>
          <div className="text-xs text-gray-500">Wait for requester to confirm.</div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-500">Your code (give to owner):</div>
          <div className="font-mono text-lg bg-gray-100 rounded px-2 py-1 inline-block mb-1">{req.requesterConfirmationCode}</div>
          <button
            onClick={() => handleRequesterConfirm(req.id)}
            className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            disabled={codeLoading[req.id]}
          >
            {codeLoading[req.id] ? 'Confirming...' : 'Confirm to Proceed'}
          </button>
          {codeError[req.id] && <div className="text-red-600 text-xs mt-1">{codeError[req.id]}</div>}
        </div>
      );
    }
    if (req.status === 'both_accepted' || req.status === 'completed') {
      return (
        <>
          <div className="mb-2">
            <span className="text-green-600 font-semibold">Chat unlocked!</span>
          </div>
          <button
            onClick={() => setChatRequest(req)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Chat
          </button>
        </>
      );
    }
    if (req.status === 'rejected') {
      return <span className="text-red-600 font-semibold">Rejected</span>;
    }
    if (req.status === 'completed') {
      return <span className="text-blue-600 font-semibold">Completed</span>;
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Barter Requests</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 text-center py-8">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Requests for My Listings</h3>
              {visibleIncoming.length === 0 ? (
                <p className="text-gray-500 text-sm">No incoming requests.</p>
              ) : (
                <ul className="space-y-4">
                  {visibleIncoming.map(req => (
                    <li key={req.id} className="border rounded-lg p-4 relative">
                      <button
                        onClick={() => handleHideRequest(req.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        title="Remove request"
                      >
                        &times;
                      </button>
                      <div className="font-medium text-gray-900 mb-1">{req.requesterName} wants to trade for <span className="font-semibold">{req.listing.title}</span></div>
                      <div className="text-gray-700 text-sm mb-2">Offer: {req.offerDescription}</div>
                      <div className="text-xs text-gray-500 mb-2">Requested: {new Date(req.createdAt).toLocaleString()}</div>
                      <div className="flex flex-col space-y-2">
                        {renderStatus(req, true)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">My Sent Requests</h3>
              {visibleMyRequests.length === 0 ? (
                <p className="text-gray-500 text-sm">No sent requests.</p>
              ) : (
                <ul className="space-y-4">
                  {visibleMyRequests.map(req => (
                    <li key={req.id} className="border rounded-lg p-4 relative">
                      <button
                        onClick={() => handleHideRequest(req.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        title="Remove request"
                      >
                        &times;
                      </button>
                      <div className="font-medium text-gray-900 mb-1">You requested <span className="font-semibold">{req.listing.title}</span></div>
                      <div className="text-gray-700 text-sm mb-2">Offer: {req.offerDescription}</div>
                      <div className="text-xs text-gray-500 mb-2">Requested: {new Date(req.createdAt).toLocaleString()}</div>
                      <div className="flex flex-col space-y-2">
                        {renderStatus(req, false)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {chatRequest && (
          <BarterChatModal
            request={chatRequest}
            open={!!chatRequest}
            onClose={() => setChatRequest(null)}
          />
        )}
      </div>
    </div>
  );
};

export default BarterRequestsModal; 