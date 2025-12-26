import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '@/services/dataStorage';

export interface AppSettings {
  company: {
    name: string;
    ruc: string;
    address: string;
    email: string;
    phone: string;
  };
  schedule: {
    entryTime: string;
    exitTime: string;
    entryTolerance: number;
    exitTolerance: number;
    lunchDuration: number;
    remoteWorkEnabled: boolean;
  };
  notifications: {
    contractExpiry: boolean;
    tardies: boolean;
    absences: boolean;
    requirements: boolean;
    messages: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    lockOnFailedAttempts: boolean;
    sessionTimeout: number;
  };
}

const defaultSettings: AppSettings = {
  company: {
    name: 'Mi Empresa S.A.C.',
    ruc: '20123456789',
    address: 'Av. Principal 123, Lima',
    email: 'rrhh@miempresa.com',
    phone: '+51 1 234 5678',
  },
  schedule: {
    entryTime: '09:00',
    exitTime: '18:00',
    entryTolerance: 10,
    exitTolerance: 5,
    lunchDuration: 60,
    remoteWorkEnabled: true,
  },
  notifications: {
    contractExpiry: true,
    tardies: true,
    absences: true,
    requirements: true,
    messages: false,
  },
  security: {
    twoFactorEnabled: false,
    lockOnFailedAttempts: true,
    sessionTimeout: 60,
  },
};

interface SettingsContextType {
  settings: AppSettings;
  updateCompanySettings: (company: Partial<AppSettings['company']>) => void;
  updateScheduleSettings: (schedule: Partial<AppSettings['schedule']>) => void;
  updateNotificationSettings: (notifications: Partial<AppSettings['notifications']>) => void;
  updateSecuritySettings: (security: Partial<AppSettings['security']>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => 
    loadFromStorage(STORAGE_KEYS.SETTINGS, defaultSettings)
  );

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const updateCompanySettings = (company: Partial<AppSettings['company']>) => {
    setSettings(prev => ({
      ...prev,
      company: { ...prev.company, ...company },
    }));
  };

  const updateScheduleSettings = (schedule: Partial<AppSettings['schedule']>) => {
    setSettings(prev => ({
      ...prev,
      schedule: { ...prev.schedule, ...schedule },
    }));
  };

  const updateNotificationSettings = (notifications: Partial<AppSettings['notifications']>) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...notifications },
    }));
  };

  const updateSecuritySettings = (security: Partial<AppSettings['security']>) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, ...security },
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateCompanySettings,
      updateScheduleSettings,
      updateNotificationSettings,
      updateSecuritySettings,
      resetSettings,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
