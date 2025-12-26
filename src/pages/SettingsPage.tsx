import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Clock, Building2, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/SettingsContext';

const SettingsPage = () => {
  const { 
    settings, 
    updateCompanySettings, 
    updateScheduleSettings, 
    updateNotificationSettings,
    updateSecuritySettings,
    resetSettings 
  } = useSettings();

  const handleSaveCompany = () => {
    toast.success('Configuración de empresa guardada');
  };

  const handleSaveSchedule = () => {
    toast.success('Configuración de horarios guardada');
  };

  const handleSaveNotifications = () => {
    toast.success('Preferencias de notificaciones guardadas');
  };

  const handleSaveSecurity = () => {
    toast.success('Configuración de seguridad guardada');
  };

  const handleReset = () => {
    resetSettings();
    toast.success('Configuración restaurada a valores predeterminados');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Ajustes del sistema de asistencia</p>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
        </motion.div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="horarios">Horarios</TabsTrigger>
            <TabsTrigger value="notificaciones">Notificaciones</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre de la Empresa</Label>
                      <Input 
                        value={settings.company.name}
                        onChange={(e) => updateCompanySettings({ name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RUC</Label>
                      <Input 
                        value={settings.company.ruc}
                        onChange={(e) => updateCompanySettings({ ruc: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input 
                      value={settings.company.address}
                      onChange={(e) => updateCompanySettings({ address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email de Contacto</Label>
                      <Input 
                        value={settings.company.email}
                        onChange={(e) => updateCompanySettings({ email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input 
                        value={settings.company.phone}
                        onChange={(e) => updateCompanySettings({ phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveCompany}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="horarios">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Configuración de Horarios
                  </CardTitle>
                  <CardDescription>Define los horarios laborales y tolerancias</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hora de Entrada</Label>
                      <Input 
                        type="time" 
                        value={settings.schedule.entryTime}
                        onChange={(e) => updateScheduleSettings({ entryTime: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Salida</Label>
                      <Input 
                        type="time" 
                        value={settings.schedule.exitTime}
                        onChange={(e) => updateScheduleSettings({ exitTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tolerancia de Entrada (minutos)</Label>
                      <Input 
                        type="number" 
                        value={settings.schedule.entryTolerance}
                        onChange={(e) => updateScheduleSettings({ entryTolerance: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tolerancia de Salida (minutos)</Label>
                      <Input 
                        type="number" 
                        value={settings.schedule.exitTolerance}
                        onChange={(e) => updateScheduleSettings({ exitTolerance: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo de Refrigerio</Label>
                    <Select 
                      value={String(settings.schedule.lunchDuration)}
                      onValueChange={(v) => updateScheduleSettings({ lunchDuration: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Trabajo Remoto Habilitado</p>
                      <p className="text-sm text-muted-foreground">Permite marcación virtual con evidencia</p>
                    </div>
                    <Switch 
                      checked={settings.schedule.remoteWorkEnabled}
                      onCheckedChange={(checked) => updateScheduleSettings({ remoteWorkEnabled: checked })}
                    />
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveSchedule}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="notificaciones">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Preferencias de Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Contratos por vencer</p>
                      <p className="text-sm text-muted-foreground">Notificar cuando un contrato está por vencer</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.contractExpiry}
                      onCheckedChange={(checked) => updateNotificationSettings({ contractExpiry: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Tardanzas</p>
                      <p className="text-sm text-muted-foreground">Alertar sobre tardanzas del personal</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.tardies}
                      onCheckedChange={(checked) => updateNotificationSettings({ tardies: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Ausencias</p>
                      <p className="text-sm text-muted-foreground">Notificar ausencias sin justificación</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.absences}
                      onCheckedChange={(checked) => updateNotificationSettings({ absences: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Nuevos requerimientos</p>
                      <p className="text-sm text-muted-foreground">Alertar sobre nuevas solicitudes de personal</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.requirements}
                      onCheckedChange={(checked) => updateNotificationSettings({ requirements: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Mensajes</p>
                      <p className="text-sm text-muted-foreground">Notificaciones de nuevos mensajes</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.messages}
                      onCheckedChange={(checked) => updateNotificationSettings({ messages: checked })}
                    />
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveNotifications}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="seguridad">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Configuración de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Autenticación de dos factores</p>
                      <p className="text-sm text-muted-foreground">Requiere código adicional al iniciar sesión</p>
                    </div>
                    <Switch 
                      checked={settings.security.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSecuritySettings({ twoFactorEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Bloqueo por intentos fallidos</p>
                      <p className="text-sm text-muted-foreground">Bloquea cuenta después de 5 intentos</p>
                    </div>
                    <Switch 
                      checked={settings.security.lockOnFailedAttempts}
                      onCheckedChange={(checked) => updateSecuritySettings({ lockOnFailedAttempts: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Expiración de sesión</p>
                      <p className="text-sm text-muted-foreground">Cierra sesión después de inactividad</p>
                    </div>
                    <Select 
                      value={String(settings.security.sessionTimeout)}
                      onValueChange={(v) => updateSecuritySettings({ sessionTimeout: parseInt(v) })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveSecurity}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;
