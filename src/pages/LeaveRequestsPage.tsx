import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  X, 
  Eye,
  Clock,
  Users,
  Palmtree,
  FileText
} from 'lucide-react';
import { mockEmployees, mockVacations, mockPermissions } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { VacationRequest, Permission } from '@/types/attendance';
import { toast } from 'sonner';
import { format, differenceInDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { logAction } from '@/services/auditLog';
import { cn } from '@/lib/utils';

type ApprovalFlow = 'pending' | 'jefe_approved' | 'rrhh_approved' | 'rejected';

interface ExtendedVacation extends VacationRequest {
  approvalFlow: ApprovalFlow;
  jefeApprovedBy?: string;
  jefeApprovedAt?: string;
}

interface ExtendedPermission extends Permission {
  approvalFlow: ApprovalFlow;
  jefeApprovedBy?: string;
  jefeApprovedAt?: string;
}

const PERMISSION_TYPES = {
  personal: 'Personal',
  medical: 'Médico',
  academic: 'Académico',
  family: 'Familiar',
  other: 'Otro',
};

export default function LeaveRequestsPage() {
  const { isAdmin, isJefe, isEmpleado, user, userRole, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'vacations' | 'permissions'>('vacations');
  const [selectedVacation, setSelectedVacation] = useState<ExtendedVacation | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<ExtendedPermission | null>(null);
  const [newRequestOpen, setNewRequestOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  // Initialize with mock data + approval flow
  const [vacations, setVacations] = useState<ExtendedVacation[]>(() => 
    mockVacations.map(v => ({
      ...v,
      approvalFlow: v.status === 'approved' ? 'rrhh_approved' as ApprovalFlow : 
                    v.status === 'pending' ? 'pending' as ApprovalFlow : 'rejected' as ApprovalFlow,
    }))
  );

  const [permissions, setPermissions] = useState<ExtendedPermission[]>(() => 
    mockPermissions.map(p => ({
      ...p,
      approvalFlow: p.status === 'approved' ? 'rrhh_approved' as ApprovalFlow : 
                    p.status === 'pending' ? 'pending' as ApprovalFlow : 'rejected' as ApprovalFlow,
    }))
  );

  const getEmployee = (employeeId: string) => mockEmployees.find(e => e.id === employeeId);

  // Filter based on role
  const myEmployeeId = isEmpleado ? '4' : null; // Mock: empleado@empresa.com is Christian Maldon

  const visibleVacations = vacations.filter(v => {
    if (isAdmin) return true;
    if (isJefe) {
      const employee = getEmployee(v.employeeId);
      return employee?.department === 'ti';
    }
    if (isEmpleado) return v.employeeId === myEmployeeId;
    return false;
  });

  const visiblePermissions = permissions.filter(p => {
    if (isAdmin) return true;
    if (isJefe) {
      const employee = getEmployee(p.employeeId);
      return employee?.department === 'ti';
    }
    if (isEmpleado) return p.employeeId === myEmployeeId;
    return false;
  });

  const pendingVacations = visibleVacations.filter(v => 
    v.approvalFlow === 'pending' || (isAdmin && v.approvalFlow === 'jefe_approved')
  );
  const pendingPermissions = visiblePermissions.filter(p => 
    p.approvalFlow === 'pending' || (isAdmin && p.approvalFlow === 'jefe_approved')
  );

  const handleApproveVacation = (vacation: ExtendedVacation, action: 'approve' | 'reject') => {
    const employee = getEmployee(vacation.employeeId);
    
    setVacations(prev => prev.map(v => {
      if (v.id !== vacation.id) return v;
      
      if (action === 'reject') {
        return { ...v, approvalFlow: 'rejected' as ApprovalFlow, status: 'rejected' };
      }
      
      if (isJefe && v.approvalFlow === 'pending') {
        return { 
          ...v, 
          approvalFlow: 'jefe_approved' as ApprovalFlow,
          jefeApprovedBy: `${profile?.nombres} ${profile?.apellidos}`,
          jefeApprovedAt: new Date().toISOString()
        };
      }
      
      if (isAdmin && (v.approvalFlow === 'pending' || v.approvalFlow === 'jefe_approved')) {
        return { 
          ...v, 
          approvalFlow: 'rrhh_approved' as ApprovalFlow, 
          status: 'approved',
          approvedBy: `${profile?.nombres} ${profile?.apellidos}`,
          approvedAt: new Date().toISOString()
        };
      }
      
      return v;
    }));

    logAction(
      action === 'approve' ? 'APPROVE' : 'REJECT', 
      'vacation', 
      vacation.id, 
      user?.id || '', 
      `${profile?.nombres} ${profile?.apellidos}`,
      `${action === 'approve' ? 'Aprobó' : 'Rechazó'} vacaciones de ${employee?.name}`
    );

    toast.success(action === 'approve' ? 'Vacaciones aprobadas' : 'Vacaciones rechazadas');
    setSelectedVacation(null);
  };

  const handleApprovePermission = (permission: ExtendedPermission, action: 'approve' | 'reject') => {
    const employee = getEmployee(permission.employeeId);
    
    setPermissions(prev => prev.map(p => {
      if (p.id !== permission.id) return p;
      
      if (action === 'reject') {
        return { ...p, approvalFlow: 'rejected' as ApprovalFlow, status: 'rejected' };
      }
      
      if (isJefe && p.approvalFlow === 'pending') {
        return { 
          ...p, 
          approvalFlow: 'jefe_approved' as ApprovalFlow,
          jefeApprovedBy: `${profile?.nombres} ${profile?.apellidos}`,
          jefeApprovedAt: new Date().toISOString()
        };
      }
      
      if (isAdmin && (p.approvalFlow === 'pending' || p.approvalFlow === 'jefe_approved')) {
        return { 
          ...p, 
          approvalFlow: 'rrhh_approved' as ApprovalFlow, 
          status: 'approved'
        };
      }
      
      return p;
    }));

    logAction(
      action === 'approve' ? 'APPROVE' : 'REJECT', 
      'permission', 
      permission.id, 
      user?.id || '', 
      `${profile?.nombres} ${profile?.apellidos}`,
      `${action === 'approve' ? 'Aprobó' : 'Rechazó'} permiso de ${employee?.name}`
    );

    toast.success(action === 'approve' ? 'Permiso aprobado' : 'Permiso rechazado');
    setSelectedPermission(null);
  };

  const getFlowBadge = (flow: ApprovalFlow) => {
    const config = {
      pending: { label: 'Pendiente', className: 'bg-warning/10 text-warning' },
      jefe_approved: { label: 'Aprobado Jefe', className: 'bg-info/10 text-info' },
      rrhh_approved: { label: 'Aprobado', className: 'bg-success/10 text-success' },
      rejected: { label: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
    };
    return <Badge className={config[flow].className}>{config[flow].label}</Badge>;
  };

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
                <Button className="gradient-primary">
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
                      <p className="text-sm text-muted-foreground">Selecciona el rango de fechas</p>
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
                  <p className="text-2xl font-bold">{visibleVacations.length}</p>
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
                  <p className="text-2xl font-bold">{visiblePermissions.length}</p>
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
                    {visibleVacations.filter(v => v.approvalFlow === 'rrhh_approved').length + 
                     visiblePermissions.filter(p => p.approvalFlow === 'rrhh_approved').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Aprobados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
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
                    {visibleVacations.map((vacation) => {
                      const employee = getEmployee(vacation.employeeId);
                      if (!employee) return null;

                      return (
                        <TableRow key={vacation.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.position}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vacation.startDate} al {vacation.endDate}
                          </TableCell>
                          <TableCell>{vacation.days} días</TableCell>
                          <TableCell className="max-w-[200px] truncate">{vacation.reason}</TableCell>
                          <TableCell>{getFlowBadge(vacation.approvalFlow)}</TableCell>
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
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visiblePermissions.map((permission) => {
                      const employee = getEmployee(permission.employeeId);
                      if (!employee) return null;

                      return (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                  {employee.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-muted-foreground">{employee.position}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{permission.date}</TableCell>
                          <TableCell>{permission.startTime} - {permission.endTime}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{PERMISSION_TYPES[permission.type]}</Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{permission.reason}</TableCell>
                          <TableCell>{getFlowBadge(permission.approvalFlow)}</TableCell>
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
              const employee = getEmployee(selectedVacation.employeeId);
              const canApprove = (isJefe && selectedVacation.approvalFlow === 'pending') ||
                                (isAdmin && (selectedVacation.approvalFlow === 'pending' || selectedVacation.approvalFlow === 'jefe_approved'));
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{employee?.name}</p>
                      <p className="text-sm text-muted-foreground">{employee?.position}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Desde</Label>
                      <p className="font-medium">{selectedVacation.startDate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Hasta</Label>
                      <p className="font-medium">{selectedVacation.endDate}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Días</Label>
                      <p className="font-medium">{selectedVacation.days} días</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <div className="mt-1">{getFlowBadge(selectedVacation.approvalFlow)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Motivo</Label>
                    <p className="p-3 mt-1 rounded-lg bg-muted/50">{selectedVacation.reason}</p>
                  </div>

                  {selectedVacation.jefeApprovedBy && (
                    <div className="p-3 rounded-lg bg-info/10 text-info text-sm">
                      ✓ Aprobado por Jefe: {selectedVacation.jefeApprovedBy}
                    </div>
                  )}

                  {canApprove && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => handleApproveVacation(selectedVacation, 'reject')}>
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button className="bg-success hover:bg-success/90" onClick={() => handleApproveVacation(selectedVacation, 'approve')}>
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
              const employee = getEmployee(selectedPermission.employeeId);
              const canApprove = (isJefe && selectedPermission.approvalFlow === 'pending') ||
                                (isAdmin && (selectedPermission.approvalFlow === 'pending' || selectedPermission.approvalFlow === 'jefe_approved'));
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{employee?.name}</p>
                      <p className="text-sm text-muted-foreground">{employee?.position}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">{selectedPermission.date}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Tipo</Label>
                      <Badge variant="outline" className="mt-1">{PERMISSION_TYPES[selectedPermission.type]}</Badge>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Horario</Label>
                      <p className="font-medium">{selectedPermission.startTime} - {selectedPermission.endTime}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Estado</Label>
                      <div className="mt-1">{getFlowBadge(selectedPermission.approvalFlow)}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-muted-foreground">Motivo</Label>
                    <p className="p-3 mt-1 rounded-lg bg-muted/50">{selectedPermission.reason}</p>
                  </div>

                  {selectedPermission.jefeApprovedBy && (
                    <div className="p-3 rounded-lg bg-info/10 text-info text-sm">
                      ✓ Aprobado por Jefe: {selectedPermission.jefeApprovedBy}
                    </div>
                  )}

                  {canApprove && (
                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => handleApprovePermission(selectedPermission, 'reject')}>
                        <X className="w-4 h-4 mr-2" />
                        Rechazar
                      </Button>
                      <Button className="bg-success hover:bg-success/90" onClick={() => handleApprovePermission(selectedPermission, 'approve')}>
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
