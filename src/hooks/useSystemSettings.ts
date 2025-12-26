import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: 'company' | 'schedule' | 'notifications' | 'security' | 'general';
  description: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SettingsMap {
  [key: string]: any;
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [settingsMap, setSettingsMap] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;

      const settingsArr = (data as SystemSetting[]) || [];
      setSettings(settingsArr);

      const map: SettingsMap = {};
      settingsArr.forEach((s) => {
        map[s.key] = s.value;
      });
      setSettingsMap(map);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las configuraciones',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    try {
      const updatedBy = profile ? `${profile.nombres} ${profile.apellidos}` : 'Sistema';
      
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value, updated_by: updatedBy })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      setSettings((prev) =>
        prev.map((s) => (s.key === key ? (data as SystemSetting) : s))
      );
      setSettingsMap((prev) => ({ ...prev, [key]: value }));
      
      toast({
        title: 'Configuración guardada',
        description: 'Los cambios han sido aplicados',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateMultipleSettings = async (updates: { key: string; value: any }[]) => {
    try {
      const updatedBy = profile ? `${profile.nombres} ${profile.apellidos}` : 'Sistema';
      
      for (const update of updates) {
        await supabase
          .from('system_settings')
          .update({ value: update.value, updated_by: updatedBy })
          .eq('key', update.key);
      }

      await fetchSettings();
      
      toast({
        title: 'Configuraciones guardadas',
        description: 'Todos los cambios han sido aplicados',
      });
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar las configuraciones',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getSetting = (key: string, defaultValue?: any) => {
    return settingsMap[key] ?? defaultValue;
  };

  const getSettingsByCategory = (category: SystemSetting['category']) => {
    return settings.filter((s) => s.category === category);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    settingsMap,
    loading,
    fetchSettings,
    updateSetting,
    updateMultipleSettings,
    getSetting,
    getSettingsByCategory,
  };
}
