import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KPI {
  name: string;
  target: number;
  actual: number;
  weight: number;
}

export interface PerformanceEvaluation {
  id: string;
  employee_id: string;
  period: string;
  classification: 'A' | 'B' | 'C' | 'D';
  overall_score: number;
  kpis: KPI[];
  observations: string | null;
  evaluated_by: string | null;
  evaluated_at: string;
  bonus_condition: 'eligible' | 'pending_review' | 'not_eligible';
  created_at: string;
  updated_at: string;
}

export function usePerformance() {
  const [evaluations, setEvaluations] = useState<PerformanceEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('performance_evaluations')
        .select('*')
        .order('evaluated_at', { ascending: false });

      if (error) throw error;
      
      // Parse JSONB kpis field
      const parsed = (data || []).map(e => ({
        ...e,
        kpis: Array.isArray(e.kpis) ? e.kpis : JSON.parse(e.kpis as unknown as string || '[]')
      }));
      
      setEvaluations(parsed as PerformanceEvaluation[]);
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  const createEvaluation = async (evaluation: Omit<PerformanceEvaluation, 'id' | 'created_at' | 'updated_at' | 'evaluated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('performance_evaluations')
        .insert({
          ...evaluation,
          kpis: JSON.stringify(evaluation.kpis)
        })
        .select()
        .single();

      if (error) throw error;
      
      const parsed = {
        ...data,
        kpis: Array.isArray(data.kpis) ? data.kpis : JSON.parse(data.kpis as unknown as string || '[]')
      };
      
      setEvaluations(prev => [parsed as PerformanceEvaluation, ...prev]);
      toast.success('Evaluación creada');
      return parsed;
    } catch (err) {
      console.error('Error creating evaluation:', err);
      toast.error('Error al crear evaluación');
      throw err;
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<PerformanceEvaluation>) => {
    try {
      const updateData = {
        ...updates,
        kpis: updates.kpis ? JSON.stringify(updates.kpis) : undefined
      };

      const { data, error } = await supabase
        .from('performance_evaluations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      const parsed = {
        ...data,
        kpis: Array.isArray(data.kpis) ? data.kpis : JSON.parse(data.kpis as unknown as string || '[]')
      };
      
      setEvaluations(prev => prev.map(e => e.id === id ? parsed as PerformanceEvaluation : e));
      toast.success('Evaluación actualizada');
      return parsed;
    } catch (err) {
      console.error('Error updating evaluation:', err);
      toast.error('Error al actualizar evaluación');
      throw err;
    }
  };

  return {
    evaluations,
    loading,
    error,
    refetch: fetchEvaluations,
    createEvaluation,
    updateEvaluation,
  };
}
