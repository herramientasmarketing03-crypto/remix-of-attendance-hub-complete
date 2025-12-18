import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Clock, Building2, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SettingsPage = () => {
  const handleSave = () => {
    toast.success('Configuración guardada correctamente');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground">Ajustes del sistema de asistencia</p>
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
                      <Input defaultValue="Mi Empresa S.A.C." />
                    </div>
                    <div className="space-y-2">
                      <Label>RUC</Label>
                      <Input defaultValue="20123456789" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección</Label>
                    <Input defaultValue="Av. Principal 123, Lima" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Email de Contacto</Label>
                      <Input defaultValue="rrhh@miempresa.com" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input defaultValue="+51 1 234 5678" />
                    </div>
                  </div>
                  <Button className="gradient-primary" onClick={handleSave}>
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
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Salida</Label>
                      <Input type="time" defaultValue="18:00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tolerancia de Entrada (minutos)</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Tolerancia de Salida (minutos)</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tiempo de Refrigerio</Label>
                    <Select defaultValue="60">
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
                    <Switch defaultChecked />
                  </div>
                  <Button className="gradient-primary" onClick={handleSave}>
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
                  {[
                    { title: 'Contratos por vencer', desc: 'Notificar cuando un contrato está por vencer', default: true },
                    { title: 'Tardanzas', desc: 'Alertar sobre tardanzas del personal', default: true },
                    { title: 'Ausencias', desc: 'Notificar ausencias sin justificación', default: true },
                    { title: 'Nuevos requerimientos', desc: 'Alertar sobre nuevas solicitudes de personal', default: true },
                    { title: 'Mensajes', desc: 'Notificaciones de nuevos mensajes', default: false },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked={item.default} />
                    </div>
                  ))}
                  <Button className="gradient-primary" onClick={handleSave}>
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
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Bloqueo por intentos fallidos</p>
                      <p className="text-sm text-muted-foreground">Bloquea cuenta después de 5 intentos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div>
                      <p className="font-medium">Expiración de sesión</p>
                      <p className="text-sm text-muted-foreground">Cierra sesión después de inactividad</p>
                    </div>
                    <Select defaultValue="60">
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
                  <Button className="gradient-primary" onClick={handleSave}>
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
