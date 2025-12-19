import { Employee, AttendanceRecord, AttendanceMessage, Department, DepartmentStats, UploadedReport, EmployeeContract, PersonnelRequirement, Sanction, RegulationArticle, ContractAddendum, VacationRequest, Permission } from '@/types/attendance';

export const mockEmployees: Employee[] = [
  { id: '1', documentId: '75670401', name: 'Aracely Reque', department: 'comercial', position: 'Ejecutiva de Ventas', email: 'aracely.reque@empresa.com', phone: '987654321', hireDate: '2023-03-15', contractType: 'indefinido', status: 'active' },
  { id: '2', documentId: '70862865', name: 'Lesly Lopez', department: 'comercial', position: 'Asistente Comercial', email: 'lesly.lopez@empresa.com', phone: '987654322', hireDate: '2024-01-10', contractType: 'plazo_fijo', contractEndDate: '2025-01-10', status: 'active' },
  { id: '3', documentId: '73870722', name: 'Zuleica Roque', department: 'marketing', position: 'Community Manager', email: 'zuleica.roque@empresa.com', phone: '987654323', hireDate: '2022-06-01', contractType: 'indefinido', status: 'active' },
  { id: '4', documentId: '76801962', name: 'Christian Maldon', department: 'ti', position: 'Desarrollador Frontend', email: 'christian.maldon@empresa.com', phone: '987654324', hireDate: '2023-09-01', contractType: 'indefinido', status: 'active' },
  { id: '5', documentId: '71717084', name: 'Andrea Paz', department: 'soporte', position: 'Agente de Soporte', email: 'andrea.paz@empresa.com', phone: '987654325', hireDate: '2024-06-01', contractType: 'practicas', contractEndDate: '2025-06-01', status: 'active' },
  { id: '6', documentId: '74394191', name: 'Leonardo Minaya', department: 'ti', position: 'DevOps Engineer', email: 'leonardo.minaya@empresa.com', phone: '987654326', hireDate: '2022-01-15', contractType: 'indefinido', status: 'active' },
  { id: '7', documentId: '72491674', name: 'Alejandra Quispe', department: 'campanas', position: 'Coordinadora de Campañas', email: 'alejandra.quispe@empresa.com', phone: '987654327', hireDate: '2023-04-01', contractType: 'indefinido', status: 'active' },
  { id: '8', documentId: '76749877', name: 'Daniel Castillo', department: 'digitalcollege', position: 'Instructor', email: 'daniel.castillo@empresa.com', phone: '987654328', hireDate: '2024-02-15', contractType: 'tiempo_parcial', status: 'active' },
  { id: '9', documentId: '72868766', name: 'Alejandro Barrientos', department: 'soporte', position: 'Supervisor de Soporte', email: 'alejandro.barrientos@empresa.com', phone: '987654329', hireDate: '2021-08-01', contractType: 'indefinido', status: 'active' },
  { id: '10', documentId: '75083276', name: 'Luis Manrique', department: 'marketing', position: 'Diseñador Gráfico', email: 'luis.manrique@empresa.com', phone: '987654330', hireDate: '2023-11-01', contractType: 'plazo_fijo', contractEndDate: '2024-11-01', status: 'active' },
  { id: '11', documentId: '72209631', name: 'Miluska Mendivil', department: 'comercial', position: 'Gerente Comercial', email: 'miluska.mendivil@empresa.com', phone: '987654331', hireDate: '2020-03-01', contractType: 'indefinido', status: 'active' },
  { id: '12', documentId: '76077253', name: 'Angel Plasencia', department: 'ti', position: 'Backend Developer', email: 'angel.plasencia@empresa.com', phone: '987654332', hireDate: '2024-03-01', contractType: 'plazo_fijo', contractEndDate: '2025-03-01', status: 'active' },
  { id: '13', documentId: '72976894', name: 'Angheli Trujillo', department: 'campanas', position: 'Ejecutiva de Campañas', email: 'angheli.trujillo@empresa.com', phone: '987654333', hireDate: '2023-07-15', contractType: 'indefinido', status: 'active' },
  { id: '14', documentId: '71161185', name: 'Celeste Ramos', department: 'digitalcollege', position: 'Coordinadora Académica', email: 'celeste.ramos@empresa.com', phone: '987654334', hireDate: '2022-09-01', contractType: 'indefinido', status: 'active' },
  { id: '15', documentId: '73335122', name: 'Jazmin Ledesma', department: 'soporte', position: 'Agente Senior', email: 'jazmin.ledesma@empresa.com', phone: '987654335', hireDate: '2021-05-01', contractType: 'indefinido', status: 'active' },
];

export const mockContracts: EmployeeContract[] = [
  { id: 'c1', employeeId: '1', type: 'indefinido', startDate: '2023-03-15', salary: 2500, position: 'Ejecutiva de Ventas', department: 'comercial', status: 'active', probationEndDate: '2023-06-15', documentsComplete: true },
  { id: 'c2', employeeId: '2', type: 'plazo_fijo', startDate: '2024-01-10', endDate: '2025-01-10', salary: 1800, position: 'Asistente Comercial', department: 'comercial', status: 'active', documentsComplete: true },
  { id: 'c3', employeeId: '3', type: 'indefinido', startDate: '2022-06-01', salary: 2800, position: 'Community Manager', department: 'marketing', status: 'active', documentsComplete: true },
  { id: 'c4', employeeId: '4', type: 'indefinido', startDate: '2023-09-01', salary: 4500, position: 'Desarrollador Frontend', department: 'ti', status: 'active', documentsComplete: true },
  { id: 'c5', employeeId: '5', type: 'practicas', startDate: '2024-06-01', endDate: '2025-06-01', salary: 1200, position: 'Agente de Soporte', department: 'soporte', status: 'active', documentsComplete: false },
  { id: 'c6', employeeId: '6', type: 'indefinido', startDate: '2022-01-15', salary: 5500, position: 'DevOps Engineer', department: 'ti', status: 'active', documentsComplete: true },
  { id: 'c7', employeeId: '10', type: 'plazo_fijo', startDate: '2023-11-01', endDate: '2024-11-01', salary: 2200, position: 'Diseñador Gráfico', department: 'marketing', status: 'pending_renewal', documentsComplete: true },
  { id: 'c8', employeeId: '12', type: 'plazo_fijo', startDate: '2024-03-01', endDate: '2025-03-01', salary: 4000, position: 'Backend Developer', department: 'ti', status: 'active', documentsComplete: true },
];

export const mockRequirements: PersonnelRequirement[] = [
  {
    id: 'r1',
    department: 'ti',
    requestedBy: 'Jefe TI - Carlos Ruiz',
    position: 'Desarrollador Full Stack',
    quantity: 2,
    justification: 'Incremento de proyectos y necesidad de ampliar el equipo de desarrollo para cumplir con los plazos de entrega.',
    priority: 'alta',
    status: 'approved',
    createdAt: '2024-11-15T10:00:00Z',
    approvedAt: '2024-11-20T14:00:00Z',
    approvedBy: 'Gerencia General',
    requirements: ['3+ años de experiencia', 'React/Node.js', 'Trabajo en equipo'],
    salaryRange: { min: 4000, max: 6000 },
    contractType: 'indefinido',
  },
  {
    id: 'r2',
    department: 'comercial',
    requestedBy: 'Gerente Comercial',
    position: 'Ejecutivo de Ventas',
    quantity: 3,
    justification: 'Expansión del área comercial para nuevas zonas de cobertura.',
    priority: 'media',
    status: 'pending',
    createdAt: '2024-12-01T09:00:00Z',
    requirements: ['Experiencia en ventas', 'Licencia de conducir', 'Disponibilidad para viajar'],
    salaryRange: { min: 2000, max: 3000 },
    contractType: 'plazo_fijo',
  },
  {
    id: 'r3',
    department: 'soporte',
    requestedBy: 'Supervisor de Soporte',
    position: 'Agente de Soporte Técnico',
    quantity: 1,
    justification: 'Reemplazo por renuncia del colaborador anterior.',
    priority: 'alta',
    status: 'in_process',
    createdAt: '2024-11-28T11:00:00Z',
    approvedAt: '2024-11-30T10:00:00Z',
    approvedBy: 'RRHH',
    requirements: ['Conocimiento técnico', 'Atención al cliente', 'Inglés intermedio'],
    salaryRange: { min: 1500, max: 2000 },
    contractType: 'indefinido',
  },
];

export const mockSanctions: Sanction[] = [
  {
    id: 's1',
    employeeId: '5',
    type: 'verbal_warning',
    infractionLevel: 'leve',
    description: 'Tardanza reiterada sin justificación (Art. 50 - Llegar tarde a su centro de trabajo)',
    regulationArticle: 'Art. 50',
    date: '2024-11-20',
    appliedBy: 'RRHH',
    status: 'active',
  },
  {
    id: 's2',
    employeeId: '8',
    type: 'written_warning',
    infractionLevel: 'grave',
    description: 'Incumplimiento de actividades asignadas (Art. 50 - Faltas Graves)',
    regulationArticle: 'Art. 50',
    date: '2024-11-25',
    appliedBy: 'Jefe de Área',
    status: 'active',
  },
];

export const mockRegulations: RegulationArticle[] = [
  { number: 'Art. 19', title: 'Jornada de Trabajo', content: 'La jornada ordinaria de trabajo es: Lunes a viernes de 09:00 a 13:00 y de 14:00 a 18:00. Sábado de 09:00 a 13:00 (4 horas laborales). Los horarios pueden ser modificados respetando las 48 horas laborables por semana.', category: 'jornada' },
  { number: 'Art. 20', title: 'Horario de Refrigerio', content: 'El horario de refrigerio es de sesenta (60) minutos diariamente, de 13:00 a 14:00 horas.', category: 'jornada' },
  { number: 'Art. 22', title: 'Registro de Asistencia', content: 'El colaborador está obligado a registrar su asistencia de forma personal. Las tardanzas en jornadas virtuales también son consideradas cuando no se asiste a la hora pactada.', category: 'jornada' },
  { number: 'Art. 24', title: 'Ausencias', content: 'Las ausencias originan incumplimiento de la principal obligación del colaborador y relevan a la empresa de abonar la remuneración correspondiente, salvo casos excepcionales de ley.', category: 'ausencias' },
  { number: 'Art. 25', title: 'Permisos', content: 'Permiso es la autorización escrita para ausentarse momentáneamente, con cargo a compensar las horas dejadas de laborar. Requiere aviso de 48 horas de anticipación.', category: 'ausencias' },
  { number: 'Art. 28', title: 'Licencias con Goce', content: 'Licencias con goce: Por enfermedad, maternidad, fallecimiento familiar (3 días, extensible a 6 si es en provincia), capacitación, citación judicial/policial.', category: 'ausencias' },
  { number: 'Art. 36', title: 'Vacaciones', content: 'El colaborador tiene derecho a 15 días calendario de descanso vacacional remunerado al año, por cada año completo de servicios.', category: 'descansos' },
  { number: 'Art. 39', title: 'Definición de Falta', content: 'Toda acción u omisión que signifique incumplimiento del reglamento, órdenes o directivas se considerará falta que da origen a sanción.', category: 'faltas_sanciones' },
  { number: 'Art. 41', title: 'Tipos de Sanciones', content: 'Las sanciones pueden ser: Amonestación verbal, Amonestación escrita, Suspensión sin goce de remuneraciones, Despido.', category: 'faltas_sanciones' },
  { number: 'Art. 42', title: 'Amonestación Verbal', content: 'Se aplica cuando la falta es primaria, leve y no reviste gravedad. A cargo de RRHH o jefe inmediato.', category: 'faltas_sanciones' },
  { number: 'Art. 43', title: 'Amonestación Escrita', content: 'Se aplica en casos de faltas graves. La suspensión sin goce aplica cuando la falta es muy grave pero no amerita despido.', category: 'faltas_sanciones' },
  { number: 'Art. 50', title: 'Clasificación de Faltas', content: 'Faltas leves: Tardanzas, uso de celular para fines no laborales, no usar uniforme, dejar equipos encendidos. Faltas graves: Disminución intencional del trabajo, dormir en horario laboral. Muy graves: Alterar registros de asistencia, marcar asistencia de otro, faltar el respeto.', category: 'faltas_sanciones' },
  { number: 'Art. 9', title: 'Período de Prueba', content: 'Los tres primeros meses de servicio serán considerados como periodo de prueba, salvo estipulación contractual distinta.', category: 'admision' },
  { number: 'Art. 8', title: 'Requisitos de Ingreso', content: 'Requisitos: CV documentado, copia de DNI o Carnet de Extranjería, comprobante de domicilio, antecedente policial o Certijoven, examen médico laboral.', category: 'admision' },
];

export const mockAttendanceRecords: AttendanceRecord[] = mockEmployees.flatMap((emp) => {
  const records: AttendanceRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const hasAbsence = Math.random() < 0.1;
    const hasTardy = !hasAbsence && Math.random() < 0.15;
    const hasOvertime = !hasAbsence && Math.random() < 0.2;

    records.push({
      id: `${emp.id}-${date.toISOString().split('T')[0]}`,
      employeeId: emp.id,
      date: date.toISOString().split('T')[0],
      scheduledHours: 9,
      workedHours: hasAbsence ? 0 : (9 + (hasOvertime ? Math.random() * 3 : 0)),
      tardyCount: hasTardy ? 1 : 0,
      tardyMinutes: hasTardy ? Math.floor(Math.random() * 30) + 5 : 0,
      earlyLeaveCount: Math.random() < 0.05 ? 1 : 0,
      earlyLeaveMinutes: Math.random() < 0.05 ? Math.floor(Math.random() * 60) : 0,
      overtimeWeekday: hasOvertime ? Math.random() * 2 : 0,
      overtimeHoliday: 0,
      daysAttended: hasAbsence ? 0 : 1,
      absences: hasAbsence ? 1 : 0,
      permissions: 0,
      status: hasAbsence ? 'pending' : 'validated',
    });
  }

  return records;
});

export const mockMessages: AttendanceMessage[] = [
  {
    id: '1',
    fromUserId: 'hr-1',
    fromUserName: 'RRHH - María García',
    toUserId: 'manager-comercial',
    toUserName: 'Gerente Comercial',
    department: 'comercial',
    subject: 'Revisión de asistencia - Semana 48',
    message: 'Por favor revisar las faltas del equipo comercial de esta semana. Se requiere justificación para 2 colaboradores.',
    createdAt: new Date().toISOString(),
    recordIds: ['1-2024-12-02', '2-2024-12-03'],
  },
  {
    id: '2',
    fromUserId: 'manager-ti',
    fromUserName: 'Jefe TI - Carlos Ruiz',
    toUserId: 'hr-1',
    toUserName: 'RRHH',
    department: 'ti',
    subject: 'Justificación de horas extras',
    message: 'Adjunto la justificación de horas extras del equipo por el proyecto de migración.',
    attachmentUrl: '/evidence/overtime-dec.pdf',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    readAt: new Date().toISOString(),
    replied: true,
  },
  {
    id: '3',
    fromUserId: 'hr-1',
    fromUserName: 'RRHH',
    toUserId: 'manager-soporte',
    toUserName: 'Supervisor de Soporte',
    department: 'soporte',
    subject: 'Requerimiento de personal aprobado',
    message: 'Se ha aprobado el requerimiento de 1 Agente de Soporte Técnico. Por favor coordinar el proceso de selección.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    readAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const mockDepartmentStats: DepartmentStats[] = [
  { department: 'comercial', totalEmployees: 25, presentToday: 23, absences: 2, tardies: 3, overtimeHours: 12, attendanceRate: 92 },
  { department: 'soporte', totalEmployees: 18, presentToday: 17, absences: 1, tardies: 2, overtimeHours: 8, attendanceRate: 94 },
  { department: 'marketing', totalEmployees: 12, presentToday: 12, absences: 0, tardies: 1, overtimeHours: 5, attendanceRate: 100 },
  { department: 'campanas', totalEmployees: 15, presentToday: 14, absences: 1, tardies: 1, overtimeHours: 15, attendanceRate: 93 },
  { department: 'ti', totalEmployees: 20, presentToday: 19, absences: 1, tardies: 0, overtimeHours: 25, attendanceRate: 95 },
  { department: 'digitalcollege', totalEmployees: 10, presentToday: 9, absences: 1, tardies: 2, overtimeHours: 3, attendanceRate: 90 },
];

export const mockUploadedReports: UploadedReport[] = [
  {
    id: '1',
    fileName: 'StandardReport_Nov23-Dec05.xls',
    uploadedAt: new Date().toISOString(),
    uploadedBy: 'María García',
    periodStart: '2024-11-23',
    periodEnd: '2024-12-05',
    recordCount: 65,
    status: 'completed',
  },
  {
    id: '2',
    fileName: 'StandardReport_Nov08-Nov22.xls',
    uploadedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    uploadedBy: 'María García',
    periodStart: '2024-11-08',
    periodEnd: '2024-11-22',
    recordCount: 65,
    status: 'completed',
  },
];

export const CONTRACT_TYPES: Record<string, { name: string; variant: 'success' | 'warning' | 'primary' | 'secondary' | 'info' }> = {
  indefinido: { name: 'Indefinido', variant: 'success' },
  plazo_fijo: { name: 'Plazo Fijo', variant: 'warning' },
  tiempo_parcial: { name: 'Tiempo Parcial', variant: 'primary' },
  practicas: { name: 'Prácticas', variant: 'secondary' },
  locacion: { name: 'Locación de Servicios', variant: 'info' },
};

export const REQUIREMENT_STATUS: Record<string, { name: string; className: string }> = {
  pending: { name: 'Pendiente', className: 'bg-warning/10 text-warning border-warning/20' },
  approved: { name: 'Aprobado', className: 'bg-success/10 text-success border-success/20' },
  rejected: { name: 'Rechazado', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  in_process: { name: 'En Proceso', className: 'bg-primary/10 text-primary border-primary/20' },
  completed: { name: 'Completado', className: 'bg-info/10 text-info border-info/20' },
};

export const PRIORITY_LEVELS: Record<string, { name: string; className: string }> = {
  alta: { name: 'Alta', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  media: { name: 'Media', className: 'bg-warning/10 text-warning border-warning/20' },
  baja: { name: 'Baja', className: 'bg-success/10 text-success border-success/20' },
};

export const ADDENDUM_TYPES: Record<string, { name: string; icon: string }> = {
  salary_increase: { name: 'Aumento de Salario', icon: 'dollar-sign' },
  position_change: { name: 'Cambio de Cargo', icon: 'briefcase' },
  schedule_change: { name: 'Cambio de Horario', icon: 'clock' },
  contract_extension: { name: 'Extensión de Contrato', icon: 'calendar' },
  benefits: { name: 'Beneficios', icon: 'gift' },
  other: { name: 'Otro', icon: 'file-text' },
};

export const mockAddendums: ContractAddendum[] = [
  {
    id: 'add1',
    contractId: 'c1',
    employeeId: '1',
    type: 'salary_increase',
    description: 'Aumento salarial por desempeño sobresaliente en el período 2024',
    effectiveDate: '2024-07-01',
    previousValue: 'S/. 2,200',
    newValue: 'S/. 2,500',
    createdAt: '2024-06-15T10:00:00Z',
    createdBy: 'RRHH',
    status: 'active',
  },
  {
    id: 'add2',
    contractId: 'c4',
    employeeId: '4',
    type: 'position_change',
    description: 'Promoción a Desarrollador Senior',
    effectiveDate: '2024-09-01',
    previousValue: 'Desarrollador Frontend',
    newValue: 'Desarrollador Senior',
    createdAt: '2024-08-20T14:00:00Z',
    createdBy: 'Jefe TI',
    status: 'active',
  },
  {
    id: 'add3',
    contractId: 'c2',
    employeeId: '2',
    type: 'contract_extension',
    description: 'Extensión del contrato por 6 meses adicionales',
    effectiveDate: '2025-01-10',
    previousValue: '2025-01-10',
    newValue: '2025-07-10',
    createdAt: '2024-12-01T09:00:00Z',
    createdBy: 'RRHH',
    status: 'pending',
  },
];

export const mockVacations: VacationRequest[] = [
  {
    id: 'v1',
    employeeId: '3',
    startDate: '2025-01-15',
    endDate: '2025-01-30',
    days: 15,
    reason: 'Vacaciones anuales',
    status: 'approved',
    requestedAt: '2024-12-01T10:00:00Z',
    approvedBy: 'RRHH',
    approvedAt: '2024-12-05T14:00:00Z',
  },
  {
    id: 'v2',
    employeeId: '6',
    startDate: '2025-02-01',
    endDate: '2025-02-08',
    days: 7,
    reason: 'Viaje familiar',
    status: 'pending',
    requestedAt: '2024-12-10T09:00:00Z',
  },
];

export const mockPermissions: Permission[] = [
  {
    id: 'p1',
    employeeId: '5',
    date: '2024-12-15',
    startTime: '09:00',
    endTime: '12:00',
    reason: 'Cita médica',
    type: 'medical',
    status: 'approved',
    evidenceUrl: '/evidence/medical-cert.pdf',
  },
  {
    id: 'p2',
    employeeId: '8',
    date: '2024-12-18',
    startTime: '14:00',
    endTime: '18:00',
    reason: 'Trámites personales',
    type: 'personal',
    status: 'pending',
  },
];
