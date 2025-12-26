import * as XLSX from 'xlsx';
import { BiometricStatRecord, ParsedBiometricReport } from '@/types/payroll';
import { supabase } from '@/integrations/supabase/client';


type RawStatRow = (string | number | undefined)[];

interface EmployeeMatch {
  id: string;
  name: string;
  document_id: string;
  department: string;
}

// Parse time string like "90:00" or "63:33" to minutes
function parseTimeToMinutes(timeStr: string | number | undefined): number {
  if (!timeStr || timeStr === '') return 0;
  const str = String(timeStr).trim();
  if (!str || str === '-') return 0;
  
  const match = str.match(/^(\d+):(\d+)$/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours * 60 + minutes;
  }
  return 0;
}

// Parse name with ~ separator
function parseName(rawName: string | undefined): string {
  if (!rawName) return '';
  return String(rawName).replace(/~/g, ' ').trim();
}

// Parse days attended format "10/9" to { scheduled: 10, actual: 9 }
function parseDaysAttended(value: string | number | undefined): { scheduled: number; actual: number } {
  if (!value) return { scheduled: 0, actual: 0 };
  const str = String(value).trim();
  const match = str.match(/^(\d+)\/(\d+)$/);
  if (match) {
    return { scheduled: parseInt(match[1], 10), actual: parseInt(match[2], 10) };
  }
  return { scheduled: 0, actual: 0 };
}

// Extract period from report
function extractPeriod(data: RawStatRow[]): { start: string; end: string } {
  // Look for period row in first few rows
  for (let i = 0; i < 5; i++) {
    const row = data[i];
    if (!row) continue;
    
    const values = Object.values(row);
    for (const val of values) {
      if (typeof val === 'string' && val.includes('~')) {
        const periodMatch = val.match(/(\d{4}-\d{2}-\d{2})\s*[~\-]\s*(\d{4}-\d{2}-\d{2})/);
        if (periodMatch) {
          return { start: periodMatch[1], end: periodMatch[2] };
        }
      }
    }
  }
  
  // Default to current month if not found
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  };
}

// Fetch employees from database for matching
async function fetchEmployeesForMatching(): Promise<Map<string, EmployeeMatch>> {
  const { data, error } = await supabase
    .from('employees')
    .select('id, name, document_id, department')
    .eq('status', 'active');
  
  if (error || !data) {
    console.error('Error fetching employees:', error);
    return new Map();
  }
  
  const map = new Map<string, EmployeeMatch>();
  for (const emp of data) {
    if (emp.document_id) {
      map.set(emp.document_id.trim(), {
        id: emp.id,
        name: emp.name,
        document_id: emp.document_id,
        department: emp.department
      });
    }
  }
  return map;
}

// Parse the statistical report sheet (Page 2)
function parseStatisticalSheet(worksheet: XLSX.WorkSheet): RawStatRow[] {
  const jsonData = XLSX.utils.sheet_to_json<RawStatRow>(worksheet, { 
    header: 1,
    defval: ''
  });
  return jsonData as RawStatRow[];
}

// Find header row and column indices
function findHeaderIndices(data: RawStatRow[]): { headerRow: number; columns: Record<string, number> } {
  const columns: Record<string, number> = {};
  
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i];
    if (!row || !Array.isArray(row)) continue;
    
    const rowStr = row.map(v => String(v || '').toLowerCase()).join('|');
    
    if (rowStr.includes('id') && (rowStr.includes('nombre') || rowStr.includes('name'))) {
      // Found header row
      for (let j = 0; j < row.length; j++) {
        const cell = String(row[j] || '').toLowerCase().trim();
        if (cell === 'id') columns.id = j;
        if (cell.includes('nombre') || cell === 'name') columns.name = j;
        if (cell.includes('departamento') || cell === 'department') columns.department = j;
        if (cell.includes('normal') && !columns.hoursNormal) columns.hoursNormal = j;
        if (cell.includes('real') && !columns.hoursReal) columns.hoursReal = j;
        if (cell.includes('cantidad') && !columns.tardyCount) columns.tardyCount = j;
        if (cell.includes('minuto') && !columns.tardyMinutes) columns.tardyMinutes = j;
        if (cell.includes('asistidos') || cell.includes('attended')) columns.daysAttended = j;
        if (cell.includes('falta') || cell.includes('absence')) columns.absences = j;
        if (cell.includes('permiso')) columns.permissions = j;
        if (cell.includes('salida') && cell.includes('días')) columns.earlyLeaveDays = j;
      }
      
      // Also check next row for sub-headers (Normal, Real, Cantidad, Minuto)
      const nextRow = data[i + 1];
      if (nextRow && Array.isArray(nextRow)) {
        for (let j = 0; j < nextRow.length; j++) {
          const cell = String(nextRow[j] || '').toLowerCase().trim();
          if (cell === 'normal' && !columns.hoursNormal) columns.hoursNormal = j;
          if (cell === 'real' && !columns.hoursReal) columns.hoursReal = j;
          if (cell === 'cantidad' && !columns.tardyCount) columns.tardyCount = j;
          if (cell === 'minuto' && !columns.tardyMinutes) columns.tardyMinutes = j;
        }
        return { headerRow: i + 1, columns }; // Skip sub-header row
      }
      
      return { headerRow: i, columns };
    }
  }
  
  // Default column positions based on typical format
  return {
    headerRow: 3,
    columns: {
      id: 0,
      name: 1,
      department: 2,
      hoursNormal: 3,
      hoursReal: 4,
      tardyCount: 5,
      tardyMinutes: 6,
      earlyLeaveCount: 7,
      earlyLeaveMinutes: 8,
      overtimeWeekday: 9,
      overtimeHoliday: 10,
      daysAttended: 11,
      earlyLeaveDays: 12,
      absences: 13,
      permissions: 14
    }
  };
}

// Main parser function for real biometric Excel files
export async function parseBiometricFile(file: File): Promise<ParsedBiometricReport> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Find the statistical report sheet (usually Page 2 or "Reporte Estadístico")
        let targetSheet: XLSX.WorkSheet | null = null;
        let sheetName = '';
        
        // Try to find by name first
        for (const name of workbook.SheetNames) {
          if (name.toLowerCase().includes('estad') || name.toLowerCase().includes('page 2')) {
            targetSheet = workbook.Sheets[name];
            sheetName = name;
            break;
          }
        }
        
        // If not found, use second sheet or first
        if (!targetSheet) {
          sheetName = workbook.SheetNames[1] || workbook.SheetNames[0];
          targetSheet = workbook.Sheets[sheetName];
        }
        
        if (!targetSheet) {
          throw new Error('No se encontró la hoja de datos estadísticos');
        }
        
        const rawData = parseStatisticalSheet(targetSheet);
        const period = extractPeriod(rawData);
        const { headerRow, columns } = findHeaderIndices(rawData);
        
        // Fetch employees for matching
        const employeeMap = await fetchEmployeesForMatching();
        
        const records: BiometricStatRecord[] = [];
        let matchedCount = 0;
        let unmatchedCount = 0;
        let totalTardyMinutes = 0;
        let totalAbsences = 0;
        let totalEarlyLeaveMinutes = 0;
        let totalOvertimeMinutes = 0;
        
        // Parse data rows (start after header)
        for (let i = headerRow + 1; i < rawData.length; i++) {
          const row = rawData[i];
          if (!row || !Array.isArray(row)) continue;
          
          const documentId = String(row[columns.id] || '').trim();
          if (!documentId || documentId.length < 5) continue; // Skip invalid rows
          
          const rawName = String(row[columns.name] || '');
          const employeeName = parseName(rawName);
          const department = String(row[columns.department] || 'Empresa');
          
          const hoursNormal = parseTimeToMinutes(row[columns.hoursNormal]);
          const hoursReal = parseTimeToMinutes(row[columns.hoursReal]);
          const tardyCount = parseInt(String(row[columns.tardyCount] || 0), 10) || 0;
          const tardyMinutes = parseInt(String(row[columns.tardyMinutes] || 0), 10) || 0;
          const earlyLeaveCount = parseInt(String(row[columns.earlyLeaveCount] || 0), 10) || 0;
          const earlyLeaveMinutes = parseInt(String(row[columns.earlyLeaveMinutes] || 0), 10) || 0;
          const overtimeWeekday = parseTimeToMinutes(row[columns.overtimeWeekday]);
          const overtimeHoliday = parseTimeToMinutes(row[columns.overtimeHoliday]);
          const daysData = parseDaysAttended(row[columns.daysAttended]);
          const earlyLeaveDays = parseInt(String(row[columns.earlyLeaveDays] || 0), 10) || 0;
          const absences = parseInt(String(row[columns.absences] || 0), 10) || 0;
          const permissions = parseInt(String(row[columns.permissions] || 0), 10) || 0;
          
          // Match with employee
          const matchedEmployee = employeeMap.get(documentId);
          const isMatched = !!matchedEmployee;
          
          if (isMatched) {
            matchedCount++;
          } else {
            unmatchedCount++;
          }
          
          totalTardyMinutes += tardyMinutes;
          totalAbsences += absences;
          totalEarlyLeaveMinutes += earlyLeaveMinutes;
          totalOvertimeMinutes += overtimeWeekday + overtimeHoliday;
          
          records.push({
            employeeId: matchedEmployee?.id || null,
            employeeName: matchedEmployee?.name || employeeName,
            documentId,
            department: matchedEmployee?.department || department,
            scheduledHours: hoursNormal,
            actualHours: hoursReal,
            tardyCount,
            tardyMinutes,
            earlyLeaveCount,
            earlyLeaveMinutes,
            overtimeWeekday,
            overtimeHoliday,
            daysScheduled: daysData.scheduled,
            daysAttended: daysData.actual,
            earlyLeaveDays,
            absences,
            permissions,
            isMatched
          });
        }
        
        resolve({
          period,
          totalEmployees: records.length,
          matchedEmployees: matchedCount,
          unmatchedEmployees: unmatchedCount,
          records,
          summary: {
            totalTardyMinutes,
            totalAbsences,
            totalEarlyLeaveMinutes,
            totalOvertimeMinutes
          }
        });
        
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

// Format minutes as HH:MM string
export function formatMinutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}

// Calculate estimated deduction based on tardy minutes
export function calculateEstimatedDeduction(tardyMinutes: number, hourlyRate: number = 20): number {
  return (tardyMinutes / 60) * hourlyRate;
}
