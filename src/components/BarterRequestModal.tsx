import React, { useState } from 'react';
import { X, Send, Package, MessageCircle, Check, AlertCircle } from 'lucide-react';
import { barterService } from '../services/barterService';
import { Listing } from '../types/listing';

interface BarterRequestModalProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export function BarterRequestModal({ listing, onClose, onSuccess }: BarterRequestModalProps) {
  const [step, setStep] = useState<'offer' | 'sending' | 'success'>('offer');
  const [offerDescription, setOfferDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [offerValue, setOfferValue] = useState<number | ''>('');
  const [offerType, setOfferType] = useState<'product' | 'service' | ''>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerDescription.trim() || offerValue === '' || !offerType) return;
    setLoading(true);
    setError('');
    setStep('sending');
    try {
      await barterService.createBarterRequest({
        listingId: listing.id,
        offerDescription: offerDescription.trim(),
        offerValue: Number(offerValue),
        offerType: offerType as 'product' | 'service',
      });
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send barter request');
      setStep('offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <MessageCircle size={24} />
              <span>Request Barter</span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'offer' && (
            <>
              {/* Listing Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Package size={20} className="text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{listing.title}</h3>
                    <p className="text-sm text-gray-600">by {listing.userName}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{listing.description}</p>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.category === 'product' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {listing.category}
                  </span>
                  <span>Est. Value: ${listing.estimatedValue}</span>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle size={20} className="text-red-600" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What do you offer in exchange?
                  </label>
                  <textarea
                    value={offerDescription}
                    onChange={(e) => setOfferDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Describe what you're offering in exchange for this item/service. Be specific about the value, condition, or details of your offer..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {offerDescription.length}/500 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is the estimated value of your offer?
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={offerValue}
                    onChange={e => setOfferValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g. 50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Is your offer a product or a service?
                  </label>
                  <select
                    value={offerType}
                    onChange={e => setOfferType(e.target.value as 'product' | 'service')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Send your barter request with your offer</li>
                    <li>2. If accepted, you'll get a private chat to negotiate</li>
                    <li>3. Both parties confirm the final agreement</li>
                    <li>4. Meet in person to exchange items/services</li>
                    <li>5. Use the confirmation code to complete the barter</li>
                  </ol>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !offerDescription.trim() || offerValue === '' || !offerType}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    <Send size={18} />
                    <span>{loading ? 'Sending...' : 'Send Request'}</span>
                  </button>
                </div>
              </form>
            </>
          )}

          {step === 'sending' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sending your request...</h3>
              <p className="text-gray-600">Please wait while we process your barter request.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request sent successfully!</h3>
              <p className="text-gray-600 mb-4">
                {listing.userName} will be notified of your barter request. You'll receive a notification when they respond.
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-800">
                  Check your dashboard for updates on this and other barter requests.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}