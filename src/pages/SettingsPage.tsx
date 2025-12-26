import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Bell, Shield, Clock, Building2, Save, RotateCcw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const SettingsPage = () => {
  const { settings, settingsMap, loading, updateSetting, updateMultipleSettings, getSetting } = useSystemSettings();
  const [saving, setSaving] = useState(false);

  // Local state for form values
  const [companyName, setCompanyName] = useState('');
  const [companyRuc, setCompanyRuc] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [workStartTime, setWorkStartTime] = useState('08:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [lunchDuration, setLunchDuration] = useState('60');
  const [toleranceMinutes, setToleranceMinutes] = useState('10');
  const [notifyAbsences, setNotifyAbsences] = useState(true);
  const [notifyBirthdays, setNotifyBirthdays] = useState(true);
  const [notifyContractExpiry, setNotifyContractExpiry] = useState(true);
  const [contractExpiryDays, setContractExpiryDays] = useState('30');
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [passwordMinLength, setPasswordMinLength] = useState('8');

  // Initialize form values from settings
  useEffect(() => {
    if (!loading && settings.length > 0) {
      setCompanyName(getSetting('company_name', 'Empresa Demo S.A.'));
      setCompanyRuc(getSetting('company_ruc', '20123456789'));
      setCompanyAddress(getSetting('company_address', 'Av. Principal 123'));
      setWorkStartTime(getSetting('work_start_time', '08:00'));
      setWorkEndTime(getSetting('work_end_time', '18:00'));
      setLunchDuration(String(getSetting('lunch_duration_minutes', 60)));
      setToleranceMinutes(String(getSetting('tolerance_minutes', 10)));
      setNotifyAbsences(getSetting('notify_absences', true));
      setNotifyBirthdays(getSetting('notify_birthdays', true));
      setNotifyContractExpiry(getSetting('notify_contract_expiry', true));
      setContractExpiryDays(String(getSetting('contract_expiry_days', 30)));
      setSessionTimeout(String(getSetting('session_timeout_minutes', 30)));
      setPasswordMinLength(String(getSetting('password_min_length', 8)));
    }
  }, [loading, settings]);

  const handleSaveCompany = async () => {
    setSaving(true);
    try {
      await updateMultipleSettings([
        { key: 'company_name', value: companyName },
        { key: 'company_ruc', value: companyRuc },
        { key: 'company_address', value: companyAddress },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      await updateMultipleSettings([
        { key: 'work_start_time', value: workStartTime },
        { key: 'work_end_time', value: workEndTime },
        { key: 'lunch_duration_minutes', value: parseInt(lunchDuration) },
        { key: 'tolerance_minutes', value: parseInt(toleranceMinutes) },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await updateMultipleSettings([
        { key: 'notify_absences', value: notifyAbsences },
        { key: 'notify_birthdays', value: notifyBirthdays },
        { key: 'notify_contract_expiry', value: notifyContractExpiry },
        { key: 'contract_expiry_days', value: parseInt(contractExpiryDays) },
      ]);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setSaving(true);
    try {
      await updateMultipleSettings([
        { key: 'session_timeout_minutes', value: parseInt(sessionTimeout) },
        { key: 'password_min_length', value: parseInt(passwordMinLength) },
      ]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configuración</h1>
            <p className="text-muted-foreground">Ajustes del sistema</p>
          </div>
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
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>RUC</Label>
                      <Input 
                        value={companyRuc}
                        onChange={(e) => setCompanyRuc(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input 
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                    />
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveCompany} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                        value={workStartTime}
                        onChange={(e) => setWorkStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Salida</Label>
                      <Input 
                        type="time" 
                        value={workEndTime}
                        onChange={(e) => setWorkEndTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tolerancia (minutos)</Label>
                      <Input 
                        type="number" 
                        value={toleranceMinutes}
                        onChange={(e) => setToleranceMinutes(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tiempo de Refrigerio</Label>
                      <Select 
                        value={lunchDuration}
                        onValueChange={setLunchDuration}
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
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveSchedule} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                      <p className="font-medium">Notificar ausencias</p>
                      <p className="text-sm text-muted-foreground">Alertar sobre ausencias sin justificación</p>
                    </div>
                    <Switch 
                      checked={notifyAbsences}
                      onCheckedChange={setNotifyAbsences}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Notificar cumpleaños</p>
                      <p className="text-sm text-muted-foreground">Recordar cumpleaños de empleados</p>
                    </div>
                    <Switch 
                      checked={notifyBirthdays}
                      onCheckedChange={setNotifyBirthdays}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Contratos por vencer</p>
                      <p className="text-sm text-muted-foreground">Notificar cuando un contrato está por vencer</p>
                    </div>
                    <Switch 
                      checked={notifyContractExpiry}
                      onCheckedChange={setNotifyContractExpiry}
                    />
                  </div>
                  {notifyContractExpiry && (
                    <div className="space-y-2 pl-4">
                      <Label>Días antes de vencimiento</Label>
                      <Input 
                        type="number" 
                        value={contractExpiryDays}
                        onChange={(e) => setContractExpiryDays(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  )}
                  <Button className="gradient-primary" onClick={handleSaveNotifications} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
                      <p className="font-medium">Expiración de sesión</p>
                      <p className="text-sm text-muted-foreground">Cierra sesión después de inactividad</p>
                    </div>
                    <Select 
                      value={sessionTimeout}
                      onValueChange={setSessionTimeout}
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
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Longitud mínima de contraseña</p>
                      <p className="text-sm text-muted-foreground">Caracteres mínimos requeridos</p>
                    </div>
                    <Select 
                      value={passwordMinLength}
                      onValueChange={setPasswordMinLength}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 caracteres</SelectItem>
                        <SelectItem value="8">8 caracteres</SelectItem>
                        <SelectItem value="10">10 caracteres</SelectItem>
                        <SelectItem value="12">12 caracteres</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="gradient-primary" onClick={handleSaveSecurity} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
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
