import React, { createContext, useContext, useState } from 'react';
import { toast } from 'sonner';

export type AppRole = 'admin_rrhh' | 'jefe_area' | 'empleado';

interface UserRole {
  role: AppRole;
  area_id: string | null;
  employeeId: string | null;
}

interface User {
  id: string;
  email: string;
  nombres: string;
  apellidos: string;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nombres: string, apellidos: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isJefe: boolean;
  isEmpleado: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing with dynamic linking
const DEMO_USERS = {
  'admin@empresa.com': { role: 'admin_rrhh' as AppRole, nombres: 'María', apellidos: 'García', area_id: null, employeeId: null },
  'jefe@empresa.com': { role: 'jefe_area' as AppRole, nombres: 'Carlos', apellidos: 'Ruiz', area_id: 'ti', employeeId: '6' },
  'empleado@empresa.com': { role: 'empleado' as AppRole, nombres: 'Christian', apellidos: 'Maldon', area_id: 'ti', employeeId: '4' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('attendance_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const savedRole = localStorage.getItem('attendance_role');
    return savedRole ? JSON.parse(savedRole) : null;
  });
  const [loading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS];
      
      if (demoUser && password === 'demo123') {
        const newUser = {
          id: email,
          email,
          nombres: demoUser.nombres,
          apellidos: demoUser.apellidos,
        };
        const newRole = { role: demoUser.role, area_id: demoUser.area_id, employeeId: demoUser.employeeId };
        
        setUser(newUser);
        setUserRole(newRole);
        localStorage.setItem('attendance_user', JSON.stringify(newUser));
        localStorage.setItem('attendance_role', JSON.stringify(newRole));
        
        toast.success('Sesión iniciada correctamente');
        return { error: null };
      }
      
      // For demo purposes, accept any email with password 'demo123'
      if (password === 'demo123') {
        const newUser = {
          id: email,
          email,
          nombres: 'Usuario',
          apellidos: 'Demo',
        };
        const newRole = { role: 'empleado' as AppRole, area_id: null, employeeId: null };
        
        setUser(newUser);
        setUserRole(newRole);
        localStorage.setItem('attendance_user', JSON.stringify(newUser));
        localStorage.setItem('attendance_role', JSON.stringify(newRole));
        
        toast.success('Sesión iniciada correctamente');
        return { error: null };
      }

      const error = new Error('Credenciales inválidas');
      toast.error('Credenciales inválidas');
      return { error };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, nombres: string, apellidos: string) => {
    try {
      const newUser = {
        id: email,
        email,
        nombres,
        apellidos,
      };
      const newRole = { role: 'empleado' as AppRole, area_id: null, employeeId: null };
      
      setUser(newUser);
      setUserRole(newRole);
      localStorage.setItem('attendance_user', JSON.stringify(newUser));
      localStorage.setItem('attendance_role', JSON.stringify(newRole));
      
      toast.success('Cuenta creada correctamente');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      return { error: err };
    }
  };

  const signOut = async () => {
    setUser(null);
    setUserRole(null);
    localStorage.removeItem('attendance_user');
    localStorage.removeItem('attendance_role');
    toast.success('Sesión cerrada');
  };

  const hasRole = (role: AppRole): boolean => {
    return userRole?.role === role;
  };

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin: userRole?.role === 'admin_rrhh',
    isJefe: userRole?.role === 'jefe_area',
    isEmpleado: userRole?.role === 'empleado',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
