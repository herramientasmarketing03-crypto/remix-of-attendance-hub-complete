import { DepartmentInfo, Position, OrgChartNode, CompanyStructure } from '@/types/organization';

// Posiciones disponibles en la empresa
export const POSITIONS: Record<string, Position> = {
  // Gerencia General
  'gerente_general': {
    id: 'gerente_general',
    name: 'Gerente General',
    level: 'gerente',
    description: 'Máxima autoridad ejecutiva de la empresa, responsable de la dirección estratégica y operativa.',
    requirements: ['MBA o maestría relacionada', '10+ años de experiencia gerencial', 'Liderazgo comprobado'],
    responsibilities: ['Definir estrategia empresarial', 'Supervisar todas las áreas', 'Representación legal', 'Toma de decisiones críticas'],
  },
  
  // RRHH
  'jefe_rrhh': {
    id: 'jefe_rrhh',
    name: 'Jefe de Recursos Humanos',
    level: 'jefe',
    description: 'Responsable de la gestión integral del capital humano de la organización.',
    requirements: ['Licenciatura en RRHH, Psicología o afín', '5+ años en RRHH', 'Conocimiento de legislación laboral'],
    responsibilities: ['Gestión de nómina', 'Reclutamiento y selección', 'Control de asistencia', 'Clima laboral'],
  },
  'asistente_rrhh': {
    id: 'asistente_rrhh',
    name: 'Asistente de RRHH',
    level: 'junior',
    description: 'Apoyo operativo en las funciones del área de Recursos Humanos.',
    requirements: ['Estudios en RRHH o Administración', '1+ año de experiencia', 'Manejo de Excel'],
    responsibilities: ['Procesamiento de asistencia', 'Archivo de documentos', 'Atención a colaboradores', 'Apoyo en procesos de selección'],
  },
  
  // Comercial
  'gerente_comercial': {
    id: 'gerente_comercial',
    name: 'Gerente Comercial',
    level: 'gerente',
    description: 'Responsable de la estrategia comercial y el cumplimiento de metas de ventas.',
    requirements: ['Licenciatura en Administración o Marketing', '7+ años en ventas', 'Gestión de equipos comerciales'],
    responsibilities: ['Definir estrategia de ventas', 'Gestionar cartera de clientes', 'Supervisar equipo comercial', 'Cumplimiento de cuotas'],
  },
  'ejecutivo_ventas': {
    id: 'ejecutivo_ventas',
    name: 'Ejecutivo de Ventas',
    level: 'senior',
    description: 'Responsable de la captación y cierre de ventas con clientes potenciales.',
    requirements: ['Experiencia en ventas B2B', 'Habilidades de negociación', 'Orientación a resultados'],
    responsibilities: ['Prospección de clientes', 'Presentación de servicios', 'Cierre de ventas', 'Seguimiento post-venta'],
  },
  'asistente_comercial': {
    id: 'asistente_comercial',
    name: 'Asistente Comercial',
    level: 'junior',
    description: 'Apoyo administrativo al equipo comercial.',
    requirements: ['Estudios en Administración', 'Manejo de CRM', 'Atención al cliente'],
    responsibilities: ['Registro de ventas', 'Coordinación de citas', 'Elaboración de cotizaciones', 'Atención telefónica'],
  },
  
  // Soporte
  'supervisor_soporte': {
    id: 'supervisor_soporte',
    name: 'Supervisor de Soporte',
    level: 'supervisor',
    description: 'Coordina las operaciones del equipo de soporte técnico y atención al cliente.',
    requirements: ['3+ años en soporte técnico', 'Experiencia liderando equipos', 'Conocimiento técnico amplio'],
    responsibilities: ['Supervisar agentes', 'Gestionar escalamientos', 'Reportes de desempeño', 'Mejora continua'],
  },
  'agente_soporte_senior': {
    id: 'agente_soporte_senior',
    name: 'Agente de Soporte Senior',
    level: 'senior',
    description: 'Atiende casos complejos y sirve como referente técnico del equipo.',
    requirements: ['2+ años en soporte', 'Conocimiento técnico avanzado', 'Capacidad de resolución'],
    responsibilities: ['Casos escalados', 'Mentoría a juniors', 'Documentación técnica', 'Atención VIP'],
  },
  'agente_soporte': {
    id: 'agente_soporte',
    name: 'Agente de Soporte',
    level: 'junior',
    description: 'Primer nivel de atención para consultas y problemas técnicos.',
    requirements: ['Conocimiento técnico básico', 'Buena comunicación', 'Paciencia'],
    responsibilities: ['Atención de tickets', 'Resolución primer nivel', 'Escalamiento adecuado', 'Documentación'],
  },
  
  // Marketing
  'jefe_marketing': {
    id: 'jefe_marketing',
    name: 'Jefe de Marketing',
    level: 'jefe',
    description: 'Lidera la estrategia de marketing y comunicación de la empresa.',
    requirements: ['Licenciatura en Marketing o Comunicación', '5+ años en marketing digital', 'Gestión de campañas'],
    responsibilities: ['Estrategia de marca', 'Marketing digital', 'Gestión de presupuesto', 'Análisis de resultados'],
  },
  'community_manager': {
    id: 'community_manager',
    name: 'Community Manager',
    level: 'senior',
    description: 'Gestiona las redes sociales y la comunidad online de la marca.',
    requirements: ['Experiencia en redes sociales', 'Redacción creativa', 'Manejo de herramientas de gestión'],
    responsibilities: ['Publicaciones en RRSS', 'Interacción con comunidad', 'Reportes de métricas', 'Crisis management'],
  },
  'disenador_grafico': {
    id: 'disenador_grafico',
    name: 'Diseñador Gráfico',
    level: 'senior',
    description: 'Crea piezas visuales para comunicación y marketing.',
    requirements: ['Manejo de Adobe Suite', 'Portafolio demostrable', 'Creatividad'],
    responsibilities: ['Diseño de piezas', 'Branding', 'Material publicitario', 'Contenido visual'],
  },
  
  // Campañas
  'coordinador_campanas': {
    id: 'coordinador_campanas',
    name: 'Coordinador de Campañas',
    level: 'coordinador',
    description: 'Planifica y ejecuta campañas de ventas y promociones.',
    requirements: ['3+ años en campañas de ventas', 'Análisis de datos', 'Gestión de equipos'],
    responsibilities: ['Planificación de campañas', 'Coordinación con áreas', 'Seguimiento de resultados', 'Optimización'],
  },
  'ejecutivo_campanas': {
    id: 'ejecutivo_campanas',
    name: 'Ejecutivo de Campañas',
    level: 'senior',
    description: 'Ejecuta campañas y contacta prospectos generados.',
    requirements: ['Experiencia en telemarketing', 'Comunicación efectiva', 'Orientación a metas'],
    responsibilities: ['Llamadas de seguimiento', 'Cierre de ventas', 'Registro en CRM', 'Cumplimiento de metas'],
  },
  
  // TI
  'jefe_ti': {
    id: 'jefe_ti',
    name: 'Jefe de TI',
    level: 'jefe',
    description: 'Lidera el área de tecnología y desarrollo de software.',
    requirements: ['Ingeniería de Sistemas o afín', '5+ años en desarrollo', 'Gestión de proyectos'],
    responsibilities: ['Arquitectura de sistemas', 'Gestión de equipo', 'Seguridad informática', 'Innovación tecnológica'],
  },
  'devops_engineer': {
    id: 'devops_engineer',
    name: 'DevOps Engineer',
    level: 'senior',
    description: 'Gestiona infraestructura, CI/CD y operaciones de desarrollo.',
    requirements: ['Conocimiento de AWS/Azure', 'Docker/Kubernetes', 'CI/CD', 'Linux'],
    responsibilities: ['Infraestructura cloud', 'Automatización', 'Monitoreo', 'Seguridad'],
  },
  'desarrollador_senior': {
    id: 'desarrollador_senior',
    name: 'Desarrollador Senior',
    level: 'senior',
    description: 'Desarrolla soluciones de software complejas y lidera proyectos técnicos.',
    requirements: ['5+ años de experiencia', 'Stack tecnológico actual', 'Buenas prácticas'],
    responsibilities: ['Desarrollo de features', 'Code review', 'Mentoría', 'Arquitectura'],
  },
  'desarrollador_frontend': {
    id: 'desarrollador_frontend',
    name: 'Desarrollador Frontend',
    level: 'senior',
    description: 'Desarrolla interfaces de usuario y experiencias web.',
    requirements: ['React/Vue/Angular', 'HTML/CSS/JS', 'Responsive design'],
    responsibilities: ['Desarrollo de UI', 'Integración con APIs', 'Testing', 'Optimización'],
  },
  'desarrollador_backend': {
    id: 'desarrollador_backend',
    name: 'Desarrollador Backend',
    level: 'senior',
    description: 'Desarrolla APIs y lógica de negocio del lado del servidor.',
    requirements: ['Node.js/Python/Java', 'Bases de datos', 'APIs REST/GraphQL'],
    responsibilities: ['Desarrollo de APIs', 'Bases de datos', 'Integraciones', 'Performance'],
  },
  
  // Digital College
  'coordinador_academico': {
    id: 'coordinador_academico',
    name: 'Coordinador Académico',
    level: 'coordinador',
    description: 'Gestiona el programa académico y el equipo de instructores.',
    requirements: ['Licenciatura en Educación o afín', '3+ años en educación', 'Gestión de equipos'],
    responsibilities: ['Diseño curricular', 'Gestión de instructores', 'Calidad educativa', 'Programación de cursos'],
  },
  'instructor': {
    id: 'instructor',
    name: 'Instructor',
    level: 'senior',
    description: 'Imparte clases y capacitaciones en su área de especialidad.',
    requirements: ['Experiencia docente', 'Dominio del tema', 'Habilidades de comunicación'],
    responsibilities: ['Impartir clases', 'Evaluar estudiantes', 'Preparar material', 'Tutorías'],
  },
};

// Información detallada de cada departamento
export const DEPARTMENT_INFO: DepartmentInfo[] = [
  {
    department: 'comercial',
    name: 'Comercial',
    color: 'hsl(217 91% 50%)',
    icon: 'briefcase',
    description: 'Área responsable de la captación de clientes y generación de ingresos a través de la venta de servicios educativos.',
    mission: 'Alcanzar las metas de ventas mensuales mediante un servicio de calidad y atención personalizada a cada prospecto.',
    headPosition: 'gerente_comercial',
    positions: [
      { positionId: 'gerente_comercial', position: POSITIONS['gerente_comercial'], employeeCount: 1, vacant: 0 },
      { positionId: 'ejecutivo_ventas', position: POSITIONS['ejecutivo_ventas'], reportsTo: 'gerente_comercial', employeeCount: 8, vacant: 2 },
      { positionId: 'asistente_comercial', position: POSITIONS['asistente_comercial'], reportsTo: 'gerente_comercial', employeeCount: 2, vacant: 0 },
    ],
    functions: [
      'Prospección y captación de nuevos clientes',
      'Presentación de servicios educativos',
      'Negociación y cierre de ventas',
      'Seguimiento post-venta y fidelización',
      'Cumplimiento de cuotas mensuales',
      'Generación de reportes de ventas',
    ],
    objectives: [
      'Alcanzar 100% de la cuota mensual de ventas',
      'Mantener tasa de conversión superior al 15%',
      'Reducir tiempo de cierre a menos de 7 días',
      'Lograr NPS de clientes superior a 80',
    ],
  },
  {
    department: 'soporte',
    name: 'Soporte',
    color: 'hsl(142 76% 36%)',
    icon: 'headphones',
    description: 'Área encargada de brindar asistencia técnica y atención al cliente para garantizar la satisfacción de los usuarios.',
    mission: 'Resolver las consultas y problemas de los clientes de manera eficiente, asegurando una experiencia positiva.',
    headPosition: 'supervisor_soporte',
    positions: [
      { positionId: 'supervisor_soporte', position: POSITIONS['supervisor_soporte'], employeeCount: 1, vacant: 0 },
      { positionId: 'agente_soporte_senior', position: POSITIONS['agente_soporte_senior'], reportsTo: 'supervisor_soporte', employeeCount: 3, vacant: 0 },
      { positionId: 'agente_soporte', position: POSITIONS['agente_soporte'], reportsTo: 'agente_soporte_senior', employeeCount: 10, vacant: 1 },
    ],
    functions: [
      'Atención de consultas por múltiples canales',
      'Resolución de problemas técnicos',
      'Escalamiento de casos complejos',
      'Documentación de soluciones',
      'Seguimiento de tickets',
      'Capacitación a usuarios',
    ],
    objectives: [
      'Tiempo de primera respuesta menor a 2 horas',
      'Tasa de resolución en primer contacto superior a 70%',
      'Satisfacción del cliente (CSAT) mayor a 90%',
      'Reducir tickets escalados a menos del 10%',
    ],
  },
  {
    department: 'marketing',
    name: 'Marketing',
    color: 'hsl(326 100% 50%)',
    icon: 'megaphone',
    description: 'Área responsable de la estrategia de marca, comunicación y generación de demanda a través de canales digitales.',
    mission: 'Posicionar la marca y generar leads calificados para el equipo comercial.',
    headPosition: 'jefe_marketing',
    positions: [
      { positionId: 'jefe_marketing', position: POSITIONS['jefe_marketing'], employeeCount: 1, vacant: 0 },
      { positionId: 'community_manager', position: POSITIONS['community_manager'], reportsTo: 'jefe_marketing', employeeCount: 2, vacant: 0 },
      { positionId: 'disenador_grafico', position: POSITIONS['disenador_grafico'], reportsTo: 'jefe_marketing', employeeCount: 2, vacant: 1 },
    ],
    functions: [
      'Gestión de redes sociales',
      'Creación de contenido visual y escrito',
      'Campañas de publicidad digital',
      'SEO y SEM',
      'Email marketing',
      'Análisis de métricas y ROI',
    ],
    objectives: [
      'Generar 500+ leads mensuales',
      'Aumentar seguidores en redes 10% mensual',
      'Costo por lead menor a S/. 15',
      'Engagement rate superior a 5%',
    ],
  },
  {
    department: 'campanas',
    name: 'Campañas',
    color: 'hsl(38 92% 50%)',
    icon: 'target',
    description: 'Área especializada en la ejecución de campañas de ventas telefónicas y seguimiento de prospectos.',
    mission: 'Convertir leads en ventas mediante contacto telefónico efectivo y seguimiento constante.',
    headPosition: 'coordinador_campanas',
    positions: [
      { positionId: 'coordinador_campanas', position: POSITIONS['coordinador_campanas'], employeeCount: 1, vacant: 0 },
      { positionId: 'ejecutivo_campanas', position: POSITIONS['ejecutivo_campanas'], reportsTo: 'coordinador_campanas', employeeCount: 10, vacant: 2 },
    ],
    functions: [
      'Contacto telefónico con prospectos',
      'Seguimiento de leads fríos y tibios',
      'Agendamiento de citas para comercial',
      'Ejecución de campañas de temporada',
      'Encuestas de satisfacción',
      'Reactivación de clientes inactivos',
    ],
    objectives: [
      'Contactar 100% de leads en menos de 24 horas',
      'Agendar 50+ citas semanales para comercial',
      'Tasa de contactabilidad superior a 60%',
      'Conversión de campaña mayor a 8%',
    ],
  },
  {
    department: 'ti',
    name: 'Tecnología de la Información',
    color: 'hsl(188 94% 43%)',
    icon: 'code',
    description: 'Área encargada del desarrollo tecnológico, infraestructura y soporte de sistemas de la organización.',
    mission: 'Proveer soluciones tecnológicas innovadoras que soporten y potencien las operaciones del negocio.',
    headPosition: 'jefe_ti',
    positions: [
      { positionId: 'jefe_ti', position: POSITIONS['jefe_ti'], employeeCount: 1, vacant: 0 },
      { positionId: 'devops_engineer', position: POSITIONS['devops_engineer'], reportsTo: 'jefe_ti', employeeCount: 2, vacant: 0 },
      { positionId: 'desarrollador_senior', position: POSITIONS['desarrollador_senior'], reportsTo: 'jefe_ti', employeeCount: 2, vacant: 1 },
      { positionId: 'desarrollador_frontend', position: POSITIONS['desarrollador_frontend'], reportsTo: 'desarrollador_senior', employeeCount: 3, vacant: 1 },
      { positionId: 'desarrollador_backend', position: POSITIONS['desarrollador_backend'], reportsTo: 'desarrollador_senior', employeeCount: 3, vacant: 0 },
    ],
    functions: [
      'Desarrollo de aplicaciones web y móviles',
      'Mantenimiento de infraestructura cloud',
      'Soporte técnico interno',
      'Seguridad informática',
      'Integraciones con terceros',
      'Innovación y nuevas tecnologías',
    ],
    objectives: [
      'Uptime de sistemas superior a 99.9%',
      'Tiempo de respuesta de APIs menor a 200ms',
      'Zero vulnerabilidades críticas',
      'Despliegues sin downtime',
    ],
  },
  {
    department: 'digitalcollege',
    name: 'Digital College',
    color: 'hsl(262 83% 58%)',
    icon: 'graduation-cap',
    description: 'Unidad de negocio enfocada en la capacitación y formación profesional en tecnología y habilidades digitales.',
    mission: 'Formar profesionales competentes en tecnología a través de programas de alta calidad.',
    headPosition: 'coordinador_academico',
    positions: [
      { positionId: 'coordinador_academico', position: POSITIONS['coordinador_academico'], employeeCount: 1, vacant: 0 },
      { positionId: 'instructor', position: POSITIONS['instructor'], reportsTo: 'coordinador_academico', employeeCount: 6, vacant: 1 },
    ],
    functions: [
      'Diseño de programas educativos',
      'Impartición de cursos y talleres',
      'Evaluación del aprendizaje',
      'Actualización de contenidos',
      'Certificación de estudiantes',
      'Vinculación con empresas',
    ],
    objectives: [
      'Tasa de aprobación superior a 85%',
      'Satisfacción estudiantil mayor a 4.5/5',
      'Empleabilidad de egresados superior a 70%',
      'Renovación de contenido trimestral',
    ],
  },
];

// Organigrama general de la empresa
export const COMPANY_ORG_CHART: CompanyStructure = {
  name: 'CCD - Centro de Capacitación Digital',
  ceo: {
    id: 'ceo',
    name: 'Director General',
    position: 'Gerente General',
    children: [
      {
        id: 'rrhh-head',
        name: 'María García',
        position: 'Jefe de RRHH',
        children: [
          { id: 'rrhh-1', name: 'Ana Torres', position: 'Asistente RRHH' },
        ],
      },
      {
        id: 'comercial-head',
        name: 'Miluska Mendivil',
        position: 'Gerente Comercial',
        department: 'comercial',
        children: [
          { id: 'com-1', name: 'Aracely Reque', position: 'Ejecutiva de Ventas', department: 'comercial' },
          { id: 'com-2', name: 'Lesly Lopez', position: 'Asistente Comercial', department: 'comercial' },
        ],
      },
      {
        id: 'soporte-head',
        name: 'Alejandro Barrientos',
        position: 'Supervisor de Soporte',
        department: 'soporte',
        children: [
          { id: 'sop-1', name: 'Jazmin Ledesma', position: 'Agente Senior', department: 'soporte' },
          { id: 'sop-2', name: 'Andrea Paz', position: 'Agente de Soporte', department: 'soporte' },
        ],
      },
      {
        id: 'marketing-head',
        name: 'Zuleica Roque',
        position: 'Community Manager',
        department: 'marketing',
        children: [
          { id: 'mkt-1', name: 'Luis Manrique', position: 'Diseñador Gráfico', department: 'marketing' },
        ],
      },
      {
        id: 'campanas-head',
        name: 'Alejandra Quispe',
        position: 'Coordinadora de Campañas',
        department: 'campanas',
        children: [
          { id: 'cam-1', name: 'Angheli Trujillo', position: 'Ejecutiva de Campañas', department: 'campanas' },
        ],
      },
      {
        id: 'ti-head',
        name: 'Carlos Ruiz',
        position: 'Jefe de TI',
        department: 'ti',
        children: [
          { id: 'ti-1', name: 'Leonardo Minaya', position: 'DevOps Engineer', department: 'ti' },
          { id: 'ti-2', name: 'Christian Maldon', position: 'Desarrollador Frontend', department: 'ti' },
          { id: 'ti-3', name: 'Angel Plasencia', position: 'Backend Developer', department: 'ti' },
        ],
      },
      {
        id: 'dc-head',
        name: 'Celeste Ramos',
        position: 'Coordinadora Académica',
        department: 'digitalcollege',
        children: [
          { id: 'dc-1', name: 'Daniel Castillo', position: 'Instructor', department: 'digitalcollege' },
        ],
      },
    ],
  },
  departments: DEPARTMENT_INFO,
};
