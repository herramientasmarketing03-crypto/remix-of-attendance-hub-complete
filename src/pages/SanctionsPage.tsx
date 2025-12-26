import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { AlertTriangle, Search, Scale, Check, X, Eye, Clock, Users, Loader2 } from 'lucide-react';
import { useSanctions, type Sanction } from '@/hooks/useSanctions';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const SANCTION_TYPE_LABELS: Record<string, string> = {
  verbal: 'Amonestación Verbal',
  written: 'Amonestación Escrita',
  suspension: 'Suspensión',
  termination: 'Despido',
};

const INFRACTION_LEVEL_LABELS: Record<string, { label: string; className: string }> = {
  leve: { label: 'Leve', className: 'bg-warning/10 text-warning' },
  grave: { label: 'Grave', className: 'bg-orange-500/10 text-orange-500' },
  muy_grave: { label: 'Muy Grave', className: 'bg-destructive/10 text-destructive' },
};

export default function SanctionsPage() {
  const { userRole, user, profile } = useAuth();
  const { sanctions, loading, approveSanction, rejectSanction } = useSanctions();
  const { employees } = useEmployees();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedSanction, setSelectedSanction] = useState<Sanction | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  const isAdmin = userRole?.role === 'admin_rrhh';
  const isJefe = userRole?.role === 'jefe_area';

  const getEmployee = (employeeId: string) => employees.find(e => e.id === employeeId);

  const filteredSanctions = sanctions.filter(s => {
    const employee = getEmployee(s.employee_id);
    const matchesSearch = employee?.name.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const pendingSanctions = sanctions.filter(s => s.status === 'pending');
  const activeSanctions = sanctions.filter(s => s.status === 'active' || s.status === 'approved');

  const handleApprove = async (sanction: Sanction) => {
    try {
      await approveSanction(sanction.id, approvalNotes || undefined);
      toast.success('Sanción aprobada');
      setSelectedSanction(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error approving sanction:', error);
    }
  };

  const handleReject = async (sanction: Sanction) => {
    try {
      await rejectSanction(sanction.id, approvalNotes || undefined);
      toast.success('Sanción rechazada');
      setSelectedSanction(null);
      setApprovalNotes('');
    } catch (error) {
      console.error('Error rejecting sanction:', error);
    }
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
                  <p className="text-2xl font-bold">{new Set(sanctions.map(s => s.employee_id)).size}</p>
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
                    const employee = getEmployee(sanction.employee_id);
                    return (
                      <div 
                        key={sanction.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-background/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-warning/10 text-warning">
                              {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{employee?.name || 'Empleado'}</p>
                            <p className="text-sm text-muted-foreground">
                              {SANCTION_TYPE_LABELS[sanction.type]} - Solicitado por {sanction.applied_by || 'Jefe de Área'}
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
                  <SelectItem value="active">Activas</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="revoked">Revocadas</SelectItem>
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
                    <TableHead>Aplicado por</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSanctions.map((sanction) => {
                    const employee = getEmployee(sanction.employee_id);
                    
                    return (
                      <TableRow key={sanction.id}>
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
                            {SANCTION_TYPE_LABELS[sanction.type] || sanction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={INFRACTION_LEVEL_LABELS[sanction.infraction_level]?.className || 'bg-muted'}>
                            {INFRACTION_LEVEL_LABELS[sanction.infraction_level]?.label || sanction.infraction_level}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(parseISO(sanction.date), 'dd MMM yyyy', { locale: es })}</TableCell>
                        <TableCell>{sanction.applied_by || '-'}</TableCell>
                        <TableCell>
                          <Badge className={
                            sanction.status === 'approved' || sanction.status === 'active' ? 'bg-success/10 text-success' :
                            sanction.status === 'revoked' ? 'bg-destructive/10 text-destructive' :
                            'bg-warning/10 text-warning'
                          }>
                            {sanction.status === 'approved' || sanction.status === 'active' ? 'Activa' :
                             sanction.status === 'revoked' ? 'Revocada' :
                             'Pendiente'}
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
              const employee = getEmployee(selectedSanction.employee_id);
              return (
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-destructive/10 text-destructive text-xl">
                        {employee?.name.split(' ').map(n => n[0]).join('') || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{employee?.name || 'Empleado'}</h3>
                      <p className="text-muted-foreground">{employee?.position || '-'}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{SANCTION_TYPE_LABELS[selectedSanction.type] || selectedSanction.type}</Badge>
                        <Badge className={INFRACTION_LEVEL_LABELS[selectedSanction.infraction_level]?.className || 'bg-muted'}>
                          {INFRACTION_LEVEL_LABELS[selectedSanction.infraction_level]?.label || selectedSanction.infraction_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Artículo</Label>
                      <p className="font-medium">{selectedSanction.regulation_article || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Fecha</Label>
                      <p className="font-medium">{format(parseISO(selectedSanction.date), 'PPP', { locale: es })}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Aplicado por</Label>
                      <p className="font-medium">{selectedSanction.applied_by || '-'}</p>
                    </div>
                    {selectedSanction.days_of_suspension && (
                      <div className="space-y-1">
                        <Label className="text-muted-foreground">Días de suspensión</Label>
                        <p className="font-medium">{selectedSanction.days_of_suspension} días</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Descripción de la falta</Label>
                    <p className="p-3 rounded-lg bg-muted/50">{selectedSanction.description}</p>
                  </div>

                  {selectedSanction.notes && (
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Notas</Label>
                      <p className="p-3 rounded-lg bg-muted/50">{selectedSanction.notes}</p>
                    </div>
                  )}

                  {isAdmin && selectedSanction.status === 'pending' && (
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
                          onClick={() => handleApprove(selectedSanction)}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprobar
                        </Button>
                      </div>
                    </>
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
