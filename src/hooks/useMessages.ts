import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;

export function useMessages(userId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages(prev => [payload.new as Message, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMessages(prev => prev.map(m => 
              m.id === (payload.new as Message).id ? payload.new as Message : m
            ));
          } else if (payload.eventType === 'DELETE') {
            setMessages(prev => prev.filter(m => m.id !== (payload.old as Message).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const sendMessage = async (message: MessageInsert) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      toast.success('Mensaje enviado');
      return data;
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al enviar mensaje');
      throw err;
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAsResolved = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ resolved: true })
        .eq('id', messageId);

      if (error) throw error;
      toast.success('Mensaje marcado como resuelto');
    } catch (err) {
      console.error('Error marking as resolved:', err);
      toast.error('Error al marcar como resuelto');
    }
  };

  return {
    messages,
    loading,
    error,
    refetch: fetchMessages,
    sendMessage,
    markAsRead,
    markAsResolved,
  };
}
