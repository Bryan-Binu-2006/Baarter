import React, { useEffect, useRef, useState } from 'react';
import { BarterRequest } from '../types/barter';
import { useAuth } from '../hooks/useAuth';
import { barterService } from '../services/barterService';
import { useNavigate } from 'react-router-dom';

interface BarterChatModalProps {
  request: BarterRequest;
  open: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

const getChatKey = (requestId: string) => `barterChat_${requestId}`;

const BarterChatModal: React.FC<BarterChatModalProps> = ({ request, open, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [barter, setBarter] = useState(request);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(getChatKey(request.id));
      setMessages(saved ? JSON.parse(saved) : []);
      // Always sync latest barter state from localStorage
      const all = JSON.parse(localStorage.getItem('barterRequests') || '[]');
      const latest = all.find((r: any) => r.id === request.id);
      setBarter(latest || request);
      setCodeInput('');
      setCodeError('');
    }
  }, [open, request.id]);

  // Poll for barter state changes (other user action)
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      const all = JSON.parse(localStorage.getItem('barterRequests') || '[]');
      const latest = all.find((r: any) => r.id === request.id);
      if (latest) setBarter(latest);
    }, 1500);
    return () => clearInterval(interval);
  }, [open, request.id]);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || barter.status === 'rejected') return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      senderName: user?.name || 'You',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const newMessages = [...messages, msg];
    setMessages(newMessages);
    localStorage.setItem(getChatKey(request.id), JSON.stringify(newMessages));
    setInput('');
  };

  // Accept/Decline logic
  const isOwner = user?.id === barter.ownerId;
  const isRequester = user?.id === barter.requesterId;
  const hasAccepted = (isOwner && barter.ownerConfirmed) || (isRequester && barter.requesterConfirmed);
  const hasDeclined = barter.status === 'rejected';
  const canDecide = barter.status === 'both_accepted' && !hasAccepted && !hasDeclined;

  const handleAccept = async () => {
    // Mark this user's confirmation as true
    const all = JSON.parse(localStorage.getItem('barterRequests') || '[]');
    const idx = all.findIndex((r: any) => r.id === barter.id);
    if (idx !== -1) {
      const updated = { ...all[idx] };
      if (isOwner) updated.ownerConfirmed = true;
      if (isRequester) updated.requesterConfirmed = true;
      all[idx] = updated;
      localStorage.setItem('barterRequests', JSON.stringify(all));
      setBarter(updated);
    }
  };

  const handleDecline = async () => {
    // Mark barter as rejected
    const all = JSON.parse(localStorage.getItem('barterRequests') || '[]');
    const idx = all.findIndex((r: any) => r.id === barter.id);
    if (idx !== -1) {
      const updated = { ...all[idx], status: 'rejected' as const };
      all[idx] = updated;
      localStorage.setItem('barterRequests', JSON.stringify(all));
      setBarter(updated);
    }
  };

  const handleCodeSubmit = async () => {
    setCodeLoading(true);
    setCodeError('');
    try {
      const updated = await barterService.completeBarter(barter.id, isOwner ? 'owner' : 'requester', codeInput.trim());
      setBarter(updated);
      setCodeInput('');
    } catch (err: any) {
      setCodeError(err.message || 'Invalid code');
    } finally {
      setCodeLoading(false);
    }
  };

  const bothAccepted = barter.ownerConfirmed && barter.requesterConfirmed;
  const canEnterCode = barter.status === 'both_accepted' && bothAccepted;
  const isRejected = barter.status === 'rejected';
  const isCompleted = barter.status === 'completed';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col h-[80vh] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">&times;</button>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Private Barter Chat</h2>
          <div className="text-xs text-gray-500">{barter.requesterName} &amp; {barter.ownerName}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.length === 0 && <div className="text-gray-400 text-center">No messages yet.</div>}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.senderId === user?.id ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-200 text-gray-800'}`}>
                <div className="text-xs font-semibold mb-1">{msg.senderName}</div>
                <div className="text-sm">{msg.content}</div>
                <div className="text-[10px] text-gray-500 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {isRejected && (
          <div className="p-4 text-center text-red-600 font-semibold border-t border-red-200 bg-red-50">Barter was declined. Chat is closed.</div>
        )}
        {isCompleted && (
          <div className="p-4 text-center text-blue-600 font-semibold border-t border-blue-200 bg-blue-50">Barter completed successfully!</div>
        )}
        {canDecide && !isRejected && !isCompleted && (
          <div className="p-4 border-t border-gray-200 flex justify-center space-x-4 bg-gray-50">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              disabled={hasAccepted}
            >
              Accept
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              disabled={hasAccepted}
            >
              Decline
            </button>
          </div>
        )}
        {bothAccepted && barter.status === 'both_accepted' && !isRejected && !isCompleted && (
          <div className="p-4 border-t border-gray-200 flex flex-col items-center bg-gray-50">
            <div className="mb-2 text-green-700 font-semibold">Both parties have accepted the barter!</div>
            <button
              onClick={() => navigate(`/confirm-barter/${barter.id}`)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Go to Barter Confirmation
            </button>
            <div className="text-xs text-gray-500 mt-2">You can confirm the barter at any time.</div>
          </div>
        )}
        <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            placeholder="Type your message..."
            maxLength={500}
            disabled={isRejected || isCompleted}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={!input.trim() || isRejected || isCompleted}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default BarterChatModal; 