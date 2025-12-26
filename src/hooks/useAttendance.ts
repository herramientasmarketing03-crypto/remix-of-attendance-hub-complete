import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  break_start: string | null;
  break_end: string | null;
  break_minutes: number;
  worked_hours: number;
  tardy_minutes: number;
  tardy_count: number;
  absences: number;
  overtime_weekday: number;
  overtime_holiday: number;
  days_attended: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance_records')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const getStatsByDepartment = useCallback((employees: { id: string; department: string }[]) => {
    const departmentStats: Record<string, {
      totalEmployees: number;
      presentToday: number;
      absences: number;
      tardies: number;
      overtimeHours: number;
      attendanceRate: number;
    }> = {};

    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter(r => r.date === today);

    const departments = [...new Set(employees.map(e => e.department))];

    departments.forEach(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const deptRecords = todayRecords.filter(r => 
        deptEmployees.some(e => e.id === r.employee_id)
      );

      const presentCount = deptRecords.filter(r => r.days_attended > 0).length;
      const tardyCount = deptRecords.reduce((acc, r) => acc + r.tardy_count, 0);
      const absenceCount = deptRecords.reduce((acc, r) => acc + r.absences, 0);
      const overtimeTotal = deptRecords.reduce((acc, r) => acc + r.overtime_weekday + r.overtime_holiday, 0);

      departmentStats[dept] = {
        totalEmployees: deptEmployees.length,
        presentToday: presentCount,
        absences: absenceCount,
        tardies: tardyCount,
        overtimeHours: overtimeTotal,
        attendanceRate: deptEmployees.length > 0 ? Math.round((presentCount / deptEmployees.length) * 100) : 0
      };
    });

    return departmentStats;
  }, [records]);

  const createRecord = async (record: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert(record)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => [data, ...prev]);
      toast.success('Registro creado');
      return data;
    } catch (err) {
      console.error('Error creating attendance record:', err);
      toast.error('Error al crear registro');
      throw err;
    }
  };

  const updateRecord = async (id: string, updates: Partial<AttendanceRecord>) => {
    try {
      const { data, error } = await supabase
        .from('attendance_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Registro actualizado');
      return data;
    } catch (err) {
      console.error('Error updating attendance record:', err);
      toast.error('Error al actualizar registro');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    refetch: fetchRecords,
    getStatsByDepartment,
    createRecord,
    updateRecord,
  };
}
