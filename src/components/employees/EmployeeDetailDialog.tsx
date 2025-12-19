import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  User,
  Building2,
  Mail,
  Phone,
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Briefcase,
  FileSignature,
  DollarSign,
  CalendarCheck,
  Shield,
  Edit,
  Send,
  Printer,
  Download,
  AlertCircle,
  History,
  ArrowLeft,
  Scale,
  FilePlus,
  ArrowRightLeft,
  Gift
} from 'lucide-react';
import { Employee, AttendanceRecord, DEPARTMENTS, EmployeeContract, Sanction, ContractAddendum } from '@/types/attendance';
import { mockAttendanceRecords, mockContracts, mockSanctions, CONTRACT_TYPES, mockAddendums, ADDENDUM_TYPES } from '@/data/mockData';
import { toast } from 'sonner';
import { SanctionForm } from './SanctionForm';
import { AddendumForm } from './AddendumForm';

interface EmployeeDetailDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeUpdate?: (employee: Employee, contract?: Partial<EmployeeContract>) => void;
}

export function EmployeeDetailDialog({ employee, open, onOpenChange, onEmployeeUpdate }: EmployeeDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [isAddingSanction, setIsAddingSanction] = useState(false);
  const [isAddingAddendum, setIsAddingAddendum] = useState(false);
  const [localSanctions, setLocalSanctions] = useState<Sanction[]>([]);
  const [localAddendums, setLocalAddendums] = useState<ContractAddendum[]>([]);

  const stats = useMemo(() => {
    if (!employee) return null;

    const records = mockAttendanceRecords.filter(r => r.employeeId === employee.id);

    const totalDays = records.length;
    const daysAttended = records.filter(r => r.daysAttended > 0).length;
    const absences = records.filter(r => r.absences > 0).length;
    const tardies = records.filter(r => r.tardyCount > 0).length;
    const totalTardyMinutes = records.reduce((sum, r) => sum + r.tardyMinutes, 0);
    const totalWorkedHours = records.reduce((sum, r) => sum + r.workedHours, 0);
    const totalOvertimeHours = records.reduce((sum, r) => sum + r.overtimeWeekday + r.overtimeHoliday, 0);
    const attendanceRate = totalDays > 0 ? (daysAttended / totalDays) * 100 : 0;

    return {
      totalDays,
      daysAttended,
      absences,
      tardies,
      totalTardyMinutes,
      totalWorkedHours: Math.round(totalWorkedHours * 10) / 10,
      totalOvertimeHours: Math.round(totalOvertimeHours * 10) / 10,
      attendanceRate: Math.round(attendanceRate),
      recentRecords: records.slice(0, 10),
    };
  }, [employee]);

  const contract = useMemo(() => {
    if (!employee) return null;
    return mockContracts.find(c => c.employeeId === employee.id) || null;
  }, [employee]);

  const sanctions = useMemo(() => {
    if (!employee) return [];
    const existing = mockSanctions.filter(s => s.employeeId === employee.id);
    const local = localSanctions.filter(s => s.employeeId === employee.id);
    return [...existing, ...local];
  }, [employee, localSanctions]);

  const addendums = useMemo(() => {
    if (!employee) return [];
    const existing = mockAddendums.filter(a => a.employeeId === employee.id);
    const local = localAddendums.filter(a => a.employeeId === employee.id);
    return [...existing, ...local];
  }, [employee, localAddendums]);

  if (!employee || !stats) return null;

  const dept = DEPARTMENTS[employee.department];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const calculateYearsWorked = (hireDate: string) => {
    const start = new Date(hireDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(years * 10) / 10;
  };

  const getDaysUntilContractEnd = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleSendMessage = () => {
    toast.info(`Enviando mensaje sobre ${employee.name}`);
  };

  const handlePrintContract = () => {
    toast.info('Generando contrato para impresión');
  };

  const handleDownloadFile = () => {
    toast.info('Descargando expediente del empleado');
  };

  const handleApplySanction = () => {
    setIsAddingSanction(true);
  };

  const handleSanctionSubmit = (sanctionData: Omit<Sanction, 'id'>) => {
    const newSanction: Sanction = {
      ...sanctionData,
      id: `s-${Date.now()}`,
    };
    setLocalSanctions(prev => [...prev, newSanction]);
    setIsAddingSanction(false);
    toast.success('Sanción registrada correctamente');
  };

  const handleCancelSanction = () => {
    setIsAddingSanction(false);
  };

  const handleAddAddendum = () => {
    setIsAddingAddendum(true);
  };

  const handleAddendumSubmit = (addendumData: Omit<ContractAddendum, 'id'>) => {
    const newAddendum: ContractAddendum = {
      ...addendumData,
      id: `add-${Date.now()}`,
    };
    setLocalAddendums(prev => [...prev, newAddendum]);
    setIsAddingAddendum(false);
    toast.success('Adenda registrada correctamente');
  };

  const handleCancelAddendum = () => {
    setIsAddingAddendum(false);
  };

  const StatItem = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className={`p-2 rounded-lg ${color || 'bg-primary/10'}`}>
        <Icon className={`w-4 h-4 ${color ? 'text-primary-foreground' : 'text-primary'}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
      </div>
    </div>
  );

  const contractType = contract ? CONTRACT_TYPES[contract.type] : null;
  const daysUntilEnd = contract?.endDate ? getDaysUntilContractEnd(contract.endDate) : null;

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setIsAddingSanction(false);
        setIsAddingAddendum(false);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isAddingSanction ? 'Registrar Sanción' : isAddingAddendum ? 'Registrar Adenda' : 'Perfil del Empleado'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[85vh] p-6">
          <AnimatePresence mode="wait">
            {isAddingSanction ? (
              <motion.div
                key="sanction-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 pb-2">
                  <Button variant="ghost" size="icon" onClick={handleCancelSanction}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Scale className="w-5 h-5 text-destructive" />
                      Registrar Sanción
                    </h2>
                    <p className="text-sm text-muted-foreground">Basado en el Reglamento Interno de Trabajo</p>
                  </div>
                </div>
                <SanctionForm
                  employee={employee}
                  onSubmit={handleSanctionSubmit}
                  onCancel={handleCancelSanction}
                />
              </motion.div>
            ) : isAddingAddendum ? (
              <motion.div
                key="addendum-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 pb-2">
                  <Button variant="ghost" size="icon" onClick={handleCancelAddendum}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FilePlus className="w-5 h-5 text-primary" />
                      Registrar Adenda
                    </h2>
                    <p className="text-sm text-muted-foreground">Modificación al contrato de {employee.name}</p>
                  </div>
                </div>
                <AddendumForm
                  employee={employee}
                  onSubmit={handleAddendumSubmit}
                  onCancel={handleCancelAddendum}
                />
              </motion.div>
            ) : (
              <motion.div
                key="view-mode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {/* Profile Header */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col sm:flex-row items-start gap-4 pb-4"
                >
                  <Avatar className="h-20 w-20">
                    <AvatarFallback
                      className="text-2xl font-bold bg-primary/10 text-primary"
                    >
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold">{employee.name}</h2>
                        <p className="text-muted-foreground">{employee.position || 'Sin cargo asignado'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleDownloadFile}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1.5 bg-primary/10 text-primary">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        {dept.name}
                      </Badge>
                      {contractType && (
                        <Badge variant="outline">
                          {contractType.name}
                        </Badge>
                      )}
                      {employee.status === 'active' && (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>
                    {employee.hireDate && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <CalendarCheck className="w-3 h-3 inline mr-1" />
                        Ingreso: {new Date(employee.hireDate).toLocaleDateString('es-PE')}
                        ({calculateYearsWorked(employee.hireDate)} años)
                      </p>
                    )}
                  </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pb-4">
                  <Button size="sm" variant="default" onClick={handleSendMessage}>
                    <Send className="w-4 h-4 mr-1" />
                    Enviar a Jefe de Área
                  </Button>
                  <Button size="sm" variant="outline" onClick={handlePrintContract}>
                    <Printer className="w-4 h-4 mr-1" />
                    Imprimir Contrato
                  </Button>
                  <Button size="sm" variant="outline" className="text-warning border-warning" onClick={handleApplySanction}>
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Aplicar Sanción
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="contract">Contrato</TabsTrigger>
                    <TabsTrigger value="attendance">Asistencia</TabsTrigger>
                    <TabsTrigger value="history">
                      Historial
                      {sanctions.length > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                          {sanctions.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  {/* Info Tab */}
                  <TabsContent value="info" className="space-y-4 mt-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Información Personal
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Documento</p>
                            <p className="font-medium">{employee.documentId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Departamento</p>
                            <p className="font-medium">{dept.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{employee.email || 'No registrado'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{employee.phone || 'No registrado'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <Separator />

                    {/* Attendance Summary */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Resumen de Asistencia (Últimos 30 días)
                      </h3>

                      <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Tasa de Asistencia</span>
                          <span className="text-2xl font-bold text-primary">{stats.attendanceRate}%</span>
                        </div>
                        <Progress value={stats.attendanceRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <StatItem icon={Calendar} label="Días Laborados" value={stats.daysAttended} />
                        <StatItem icon={XCircle} label="Ausencias" value={stats.absences} color="bg-destructive" />
                        <StatItem icon={AlertTriangle} label="Tardanzas" value={stats.tardies} color="bg-warning" />
                        <StatItem icon={TrendingUp} label="Horas Extra" value={`${stats.totalOvertimeHours}h`} color="bg-success" />
                      </div>
                    </motion.div>
                  </TabsContent>

                  {/* Contract Tab */}
                  <TabsContent value="contract" className="space-y-4 mt-4">
                    {contract ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        {/* Contract Status Alert */}
                        {daysUntilEnd !== null && daysUntilEnd <= 30 && daysUntilEnd > 0 && (
                          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                            <div>
                              <p className="font-medium text-warning">Contrato próximo a vencer</p>
                              <p className="text-sm text-muted-foreground">
                                Vence en {daysUntilEnd} días - Coordinar renovación
                              </p>
                            </div>
                          </div>
                        )}

                        {daysUntilEnd !== null && daysUntilEnd <= 0 && (
                          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                            <XCircle className="w-5 h-5 text-destructive" />
                            <div>
                              <p className="font-medium text-destructive">Contrato vencido</p>
                              <p className="text-sm text-muted-foreground">
                                Este contrato requiere renovación inmediata
                              </p>
                            </div>
                          </div>
                        )}

                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          Datos del Contrato
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <FileSignature className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Tipo de Contrato</p>
                              <Badge variant="outline">{contractType?.name}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <Briefcase className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Cargo</p>
                              <p className="font-medium">{contract.position}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <Calendar className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Fecha de Inicio</p>
                              <p className="font-medium">
                                {new Date(contract.startDate).toLocaleDateString('es-PE')}
                              </p>
                            </div>
                          </div>
                          {contract.endDate && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                              <Calendar className="w-5 h-5 text-primary" />
                              <div>
                                <p className="text-xs text-muted-foreground">Fecha de Fin</p>
                                <p className="font-medium">
                                  {new Date(contract.endDate).toLocaleDateString('es-PE')}
                                  {daysUntilEnd !== null && daysUntilEnd > 0 && (
                                    <span className="text-muted-foreground text-sm ml-1">({daysUntilEnd} días)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <DollarSign className="w-5 h-5 text-success" />
                            <div>
                              <p className="text-xs text-muted-foreground">Salario Mensual</p>
                              <p className="font-medium text-success">S/. {contract.salary.toLocaleString('es-PE')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                            <Shield className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Estado del Contrato</p>
                              <Badge variant={contract.status === 'active' ? 'success' : 'destructive'}>
                                {contract.status === 'active' ? 'Activo' :
                                 contract.status === 'pending_renewal' ? 'Pendiente Renovación' : 'Expirado'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-muted/30">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Documentación</h4>
                            <Badge variant={contract.documentsComplete ? 'success' : 'destructive'}>
                              {contract.documentsComplete ? 'Completa' : 'Incompleta'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={handlePrintContract}>
                            <Printer className="w-4 h-4 mr-1" />
                            Imprimir Contrato
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-1" />
                            Ver Adendas
                          </Button>
                          {(contract.status === 'pending_renewal' || (daysUntilEnd && daysUntilEnd <= 30)) && (
                            <Button size="sm">
                              <CalendarCheck className="w-4 h-4 mr-1" />
                              Renovar Contrato
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay contrato registrado para este empleado</p>
                        <Button className="mt-4" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Registrar Contrato
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Attendance Tab */}
                  <TabsContent value="attendance" className="space-y-4 mt-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Total Horas Trabajadas</span>
                          </div>
                          <p className="text-xl font-bold">{stats.totalWorkedHours}h</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Minutos de Tardanza</span>
                          </div>
                          <p className="text-xl font-bold">{stats.totalTardyMinutes} min</p>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Registros Recientes
                      </h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stats.recentRecords.map((record) => (
                          <div
                            key={record.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${
                                record.absences > 0 ? 'bg-destructive' :
                                record.tardyCount > 0 ? 'bg-warning' : 'bg-success'
                              }`} />
                              <span className="text-sm font-medium">{new Date(record.date).toLocaleDateString('es-PE', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              })}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-muted-foreground">
                                {record.workedHours.toFixed(1)}h trabajadas
                              </span>
                              {record.absences > 0 && (
                                <Badge variant="destructive" className="text-xs">Ausente</Badge>
                              )}
                              {record.tardyCount > 0 && (
                                <Badge variant="warning" className="text-xs">
                                  Tardanza {record.tardyMinutes}min
                                </Badge>
                              )}
                              {record.overtimeWeekday > 0 && (
                                <Badge variant="success" className="text-xs">
                                  +{record.overtimeWeekday.toFixed(1)}h extra
                                </Badge>
                              )}
                              {record.absences === 0 && record.tardyCount === 0 && (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button variant="outline" className="w-full">
                        <History className="w-4 h-4 mr-2" />
                        Ver Historial Completo
                      </Button>
                    </motion.div>
                  </TabsContent>

                  {/* History Tab - Sanctions */}
                  <TabsContent value="history" className="space-y-4 mt-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          Historial de Sanciones
                        </h3>
                        <Button size="sm" variant="outline" onClick={handleApplySanction}>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Nueva Sanción
                        </Button>
                      </div>

                      {sanctions.length > 0 ? (
                        <div className="space-y-3">
                          {sanctions.map((sanction) => (
                            <div
                              key={sanction.id}
                              className="p-4 rounded-lg border border-destructive/20 bg-destructive/5"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <Badge variant="destructive">
                                    {sanction.type === 'verbal_warning' ? 'Amonestación Verbal' :
                                     sanction.type === 'written_warning' ? 'Amonestación Escrita' :
                                     sanction.type === 'suspension' ? 'Suspensión' : 'Despido'}
                                  </Badge>
                                  <p className="text-sm font-medium mt-2">{sanction.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {sanction.regulationArticle} - Falta {sanction.infractionLevel}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground">
                                  <p>{new Date(sanction.date).toLocaleDateString('es-PE')}</p>
                                  <p className="text-xs">Por: {sanction.appliedBy}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-success opacity-50" />
                          <p>Sin sanciones registradas</p>
                          <p className="text-sm">El colaborador tiene un historial limpio</p>
                        </div>
                      )}

                      <Separator />

                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Otros Registros
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Capacitaciones
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          Vacaciones
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          Licencias
                        </Button>
                        <Button variant="outline" className="justify-start">
                          <FileSignature className="w-4 h-4 mr-2" />
                          Adendas
                        </Button>
                      </div>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
