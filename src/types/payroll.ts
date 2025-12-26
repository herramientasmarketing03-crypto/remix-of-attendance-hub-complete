export interface PayslipDeduction {
  concept: string;
  amount: number;
  type: 'fixed' | 'percentage' | 'calculated';
}

export interface Payslip {
  id: string;
  employeeId: string;
  period: string;
  date: string;
  grossSalary: number;
  
  // Attendance-based calculations
  tardyMinutes: number;
  tardyDeduction: number;
  absenceDays: number;
  absenceDeduction: number;
  overtimeHours: number;
  overtimePay: number;
  
  // Fixed deductions
  afpDeduction: number; // 13%
  incomeTaxDeduction: number;
  otherDeductions: PayslipDeduction[];
  
  // Totals
  totalDeductions: number;
  totalBonuses: number;
  netSalary: number;
  
  status: 'pending' | 'generated' | 'approved' | 'paid';
  generatedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface BiometricRecord {
  employeeId: string;
  employeeName: string;
  documentId: string;
  date: string;
  entryTime: string;
  exitTime: string;
  scheduledEntry: string;
  scheduledExit: string;
  tardyMinutes: number;
  earlyLeaveMinutes: number;
  workedHours: number;
  status: 'normal' | 'tardy' | 'absent' | 'early_leave';
}

export interface BiometricUploadResult {
  totalRecords: number;
  processedRecords: number;
  tardiesDetected: number;
  totalTardyMinutes: number;
  absencesDetected: number;
  estimatedDeduction: number;
  records: BiometricRecord[];
}

// Parsed statistical biometric report (from Excel Página 2)
export interface BiometricStatRecord {
  employeeId: string | null;
  employeeName: string;
  documentId: string;
  department: string;
  scheduledHours: number; // in minutes
  actualHours: number; // in minutes
  tardyCount: number;
  tardyMinutes: number;
  earlyLeaveCount: number;
  earlyLeaveMinutes: number;
  overtimeWeekday: number; // in minutes
  overtimeHoliday: number; // in minutes
  daysScheduled: number;
  daysAttended: number;
  earlyLeaveDays: number;
  absences: number;
  permissions: number;
  isMatched: boolean; // if found in employees table
}

export interface ParsedBiometricReport {
  period: {
    start: string;
    end: string;
  };
  totalEmployees: number;
  matchedEmployees: number;
  unmatchedEmployees: number;
  records: BiometricStatRecord[];
  summary: {
    totalTardyMinutes: number;
    totalAbsences: number;
    totalEarlyLeaveMinutes: number;
    totalOvertimeMinutes: number;
  };
}

export interface DuplicateCheckResult {
  hasDuplicates: boolean;
  existingCount: number;
  existingDates: string[];
}

export type UploadConflictAction = 'overwrite' | 'skip' | 'cancel';
