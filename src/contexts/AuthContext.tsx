import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin_rrhh' | 'jefe_area' | 'empleado';

interface UserRole {
  role: AppRole;
  area_id: string | null;
  employeeId: string | null;
}

interface Profile {
  id: string;
  email: string | null;
  nombres: string;
  apellidos: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching profile and role to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          email: profileData.email,
          nombres: profileData.nombres,
          apellidos: profileData.apellidos,
          avatar_url: profileData.avatar_url,
        });
      }

      // Fetch role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleData) {
        setUserRole({
          role: roleData.role as AppRole,
          area_id: roleData.area_id,
          employeeId: roleData.employee_id,
        });
      } else {
        // Default to empleado if no role found
        setUserRole({
          role: 'empleado',
          area_id: null,
          employeeId: null,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Sesión iniciada correctamente');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, nombres: string, apellidos: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nombres,
            apellidos,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Cuenta creada correctamente. ¡Bienvenido!');
      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast.error(err.message);
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole(null);
    toast.success('Sesión cerrada');
  };

  const hasRole = (role: AppRole): boolean => {
    return userRole?.role === role;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
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
