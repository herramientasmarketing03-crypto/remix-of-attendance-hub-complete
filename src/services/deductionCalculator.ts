import { BiometricStatRecord, ParsedBiometricReport } from '@/types/payroll';

export interface DeductionSettings {
  tardyMinuteRate: number; // Amount per minute of tardiness
  absenceDayRate: number; // Amount per day of absence
  earlyLeaveMinuteRate: number; // Amount per minute of early leave
  toleranceMinutes: number; // Minutes of tolerance before counting as tardy
  maxTardyDeductionPercent: number; // Maximum deduction as % of salary
}

export interface EmployeeDeduction {
  employeeId: string | null;
  employeeName: string;
  documentId: string;
  tardyMinutes: number;
  tardyDeduction: number;
  absences: number;
  absenceDeduction: number;
  earlyLeaveMinutes: number;
  earlyLeaveDeduction: number;
  totalDeduction: number;
}

export interface DeductionSummary {
  totalEmployees: number;
  employeesWithDeductions: number;
  totalTardyMinutes: number;
  totalTardyDeduction: number;
  totalAbsences: number;
  totalAbsenceDeduction: number;
  totalEarlyLeaveMinutes: number;
  totalEarlyLeaveDeduction: number;
  grandTotalDeduction: number;
  deductions: EmployeeDeduction[];
}

// Default settings (can be overridden by system settings)
export const DEFAULT_DEDUCTION_SETTINGS: DeductionSettings = {
  tardyMinuteRate: 0.50, // S/. 0.50 per minute
  absenceDayRate: 100, // S/. 100 per day
  earlyLeaveMinuteRate: 0.50, // S/. 0.50 per minute
  toleranceMinutes: 10, // 10 minutes tolerance
  maxTardyDeductionPercent: 10 // Max 10% of salary
};

export function calculateDeductions(
  report: ParsedBiometricReport,
  settings: Partial<DeductionSettings> = {}
): DeductionSummary {
  const config = { ...DEFAULT_DEDUCTION_SETTINGS, ...settings };
  
  const deductions: EmployeeDeduction[] = [];
  let totalTardyMinutes = 0;
  let totalTardyDeduction = 0;
  let totalAbsences = 0;
  let totalAbsenceDeduction = 0;
  let totalEarlyLeaveMinutes = 0;
  let totalEarlyLeaveDeduction = 0;
  let employeesWithDeductions = 0;

  for (const record of report.records) {
    // Apply tolerance - only count minutes above tolerance
    const effectiveTardyMinutes = Math.max(0, record.tardyMinutes - (record.tardyCount * config.toleranceMinutes));
    
    const tardyDeduction = effectiveTardyMinutes * config.tardyMinuteRate;
    const absenceDeduction = record.absences * config.absenceDayRate;
    const earlyLeaveDeduction = record.earlyLeaveMinutes * config.earlyLeaveMinuteRate;
    const totalEmployeeDeduction = tardyDeduction + absenceDeduction + earlyLeaveDeduction;

    if (totalEmployeeDeduction > 0) {
      employeesWithDeductions++;
    }

    totalTardyMinutes += effectiveTardyMinutes;
    totalTardyDeduction += tardyDeduction;
    totalAbsences += record.absences;
    totalAbsenceDeduction += absenceDeduction;
    totalEarlyLeaveMinutes += record.earlyLeaveMinutes;
    totalEarlyLeaveDeduction += earlyLeaveDeduction;

    deductions.push({
      employeeId: record.employeeId,
      employeeName: record.employeeName,
      documentId: record.documentId,
      tardyMinutes: effectiveTardyMinutes,
      tardyDeduction,
      absences: record.absences,
      absenceDeduction,
      earlyLeaveMinutes: record.earlyLeaveMinutes,
      earlyLeaveDeduction,
      totalDeduction: totalEmployeeDeduction
    });
  }

  // Sort by total deduction descending
  deductions.sort((a, b) => b.totalDeduction - a.totalDeduction);

  return {
    totalEmployees: report.records.length,
    employeesWithDeductions,
    totalTardyMinutes,
    totalTardyDeduction,
    totalAbsences,
    totalAbsenceDeduction,
    totalEarlyLeaveMinutes,
    totalEarlyLeaveDeduction,
    grandTotalDeduction: totalTardyDeduction + totalAbsenceDeduction + totalEarlyLeaveDeduction,
    deductions
  };
}

export function formatCurrency(amount: number): string {
  return `S/. ${amount.toFixed(2)}`;
}
