import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AreaRequirement {
  id: string;
  title: string;
  description: string | null;
  department: string;
  expense_type: 'fixed' | 'variable';
  category: 'software' | 'hardware' | 'service' | 'subscription' | 'training' | 'infrastructure' | 'other';
  estimated_cost: number;
  recurring: boolean;
  recurring_period: 'monthly' | 'quarterly' | 'yearly' | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  justification: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'purchased' | 'cancelled';
  requested_by: string;
  approved_by: string | null;
  approved_at: string | null;
  purchase_date: string | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAreaRequirementData {
  title: string;
  description?: string;
  department: string;
  expense_type: AreaRequirement['expense_type'];
  category: AreaRequirement['category'];
  estimated_cost: number;
  recurring?: boolean;
  recurring_period?: AreaRequirement['recurring_period'];
  priority?: AreaRequirement['priority'];
  justification?: string;
  requested_by: string;
  notes?: string;
}

export function useAreaRequirements() {
  const [areaRequirements, setAreaRequirements] = useState<AreaRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAreaRequirements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('area_requirements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAreaRequirements((data as AreaRequirement[]) || []);
    } catch (error: any) {
      console.error('Error fetching area requirements:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los requerimientos de área',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAreaRequirement = async (data: CreateAreaRequirementData) => {
    try {
      const { data: newData, error } = await supabase
        .from('area_requirements')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      setAreaRequirements((prev) => [newData as AreaRequirement, ...prev]);
      toast({
        title: 'Requerimiento creado',
        description: 'El requerimiento de área ha sido registrado',
      });
      return newData;
    } catch (error: any) {
      console.error('Error creating area requirement:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el requerimiento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateAreaRequirement = async (id: string, updates: Partial<AreaRequirement>) => {
    try {
      const { data, error } = await supabase
        .from('area_requirements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAreaRequirements((prev) =>
        prev.map((r) => (r.id === id ? (data as AreaRequirement) : r))
      );
      toast({
        title: 'Requerimiento actualizado',
        description: 'Los cambios han sido guardados',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating area requirement:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el requerimiento',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const approveAreaRequirement = async (id: string, approvedBy: string) => {
    return updateAreaRequirement(id, {
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  };

  const rejectAreaRequirement = async (id: string, approvedBy: string) => {
    return updateAreaRequirement(id, {
      status: 'rejected',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
    });
  };

  useEffect(() => {
    fetchAreaRequirements();
  }, []);

  return {
    areaRequirements,
    loading,
    fetchAreaRequirements,
    createAreaRequirement,
    updateAreaRequirement,
    approveAreaRequirement,
    rejectAreaRequirement,
  };
}
