import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PositionManual {
  id: string;
  department: string;
  position: string;
  title: string;
  description: string | null;
  responsibilities: string[];
  requirements: string | null;
  created_by: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManualInsert {
  department: string;
  position: string;
  title: string;
  description?: string | null;
  responsibilities?: string[];
  requirements?: string | null;
  created_by?: string | null;
  file_url?: string | null;
}

export interface ManualUpdate {
  title?: string;
  description?: string | null;
  responsibilities?: string[];
  requirements?: string | null;
  file_url?: string | null;
}

export function usePositionManuals() {
  const [manuals, setManuals] = useState<PositionManual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchManuals = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('position_manuals')
        .select('*')
        .order('department', { ascending: true });

      if (error) throw error;
      
      // Parse responsibilities from JSONB
      const parsed = (data || []).map(m => ({
        ...m,
        responsibilities: Array.isArray(m.responsibilities) ? m.responsibilities : [],
      })) as PositionManual[];
      
      setManuals(parsed);
    } catch (err) {
      console.error('Error fetching manuals:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManuals();
  }, [fetchManuals]);

  const getManualByPosition = useCallback((department: string, position: string) => {
    return manuals.find(m => 
      m.department.toLowerCase() === department.toLowerCase() && 
      m.position.toLowerCase() === position.toLowerCase()
    );
  }, [manuals]);

  const getManualsByDepartment = useCallback((department: string) => {
    return manuals.filter(m => m.department.toLowerCase() === department.toLowerCase());
  }, [manuals]);

  const createManual = async (manual: ManualInsert) => {
    try {
      const { data, error } = await supabase
        .from('position_manuals')
        .insert({
          ...manual,
          responsibilities: manual.responsibilities || [],
        })
        .select()
        .single();

      if (error) throw error;
      
      const parsed = {
        ...data,
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      } as PositionManual;
      
      setManuals(prev => [...prev, parsed]);
      toast.success('Manual creado exitosamente');
      return parsed;
    } catch (err) {
      console.error('Error creating manual:', err);
      toast.error('Error al crear manual');
      throw err;
    }
  };

  const updateManual = async (id: string, updates: ManualUpdate) => {
    try {
      const { data, error } = await supabase
        .from('position_manuals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const parsed = {
        ...data,
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      } as PositionManual;
      
      setManuals(prev => prev.map(m => m.id === id ? parsed : m));
      toast.success('Manual actualizado');
      return parsed;
    } catch (err) {
      console.error('Error updating manual:', err);
      toast.error('Error al actualizar manual');
      throw err;
    }
  };

  const deleteManual = async (id: string) => {
    try {
      const { error } = await supabase
        .from('position_manuals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setManuals(prev => prev.filter(m => m.id !== id));
      toast.success('Manual eliminado');
    } catch (err) {
      console.error('Error deleting manual:', err);
      toast.error('Error al eliminar manual');
      throw err;
    }
  };

  return {
    manuals,
    loading,
    error,
    refetch: fetchManuals,
    getManualByPosition,
    getManualsByDepartment,
    createManual,
    updateManual,
    deleteManual,
  };
}
