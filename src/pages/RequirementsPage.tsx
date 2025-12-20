import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { UserPlus, Plus, Users, DollarSign, Calendar, FileText, Search, Filter, CheckCircle, XCircle, Eye } from 'lucide-react';
import { mockRequirements, REQUIREMENT_STATUS, PRIORITY_LEVELS, CONTRACT_TYPES } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RequirementsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredRequirements = mockRequirements.filter(req => {
    const matchesSearch = req.position.toLowerCase().includes(search.toLowerCase()) ||
      req.justification.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleApprove = (req: any) => {
    toast.success(`Requerimiento "${req.position}" aprobado`);
    setDetailDialogOpen(false);
  };

  const handleReject = (req: any) => {
    toast.error(`Requerimiento "${req.position}" rechazado`);
    setDetailDialogOpen(false);
  };

  const handleSubmit = () => {
    toast.success('Requerimiento enviado correctamente');
    setDialogOpen(false);
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
                    <Label>Cargo</Label>
                    <Input placeholder="Ej: Desarrollador Web" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input type="number" min={1} defaultValue={1} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Departamento</Label>
                    <Select>
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
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Contrato</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONTRACT_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key}>{type.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rango Salarial</Label>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Mín" type="number" />
                    <span className="text-muted-foreground">-</span>
                    <Input placeholder="Máx" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Justificación</Label>
                  <Textarea placeholder="Explica por qué se necesita este personal..." rows={3} />
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
                      <p className="text-muted-foreground">{DEPARTMENTS[selectedReq.department]?.name} · {selectedReq.quantity} vacante(s)</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={REQUIREMENT_STATUS[selectedReq.status]?.className}>
                        {REQUIREMENT_STATUS[selectedReq.status]?.name}
                      </Badge>
                      <Badge variant="outline" className={PRIORITY_LEVELS[selectedReq.priority]?.className}>
                        {PRIORITY_LEVELS[selectedReq.priority]?.name}
                      </Badge>
                    </div>
                  </div>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="requirements">Requisitos</TabsTrigger>
                      <TabsTrigger value="approval">Aprobación</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Tipo de Contrato</p>
                          <p className="font-medium">{CONTRACT_TYPES[selectedReq.contractType]?.name}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Rango Salarial</p>
                          <p className="font-medium">S/. {selectedReq.salaryRange?.min} - {selectedReq.salaryRange?.max}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Solicitado por</p>
                          <p className="font-medium">{selectedReq.requestedBy}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Fecha de Solicitud</p>
                          <p className="font-medium">{new Date(selectedReq.createdAt).toLocaleDateString('es-PE')}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Justificación</p>
                        <p className="text-sm">{selectedReq.justification}</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="requirements" className="space-y-4 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedReq.requirements.map((r: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">{r}</Badge>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="approval" className="space-y-4 pt-4">
                      <div className="p-4 rounded-lg border border-dashed">
                        <Label>Comentarios de Aprobación</Label>
                        <Textarea placeholder="Agregar comentarios..." className="mt-2" rows={3} />
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => handleApprove(selectedReq)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprobar
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={() => handleReject(selectedReq)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
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
                  {Object.entries(REQUIREMENT_STATUS).map(([key, status]) => (
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
                  {Object.entries(PRIORITY_LEVELS).map(([key, priority]) => (
                    <SelectItem key={key} value={key}>{priority.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredRequirements.map((req, index) => {
            const statusInfo = REQUIREMENT_STATUS[req.status];
            const priorityInfo = PRIORITY_LEVELS[req.priority];
            const deptInfo = DEPARTMENTS[req.department];

            return (
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
                            <p className="text-sm text-muted-foreground">{deptInfo.name} · {req.quantity} vacante(s)</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4">{req.justification}</p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {req.requirements.map((r, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{r}</Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Por:</span>
                            <span className="font-medium">{req.requestedBy.split(' - ')[0]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{new Date(req.createdAt).toLocaleDateString('es-PE')}</span>
                          </div>
                          {req.salaryRange && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>S/. {req.salaryRange.min} - {req.salaryRange.max}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <Badge variant={CONTRACT_TYPES[req.contractType]?.variant || 'secondary'}>
                              {CONTRACT_TYPES[req.contractType]?.name}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className={statusInfo.className}>
                          {statusInfo.name}
                        </Badge>
                        <Badge variant="outline" className={priorityInfo.className}>
                          {priorityInfo.name}
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
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default RequirementsPage;
