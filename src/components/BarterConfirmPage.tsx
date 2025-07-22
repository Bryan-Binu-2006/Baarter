import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BarterRequest } from '../types/barter';
import { useAuth } from '../hooks/useAuth';
import { barterService } from '../services/barterService';

const BarterConfirmPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [barter, setBarter] = useState<BarterRequest | null>(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      const all = JSON.parse(localStorage.getItem('barterRequests') || '[]');
      const found = all.find((r: BarterRequest) => r.id === id);
      setBarter(found || null);
    }
  }, [id]);

  if (!barter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="text-lg font-semibold text-gray-900 mb-2">Barter not found.</div>
          <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Go Back</button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === barter.ownerId;
  const isRequester = user?.id === barter.requesterId;
  const otherParty = isOwner ? barter.requesterName : barter.ownerName;
  const codeLabel = isOwner ? "Enter the requester's code" : "Enter the owner's code";
  const canConfirm = barter.status === 'both_accepted' && ((isOwner && barter.ownerConfirmed) || (isRequester && barter.requesterConfirmed));
  const isCompleted = barter.status === 'completed';
  const isRejected = barter.status === 'rejected';

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCodeError('');
    try {
      const updated = await barterService.completeBarter(barter.id, isOwner ? 'owner' : 'requester', codeInput.trim());
      setBarter(updated);
      setCodeInput('');
      if (updated.status === 'completed') {
        setSuccess(true);
      }
    } catch (err: any) {
      setCodeError(err.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50">
      <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">Barter Confirmation</h2>
        <div className="mb-4 text-center">
          <div className="text-lg font-semibold text-gray-800">{barter.listing.title}</div>
          <div className="text-sm text-gray-500">with {otherParty}</div>
        </div>
        {isRejected && (
          <div className="text-red-600 font-semibold text-center mb-4">Barter was declined.</div>
        )}
        {isCompleted && (
          <div className="text-blue-600 font-semibold text-center mb-4">Barter completed successfully!</div>
        )}
        {success && (
          <div className="text-green-600 font-semibold text-center mb-4">Barter confirmed! You may now close this page.</div>
        )}
        {!isCompleted && !isRejected && !success && canConfirm && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col items-center">
            <label className="mb-2 text-sm text-gray-700">{codeLabel}</label>
            <input
              type="text"
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              className="border rounded px-3 py-2 text-sm font-mono mb-2"
              placeholder="Enter code..."
              maxLength={8}
              disabled={loading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Confirm Barter'}
            </button>
            {codeError && <div className="text-red-600 text-xs mt-1">{codeError}</div>}
          </form>
        )}
        {!canConfirm && !isCompleted && !isRejected && (
          <div className="text-gray-500 text-center mt-4">Waiting for both parties to accept in chat before confirming.</div>
        )}
        <button onClick={() => navigate(-1)} className="mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 w-full">Back</button>
      </div>
    </div>
  );
};

export default BarterConfirmPage; 