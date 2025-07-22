import React, { useEffect, useState } from 'react';
import { notificationService, Notification } from '../services/notificationService';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (open) {
      setNotifications(notificationService.getAll());
    }
  }, [open]);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(notificationService.getAll());
  };

  const handleMarkAll = () => {
    notificationService.markAllAsRead();
    setNotifications(notificationService.getAll());
  };

  const handleClear = () => {
    notificationService.clear();
    setNotifications([]);
  };

  const handleClearRead = () => {
    const unread = notifications.filter(n => !n.read);
    notificationService.clear();
    unread.forEach(n => notificationService.add(n.type, n.message));
    setNotifications(notificationService.getAll());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">&times;</button>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h2>
        <div className="flex justify-between mb-4">
          <button onClick={handleMarkAll} className="text-emerald-600 hover:underline text-sm">Mark all as read</button>
          <button onClick={handleClearRead} className="text-blue-500 hover:underline text-sm">Clear read</button>
          <button onClick={handleClear} className="text-red-500 hover:underline text-sm">Clear all</button>
        </div>
        {notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No notifications.</div>
        ) : (
          <ul className="space-y-4 max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <li key={n.id} className={`p-4 rounded-lg border ${n.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900 mb-1">{n.message}</div>
                    <div className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <button onClick={() => handleMarkAsRead(n.id)} className="text-xs text-blue-600 hover:underline">Mark as read</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 