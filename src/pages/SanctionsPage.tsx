import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Search, 
  Scale, 
  Check, 
  X, 
  Eye,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import { mockSanctions, mockEmployees } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Sanction, SanctionType, InfractionLevel } from '@/types/attendance';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { logAction } from '@/services/auditLog';

type SanctionApprovalStatus = 'pending' | 'approved' | 'rejected';

interface ExtendedSanction extends Sanction {
  requestedBy?: string;
  approvalStatus?: SanctionApprovalStatus;
  approvalNotes?: string;
}

const SANCTION_TYPE_LABELS: Record<SanctionType, string> = {
  verbal_warning: 'Amonestación Verbal',
  written_warning: 'Amonestación Escrita',
  suspension: 'Suspensión',
  dismissal: 'Despido',
};

const INFRACTION_LEVEL_LABELS: Record<InfractionLevel, { label: string; className: string }> = {
  leve: { label: 'Leve', className: 'bg-warning/10 text-warning' },
  grave: { label: 'Grave', className: 'bg-orange-500/10 text-orange-500' },
  muy_grave: { label: 'Muy Grave', className: 'bg-destructive/10 text-destructive' },
};

export default function SanctionsPage() {
  const { isAdmin, isJefe, user, userRole } = useAuth();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSanction, setSelectedSanction] = useState<ExtendedSanction | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Extend mock sanctions with approval status
  const [sanctions, setSanctions] = useState<ExtendedSanction[]>(() => 
    mockSanctions.map(s => ({
      ...s,
      requestedBy: s.appliedBy.includes('Jefe') ? s.appliedBy : undefined,
      approvalStatus: s.appliedBy.includes('Jefe') ? 'pending' as SanctionApprovalStatus : 'approved' as SanctionApprovalStatus,
    }))
  );

  const getEmployee = (employeeId: string) => mockEmployees.find(e => e.id === employeeId);

  // Filter sanctions based on role
  const visibleSanctions = sanctions.filter(s => {
    if (isAdmin) return true;
    if (isJefe) {
      const employee = getEmployee(s.employeeId);
      return employee?.department === userRole?.area_id || s.requestedBy?.includes('Carlos');
    }
    return false;
  });

  const filteredSanctions = visibleSanctions.filter(s => {
    const employee = getEmployee(s.employeeId);
    const matchesSearch = employee?.name.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesStatus = filterStatus === 'all' || s.approvalStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingSanctions = visibleSanctions.filter(s => s.approvalStatus === 'pending');
  const activeSanctions = visibleSanctions.filter(s => s.status === 'active' && s.approvalStatus === 'approved');

  const handleApprove = (sanction: ExtendedSanction) => {
    setSanctions(prev => prev.map(s => 
      s.id === sanction.id 
        ? { ...s, approvalStatus: 'approved' as SanctionApprovalStatus, approvalNotes }
        : s
    ));
    
    const employee = getEmployee(sanction.employeeId);
    logAction('APPROVE', 'sanction', sanction.id, user?.id || '', `${user?.nombres} ${user?.apellidos}`, 
      `Aprobó sanción para ${employee?.name}`);
    
    toast.success('Sanción aprobada');
    setSelectedSanction(null);
    setApprovalNotes('');
  };

  const handleReject = (sanction: ExtendedSanction) => {
    setSanctions(prev => prev.map(s => 
      s.id === sanction.id 
        ? { ...s, approvalStatus: 'rejected' as SanctionApprovalStatus, approvalNotes, status: 'revoked' }
        : s
    ));
    
    const employee = getEmployee(sanction.employeeId);
    logAction('REJECT', 'sanction', sanction.id, user?.id || '', `${user?.nombres} ${user?.apellidos}`, 
      `Rechazó sanción para ${employee?.name}`);
    
    toast.success('Sanción rechazada');
    setSelectedSanction(null);
    setApprovalNotes('');
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
            <h1 className="text-2xl font-bold">Gestión de Sanciones</h1>
            <p className="text-muted-foreground">
              {isAdmin ? 'Administra y aprueba las sanciones del personal' : 'Solicita y gestiona sanciones de tu equipo'}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingSanctions.length}</p>
                  <p className="text-sm text-muted-foreground">Pendientes de aprobación</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <AlertTriangle className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeSanctions.length}</p>
                  <p className="text-sm text-muted-foreground">Sanciones activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(visibleSanctions.map(s => s.employeeId)).size}</p>
                  <p className="text-sm text-muted-foreground">Empleados sancionados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Approvals (Admin only) */}
        {isAdmin && pendingSanctions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-warning/20 bg-warning/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Clock className="w-5 h-5" />
                  Sanciones Pendientes de Aprobación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingSanctions.map(sanction => {
                    const employee = getEmployee(sanction.employeeId);
                    return (
                      <div 
                        key={sanction.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-warning/10 text-warning">
                              {employee?.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {SANCTION_TYPE_LABELS[sanction.type]} - Solicitado por {sanction.requestedBy}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSanction(sanction)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Revisar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters and Table */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por empleado..." 
                  className="pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="rejected">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Empleado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nivel</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Solicitado por</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSanctions.map((sanction) => {
                    const employee = getEmployee(sanction.employeeId);
                    if (!employee) return null;

                    return (
                      <TableRow key={sanction.id}>
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
                          <Badge variant="outline">
                            {SANCTION_TYPE_LABELS[sanction.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={INFRACTION_LEVEL_LABELS[sanction.infractionLevel].className}>
                            {INFRACTION_LEVEL_LABELS[sanction.infractionLevel].label}
                          </Badge>
                        </TableCell>
                        <TableCell>{sanction.date}</TableCell>
                        <TableCell>{sanction.requestedBy || sanction.appliedBy}</TableCell>
                        <TableCell>
                          <Badge className={
                            sanction.approvalStatus === 'approved' ? 'bg-success/10 text-success' :
                            sanction.approvalStatus === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }>
                            {sanction.approvalStatus === 'approved' && 'Aprobada'}
                            {sanction.approvalStatus === 'rejected' && 'Rechazada'}
                            {sanction.approvalStatus === 'pending' && 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedSanction(sanction)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Detail/Approval Dialog */}
        <Dialog open={!!selectedSanction} onOpenChange={() => setSelectedSanction(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Detalle de Sanción
              </DialogTitle>
            </DialogHeader>
            {selectedSanction && (() => {
              const employee = getEmployee(selectedSanction.employeeId);
              return (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-destructive/10 text-destructive text-xl">
                        {employee?.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{employee?.name}</h3>
                      <p className="text-muted-foreground">{employee?.position}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{SANCTION_TYPE_LABELS[selectedSanction.type]}</Badge>
                        <Badge className={INFRACTION_LEVEL_LABELS[selectedSanction.infractionLevel].className}>
                          {INFRACTION_LEVEL_LABELS[selectedSanction.infractionLevel].label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Artículo</Label>
                      <p className="font-medium">{selectedSanction.regulationArticle}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">{selectedSanction.date}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Solicitado por</Label>
                      <p className="font-medium">{selectedSanction.requestedBy || selectedSanction.appliedBy}</p>
                    </div>
                    {selectedSanction.daysOfSuspension && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Días de suspensión</Label>
                        <p className="font-medium">{selectedSanction.daysOfSuspension} días</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Descripción de la falta</Label>
                    <p className="p-3 rounded-lg bg-muted/50">{selectedSanction.description}</p>
                  </div>

                  {isAdmin && selectedSanction.approvalStatus === 'pending' && (
                    <>
                      <div className="space-y-2">
                        <Label>Notas de aprobación/rechazo</Label>
                        <Textarea 
                          placeholder="Agregue comentarios sobre la decisión..."
                          value={approvalNotes}
                          onChange={(e) => setApprovalNotes(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleReject(selectedSanction)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                        <Button 
                          className="bg-success hover:bg-success/90"
                          onClick={() => handleApprove(selectedSanction)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprobar Sanción
                        </Button>
                      </div>
                    </>
                  )}

                  {selectedSanction.approvalStatus !== 'pending' && (
                    <div className={`p-4 rounded-lg ${
                      selectedSanction.approvalStatus === 'approved' ? 'bg-success/10' : 'bg-destructive/10'
                    }`}>
                      <p className={`font-medium ${
                        selectedSanction.approvalStatus === 'approved' ? 'text-success' : 'text-destructive'
                      }`}>
                        {selectedSanction.approvalStatus === 'approved' ? '✓ Sanción aprobada' : '✗ Sanción rechazada'}
                      </p>
                      {selectedSanction.approvalNotes && (
                        <p className="text-sm text-muted-foreground mt-1">{selectedSanction.approvalNotes}</p>
                      )}
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
