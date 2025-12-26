import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  end_time: string | null;
  type: 'meeting' | 'training' | 'event' | 'deadline' | 'reminder' | 'birthday' | 'other';
  priority: 'low' | 'medium' | 'high';
  location: string | null;
  department: string | null;
  participants: string[];
  created_by: string | null;
  created_by_name: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateActivityData {
  title: string;
  description?: string;
  date: string;
  time?: string;
  end_time?: string;
  type: Activity['type'];
  priority?: Activity['priority'];
  location?: string;
  department?: string;
  participants?: string[];
  recurrence?: Activity['recurrence'];
  notes?: string;
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      
      const parsed = (data || []).map((a: any) => ({
        ...a,
        participants: Array.isArray(a.participants) ? a.participants : [],
      }));
      setActivities(parsed as Activity[]);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las actividades',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityData: CreateActivityData) => {
    try {
      const payload = {
        ...activityData,
        created_by: user?.id,
        created_by_name: profile ? `${profile.nombres} ${profile.apellidos}` : 'Usuario',
      };

      const { data, error } = await supabase
        .from('activities')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        participants: Array.isArray(data.participants) ? data.participants : [],
      };
      
      setActivities((prev) => [...prev, parsed as Activity].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ));
      toast({
        title: 'Actividad creada',
        description: 'La actividad ha sido programada',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error creating activity:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la actividad',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const { data, error } = await supabase
        .from('activities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const parsed = {
        ...data,
        participants: Array.isArray(data.participants) ? data.participants : [],
      };
      
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? (parsed as Activity) : a))
      );
      toast({
        title: 'Actividad actualizada',
        description: 'Los cambios han sido guardados',
      });
      return parsed;
    } catch (error: any) {
      console.error('Error updating activity:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la actividad',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteActivity = async (id: string) => {
    try {
      const { error } = await supabase.from('activities').delete().eq('id', id);

      if (error) throw error;

      setActivities((prev) => prev.filter((a) => a.id !== id));
      toast({
        title: 'Actividad eliminada',
        description: 'La actividad ha sido eliminada',
      });
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la actividad',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return {
    activities,
    loading,
    fetchActivities,
    createActivity,
    updateActivity,
    deleteActivity,
  };
}
