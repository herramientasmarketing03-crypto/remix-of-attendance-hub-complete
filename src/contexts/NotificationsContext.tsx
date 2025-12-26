import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type NotificationType = 
  | 'contract_expiring'
  | 'justification_pending'
  | 'sanction_pending'
  | 'task_due'
  | 'vacation_request'
  | 'evaluation_pending'
  | 'attendance_issue'
  | 'message'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  refreshNotifications: () => void;
  createNotification: (targetUserId: string, notification: {
    type: string;
    title: string;
    message: string;
    link?: string;
    priority?: string;
  }) => Promise<boolean>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: n.type as NotificationType,
        title: n.title,
        message: n.message,
        link: n.link || undefined,
        isRead: n.is_read,
        createdAt: n.created_at,
        priority: (n.priority || 'medium') as 'low' | 'medium' | 'high',
      }));
      
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime updates
    if (user) {
      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newNotif = payload.new as any;
              const mapped: Notification = {
                id: newNotif.id,
                type: newNotif.type as NotificationType,
                title: newNotif.title,
                message: newNotif.message,
                link: newNotif.link || undefined,
                isRead: newNotif.is_read,
                createdAt: newNotif.created_at,
                priority: (newNotif.priority || 'medium') as 'low' | 'medium' | 'high',
              };
              setNotifications((prev) => [mapped, ...prev]);
              
              // Show toast for new notifications
              toast.info(mapped.title, {
                description: mapped.message,
              });
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as any;
              setNotifications((prev) =>
                prev.map((n) =>
                  n.id === updated.id 
                    ? { ...n, isRead: updated.is_read } 
                    : n
                )
              );
            } else if (payload.eventType === 'DELETE') {
              setNotifications((prev) =>
                prev.filter((n) => n.id !== (payload.old as any).id)
              );
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      fetchNotifications();
    }
  };

  const clearNotification = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== id));

    try {
      const { error } = await supabase
        .from('user_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing notification:', error);
      fetchNotifications();
    }
  };

  const createNotification = async (
    targetUserId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      link?: string;
      priority?: string;
    }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase.from('user_notifications').insert({
        user_id: targetUserId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link || null,
        priority: notification.priority || 'medium',
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      refreshNotifications: fetchNotifications,
      createNotification,
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
