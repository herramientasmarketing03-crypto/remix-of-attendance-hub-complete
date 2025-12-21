import { Department } from './attendance';

// Agenda y Actividades
export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time?: string;
  type: 'meeting' | 'training' | 'event' | 'deadline' | 'birthday' | 'anniversary' | 'other';
  department?: Department;
  participants?: string[];
  createdBy: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority?: 'alta' | 'media' | 'baja';
}

// Base de datos de personal
export type PersonnelStatus = 'active' | 'applicant' | 'terminated';

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: Department;
  cvUrl?: string;
  appliedAt: string;
  status: 'pending' | 'interview' | 'approved' | 'rejected';
  notes?: string;
  source: 'web' | 'referral' | 'linkedin' | 'other';
  experience: string;
  salary_expectation?: number;
}

export interface TerminatedEmployee {
  id: string;
  employeeId: string;
  name: string;
  department: Department;
  position: string;
  hireDate: string;
  terminationDate: string;
  terminationType: 'voluntary' | 'dismissal' | 'contract_end' | 'retirement' | 'mutual_agreement';
  reason: string;
  processedBy: string;
  clearanceComplete: boolean;
  finalSettlementPaid: boolean;
}

// Justificaciones con validación DCTS
export type JustificationType = 'tardanza' | 'falta' | 'salida_temprana' | 'permiso' | 'licencia';

export interface JustificationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: JustificationType;
  date: string;
  description: string;
  evidenceUrl?: string;
  evidenceType?: 'medical' | 'document' | 'photo' | 'other';
  submittedAt: string;
  dctsValidation?: {
    validated: boolean;
    validatedAt?: string;
    validatedBy?: string;
    observations?: string;
  };
  approvalFlow: {
    jefeApproval?: { approved: boolean; date: string; by: string };
    rrhhApproval?: { approved: boolean; date: string; by: string };
  };
  status: 'pending' | 'jefe_approved' | 'rrhh_approved' | 'rejected';
}

// Tracker de tareas
export type TaskPriority = 'alta' | 'media' | 'baja';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  department?: Department;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  tags?: string[];
}

// Plan de trabajo
export interface WorkPlan {
  id: string;
  title: string;
  description: string;
  department: Department;
  startDate: string;
  endDate: string;
  objectives: WorkPlanObjective[];
  createdBy: string;
  status: 'draft' | 'active' | 'completed';
}

export interface WorkPlanObjective {
  id: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Clasificación de empleados/asesores
export type EmployeeClassification = 'A' | 'B' | 'C' | 'D';
export type BonusCondition = 'eligible' | 'not_eligible' | 'pending_review';

export interface EmployeePerformance {
  id: string;
  employeeId: string;
  period: string;
  classification: EmployeeClassification;
  bonusCondition: BonusCondition;
  kpis: KPI[];
  overallScore: number;
  observations?: string;
  evaluatedBy: string;
  evaluatedAt: string;
}

export interface KPI {
  name: string;
  target: number;
  actual: number;
  weight: number;
}

// Requerimientos de área (fijos y variables)
export type ExpenseType = 'fijo' | 'variable';

export interface AreaRequirement {
  id: string;
  department: Department;
  title: string;
  description: string;
  type: ExpenseType;
  category: 'software' | 'hardware' | 'service' | 'personnel' | 'training' | 'other';
  estimatedCost: number;
  justification: string;
  requestedBy: string;
  requestedAt: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pending' | 'approved' | 'rejected' | 'in_evaluation';
  approvedBy?: string;
  approvedAt?: string;
  recurring?: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly' | 'one_time';
}

// Inventario y logística
export interface InventoryItem {
  id: string;
  name: string;
  category: 'equipment' | 'furniture' | 'supplies' | 'software_license' | 'vehicle' | 'other';
  quantity: number;
  unit: string;
  location: string;
  assignedTo?: string;
  department?: Department;
  status: 'available' | 'in_use' | 'maintenance' | 'disposed';
  purchaseDate?: string;
  warranty?: string;
  value: number;
  serialNumber?: string;
}
