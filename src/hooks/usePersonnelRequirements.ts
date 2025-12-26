import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PersonnelRequirement {
  id: string;
  position: string;
  quantity: number;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  contract_type: string;
  salary_min: number | null;
  salary_max: number | null;
  justification: string | null;
  requirements: string[];
  responsibilities: string[];
  status: 'pending' | 'approved' | 'rejected' | 'in_process' | 'filled' | 'cancelled';
  requested_by: string;
  approved_by: string | null;
  approved_at: string | null;
  filled_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequirementData {
  position: string;
  quantity?: number;
  department: string;
  priority?: PersonnelRequirement['priority'];
  contract_type?: string;
  salary_min?: number;
  salary_max?: number;
  justification?: string;
  requirements?: string[];
  responsibilities?: string[];
  requested_by: string;
  notes?: string;
}

export function usePersonnelRequirements() {
  const [requirements, setRequirements] = useState<PersonnelRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('personnel_requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const parsed = (data || []).map((r: any) => ({
        ...r,
        requirements: Array.isArray(r.requirements) ? r.requirements : [],
        responsibilities: Array.isArray(r.responsibilities) ? r.responsibilities : [],
      }));
      setRequirements(parsed as PersonnelRequirement[]);
    } catch (error: any) {
      console.error('Error fetching requirements:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los requerimientos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequirement = async (data: CreateRequirementData) => {
    try {
      const { data: newData, error } = await supabase
        .from('personnel_requirements')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...newData,
        requirements: Array.isArray(newData.requirements) ? newData.requirements : [],
        responsibilities: Array.isArray(newData.responsibilities) ? newData.responsibilities : [],
      };
      
      setRequirements((prev) => [parsed as PersonnelRequirement, ...prev]);
      toast({
        title: 'Requerimiento creado',
        description: 'El requerimiento ha sido registrado',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error creating requirement:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el requerimiento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateRequirement = async (id: string, updates: Partial<PersonnelRequirement>) => {
    try {
      const { data, error } = await supabase
        .from('personnel_requirements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      };
      
      setRequirements((prev) =>
        prev.map((r) => (r.id === id ? (parsed as PersonnelRequirement) : r))
      );
      toast({
        title: 'Requerimiento actualizado',
        description: 'Los cambios han sido guardados',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error updating requirement:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el requerimiento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const approveRequirement = async (id: string, approvedBy: string) => {
    return updateRequirement(id, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  };

  const rejectRequirement = async (id: string, approvedBy: string) => {
    return updateRequirement(id, {
      status: 'rejected',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  return {
    requirements,
    loading,
    fetchRequirements,
    createRequirement,
    updateRequirement,
    approveRequirement,
    rejectRequirement,
  };
}
