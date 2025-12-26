export type Department =
  | 'comercial'
  | 'soporte'
  | 'marketing'
  | 'campanas'
  | 'ti'
  | 'digitalcollege'
  | 'rrhh'
  | 'finanzas';

export const DEPARTMENTS: Record<Department, { name: string; color: string; icon: string }> = {
  comercial: { name: 'Comercial', color: 'hsl(217 91% 50%)', icon: 'briefcase' },
  soporte: { name: 'Soporte', color: 'hsl(142 76% 36%)', icon: 'headphones' },
  marketing: { name: 'Marketing', color: 'hsl(326 100% 50%)', icon: 'megaphone' },
  campanas: { name: 'Campañas', color: 'hsl(38 92% 50%)', icon: 'target' },
  ti: { name: 'TI', color: 'hsl(188 94% 43%)', icon: 'code' },
  digitalcollege: { name: 'Digital College', color: 'hsl(262 83% 58%)', icon: 'graduation-cap' },
  rrhh: { name: 'RRHH', color: 'hsl(350 89% 60%)', icon: 'users' },
  finanzas: { name: 'Finanzas', color: 'hsl(45 93% 47%)', icon: 'calculator' },
};

export interface Employee {
  id: string;
  documentId: string;
  name: string;
  department: Department;
  position?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  hireDate?: string;
  contractType?: ContractType;
  contractEndDate?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  scheduledHours: number;
  workedHours: number;
  tardyCount: number;
  tardyMinutes: number;
  earlyLeaveCount: number;
  earlyLeaveMinutes: number;
  overtimeWeekday: number;
  overtimeHoliday: number;
  daysAttended: number;
  absences: number;
  permissions: number;
  status: 'pending' | 'validated' | 'rejected' | 'justified';
  justification?: Justification;
}

export interface Justification {
  id: string;
  recordId: string;
  type: 'medical' | 'personal' | 'work' | 'other';
  description: string;
  evidenceUrl?: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface AttendanceMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  department: Department;
  subject: string;
  message: string;
  attachmentUrl?: string;
  recordIds?: string[];
  createdAt: string;
  readAt?: string;
  replied?: boolean;
}

export interface DepartmentStats {
  department: Department;
  totalEmployees: number;
  presentToday: number;
  absences: number;
  tardies: number;
  overtimeHours: number;
  attendanceRate: number;
}

export interface EmployeeStats {
  employeeId: string;
  totalWorkDays: number;
  daysAttended: number;
  absences: number;
  tardies: number;
  totalTardyMinutes: number;
  earlyLeaves: number;
  totalOvertimeHours: number;
  attendanceRate: number;
}

export interface UploadedReport {
  id: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  periodStart: string;
  periodEnd: string;
  recordCount: number;
  status: 'processing' | 'completed' | 'error';
}

export type ContractType = 'indefinido' | 'plazo_fijo' | 'tiempo_parcial' | 'practicas' | 'locacion';

export interface EmployeeContract {
  id: string;
  employeeId: string;
  type: ContractType;
  startDate: string;
  endDate?: string;
  salary: number;
  position: string;
  department: Department;
  status: 'active' | 'expired' | 'pending_renewal';
  probationEndDate?: string;
  documentsComplete: boolean;
}

export type RequirementPriority = 'alta' | 'media' | 'baja';
export type RequirementStatus = 'pending' | 'approved' | 'rejected' | 'in_process' | 'completed';

export interface PersonnelRequirement {
  id: string;
  department: Department;
  requestedBy: string;
  position: string;
  quantity: number;
  justification: string;
  priority: RequirementPriority;
  status: RequirementStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  requirements: string[];
  salaryRange?: { min: number; max: number };
  contractType: ContractType;
}

export type SanctionType = 'verbal_warning' | 'written_warning' | 'suspension' | 'dismissal';
export type InfractionLevel = 'leve' | 'grave' | 'muy_grave';

export interface Sanction {
  id: string;
  employeeId: string;
  type: SanctionType;
  infractionLevel: InfractionLevel;
  description: string;
  regulationArticle: string;
  date: string;
  appliedBy: string;
  daysOfSuspension?: number;
  status: 'active' | 'appealed' | 'revoked' | 'justified';
  notes?: string;
}

export interface RegulationArticle {
  number: string;
  title: string;
  content: string;
  category: 'generalidades' | 'admision' | 'derechos_empleador' | 'derechos_colaborador' | 'jornada' | 'ausencias' | 'remuneraciones' | 'descansos' | 'faltas_sanciones';
}

export type AddendumType = 'salary_increase' | 'position_change' | 'schedule_change' | 'contract_extension' | 'benefits' | 'other';

export interface ContractAddendum {
  id: string;
  contractId: string;
  employeeId: string;
  type: AddendumType;
  description: string;
  effectiveDate: string;
  previousValue?: string;
  newValue?: string;
  createdAt: string;
  createdBy: string;
  status: 'active' | 'pending' | 'revoked';
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Permission {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  type: 'personal' | 'medical' | 'academic' | 'family' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  evidenceUrl?: string;
}
