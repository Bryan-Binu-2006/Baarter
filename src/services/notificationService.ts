export interface Notification {
  id: string;
  type: 'barter' | 'chat' | 'system';
  message: string;
  read: boolean;
  createdAt: string;
}

const NOTIF_KEY = 'notifications';

function getAll(): Notification[] {
  return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]');
}

function saveAll(notifs: Notification[]) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(notifs));
}

export const notificationService = {
  getAll(): Notification[] {
    return getAll();
  },
  add(type: Notification['type'], message: string) {
    const notifs = getAll();
    notifs.unshift({
      id: Date.now().toString(),
      type,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    saveAll(notifs);
  },
  markAsRead(id: string) {
    const notifs = getAll();
    const idx = notifs.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifs[idx].read = true;
      saveAll(notifs);
    }
  },
  markAllAsRead() {
    const notifs = getAll().map(n => ({ ...n, read: true }));
    saveAll(notifs);
  },
  clear() {
    saveAll([]);
  },
  getUnreadCount() {
    return getAll().filter(n => !n.read).length;
  }
}; 