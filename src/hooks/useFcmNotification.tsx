'use client';

import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import toast from 'react-hot-toast';
import { getFirebaseMessaging } from '@/lib/firebase';
import { useNotification } from '@/contexts/NotificationContext';
import TaskRepository from '@/repositories/TaskRepository';

export function useFcmNotification() {
  const { incrementUnread } = useNotification();

  useEffect(() => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title || 'Thông báo mới';
      const body = payload.notification?.body || '';

      toast(
        (t) => (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => toast.dismiss(t.id)}
          >
            <strong>{title}</strong>
            {body && <p style={{ margin: '4px 0 0', fontSize: 14 }}>{body}</p>}
          </div>
        ),
        {
          duration: 5000,
          icon: '\uD83D\uDD14',
        },
      );

      incrementUnread();

      // Notify TaskRepository subscribers to refresh data
      TaskRepository.getInstance().notifyListeners();
    });

    return () => unsubscribe();
  }, [incrementUnread]);
}
