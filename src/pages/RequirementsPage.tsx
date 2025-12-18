import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { UserPlus, Plus, Users, DollarSign, Calendar, FileText } from 'lucide-react';
import { mockRequirements, REQUIREMENT_STATUS, PRIORITY_LEVELS, CONTRACT_TYPES } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const RequirementsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

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
        </motion.div>

        <div className="grid gap-4">
          {mockRequirements.map((req, index) => {
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
