import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { mockContracts, mockEmployees, mockSanctions } from '@/data/mockData';
import { getContractAlerts } from '@/services/contractAlerts';

export type NotificationType = 
  | 'contract_expiring'
  | 'justification_pending'
  | 'sanction_pending'
  | 'task_due'
  | 'vacation_request'
  | 'evaluation_pending'
  | 'attendance_issue'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotification: (id: string) => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { userRole, isAdmin, isJefe, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateNotifications = useCallback(() => {
    const newNotifications: Notification[] = [];

    // Admin/RRHH notifications
    if (isAdmin) {
      // Contract alerts
      const contractAlerts = getContractAlerts(mockContracts);
      contractAlerts.forEach(alert => {
        const employee = mockEmployees.find(e => e.id === alert.contract.employeeId);
        newNotifications.push({
          id: `contract-${alert.contract.id}`,
          type: 'contract_expiring',
          title: 'Contrato próximo a vencer',
          message: `${employee?.name} - ${alert.message}`,
          link: '/contracts',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: alert.level === 'critical' ? 'high' : alert.level === 'warning' ? 'medium' : 'low'
        });
      });

      // Pending sanctions
      const pendingSanctions = mockSanctions.filter(s => s.status === 'active');
      if (pendingSanctions.length > 0) {
        newNotifications.push({
          id: 'sanctions-pending',
          type: 'sanction_pending',
          title: 'Sanciones activas',
          message: `${pendingSanctions.length} sanciones activas requieren seguimiento`,
          link: '/sanctions',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'medium'
        });
      }

      // Sample justification pending
      newNotifications.push({
        id: 'justification-1',
        type: 'justification_pending',
        title: 'Justificación pendiente',
        message: '3 justificaciones pendientes de revisión',
        link: '/justifications',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    }

    // Jefe notifications
    if (isJefe) {
      newNotifications.push({
        id: 'team-attendance',
        type: 'attendance_issue',
        title: 'Tardanzas del equipo',
        message: '2 empleados con tardanzas hoy',
        link: '/attendance',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });

      newNotifications.push({
        id: 'tasks-due',
        type: 'task_due',
        title: 'Tareas vencidas',
        message: '3 tareas del equipo vencen hoy',
        link: '/task-tracker',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: 'high'
      });
    }

    // Employee notifications
    if (userRole?.role === 'empleado') {
      newNotifications.push({
        id: 'my-tasks',
        type: 'task_due',
        title: 'Tarea asignada',
        message: 'Tienes 2 tareas pendientes',
        link: '/task-tracker',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      });
    }

    // Add a general notification for everyone
    newNotifications.push({
      id: 'general-1',
      type: 'general',
      title: 'Mensaje del sistema',
      message: 'Bienvenido al sistema de gestión de RRHH',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      priority: 'low'
    });

    setNotifications(newNotifications);
  }, [isAdmin, isJefe, userRole]);

  useEffect(() => {
    if (user) {
      generateNotifications();
    } else {
      setNotifications([]);
    }
  }, [user, generateNotifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const refreshNotifications = () => {
    generateNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotification,
      refreshNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
