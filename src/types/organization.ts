import { Department } from './attendance';

export interface Position {
  id: string;
  name: string;
  level: 'gerente' | 'jefe' | 'coordinador' | 'supervisor' | 'senior' | 'junior' | 'practicante';
  description: string;
  requirements: string[];
  responsibilities: string[];
}

export interface DepartmentPosition {
  positionId: string;
  position: Position;
  reportsTo?: string; // positionId of supervisor
  employeeCount: number;
  vacant: number;
}

export interface DepartmentInfo {
  department: Department;
  name: string;
  color: string;
  icon: string;
  description: string;
  mission: string;
  headPosition: string; // positionId of department head
  positions: DepartmentPosition[];
  functions: string[];
  objectives: string[];
}

export interface OrgChartNode {
  id: string;
  name: string;
  position: string;
  department?: Department;
  avatar?: string;
  email?: string;
  children?: OrgChartNode[];
}

export interface CompanyStructure {
  name: string;
  ceo: OrgChartNode;
  departments: DepartmentInfo[];
}
