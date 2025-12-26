import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ParsedBiometricReport, BiometricStatRecord, DuplicateCheckResult, UploadConflictAction } from '@/types/payroll';
import { toast } from 'sonner';

interface UploadResult {
  success: boolean;
  recordsSaved: number;
  recordsSkipped: number;
  errors: string[];
}

export function useAttendanceUpload() {
  const [isChecking, setIsChecking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check for existing records in the date range
  const checkForDuplicates = async (
    report: ParsedBiometricReport
  ): Promise<DuplicateCheckResult> => {
    setIsChecking(true);
    try {
      const employeeIds = report.records
        .filter(r => r.employeeId)
        .map(r => r.employeeId as string);

      if (employeeIds.length === 0) {
        return { hasDuplicates: false, existingCount: 0, existingDates: [] };
      }

      const { data, error } = await supabase
        .from('attendance_records')
        .select('employee_id, date')
        .in('employee_id', employeeIds)
        .gte('date', report.period.start)
        .lte('date', report.period.end);

      if (error) {
        console.error('Error checking duplicates:', error);
        return { hasDuplicates: false, existingCount: 0, existingDates: [] };
      }

      const existingDates = [...new Set(data?.map(r => r.date) || [])];
      
      return {
        hasDuplicates: (data?.length || 0) > 0,
        existingCount: data?.length || 0,
        existingDates
      };
    } finally {
      setIsChecking(false);
    }
  };

  // Save attendance records to database
  const saveAttendanceRecords = async (
    report: ParsedBiometricReport,
    conflictAction: UploadConflictAction
  ): Promise<UploadResult> => {
    if (conflictAction === 'cancel') {
      return { success: false, recordsSaved: 0, recordsSkipped: 0, errors: ['Operación cancelada'] };
    }

    setIsSaving(true);
    const result: UploadResult = {
      success: true,
      recordsSaved: 0,
      recordsSkipped: 0,
      errors: []
    };

    try {
      // Only process matched employees
      const matchedRecords = report.records.filter(r => r.employeeId);

      if (matchedRecords.length === 0) {
        result.success = false;
        result.errors.push('No hay empleados coincidentes para guardar');
        return result;
      }

      // Generate date range for the period
      const startDate = new Date(report.period.start);
      const endDate = new Date(report.period.end);
      
      for (const record of matchedRecords) {
        try {
          // Create a consolidated record for the period
          const attendanceData = {
            employee_id: record.employeeId as string,
            date: report.period.end, // Use end date as the summary date
            worked_hours: record.actualHours / 60, // Convert minutes to hours
            tardy_minutes: record.tardyMinutes,
            tardy_count: record.tardyCount,
            absences: record.absences,
            days_attended: record.daysAttended,
            overtime_weekday: record.overtimeWeekday / 60,
            overtime_holiday: record.overtimeHoliday / 60,
            status: record.absences > 0 ? 'absent' : record.tardyMinutes > 0 ? 'tardy' : 'present',
            notes: `Reporte período ${report.period.start} al ${report.period.end}`
          };

          if (conflictAction === 'overwrite') {
            // Delete existing records in the period first
            await supabase
              .from('attendance_records')
              .delete()
              .eq('employee_id', record.employeeId as string)
              .gte('date', report.period.start)
              .lte('date', report.period.end);
          }

          // Check if record exists for this specific date
          const { data: existing } = await supabase
            .from('attendance_records')
            .select('id')
            .eq('employee_id', record.employeeId as string)
            .eq('date', report.period.end)
            .maybeSingle();

          if (existing && conflictAction === 'skip') {
            result.recordsSkipped++;
            continue;
          }

          if (existing) {
            // Update existing record
            const { error } = await supabase
              .from('attendance_records')
              .update(attendanceData)
              .eq('id', existing.id);

            if (error) throw error;
          } else {
            // Insert new record
            const { error } = await supabase
              .from('attendance_records')
              .insert(attendanceData);

            if (error) throw error;
          }

          result.recordsSaved++;
        } catch (err) {
          console.error('Error saving record for employee:', record.employeeName, err);
          result.errors.push(`Error guardando ${record.employeeName}: ${err}`);
        }
      }

      if (result.recordsSaved > 0) {
        toast.success(`${result.recordsSaved} registros guardados correctamente`);
      }

      if (result.recordsSkipped > 0) {
        toast.info(`${result.recordsSkipped} registros omitidos (ya existían)`);
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

    } catch (error) {
      console.error('Error saving attendance records:', error);
      result.success = false;
      result.errors.push(`Error general: ${error}`);
      toast.error('Error al guardar los registros');
    } finally {
      setIsSaving(false);
    }

    return result;
  };

  return {
    checkForDuplicates,
    saveAttendanceRecords,
    isChecking,
    isSaving
  };
}
