import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Sanction = Tables<'sanctions'>;
export type SanctionInsert = TablesInsert<'sanctions'>;
export type SanctionUpdate = TablesUpdate<'sanctions'>;

export function useSanctions() {
  const [sanctions, setSanctions] = useState<Sanction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSanctions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sanctions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSanctions(data || []);
    } catch (err) {
      console.error('Error fetching sanctions:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSanctions();
  }, [fetchSanctions]);

  const createSanction = async (sanction: SanctionInsert) => {
    try {
      const { data, error } = await supabase
        .from('sanctions')
        .insert(sanction)
        .select()
        .single();

      if (error) throw error;
      
      setSanctions(prev => [data, ...prev]);
      toast.success('Sanción creada');
      return data;
    } catch (err) {
      console.error('Error creating sanction:', err);
      toast.error('Error al crear sanción');
      throw err;
    }
  };

  const updateSanction = async (id: string, updates: SanctionUpdate) => {
    try {
      const { data, error } = await supabase
        .from('sanctions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setSanctions(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      console.error('Error updating sanction:', err);
      toast.error('Error al actualizar sanción');
      throw err;
    }
  };

  const approveSanction = async (id: string, notes?: string) => {
    return updateSanction(id, {
      status: 'approved',
      notes: notes || null,
    });
  };

  const rejectSanction = async (id: string, notes?: string) => {
    return updateSanction(id, {
      status: 'revoked',
      notes: notes || null,
    });
  };

  return {
    sanctions,
    loading,
    error,
    refetch: fetchSanctions,
    createSanction,
    updateSanction,
    approveSanction,
    rejectSanction,
  };
}
