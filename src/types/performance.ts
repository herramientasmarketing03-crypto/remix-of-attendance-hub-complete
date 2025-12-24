export type EvaluationStatus = 'draft' | 'submitted' | 'reviewed' | 'approved' | 'completed';

export interface EvaluationCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // 1-100
  score: number; // 1-5
  comments?: string;
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  evaluatorId: string;
  evaluatorName: string;
  period: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'probation';
  
  criteria: EvaluationCriteria[];
  
  overallScore: number; // Calculated from criteria
  classification: 'A' | 'B' | 'C' | 'D';
  
  strengths: string[];
  areasForImprovement: string[];
  objectives: string[];
  
  employeeComments?: string;
  evaluatorComments?: string;
  hrComments?: string;
  
  status: EvaluationStatus;
  
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  approvedAt?: string;
}

export const DEFAULT_EVALUATION_CRITERIA: Omit<EvaluationCriteria, 'id' | 'score' | 'comments'>[] = [
  { name: 'Puntualidad', description: 'Cumplimiento de horarios y asistencia', weight: 15 },
  { name: 'Productividad', description: 'Cumplimiento de metas y objetivos', weight: 25 },
  { name: 'Calidad del Trabajo', description: 'Precisión y atención al detalle', weight: 20 },
  { name: 'Trabajo en Equipo', description: 'Colaboración y comunicación', weight: 15 },
  { name: 'Iniciativa', description: 'Proactividad y propuestas de mejora', weight: 10 },
  { name: 'Conocimiento Técnico', description: 'Dominio de herramientas y procesos', weight: 15 },
];

export function calculateClassification(score: number): 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}
