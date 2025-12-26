import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  document_id: string | null;
  position: string;
  department: string;
  experience_years: number;
  source: string;
  salary_expectation: number | null;
  status: 'pending' | 'interviewing' | 'selected' | 'rejected' | 'hired';
  resume_url: string | null;
  notes: string | null;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreateApplicantData {
  name: string;
  email: string;
  phone?: string;
  document_id?: string;
  position: string;
  department: string;
  experience_years?: number;
  source?: string;
  salary_expectation?: number;
  notes?: string;
}

export function useApplicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applicants')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplicants((data as Applicant[]) || []);
    } catch (error: any) {
      console.error('Error fetching applicants:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los postulantes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createApplicant = async (applicantData: CreateApplicantData) => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .insert([applicantData])
        .select()
        .single();

      if (error) throw error;

      setApplicants((prev) => [data as Applicant, ...prev]);
      toast({
        title: 'Postulante registrado',
        description: 'El postulante ha sido registrado exitosamente',
      });
      return data;
    } catch (error: any) {
      console.error('Error creating applicant:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el postulante',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateApplicant = async (id: string, updates: Partial<Applicant>) => {
    try {
      const { data, error } = await supabase
        .from('applicants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setApplicants((prev) =>
        prev.map((a) => (a.id === id ? (data as Applicant) : a))
      );
      toast({
        title: 'Postulante actualizado',
        description: 'Los datos han sido actualizados',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating applicant:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el postulante',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteApplicant = async (id: string) => {
    try {
      const { error } = await supabase.from('applicants').delete().eq('id', id);

      if (error) throw error;

      setApplicants((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: 'Postulante eliminado',
        description: 'El registro ha sido eliminado',
      });
    } catch (error: any) {
      console.error('Error deleting applicant:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el postulante',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  return {
    applicants,
    loading,
    fetchApplicants,
    createApplicant,
    updateApplicant,
    deleteApplicant,
  };
}
