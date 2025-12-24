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
