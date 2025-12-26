import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface ClearanceChecklist {
  equipment_returned: boolean;
  access_revoked: boolean;
  documentation_complete: boolean;
  exit_interview: boolean;
  final_payment: boolean;
}

export interface Termination {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  position: string | null;
  termination_type: 'voluntary' | 'dismissal' | 'contract_end' | 'retirement' | 'mutual_agreement';
  reason: string | null;
  requested_date: string;
  effective_date: string | null;
  last_working_day: string | null;
  status: 'pending' | 'in_progress' | 'clearance' | 'completed' | 'cancelled';
  clearance_checklist: ClearanceChecklist;
  settlement_amount: number | null;
  notes: string | null;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTerminationData {
  employee_id: string;
  employee_name: string;
  department: string;
  position?: string;
  termination_type: Termination['termination_type'];
  reason?: string;
  effective_date?: string;
  last_working_day?: string;
  notes?: string;
}

export function useTerminations() {
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTerminations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('terminations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map((t: any) => ({
        ...t,
        clearance_checklist: typeof t.clearance_checklist === 'string' 
          ? JSON.parse(t.clearance_checklist) 
          : t.clearance_checklist
      }));
      setTerminations(parsed as Termination[]);
    } catch (error: any) {
      console.error('Error fetching terminations:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los procesos de retiro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createTermination = async (data: CreateTerminationData) => {
    try {
      const { data: newData, error } = await supabase
        .from('terminations')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...newData,
        clearance_checklist: typeof newData.clearance_checklist === 'string'
          ? JSON.parse(newData.clearance_checklist)
          : newData.clearance_checklist
      };
      
      setTerminations((prev) => [parsed as Termination, ...prev]);
      toast({
        title: 'Proceso de retiro iniciado',
        description: 'El proceso ha sido registrado exitosamente',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error creating termination:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el proceso de retiro',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateTermination = async (id: string, updates: Record<string, unknown>) => {
    try {
      const { data, error } = await supabase
        .from('terminations')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        clearance_checklist: typeof data.clearance_checklist === 'string'
          ? JSON.parse(data.clearance_checklist)
          : data.clearance_checklist
      };
      
      setTerminations((prev) =>
        prev.map((t) => (t.id === id ? (parsed as Termination) : t))
      );
      toast({
        title: 'Proceso actualizado',
        description: 'Los cambios han sido guardados',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error updating termination:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el proceso',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateClearanceItem = async (id: string, item: keyof ClearanceChecklist, value: boolean) => {
    const termination = terminations.find((t) => t.id === id);
    if (!termination) return;

    const newChecklist = { ...termination.clearance_checklist, [item]: value };
    
    try {
      const { data, error } = await supabase
        .from('terminations')
        .update({ clearance_checklist: newChecklist as Json })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        clearance_checklist: typeof data.clearance_checklist === 'string'
          ? JSON.parse(data.clearance_checklist)
          : data.clearance_checklist
      };
      
      setTerminations((prev) =>
        prev.map((t) => (t.id === id ? (parsed as Termination) : t))
      );
      toast({
        title: 'Checklist actualizado',
        description: 'El item ha sido marcado',
      });
    } catch (error: any) {
      console.error('Error updating clearance item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el checklist',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchTerminations();
  }, []);

  return {
    terminations,
    loading,
    fetchTerminations,
    createTermination,
    updateTermination,
    updateClearanceItem,
  };
}
