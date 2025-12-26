import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Employee = Tables<'employees'>;
export type EmployeeInsert = TablesInsert<'employees'>;
export type EmployeeUpdate = TablesUpdate<'employees'>;

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (employee: EmployeeInsert) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) throw error;
      
      setEmployees(prev => [...prev, data]);
      toast.success('Empleado creado exitosamente');
      return data;
    } catch (err) {
      console.error('Error creating employee:', err);
      toast.error('Error al crear empleado');
      throw err;
    }
  };

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setEmployees(prev => prev.map(e => e.id === id ? data : e));
      toast.success('Empleado actualizado exitosamente');
      return data;
    } catch (err) {
      console.error('Error updating employee:', err);
      toast.error('Error al actualizar empleado');
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success('Empleado eliminado');
    } catch (err) {
      console.error('Error deleting employee:', err);
      toast.error('Error al eliminar empleado');
      throw err;
    }
  };

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}

export function useEmployee(id: string | null) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        setEmployee(data);
      } catch (err) {
        console.error('Error fetching employee:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  return { employee, loading };
}
