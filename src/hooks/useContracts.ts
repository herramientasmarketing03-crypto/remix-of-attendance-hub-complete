import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Contract = Tables<'contracts'>;
export type ContractInsert = TablesInsert<'contracts'>;
export type ContractUpdate = TablesUpdate<'contracts'>;

export function useContracts() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  const createContract = async (contract: ContractInsert) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      
      setContracts(prev => [data, ...prev]);
      toast.success('Contrato creado');
      return data;
    } catch (err) {
      console.error('Error creating contract:', err);
      toast.error('Error al crear contrato');
      throw err;
    }
  };

  const updateContract = async (id: string, updates: ContractUpdate) => {
    try {
      const { data, error } = await supabase
        .from('contracts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setContracts(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Contrato actualizado');
      return data;
    } catch (err) {
      console.error('Error updating contract:', err);
      toast.error('Error al actualizar contrato');
      throw err;
    }
  };

  const deleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setContracts(prev => prev.filter(c => c.id !== id));
      toast.success('Contrato eliminado');
    } catch (err) {
      console.error('Error deleting contract:', err);
      toast.error('Error al eliminar contrato');
      throw err;
    }
  };

  return {
    contracts,
    loading,
    error,
    refetch: fetchContracts,
    createContract,
    updateContract,
    deleteContract,
  };
}
