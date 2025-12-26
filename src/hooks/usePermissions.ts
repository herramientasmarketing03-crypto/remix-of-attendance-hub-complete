import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type PermissionRequest = Tables<'permission_requests'>;
export type PermissionInsert = TablesInsert<'permission_requests'>;
export type PermissionUpdate = TablesUpdate<'permission_requests'>;

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('permission_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPermissions(data || []);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const createPermission = async (permission: PermissionInsert) => {
    try {
      const { data, error } = await supabase
        .from('permission_requests')
        .insert(permission)
        .select()
        .single();

      if (error) throw error;
      setPermissions(prev => [data, ...prev]);
      toast.success('Permiso solicitado');
      return data;
    } catch (err) {
      console.error('Error creating permission:', err);
      toast.error('Error al crear permiso');
      throw err;
    }
  };

  const updatePermission = async (id: string, updates: PermissionUpdate) => {
    try {
      const { data, error } = await supabase
        .from('permission_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPermissions(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (err) {
      console.error('Error updating permission:', err);
      toast.error('Error al actualizar permiso');
      throw err;
    }
  };

  const approveByJefe = async (id: string, approvedBy: string) => {
    return updatePermission(id, {
      approval_flow: 'jefe_approved',
      jefe_approved_by: approvedBy,
      jefe_approved_at: new Date().toISOString(),
    });
  };

  const approveByRRHH = async (id: string, approvedBy: string) => {
    return updatePermission(id, {
      status: 'approved',
      approval_flow: 'completed',
      rrhh_approved_by: approvedBy,
      rrhh_approved_at: new Date().toISOString(),
    });
  };

  const reject = async (id: string) => {
    return updatePermission(id, {
      status: 'rejected',
      approval_flow: 'rejected',
    });
  };

  return {
    permissions,
    loading,
    error,
    refetch: fetchPermissions,
    createPermission,
    updatePermission,
    approveByJefe,
    approveByRRHH,
    reject,
  };
}
