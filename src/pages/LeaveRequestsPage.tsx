import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Check, 
  X, 
  Eye,
  Clock,
  Palmtree,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useVacations, usePermissions, type VacationRequest, type PermissionRequest } from '@/hooks/useVacations';
import { useEmployees } from '@/hooks/useEmployees';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const PERMISSION_TYPES: Record<string, string> = {
  personal: 'Personal',
  medical: 'Médico',
  academic: 'Académico',
  family: 'Familiar',
  other: 'Otro',
};

export default function LeaveRequestsPage() {
  const { userRole, user, profile } = useAuth();
  const { vacations, loading: vacationsLoading, approveByJefe: approveVacationJefe, approveByRRHH: approveVacationRRHH, reject: rejectVacation } = useVacations();
  const { permissions, loading: permissionsLoading, approveByJefe: approvePermissionJefe, approveByRRHH: approvePermissionRRHH, reject: rejectPermission } = usePermissions();
  const { employees } = useEmployees();
  
  const [activeTab, setActiveTab] = useState<'vacations' | 'permissions'>('vacations');
  const [selectedVacation, setSelectedVacation] = useState<VacationRequest | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<PermissionRequest | null>(null);
  const [newRequestOpen, setNewRequestOpen] = useState(false);

  const isAdmin = userRole?.role === 'admin_rrhh';
  const isJefe = userRole?.role === 'jefe_area';
  const isEmpleado = userRole?.role === 'empleado';

  const getEmployee = (employeeId: string) => employees.find(e => e.id === employeeId);

  const pendingVacations = vacations.filter(v => 
    v.status === 'pending' || (isAdmin && v.approval_flow === 'jefe_approved')
  );
  const pendingPermissions = permissions.filter(p => 
    p.status === 'pending' || (isAdmin && p.approval_flow === 'jefe_approved')
  );

  const handleApproveVacation = async (vacation: VacationRequest, action: 'approve' | 'reject') => {
    const approverName = `${profile?.nombres} ${profile?.apellidos}`;
    
    try {
      if (action === 'reject') {
        await rejectVacation(vacation.id);
        toast.info('Vacaciones rechazadas');
      } else if (isJefe && vacation.approval_flow === 'pending') {
        await approveVacationJefe(vacation.id, approverName);
        toast.success('Vacaciones aprobadas por Jefe');
      } else if (isAdmin) {
        await approveVacationRRHH(vacation.id, approverName);
        toast.success('Vacaciones aprobadas por RRHH');
      }
      setSelectedVacation(null);
    } catch (error) {
      console.error('Error processing vacation:', error);
    }
  };

  const handleApprovePermission = async (permission: PermissionRequest, action: 'approve' | 'reject') => {
    const approverName = `${profile?.nombres} ${profile?.apellidos}`;
    
    try {
      if (action === 'reject') {
        await rejectPermission(permission.id);
        toast.info('Permiso rechazado');
      } else if (isJefe && permission.approval_flow === 'pending') {
        await approvePermissionJefe(permission.id, approverName);
        toast.success('Permiso aprobado por Jefe');
      } else if (isAdmin) {
        await approvePermissionRRHH(permission.id, approverName);
        toast.success('Permiso aprobado por RRHH');
      }
      setSelectedPermission(null);
    } catch (error) {
      console.error('Error processing permission:', error);
    }
  };

  const getFlowBadge = (flow: string | null) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pendiente', className: 'bg-warning/10 text-warning' },
      jefe_approved: { label: 'Aprobado Jefe', className: 'bg-info/10 text-info' },
      rrhh_approved: { label: 'Aprobado', className: 'bg-success/10 text-success' },
      completed: { label: 'Completado', className: 'bg-success/10 text-success' },
      rejected: { label: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
    };
    const flowConfig = config[flow || 'pending'];
    return <Badge className={flowConfig.className}>{flowConfig.label}</Badge>;
  };

  const loading = vacationsLoading || permissionsLoading;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">Permisos y Vacaciones</h1>
            <p className="text-muted-foreground">
              {isEmpleado ? 'Gestiona tus solicitudes' : 'Aprueba y gestiona solicitudes del equipo'}
            </p>
          </div>
          {isEmpleado && (
            <Dialog open={newRequestOpen} onOpenChange={setNewRequestOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Solicitud
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Solicitud</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="vacation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vacation">Vacaciones</TabsTrigger>
                    <TabsTrigger value="permission">Permiso</TabsTrigger>
                  </TabsList>
                  <TabsContent value="vacation" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Fechas</Label>
                      <div className="flex gap-2">
                        <Input type="date" placeholder="Desde" />
                        <Input type="date" placeholder="Hasta" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Motivo</Label>
                      <Textarea placeholder="Describe el motivo de la solicitud..." />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Solicitud enviada');
                      setNewRequestOpen(false);
                    }}>
                      Enviar Solicitud
                    </Button>
                  </TabsContent>
                  <TabsContent value="permission" className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Input type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PERMISSION_TYPES).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hora inicio</Label>
                        <Input type="time" />
                      </div>
                      <div className="space-y-2">
                        <Label>Hora fin</Label>
                        <Input type="time" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Motivo</Label>
                      <Textarea placeholder="Describe el motivo del permiso..." />
                    </div>
                    <Button className="w-full" onClick={() => {
                      toast.success('Permiso solicitado');
                      setNewRequestOpen(false);
                    }}>
                      Solicitar Permiso
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingVacations.length + pendingPermissions.length}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Palmtree className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{vacations.length}</p>
                  <p className="text-sm text-muted-foreground">Vacaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <FileText className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{permissions.length}</p>
                  <p className="text-sm text-muted-foreground">Permisos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {vacations.filter(v => v.approval_flow === 'rrhh_approved' || v.approval_flow === 'completed').length + 
                     permissions.filter(p => p.approval_flow === 'rrhh_approved' || p.approval_flow === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Aprobados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vacations' | 'permissions')}>
          <TabsList>
            <TabsTrigger value="vacations" className="gap-2">
              <Palmtree className="w-4 h-4" />
              Vacaciones
            </TabsTrigger>
            <TabsTrigger value="permissions" className="gap-2">
              <FileText className="w-4 h-4" />
              Permisos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vacations" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Días</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vacations.map((vacation) => {
                      const employee = getEmployee(vacation.employee_id);
                      
                      return (
                        <TableRow key={vacation.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee?.name || 'Empleado'}</p>
                                <p className="text-xs text-muted-foreground">{employee?.position || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(parseISO(vacation.start_date), 'dd MMM', { locale: es })} al {format(parseISO(vacation.end_date), 'dd MMM yyyy', { locale: es })}
                          </TableCell>
                          <TableCell>{vacation.days} días</TableCell>
                          <TableCell className="max-w-[200px] truncate">{vacation.reason || '-'}</TableCell>
                          <TableCell>{getFlowBadge(vacation.approval_flow)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedVacation(vacation)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="mt-4">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => {
                      const employee = getEmployee(permission.employee_id);
                      
                      return (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee?.name || 'Empleado'}</p>
                                <p className="text-xs text-muted-foreground">{employee?.position || '-'}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {PERMISSION_TYPES[permission.type] || permission.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(parseISO(permission.date), 'dd MMM yyyy', { locale: es })}</TableCell>
                          <TableCell>
                            {permission.start_time && permission.end_time 
                              ? `${permission.start_time} - ${permission.end_time}`
                              : 'Todo el día'}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{permission.reason || '-'}</TableCell>
                          <TableCell>{getFlowBadge(permission.approval_flow)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedPermission(permission)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Vacation Detail Dialog */}
        <Dialog open={!!selectedVacation} onOpenChange={() => setSelectedVacation(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalle de Vacaciones</DialogTitle>
            </DialogHeader>
            {selectedVacation && (() => {
              const employee = getEmployee(selectedVacation.employee_id);
              const canApprove = (isJefe && selectedVacation.approval_flow === 'pending') ||
                                (isAdmin && (selectedVacation.approval_flow === 'pending' || selectedVacation.approval_flow === 'jefe_approved'));
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{employee?.name || 'Empleado'}</p>
                      <p className="text-sm text-muted-foreground">{employee?.position || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Fecha inicio</Label>
                      <p className="font-medium">{format(parseISO(selectedVacation.start_date), 'PPP', { locale: es })}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha fin</Label>
                      <p className="font-medium">{format(parseISO(selectedVacation.end_date), 'PPP', { locale: es })}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Días solicitados</Label>
                    <p className="font-medium">{selectedVacation.days} días</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Motivo</Label>
                    <p className="font-medium">{selectedVacation.reason || 'No especificado'}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">{getFlowBadge(selectedVacation.approval_flow)}</div>
                  </div>

                  {selectedVacation.jefe_approved_by && (
                    <div>
                      <Label className="text-muted-foreground">Aprobado por Jefe</Label>
                      <p className="font-medium">{selectedVacation.jefe_approved_by}</p>
                    </div>
                  )}

                  {canApprove && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleApproveVacation(selectedVacation, 'reject')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleApproveVacation(selectedVacation, 'approve')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Permission Detail Dialog */}
        <Dialog open={!!selectedPermission} onOpenChange={() => setSelectedPermission(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Detalle de Permiso</DialogTitle>
            </DialogHeader>
            {selectedPermission && (() => {
              const employee = getEmployee(selectedPermission.employee_id);
              const canApprove = (isJefe && selectedPermission.approval_flow === 'pending') ||
                                (isAdmin && (selectedPermission.approval_flow === 'pending' || selectedPermission.approval_flow === 'jefe_approved'));
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{employee?.name || 'Empleado'}</p>
                      <p className="text-sm text-muted-foreground">{employee?.position || '-'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Tipo</Label>
                      <Badge variant="outline" className="mt-1">
                        {PERMISSION_TYPES[selectedPermission.type] || selectedPermission.type}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">{format(parseISO(selectedPermission.date), 'PPP', { locale: es })}</p>
                    </div>
                  </div>

                  {selectedPermission.start_time && selectedPermission.end_time && (
                    <div>
                      <Label className="text-muted-foreground">Horario</Label>
                      <p className="font-medium">{selectedPermission.start_time} - {selectedPermission.end_time}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-muted-foreground">Motivo</Label>
                    <p className="font-medium">{selectedPermission.reason || 'No especificado'}</p>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">{getFlowBadge(selectedPermission.approval_flow)}</div>
                  </div>

                  {selectedPermission.jefe_approved_by && (
                    <div>
                      <Label className="text-muted-foreground">Aprobado por Jefe</Label>
                      <p className="font-medium">{selectedPermission.jefe_approved_by}</p>
                    </div>
                  )}

                  {canApprove && (
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleApprovePermission(selectedPermission, 'reject')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={() => handleApprovePermission(selectedPermission, 'approve')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprobar
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
