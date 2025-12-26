import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type VacationRequest = Tables<'vacation_requests'>;
export type VacationInsert = TablesInsert<'vacation_requests'>;
export type VacationUpdate = TablesUpdate<'vacation_requests'>;

export type PermissionRequest = Tables<'permission_requests'>;
export type PermissionInsert = TablesInsert<'permission_requests'>;
export type PermissionUpdate = TablesUpdate<'permission_requests'>;

export function useVacations() {
  const [vacations, setVacations] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchVacations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vacation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVacations(data || []);
    } catch (err) {
      console.error('Error fetching vacations:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  const createVacation = async (vacation: VacationInsert) => {
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .insert(vacation)
        .select()
        .single();

      if (error) throw error;
      
      setVacations(prev => [data, ...prev]);
      toast.success('Solicitud de vacaciones creada');
      return data;
    } catch (err) {
      console.error('Error creating vacation:', err);
      toast.error('Error al crear solicitud');
      throw err;
    }
  };

  const updateVacation = async (id: string, updates: VacationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('vacation_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setVacations(prev => prev.map(v => v.id === id ? data : v));
      return data;
    } catch (err) {
      console.error('Error updating vacation:', err);
      toast.error('Error al actualizar solicitud');
      throw err;
    }
  };

  const approveByJefe = async (id: string, approvedBy: string) => {
    return updateVacation(id, {
      jefe_approved_by: approvedBy,
      jefe_approved_at: new Date().toISOString(),
      approval_flow: 'jefe_approved',
    });
  };

  const approveByRRHH = async (id: string, approvedBy: string) => {
    return updateVacation(id, {
      rrhh_approved_by: approvedBy,
      rrhh_approved_at: new Date().toISOString(),
      approval_flow: 'completed',
      status: 'approved',
    });
  };

  const reject = async (id: string) => {
    return updateVacation(id, {
      approval_flow: 'rejected',
      status: 'rejected',
    });
  };

  return {
    vacations,
    loading,
    error,
    refetch: fetchVacations,
    createVacation,
    updateVacation,
    approveByJefe,
    approveByRRHH,
    reject,
  };
}

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
      toast.success('Solicitud de permiso creada');
      return data;
    } catch (err) {
      console.error('Error creating permission:', err);
      toast.error('Error al crear solicitud');
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
      toast.error('Error al actualizar solicitud');
      throw err;
    }
  };

  const approveByJefe = async (id: string, approvedBy: string) => {
    return updatePermission(id, {
      jefe_approved_by: approvedBy,
      jefe_approved_at: new Date().toISOString(),
      approval_flow: 'jefe_approved',
    });
  };

  const approveByRRHH = async (id: string, approvedBy: string) => {
    return updatePermission(id, {
      rrhh_approved_by: approvedBy,
      rrhh_approved_at: new Date().toISOString(),
      approval_flow: 'completed',
      status: 'approved',
    });
  };

  const reject = async (id: string) => {
    return updatePermission(id, {
      approval_flow: 'rejected',
      status: 'rejected',
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
