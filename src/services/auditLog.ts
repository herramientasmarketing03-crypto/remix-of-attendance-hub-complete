export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'VIEW';

export type AuditEntity = 
  | 'employee'
  | 'contract'
  | 'sanction'
  | 'justification'
  | 'vacation'
  | 'permission'
  | 'payslip'
  | 'attendance'
  | 'evaluation'
  | 'task'
  | 'user';

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  userId: string;
  userName: string;
  details: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// In-memory store for demo (would be database in production)
let auditLogs: AuditLogEntry[] = [];

export function logAction(
  action: AuditAction,
  entity: AuditEntity,
  entityId: string,
  userId: string,
  userName: string,
  details: string,
  metadata?: Record<string, unknown>
): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    action,
    entity,
    entityId,
    userId,
    userName,
    details,
    metadata,
    timestamp: new Date().toISOString()
  };

  auditLogs.unshift(entry); // Add to beginning
  
  // Keep only last 1000 entries in memory
  if (auditLogs.length > 1000) {
    auditLogs = auditLogs.slice(0, 1000);
  }

  console.log(`[AUDIT] ${action} ${entity}:${entityId} by ${userName} - ${details}`);
  
  return entry;
}

export function getAuditLogs(filters?: {
  action?: AuditAction;
  entity?: AuditEntity;
  userId?: string;
  startDate?: string;
  endDate?: string;
}): AuditLogEntry[] {
  let filtered = [...auditLogs];

  if (filters?.action) {
    filtered = filtered.filter(log => log.action === filters.action);
  }

  if (filters?.entity) {
    filtered = filtered.filter(log => log.entity === filters.entity);
  }

  if (filters?.userId) {
    filtered = filtered.filter(log => log.userId === filters.userId);
  }

  if (filters?.startDate) {
    const start = new Date(filters.startDate);
    filtered = filtered.filter(log => new Date(log.timestamp) >= start);
  }

  if (filters?.endDate) {
    const end = new Date(filters.endDate);
    filtered = filtered.filter(log => new Date(log.timestamp) <= end);
  }

  return filtered;
}

export function clearAuditLogs(): void {
  auditLogs = [];
}

// Initialize with some sample data
export function initializeSampleAuditLogs(): void {
  const sampleLogs: Omit<AuditLogEntry, 'id'>[] = [
    {
      action: 'CREATE',
      entity: 'contract',
      entityId: 'c1',
      userId: 'admin@empresa.com',
      userName: 'María García',
      details: 'Creó contrato para Aracely Reque',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    },
    {
      action: 'APPROVE',
      entity: 'justification',
      entityId: 'j1',
      userId: 'admin@empresa.com',
      userName: 'María García',
      details: 'Aprobó justificación de ausencia de Christian Maldon',
      timestamp: new Date(Date.now() - 172800000).toISOString()
    },
    {
      action: 'UPDATE',
      entity: 'sanction',
      entityId: 's1',
      userId: 'jefe@empresa.com',
      userName: 'Carlos Ruiz',
      details: 'Solicitó sanción para Andrea Paz',
      timestamp: new Date(Date.now() - 259200000).toISOString()
    },
    {
      action: 'UPLOAD',
      entity: 'attendance',
      entityId: 'upload-1',
      userId: 'admin@empresa.com',
      userName: 'María García',
      details: 'Cargó archivo de huellero: StandardReport_Nov23-Dec05.xls',
      timestamp: new Date(Date.now() - 345600000).toISOString()
    },
    {
      action: 'CREATE',
      entity: 'evaluation',
      entityId: 'eval-1',
      userId: 'jefe@empresa.com',
      userName: 'Carlos Ruiz',
      details: 'Creó evaluación de desempeño para Leonardo Minaya',
      timestamp: new Date(Date.now() - 432000000).toISOString()
    }
  ];

  sampleLogs.forEach(log => {
    auditLogs.push({
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  });
}

// Initialize on import
initializeSampleAuditLogs();
