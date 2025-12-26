import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Justification = Tables<'justifications'>;
export type JustificationInsert = TablesInsert<'justifications'>;
export type JustificationUpdate = TablesUpdate<'justifications'>;

export function useJustifications() {
  const [justifications, setJustifications] = useState<Justification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchJustifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('justifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJustifications(data || []);
    } catch (err) {
      console.error('Error fetching justifications:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJustifications();
  }, [fetchJustifications]);

  const createJustification = async (justification: JustificationInsert) => {
    try {
      const { data, error } = await supabase
        .from('justifications')
        .insert(justification)
        .select()
        .single();

      if (error) throw error;
      
      setJustifications(prev => [data, ...prev]);
      toast.success('Justificación creada');
      return data;
    } catch (err) {
      console.error('Error creating justification:', err);
      toast.error('Error al crear justificación');
      throw err;
    }
  };

  const updateJustification = async (id: string, updates: JustificationUpdate) => {
    try {
      const { data, error } = await supabase
        .from('justifications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setJustifications(prev => prev.map(j => j.id === id ? data : j));
      toast.success('Justificación actualizada');
      return data;
    } catch (err) {
      console.error('Error updating justification:', err);
      toast.error('Error al actualizar justificación');
      throw err;
    }
  };

  const approveByJefe = async (id: string, approvedBy: string) => {
    return updateJustification(id, {
      jefe_approved: true,
      jefe_approved_at: new Date().toISOString(),
      jefe_approved_by: approvedBy,
    });
  };

  const approveByRRHH = async (id: string, approvedBy: string) => {
    return updateJustification(id, {
      rrhh_approved: true,
      rrhh_approved_at: new Date().toISOString(),
      rrhh_approved_by: approvedBy,
      status: 'approved',
    });
  };

  const validateDCTS = async (id: string, validatedBy: string) => {
    return updateJustification(id, {
      dcts_validated: true,
      dcts_validated_at: new Date().toISOString(),
      dcts_validated_by: validatedBy,
    });
  };

  const reject = async (id: string) => {
    return updateJustification(id, {
      status: 'rejected',
    });
  };

  return {
    justifications,
    loading,
    error,
    refetch: fetchJustifications,
    createJustification,
    updateJustification,
    approveByJefe,
    approveByRRHH,
    validateDCTS,
    reject,
  };
}
