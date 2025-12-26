import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DepartmentPosition {
  id: string;
  department: string;
  position_name: string;
  description: string | null;
  responsibilities: string[];
  requirements: string | null;
  current_count: number;
  max_positions: number;
  is_leadership: boolean;
  reports_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePositionData {
  department: string;
  position_name: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string;
  max_positions?: number;
  is_leadership?: boolean;
  reports_to?: string;
}

export function useDepartmentPositions() {
  const [positions, setPositions] = useState<DepartmentPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('department_positions')
        .select('*')
        .order('department', { ascending: true });

      if (error) throw error;
      
      const parsed = (data || []).map((p: any) => ({
        ...p,
        responsibilities: Array.isArray(p.responsibilities) ? p.responsibilities : [],
      }));
      setPositions(parsed as DepartmentPosition[]);
    } catch (error: any) {
      console.error('Error fetching positions:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los puestos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createPosition = async (data: CreatePositionData) => {
    try {
      const { data: newData, error } = await supabase
        .from('department_positions')
        .insert([data])
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...newData,
        responsibilities: Array.isArray(newData.responsibilities) ? newData.responsibilities : [],
      };
      
      setPositions((prev) => [...prev, parsed as DepartmentPosition]);
      toast({
        title: 'Puesto creado',
        description: 'El puesto ha sido registrado',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error creating position:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el puesto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updatePosition = async (id: string, updates: Partial<DepartmentPosition>) => {
    try {
      const { data, error } = await supabase
        .from('department_positions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities : [],
      };
      
      setPositions((prev) =>
        prev.map((p) => (p.id === id ? (parsed as DepartmentPosition) : p))
      );
      toast({
        title: 'Puesto actualizado',
        description: 'Los cambios han sido guardados',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error updating position:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el puesto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deletePosition = async (id: string) => {
    try {
      const { error } = await supabase.from('department_positions').delete().eq('id', id);

      if (error) throw error;

      setPositions((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: 'Puesto eliminado',
        description: 'El puesto ha sido eliminado',
      });
    } catch (error: any) {
      console.error('Error deleting position:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el puesto',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getPositionsByDepartment = (department: string) => {
    return positions.filter((p) => p.department === department);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return {
    positions,
    loading,
    fetchPositions,
    createPosition,
    updatePosition,
    deletePosition,
    getPositionsByDepartment,
  };
}
