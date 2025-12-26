import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Lock, Building2, Mail, Phone, Calendar, Briefcase, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MyAccountPage = () => {
  const { user, profile, userRole, isAdmin, isJefe, isEmpleado } = useAuth();
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch employee data if linked
  const { data: employeeData, isLoading: loadingEmployee } = useQuery({
    queryKey: ['my-employee', userRole?.employeeId],
    queryFn: async () => {
      if (!userRole?.employeeId) return null;
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', userRole.employeeId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userRole?.employeeId,
  });

  // Fetch contract data
  const { data: contractData, isLoading: loadingContract } = useQuery({
    queryKey: ['my-contract', userRole?.employeeId],
    queryFn: async () => {
      if (!userRole?.employeeId) return null;
      
      const { data, error } = await supabase
        .from('contracts')
        .select('*')
        .eq('employee_id', userRole.employeeId)
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!userRole?.employeeId,
  });

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Por favor ingresa la nueva contraseña');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return <Badge className="bg-primary/20 text-primary">Administrador RRHH</Badge>;
    if (isJefe) return <Badge className="bg-blue-500/20 text-blue-500">Jefe de Área</Badge>;
    return <Badge className="bg-muted text-muted-foreground">Empleado</Badge>;
  };

  const departmentLabels: Record<string, string> = {
    'rrhh': 'Recursos Humanos',
    'finanzas': 'Finanzas',
    'operaciones': 'Operaciones',
    'comercial': 'Comercial',
    'ti': 'Tecnología',
    'legal': 'Legal',
    'marketing': 'Marketing',
    'gerencia': 'Gerencia General',
  };

  const contractTypeLabels: Record<string, string> = {
    'indefinido': 'Indefinido',
    'plazo_fijo': 'Plazo Fijo',
    'por_obra': 'Por Obra',
    'honorarios': 'Honorarios',
    'practica': 'Prácticas',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">Mi Cuenta</h1>
            <p className="text-muted-foreground">Gestiona tu información personal y seguridad</p>
          </div>
          {getRoleBadge()}
        </motion.div>

        <Tabs defaultValue="perfil" className="space-y-6">
          <TabsList>
            <TabsTrigger value="perfil">Mi Perfil</TabsTrigger>
            <TabsTrigger value="laboral">Información Laboral</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Información Personal
                  </CardTitle>
                  <CardDescription>Tu información de perfil de usuario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {profile?.nombres} {profile?.apellidos}
                      </h3>
                      <p className="text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Nombres</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{profile?.nombres || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Apellidos</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{profile?.apellidos || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Correo Electrónico</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{user?.email || '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Rol en el Sistema</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <Briefcase className="w-4 h-4 text-muted-foreground" />
                        <span>{userRole?.role === 'admin_rrhh' ? 'Administrador RRHH' : userRole?.role === 'jefe_area' ? 'Jefe de Área' : 'Empleado'}</span>
                      </div>
                    </div>
                  </div>

                  {userRole?.area_id && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Área/Departamento</Label>
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span>{departmentLabels[userRole.area_id] || userRole.area_id}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="laboral">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {loadingEmployee || loadingContract ? (
                <Card className="glass-card">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : employeeData ? (
                <>
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Datos del Empleado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Código de Empleado</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <span className="font-mono">{employeeData.employee_code || '-'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Documento de Identidad</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <span className="font-mono">{employeeData.document_id}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Cargo</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span>{employeeData.position || '-'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Departamento</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            <span>{departmentLabels[employeeData.department] || employeeData.department}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Teléfono</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{employeeData.phone || '-'}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-muted-foreground">Fecha de Ingreso</Label>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {employeeData.hire_date 
                                ? format(new Date(employeeData.hire_date), 'dd MMMM yyyy', { locale: es })
                                : '-'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <Label className="text-muted-foreground">Estado:</Label>
                        <Badge variant={employeeData.status === 'active' ? 'default' : 'secondary'}>
                          {employeeData.status === 'active' ? 'Activo' : 
                           employeeData.status === 'on_leave' ? 'Con Licencia' : 
                           employeeData.status === 'inactive' ? 'Inactivo' : 'Cesado'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {contractData && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Contrato Actual
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Tipo de Contrato</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                              <span>{contractTypeLabels[contractData.type] || contractData.type}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Estado</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                              <Badge variant={contractData.status === 'active' ? 'default' : 'secondary'}>
                                {contractData.status === 'active' ? 'Vigente' : 'Vencido'}
                              </Badge>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Fecha de Inicio</Label>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {format(new Date(contractData.start_date), 'dd MMMM yyyy', { locale: es })}
                              </span>
                            </div>
                          </div>
                          {contractData.end_date && (
                            <div className="space-y-2">
                              <Label className="text-muted-foreground">Fecha de Fin</Label>
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>
                                  {format(new Date(contractData.end_date), 'dd MMMM yyyy', { locale: es })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Sin información laboral vinculada</h3>
                    <p className="text-muted-foreground">
                      Tu cuenta de usuario no está vinculada a un registro de empleado.
                      Contacta al administrador de RRHH para más información.
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="seguridad">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    Cambiar Contraseña
                  </CardTitle>
                  <CardDescription>Actualiza tu contraseña de acceso al sistema</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nueva Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                  
                  <div className="p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Requisitos de contraseña:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Mínimo 6 caracteres</li>
                      <li>Se recomienda usar letras, números y símbolos</li>
                    </ul>
                  </div>

                  <Button 
                    className="gradient-primary w-full" 
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                  >
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Cambiar Contraseña
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

export default MyAccountPage;
