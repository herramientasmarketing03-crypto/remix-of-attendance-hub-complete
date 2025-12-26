import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, Plus, Users, DollarSign, Calendar, FileText, Search, CheckCircle, XCircle, Eye } from 'lucide-react';
import { usePersonnelRequirements } from '@/hooks/usePersonnelRequirements';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const STATUS_LABELS: Record<string, { name: string; className: string }> = {
  pending: { name: 'Pendiente', className: 'bg-warning/10 text-warning' },
  approved: { name: 'Aprobado', className: 'bg-success/10 text-success' },
  rejected: { name: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
  in_process: { name: 'En Proceso', className: 'bg-info/10 text-info' },
  filled: { name: 'Cubierto', className: 'bg-success/10 text-success' },
  cancelled: { name: 'Cancelado', className: 'bg-muted text-muted-foreground' },
};

const PRIORITY_LABELS: Record<string, { name: string; className: string }> = {
  low: { name: 'Baja', className: 'bg-success/10 text-success' },
  medium: { name: 'Media', className: 'bg-warning/10 text-warning' },
  high: { name: 'Alta', className: 'bg-destructive/10 text-destructive' },
  urgent: { name: 'Urgente', className: 'bg-destructive text-destructive-foreground' },
};

const RequirementsPage = () => {
  const { requirements, loading, createRequirement, approveRequirement, rejectRequirement } = usePersonnelRequirements();
  const { profile } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  
  const [newReq, setNewReq] = useState({
    position: '',
    quantity: 1,
    department: '',
    priority: 'medium' as const,
    contract_type: 'indefinido',
    salary_min: '',
    salary_max: '',
    justification: '',
  });

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.position.toLowerCase().includes(search.toLowerCase()) ||
      (req.justification?.toLowerCase().includes(search.toLowerCase()) || false);
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleApprove = async () => {
    if (!selectedReq) return;
    const approverName = profile ? `${profile.nombres} ${profile.apellidos}` : 'Admin';
    await approveRequirement(selectedReq.id, approverName);
    setDetailDialogOpen(false);
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    const approverName = profile ? `${profile.nombres} ${profile.apellidos}` : 'Admin';
    await rejectRequirement(selectedReq.id, approverName);
    setDetailDialogOpen(false);
  };

  const handleSubmit = async () => {
    if (!newReq.position || !newReq.department) return;
    
    const requestedBy = profile ? `${profile.nombres} ${profile.apellidos}` : 'Usuario';
    await createRequirement({
      position: newReq.position,
      quantity: newReq.quantity,
      department: newReq.department,
      priority: newReq.priority,
      contract_type: newReq.contract_type,
      salary_min: newReq.salary_min ? Number(newReq.salary_min) : undefined,
      salary_max: newReq.salary_max ? Number(newReq.salary_max) : undefined,
      justification: newReq.justification,
      requested_by: requestedBy,
    });
    
    setDialogOpen(false);
    setNewReq({
      position: '',
      quantity: 1,
      department: '',
      priority: 'medium',
      contract_type: 'indefinido',
      salary_min: '',
      salary_max: '',
      justification: '',
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Requerimientos de Personal</h1>
            <p className="text-muted-foreground">Solicitudes y aprobaciones de nuevo personal</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Requerimiento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Solicitar Personal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cargo *</Label>
                    <Input 
                      placeholder="Ej: Desarrollador Web" 
                      value={newReq.position}
                      onChange={(e) => setNewReq({...newReq, position: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input 
                      type="number" 
                      min={1} 
                      value={newReq.quantity}
                      onChange={(e) => setNewReq({...newReq, quantity: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento *</Label>
                    <Select value={newReq.department} onValueChange={(v) => setNewReq({...newReq, department: v})}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                          <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Prioridad</Label>
                    <Select value={newReq.priority} onValueChange={(v: any) => setNewReq({...newReq, priority: v})}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select value={newReq.contract_type} onValueChange={(v) => setNewReq({...newReq, contract_type: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="plazo_fijo">Plazo Fijo</SelectItem>
                      <SelectItem value="por_obra">Por Obra</SelectItem>
                      <SelectItem value="practicas">Prácticas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rango Salarial</Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      placeholder="Mín" 
                      type="number" 
                      value={newReq.salary_min}
                      onChange={(e) => setNewReq({...newReq, salary_min: e.target.value})}
                    />
                    <span className="text-muted-foreground">-</span>
                    <Input 
                      placeholder="Máx" 
                      type="number"
                      value={newReq.salary_max}
                      onChange={(e) => setNewReq({...newReq, salary_max: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Justificación</Label>
                  <Textarea 
                    placeholder="Explica por qué se necesita este personal..." 
                    rows={3}
                    value={newReq.justification}
                    onChange={(e) => setNewReq({...newReq, justification: e.target.value})}
                  />
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSubmit}>
                  Enviar Requerimiento
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle del Requerimiento</DialogTitle>
              </DialogHeader>
              {selectedReq && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedReq.position}</h3>
                      <p className="text-muted-foreground">
                        {DEPARTMENTS[selectedReq.department]?.name || selectedReq.department} · {selectedReq.quantity} vacante(s)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={STATUS_LABELS[selectedReq.status]?.className}>
                        {STATUS_LABELS[selectedReq.status]?.name}
                      </Badge>
                      <Badge className={PRIORITY_LABELS[selectedReq.priority]?.className}>
                        {PRIORITY_LABELS[selectedReq.priority]?.name}
                      </Badge>
                    </div>
                  </div>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="approval">Aprobación</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Tipo de Contrato</p>
                          <p className="font-medium">{selectedReq.contract_type}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Rango Salarial</p>
                          <p className="font-medium">
                            S/. {selectedReq.salary_min || '-'} - {selectedReq.salary_max || '-'}
                          </p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Solicitado por</p>
                          <p className="font-medium">{selectedReq.requested_by}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Fecha de Solicitud</p>
                          <p className="font-medium">{new Date(selectedReq.created_at).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                      {selectedReq.justification && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Justificación</p>
                          <p className="text-sm">{selectedReq.justification}</p>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="approval" className="space-y-4 pt-4">
                      {selectedReq.status === 'pending' ? (
                        <div className="flex gap-3">
                          <Button className="flex-1 bg-success hover:bg-success/90" onClick={handleApprove}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button variant="destructive" className="flex-1" onClick={handleReject}>
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 rounded-lg bg-muted/50 text-center">
                          <p className="text-sm text-muted-foreground">
                            Este requerimiento ya fue {selectedReq.status === 'approved' ? 'aprobado' : 'procesado'}
                            {selectedReq.approved_by && ` por ${selectedReq.approved_by}`}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar requerimientos..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_LABELS).map(([key, status]) => (
                    <SelectItem key={key} value={key}>{status.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(PRIORITY_LABELS).map(([key, priority]) => (
                    <SelectItem key={key} value={key}>{priority.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRequirements.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center text-muted-foreground">
                  No hay requerimientos que mostrar
                </CardContent>
              </Card>
            ) : (
              filteredRequirements.map((req, index) => (
                <motion.div key={req.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="glass-card hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <UserPlus className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{req.position}</h3>
                              <p className="text-sm text-muted-foreground">
                                {DEPARTMENTS[req.department]?.name || req.department} · {req.quantity} vacante(s)
                              </p>
                            </div>
                          </div>

                          {req.justification && (
                            <p className="text-sm text-muted-foreground mb-4">{req.justification}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Por:</span>
                              <span className="font-medium">{req.requested_by?.split(' - ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{new Date(req.created_at).toLocaleDateString('es-PE')}</span>
                            </div>
                            {(req.salary_min || req.salary_max) && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-muted-foreground" />
                                <span>S/. {req.salary_min || '-'} - {req.salary_max || '-'}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <Badge variant="secondary">{req.contract_type}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <Badge className={STATUS_LABELS[req.status]?.className}>
                            {STATUS_LABELS[req.status]?.name}
                          </Badge>
                          <Badge className={PRIORITY_LABELS[req.priority]?.className}>
                            {PRIORITY_LABELS[req.priority]?.name}
                          </Badge>
                          <Button variant="outline" size="sm" className="mt-2" onClick={() => { setSelectedReq(req); setDetailDialogOpen(true); }}>
                            <Eye className="w-4 h-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RequirementsPage;
