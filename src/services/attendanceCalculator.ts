import { BiometricRecord, BiometricUploadResult } from '@/types/payroll';
import { mockEmployees } from '@/data/mockData';

const SCHEDULED_ENTRY = '09:00';
const SCHEDULED_EXIT = '18:00';
const TOLERANCE_MINUTES = 5;
const HOURLY_RATE_DIVISOR = 240; // Monthly hours for salary calculation

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function calculateTardiness(entryTime: string, scheduledTime: string = SCHEDULED_ENTRY): number {
  const entryMinutes = parseTimeToMinutes(entryTime);
  const scheduledMinutes = parseTimeToMinutes(scheduledTime);
  const toleranceEnd = scheduledMinutes + TOLERANCE_MINUTES;

  if (entryMinutes <= toleranceEnd) {
    return 0;
  }

  return entryMinutes - scheduledMinutes;
}

export function calculateEarlyLeave(exitTime: string, scheduledTime: string = SCHEDULED_EXIT): number {
  const exitMinutes = parseTimeToMinutes(exitTime);
  const scheduledMinutes = parseTimeToMinutes(scheduledTime);

  if (exitMinutes >= scheduledMinutes) {
    return 0;
  }

  return scheduledMinutes - exitMinutes;
}

export function calculateTardyDeduction(tardyMinutes: number, monthlySalary: number): number {
  const minuteRate = monthlySalary / HOURLY_RATE_DIVISOR / 60;
  return tardyMinutes * minuteRate;
}

export function calculateAbsenceDeduction(absenceDays: number, monthlySalary: number): number {
  const dailyRate = monthlySalary / 30;
  return absenceDays * dailyRate;
}

export function calculateOvertimePay(overtimeHours: number, monthlySalary: number): number {
  const hourlyRate = monthlySalary / HOURLY_RATE_DIVISOR;
  // Overtime is 1.25x for weekdays, 1.35x for holidays
  return overtimeHours * hourlyRate * 1.25;
}

export function processBiometricData(rawData: string[][]): BiometricUploadResult {
  const records: BiometricRecord[] = [];
  let totalTardyMinutes = 0;
  let tardiesDetected = 0;
  let absencesDetected = 0;

  // Skip header row (if any) and process data
  rawData.forEach((row, index) => {
    if (index === 0 && row[0]?.toLowerCase().includes('nombre')) return; // Skip header

    const [documentId, name, date, entryTime, exitTime] = row;
    if (!documentId || !date) return;

    const employee = mockEmployees.find(e => e.documentId === documentId);
    if (!employee) return;

    let status: BiometricRecord['status'] = 'normal';
    let tardyMinutes = 0;
    let earlyLeaveMinutes = 0;
    let workedHours = 0;

    if (!entryTime || entryTime === '-') {
      status = 'absent';
      absencesDetected++;
    } else {
      tardyMinutes = calculateTardiness(entryTime);
      if (tardyMinutes > 0) {
        status = 'tardy';
        tardiesDetected++;
        totalTardyMinutes += tardyMinutes;
      }

      if (exitTime && exitTime !== '-') {
        earlyLeaveMinutes = calculateEarlyLeave(exitTime);
        if (earlyLeaveMinutes > 0 && status === 'normal') {
          status = 'early_leave';
        }
        
        const entryMins = parseTimeToMinutes(entryTime);
        const exitMins = parseTimeToMinutes(exitTime);
        workedHours = Math.max(0, (exitMins - entryMins - 60) / 60); // Subtract 1 hour lunch
      }
    }

    records.push({
      employeeId: employee.id,
      employeeName: employee.name,
      documentId,
      date,
      entryTime: entryTime || '-',
      exitTime: exitTime || '-',
      scheduledEntry: SCHEDULED_ENTRY,
      scheduledExit: SCHEDULED_EXIT,
      tardyMinutes,
      earlyLeaveMinutes,
      workedHours,
      status
    });
  });

  // Calculate estimated deduction based on average salary
  const avgSalary = 3000;
  const estimatedDeduction = calculateTardyDeduction(totalTardyMinutes, avgSalary);

  return {
    totalRecords: rawData.length - 1, // Excluding header
    processedRecords: records.length,
    tardiesDetected,
    totalTardyMinutes,
    absencesDetected,
    estimatedDeduction,
    records
  };
}

export function generateSampleBiometricData(): string[][] {
  const today = new Date();
  const data: string[][] = [
    ['DNI', 'Nombre', 'Fecha', 'Hora Entrada', 'Hora Salida']
  ];

  mockEmployees.slice(0, 8).forEach(emp => {
    const date = today.toISOString().split('T')[0];
    const isLate = Math.random() < 0.2;
    const isAbsent = Math.random() < 0.05;
    
    const entryHour = isAbsent ? '-' : isLate 
      ? `09:${String(Math.floor(Math.random() * 25) + 10).padStart(2, '0')}`
      : `08:${String(Math.floor(Math.random() * 55) + 5).padStart(2, '0')}`;
    
    const exitTime = isAbsent ? '-' : `18:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}`;

    data.push([emp.documentId, emp.name, date, entryHour, exitTime]);
  });

  return data;
}
