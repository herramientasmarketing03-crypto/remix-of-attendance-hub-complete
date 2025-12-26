import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJustifications, type Justification } from '@/hooks/useJustifications';
import { 
  FileCheck, Search, Plus, CheckCircle, XCircle, Clock, FileText, ShieldCheck, Eye, Upload, Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const JUSTIFICATION_STATUS: Record<string, { name: string; className: string }> = {
  pending: { name: 'Pendiente', className: 'bg-warning/10 text-warning' },
  approved: { name: 'Aprobado', className: 'bg-success/10 text-success' },
  rejected: { name: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
};

const JUSTIFICATION_TYPE_LABELS: Record<string, string> = {
  tardanza: 'Tardanza',
  inasistencia: 'Inasistencia',
  salida_temprana: 'Salida Temprana',
  permiso_medico: 'Permiso Médico',
  emergencia_familiar: 'Emergencia Familiar',
};

export default function JustificationsPage() {
  const { userRole, profile, user } = useAuth();
  const { justifications, loading, approveByJefe, approveByRRHH, reject, refetch } = useJustifications();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedJustification, setSelectedJustification] = useState<Justification | null>(null);
  const [isNewOpen, setIsNewOpen] = useState(false);

  const isAdmin = userRole?.role === 'admin_rrhh';
  const isJefe = userRole?.role === 'jefe_area';

  const filteredJustifications = justifications.filter(j => {
    const matchesSearch = j.employee_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = justifications.filter(j => j.status === 'pending').length;
  const jefeApprovedCount = justifications.filter(j => j.jefe_approved && !j.rrhh_approved).length;
  const approvedCount = justifications.filter(j => j.status === 'approved').length;
  const dctsValidatedCount = justifications.filter(j => j.dcts_validated).length;

  const handleApproveJefe = async (id: string) => {
    try {
      await approveByJefe(id, `${profile?.nombres} ${profile?.apellidos}`);
      toast.success('Justificación aprobada por Jefe');
      setSelectedJustification(null);
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleApproveRRHH = async (id: string) => {
    try {
      await approveByRRHH(id, `${profile?.nombres} ${profile?.apellidos}`);
      toast.success('Justificación aprobada por RRHH');
      setSelectedJustification(null);
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await reject(id);
      toast.info('Justificación rechazada');
      setSelectedJustification(null);
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const getTypeLabel = (type: string) => {
    return JUSTIFICATION_TYPE_LABELS[type] || type;
  };

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
                      <SelectItem value="inasistencia">Inasistencia</SelectItem>
                      <SelectItem value="salida_temprana">Salida Temprana</SelectItem>
                      <SelectItem value="permiso_medico">Permiso Médico</SelectItem>
                      <SelectItem value="emergencia_familiar">Emergencia Familiar</SelectItem>
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
                  <p className="text-2xl font-bold">{dctsValidatedCount}</p>
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
                  <SelectItem value="approved">Aprobados</SelectItem>
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
                    <TableCell className="font-medium">{justification.employee_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getTypeLabel(justification.type)}</Badge>
                    </TableCell>
                    <TableCell>{format(parseISO(justification.date), 'dd MMM yyyy', { locale: es })}</TableCell>
                    <TableCell className="max-w-xs truncate">{justification.description}</TableCell>
                    <TableCell>
                      {justification.dcts_validated ? (
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
                      <Badge className={JUSTIFICATION_STATUS[justification.status || 'pending']?.className}>
                        {JUSTIFICATION_STATUS[justification.status || 'pending']?.name}
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
                    <h3 className="text-xl font-semibold">{selectedJustification.employee_name}</h3>
                    <p className="text-muted-foreground">{getTypeLabel(selectedJustification.type)}</p>
                  </div>
                  <Badge className={JUSTIFICATION_STATUS[selectedJustification.status || 'pending']?.className}>
                    {JUSTIFICATION_STATUS[selectedJustification.status || 'pending']?.name}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha</Label>
                    <p className="font-medium">{format(parseISO(selectedJustification.date), 'PPP', { locale: es })}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Envío</Label>
                    <p className="font-medium">{format(parseISO(selectedJustification.created_at || new Date().toISOString()), 'PPP', { locale: es })}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Descripción</Label>
                  <p className="font-medium">{selectedJustification.description}</p>
                </div>

                {selectedJustification.evidence_url && (
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
                    <ShieldCheck className={`w-5 h-5 ${selectedJustification.dcts_validated ? 'text-success' : 'text-muted-foreground'}`} />
                    <span className="font-medium">Validación DCTS</span>
                  </div>
                  {selectedJustification.dcts_validated ? (
                    <div className="text-sm text-muted-foreground">
                      <p>Validado el {selectedJustification.dcts_validated_at ? format(parseISO(selectedJustification.dcts_validated_at), 'PPP', { locale: es }) : '-'}</p>
                      <p>Por: {selectedJustification.dcts_validated_by || '-'}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Pendiente de validación automática</p>
                  )}
                </div>

                {/* Flujo de aprobación */}
                <div className="space-y-3">
                  <Label>Flujo de Aprobación</Label>
                  <div className="flex items-center gap-4">
                    <div className={`flex-1 p-3 rounded-lg border ${selectedJustification.jefe_approved ? 'border-success bg-success/5' : 'border-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selectedJustification.jefe_approved ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">Jefe de Área</span>
                      </div>
                      {selectedJustification.jefe_approved && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedJustification.jefe_approved_by || '-'}
                        </p>
                      )}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg border ${selectedJustification.rrhh_approved ? 'border-success bg-success/5' : 'border-muted'}`}>
                      <div className="flex items-center gap-2">
                        {selectedJustification.rrhh_approved ? (
                          <CheckCircle className="w-5 h-5 text-success" />
                        ) : (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">RRHH</span>
                      </div>
                      {selectedJustification.rrhh_approved && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedJustification.rrhh_approved_by || '-'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {selectedJustification.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => handleReject(selectedJustification.id)}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                    {isJefe && !selectedJustification.jefe_approved && (
                      <Button onClick={() => handleApproveJefe(selectedJustification.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar (Jefe)
                      </Button>
                    )}
                    {isAdmin && (
                      <Button onClick={() => handleApproveRRHH(selectedJustification.id)}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aprobar (RRHH)
                      </Button>
                    )}
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
