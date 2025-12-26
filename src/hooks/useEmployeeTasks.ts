import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeTask {
  id: string;
  title: string;
  description: string | null;
  employee_id: string | null;
  assigned_to: string;
  assigned_by: string | null;
  created_by_user_id: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  due_date: string | null;
  completed_at: string | null;
  link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  description?: string | null;
  employee_id?: string | null;
  assigned_to: string;
  assigned_by?: string | null;
  created_by_user_id?: string | null;
  status?: string;
  priority?: string;
  category?: string;
  due_date?: string | null;
  link?: string | null;
  notes?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  category?: string;
  due_date?: string | null;
  completed_at?: string | null;
  link?: string | null;
  notes?: string | null;
}

export function useEmployeeTasks() {
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employee_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks((data as EmployeeTask[]) || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('employee-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employee_tasks',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as EmployeeTask]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => prev.map(t => 
              t.id === (payload.new as EmployeeTask).id ? payload.new as EmployeeTask : t
            ));
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== (payload.old as EmployeeTask).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const createTask = async (task: TaskInsert) => {
    try {
      const { data, error } = await supabase
        .from('employee_tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      toast.success('Tarea creada');
      return data;
    } catch (err) {
      console.error('Error creating task:', err);
      toast.error('Error al crear tarea');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      const updateData = {
        ...updates,
        completed_at: updates.status === 'completed' ? new Date().toISOString() : updates.completed_at,
      };
      
      const { data, error } = await supabase
        .from('employee_tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Error al actualizar tarea');
      throw err;
    }
  };

  const toggleComplete = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return updateTask(id, { 
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null
    });
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employee_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success('Tarea eliminada');
    } catch (err) {
      console.error('Error deleting task:', err);
      toast.error('Error al eliminar tarea');
      throw err;
    }
  };

  // Stats calculations
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    onHold: tasks.filter(t => t.status === 'on_hold').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };

  const getTasksByDate = (date: string) => {
    return tasks.filter(t => t.due_date === date);
  };

  const getTodayTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(t => t.due_date === today && t.status !== 'completed');
  };

  const getTasksByAssignee = () => {
    const grouped: Record<string, number> = {};
    tasks.forEach(t => {
      grouped[t.assigned_to] = (grouped[t.assigned_to] || 0) + 1;
    });
    return grouped;
  };

  return {
    tasks,
    loading,
    error,
    stats,
    refetch: fetchTasks,
    createTask,
    updateTask,
    toggleComplete,
    deleteTask,
    getTasksByDate,
    getTodayTasks,
    getTasksByAssignee,
  };
}
