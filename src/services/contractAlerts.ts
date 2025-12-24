import { EmployeeContract } from '@/types/attendance';
import { differenceInDays, parseISO, isAfter } from 'date-fns';

export type AlertLevel = 'critical' | 'warning' | 'info';

export interface ContractAlert {
  contract: EmployeeContract;
  daysRemaining: number;
  level: AlertLevel;
  message: string;
}

export function getDaysUntilExpiration(endDate: string | undefined): number | null {
  if (!endDate) return null;
  const today = new Date();
  const end = parseISO(endDate);
  return differenceInDays(end, today);
}

export function getContractAlertLevel(daysRemaining: number): AlertLevel {
  if (daysRemaining <= 7) return 'critical';
  if (daysRemaining <= 15) return 'warning';
  if (daysRemaining <= 30) return 'info';
  return 'info';
}

export function getContractAlerts(contracts: EmployeeContract[]): ContractAlert[] {
  const today = new Date();
  const alerts: ContractAlert[] = [];

  contracts.forEach(contract => {
    if (!contract.endDate) return;
    
    const endDate = parseISO(contract.endDate);
    if (!isAfter(endDate, today)) {
      // Already expired
      alerts.push({
        contract,
        daysRemaining: 0,
        level: 'critical',
        message: 'Contrato vencido'
      });
      return;
    }

    const daysRemaining = differenceInDays(endDate, today);
    
    if (daysRemaining <= 30) {
      const level = getContractAlertLevel(daysRemaining);
      let message = '';
      
      if (daysRemaining <= 7) {
        message = `¡Urgente! Vence en ${daysRemaining} días`;
      } else if (daysRemaining <= 15) {
        message = `Vence en ${daysRemaining} días`;
      } else {
        message = `Vence en ${daysRemaining} días`;
      }

      alerts.push({
        contract,
        daysRemaining,
        level,
        message
      });
    }
  });

  // Sort by urgency (least days first)
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function groupAlertsByLevel(alerts: ContractAlert[]): Record<AlertLevel, ContractAlert[]> {
  return {
    critical: alerts.filter(a => a.level === 'critical'),
    warning: alerts.filter(a => a.level === 'warning'),
    info: alerts.filter(a => a.level === 'info')
  };
}
