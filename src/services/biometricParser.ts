import * as XLSX from 'xlsx';
import { BiometricRecord, BiometricUploadResult } from '@/types/payroll';
import { mockEmployees } from '@/data/mockData';

const WORK_START_TIME = '09:00';
const WORK_END_TIME = '18:00';
const TOLERANCE_MINUTES = 10;

interface RawBiometricRow {
  [key: string]: string | number | undefined;
}

// Parse real Excel file from biometric system
export async function parseBiometricFile(file: File): Promise<BiometricRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<RawBiometricRow>(worksheet);
        
        const records = parseExcelData(jsonData);
        resolve(records);
      } catch (error) {
        console.error('Error parsing biometric file:', error);
        reject(new Error('Error al procesar el archivo biométrico'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

function parseExcelData(data: RawBiometricRow[]): BiometricRecord[] {
  const records: BiometricRecord[] = [];
  
  for (const row of data) {
    // Try to find common column names
    const employeeName = String(row['Nombre'] || row['Employee'] || row['Empleado'] || row['Name'] || '');
    const documentId = String(row['DNI'] || row['DocumentId'] || row['Document'] || row['ID'] || '');
    const date = String(row['Fecha'] || row['Date'] || row['Day'] || '');
    const entryTime = String(row['Entrada'] || row['Entry'] || row['CheckIn'] || row['In'] || '');
    const exitTime = String(row['Salida'] || row['Exit'] || row['CheckOut'] || row['Out'] || '');
    
    if (!employeeName && !documentId) continue;
    
    // Try to match with existing employees
    let matchedEmployee = mockEmployees.find(e => e.documentId === documentId);
    if (!matchedEmployee) {
      matchedEmployee = mockEmployees.find(e => 
        e.name.toLowerCase().includes(employeeName.toLowerCase()) ||
        employeeName.toLowerCase().includes(e.name.toLowerCase())
      );
    }
    
    // Calculate tardy minutes
    const tardyMinutes = calculateTardyMinutes(entryTime, WORK_START_TIME, TOLERANCE_MINUTES);
    const workedHours = calculateWorkedHours(entryTime, exitTime);
    const earlyLeaveMinutes = calculateEarlyLeaveMinutes(exitTime, WORK_END_TIME);
    
    // Determine status
    let status: BiometricRecord['status'] = 'normal';
    if (!entryTime && !exitTime) {
      status = 'absent';
    } else if (tardyMinutes > 0) {
      status = 'tardy';
    } else if (earlyLeaveMinutes > 0) {
      status = 'early_leave';
    }
    
    records.push({
      employeeId: matchedEmployee?.id || '',
      employeeName: matchedEmployee?.name || employeeName,
      documentId: matchedEmployee?.documentId || documentId,
      date: formatDate(date),
      entryTime: entryTime || '-',
      exitTime: exitTime || '-',
      scheduledEntry: WORK_START_TIME,
      scheduledExit: WORK_END_TIME,
      tardyMinutes,
      earlyLeaveMinutes,
      workedHours,
      status,
    });
  }
  
  return records;
}

function calculateTardyMinutes(entryTime: string, workStartTime: string, tolerance: number): number {
  if (!entryTime || entryTime === '-') return 0;
  
  try {
    const [entryHour, entryMin] = entryTime.split(':').map(Number);
    const [startHour, startMin] = workStartTime.split(':').map(Number);
    
    const entryTotalMinutes = entryHour * 60 + entryMin;
    const startTotalMinutes = startHour * 60 + startMin;
    const toleranceEnd = startTotalMinutes + tolerance;
    
    if (entryTotalMinutes > toleranceEnd) {
      return entryTotalMinutes - startTotalMinutes;
    }
    
    return 0;
  } catch {
    return 0;
  }
}

function calculateWorkedHours(entryTime: string, exitTime: string): number {
  if (!entryTime || !exitTime || entryTime === '-' || exitTime === '-') return 0;
  
  try {
    const [entryHour, entryMin] = entryTime.split(':').map(Number);
    const [exitHour, exitMin] = exitTime.split(':').map(Number);
    
    const entryTotalMinutes = entryHour * 60 + entryMin;
    const exitTotalMinutes = exitHour * 60 + exitMin;
    
    // Subtract 1 hour for lunch break
    const totalMinutes = exitTotalMinutes - entryTotalMinutes - 60;
    
    return Math.max(0, totalMinutes / 60);
  } catch {
    return 0;
  }
}

function calculateEarlyLeaveMinutes(exitTime: string, workEndTime: string): number {
  if (!exitTime || exitTime === '-') return 0;
  
  try {
    const [exitHour, exitMin] = exitTime.split(':').map(Number);
    const [endHour, endMin] = workEndTime.split(':').map(Number);
    
    const exitTotalMinutes = exitHour * 60 + exitMin;
    const endTotalMinutes = endHour * 60 + endMin;
    
    if (exitTotalMinutes < endTotalMinutes) {
      return endTotalMinutes - exitTotalMinutes;
    }
    
    return 0;
  } catch {
    return 0;
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  
  // Try to parse various date formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  
  // If in DD/MM/YYYY format
  const dmyMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmyMatch) {
    const [, day, month, year] = dmyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return dateStr;
}

// Process biometric records and calculate totals
export function processBiometricRecords(records: BiometricRecord[]): BiometricUploadResult {
  const tardiesDetected = records.filter(r => r.status === 'tardy').length;
  const absencesDetected = records.filter(r => r.status === 'absent').length;
  const totalTardyMinutes = records.reduce((sum, r) => sum + r.tardyMinutes, 0);
  
  // Estimate deduction (assuming S/. 20 per hour)
  const hourlyRate = 20;
  const estimatedDeduction = (totalTardyMinutes / 60) * hourlyRate;
  
  return {
    totalRecords: records.length,
    records,
    processedRecords: records.length,
    tardiesDetected,
    absencesDetected,
    totalTardyMinutes,
    estimatedDeduction,
  };
}
