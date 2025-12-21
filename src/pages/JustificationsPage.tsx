import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockJustifications, JUSTIFICATION_STATUS } from '@/data/hrmData';
import { JustificationRequest } from '@/types/hrm';
import { 
  FileCheck, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  ShieldCheck,
  Eye,
  Upload
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function JustificationsPage() {
  const { userRole } = useAuth();
  const [justifications, setJustifications] = useState<JustificationRequest[]>(mockJustifications);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJustification, setSelectedJustification] = useState<JustificationRequest | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const isAdmin = userRole?.role === 'admin_rrhh';
  const isJefe = userRole?.role === 'jefe_area';

  const filteredJustifications = justifications.filter(j => {
    const matchesSearch = j.employeeName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = justifications.filter(j => j.status === 'pending').length;
  const jefeApprovedCount = justifications.filter(j => j.status === 'jefe_approved').length;
  const approvedCount = justifications.filter(j => j.status === 'rrhh_approved').length;

  const handleApproveJefe = (id: string) => {
    setJustifications(prev => prev.map(j => 
      j.id === id ? {
        ...j,
        status: 'jefe_approved' as const,
        approvalFlow: {
          ...j.approvalFlow,
          jefeApproval: { approved: true, date: new Date().toISOString(), by: 'Jefe de Área' }
        }
      } : j
    ));
    toast.success('Justificación aprobada por Jefe');
    setSelectedJustification(null);
  };

  const handleApproveRRHH = (id: string) => {
    setJustifications(prev => prev.map(j => 
      j.id === id ? {
        ...j,
        status: 'rrhh_approved' as const,
        approvalFlow: {
          ...j.approvalFlow,
          rrhhApproval: { approved: true, date: new Date().toISOString(), by: 'RRHH' }
        }
      } : j
    ));
    toast.success('Justificación aprobada por RRHH');
    setSelectedJustification(null);
  };

  const handleReject = (id: string) => {
    setJustifications(prev => prev.map(j => 
      j.id === id ? { ...j, status: 'rejected' as const } : j
    ));
    toast.info('Justificación rechazada');
    setSelectedJustification(null);
  };

  const getTypeLabel = (type: JustificationRequest['type']) => {
    switch (type) {
      case 'tardanza': return 'Tardanza';
      case 'falta': return 'Falta';
      case 'salida_temprana': return 'Salida Temprana';
      case 'permiso': return 'Permiso';
      case 'licencia': return 'Licencia';
      default: return type;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Justificaciones</h1>
            <p className="text-muted-foreground">Gestión y validación de justificaciones - Sistema DCTS</p>
          </div>
          <Dialog open={isNewOpen} onOpenChange={setIsNewOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nueva Justificación
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitar Justificación</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Tipo de Justificación *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tardanza">Tardanza</SelectItem>
                      <SelectItem value="falta">Falta</SelectItem>
                      <SelectItem value="salida_temprana">Salida Temprana</SelectItem>
                      <SelectItem value="permiso">Permiso</SelectItem>
                      <SelectItem value="licencia">Licencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha *</Label>
                  <Input type="date" />
                </div>
                <div>
                  <Label>Descripción *</Label>
                  <Textarea placeholder="Describe el motivo de la justificación..." />
                </div>
                <div>
                  <Label>Tipo de Evidencia</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Certificado Médico</SelectItem>
                      <SelectItem value="document">Documento Oficial</SelectItem>
                      <SelectItem value="photo">Fotografía</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adjuntar Evidencia</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Click para subir archivo</p>
                    <p className="text-xs text-muted-foreground">PDF, JPG, PNG hasta 5MB</p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => {
                  toast.success('Justificación enviada para validación');
                  setIsNewOpen(false);
                }}>
                  Enviar Justificación
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <FileCheck className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{jefeApprovedCount}</p>
                  <p className="text-sm text-muted-foreground">Aprobadas Jefe</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedCount}</p>
                  <p className="text-sm text-muted-foreground">Aprobadas RRHH</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{justifications.filter(j => j.dctsValidation?.validated).length}</p>
                  <p className="text-sm text-muted-foreground">Validadas DCTS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por empleado..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="jefe_approved">Aprobado Jefe</SelectItem>
                  <SelectItem value="rrhh_approved">Aprobado RRHH</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>DCTS</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJustifications.map((justification) => (
                  <TableRow key={justification.id}>
                    <TableCell className="font-medium">{justification.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(justification.type)}</Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(justification.date), 'dd MMM yyyy', { locale: es })}</TableCell>
                    <TableCell className="max-w-xs truncate">{justification.description}</TableCell>
                    <TableCell>
                      {justification.dctsValidation?.validated ? (
                        <Badge className="bg-success/10 text-success gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Validado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Clock className="w-3 h-3" />
                          Pendiente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={JUSTIFICATION_STATUS[justification.status].className}>
                        {JUSTIFICATION_STATUS[justification.status].name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedJustification(justification)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Detail */}
        <Dialog open={!!selectedJustification} onOpenChange={() => setSelectedJustification(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Justificación</DialogTitle>
            </DialogHeader>
            {selectedJustification && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedJustification.employeeName}</h3>
                    <p className="text-muted-foreground">{getTypeLabel(selectedJustification.type)}</p>
                  </div>
                  <Badge className={JUSTIFICATION_STATUS[selectedJustification.status].className}>
                    {JUSTIFICATION_STATUS[selectedJustification.status].name}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha</Label>
                    <p className="font-medium">{format(parseISO(selectedJustification.date), 'PPP', { locale: es })}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Envío</Label>
                    <p className="font-medium">{format(parseISO(selectedJustification.submittedAt), 'PPP', { locale: es })}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="font-medium">{selectedJustification.description}</p>
                </div>

                {selectedJustification.evidenceUrl && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Evidencia</Label>
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" />
                      Ver documento adjunto
                    </Button>
                  </div>
                )}

                {/* Validación DCTS */}
                <div className="p-4 rounded-xl bg-muted/50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${selectedJustification.dctsValidation?.validated ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Validación DCTS</span>
                  </div>
                  {selectedJustification.dctsValidation?.validated ? (
                    <div className="text-sm text-muted-foreground">
                      <p>Validado el {format(parseISO(selectedJustification.dctsValidation.validatedAt!), 'PPP', { locale: es })}</p>
                      <p>Por: {selectedJustification.dctsValidation.validatedBy}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pendiente de validación automática</p>
                  )}
                </div>

                {/* Flujo de aprobación */}
                <div className="space-y-3">
                  <Label>Flujo de Aprobación</Label>
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 p-3 rounded-lg border ${selectedJustification.approvalFlow.jefeApproval ? 'border-success bg-success/5' : 'border-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selectedJustification.approvalFlow.jefeApproval ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">Jefe de Área</span>
                      </div>
                      {selectedJustification.approvalFlow.jefeApproval && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedJustification.approvalFlow.jefeApproval.by}
                        </p>
                      )}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg border ${selectedJustification.approvalFlow.rrhhApproval ? 'border-success bg-success/5' : 'border-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selectedJustification.approvalFlow.rrhhApproval ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">RRHH</span>
                      </div>
                      {selectedJustification.approvalFlow.rrhhApproval && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedJustification.approvalFlow.rrhhApproval.by}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {selectedJustification.status === 'pending' && isJefe && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2" onClick={() => handleApproveJefe(selectedJustification.id)}>
                      <CheckCircle className="w-4 h-4" />
                      Aprobar como Jefe
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={() => handleReject(selectedJustification.id)}>
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {selectedJustification.status === 'jefe_approved' && isAdmin && (
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2 bg-success hover:bg-success/90" onClick={() => handleApproveRRHH(selectedJustification.id)}>
                      <CheckCircle className="w-4 h-4" />
                      Aprobar como RRHH
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={() => handleReject(selectedJustification.id)}>
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
