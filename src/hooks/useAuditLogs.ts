import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_name: string;
  user_email: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  details: string | null;
  metadata: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AuditLogFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchLogs = async (filters?: AuditLogFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.entity) {
        query = query.eq('entity', filters.entity);
      }
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const parsed = (data || []).map((log: any) => ({
        ...log,
        metadata: typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata || {},
      }));
      setLogs(parsed as AuditLog[]);
    } catch (error: any) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de auditoría',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const logAction = async (
    action: string,
    entity: string,
    entityId?: string,
    details?: string,
    metadata?: Record<string, any>
  ) => {
    try {
      const userName = profile ? `${profile.nombres} ${profile.apellidos}` : 'Usuario';
      const userEmail = profile?.email || user?.email;

      const { error } = await supabase.from('audit_logs').insert([
        {
          user_id: user?.id,
          user_name: userName,
          user_email: userEmail,
          action,
          entity,
          entity_id: entityId,
          details,
          metadata: metadata || {},
          user_agent: navigator.userAgent,
        },
      ]);

      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return {
    logs,
    loading,
    fetchLogs,
    logAction,
  };
}
