import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployees } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { 
  UserMinus, 
  Search, 
  AlertTriangle,
  FileText,
  CheckCircle,
  Clock,
  Calculator,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface TerminationProcess {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  terminationType: 'voluntary' | 'dismissal' | 'contract_end' | 'mutual_agreement';
  reason: string;
  requestedDate: string;
  effectiveDate: string;
  status: 'pending' | 'in_process' | 'completed';
  clearance: {
    equipment: boolean;
    documents: boolean;
    access: boolean;
    exit_interview: boolean;
  };
  settlement: {
    calculated: boolean;
    approved: boolean;
    paid: boolean;
    amount?: number;
  };
}

const mockTerminationProcesses: TerminationProcess[] = [
  {
    id: 'tp1',
    employeeId: '5',
    employeeName: 'Andrea Paz',
    department: 'soporte',
    position: 'Agente de Soporte',
    terminationType: 'contract_end',
    reason: 'Fin de contrato de prácticas',
    requestedDate: new Date().toISOString().split('T')[0],
    effectiveDate: '2025-06-01',
    status: 'pending',
    clearance: { equipment: false, documents: false, access: false, exit_interview: false },
    settlement: { calculated: false, approved: false, paid: false },
  },
];

export default function TerminationPage() {
  const [processes, setProcesses] = useState<TerminationProcess[]>(mockTerminationProcesses);
  const [search, setSearch] = useState('');
  const [isNewProcessOpen, setIsNewProcessOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<TerminationProcess | null>(null);
  const [newProcess, setNewProcess] = useState({
    employeeId: '',
    terminationType: 'voluntary' as TerminationProcess['terminationType'],
    reason: '',
    effectiveDate: '',
  });

  const activeEmployees = mockEmployees.filter(e => e.status === 'active');

  const handleCreateProcess = () => {
    if (!newProcess.employeeId || !newProcess.reason || !newProcess.effectiveDate) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const employee = mockEmployees.find(e => e.id === newProcess.employeeId);
    if (!employee) return;

    const process: TerminationProcess = {
      id: `tp-${Date.now()}`,
      employeeId: newProcess.employeeId,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position || '',
      terminationType: newProcess.terminationType,
      reason: newProcess.reason,
      requestedDate: new Date().toISOString().split('T')[0],
      effectiveDate: newProcess.effectiveDate,
      status: 'pending',
      clearance: { equipment: false, documents: false, access: false, exit_interview: false },
      settlement: { calculated: false, approved: false, paid: false },
    };

    setProcesses([process, ...processes]);
    setIsNewProcessOpen(false);
    setNewProcess({ employeeId: '', terminationType: 'voluntary', reason: '', effectiveDate: '' });
    toast.success('Proceso de retiro iniciado');
  };

  const handleUpdateClearance = (processId: string, field: keyof TerminationProcess['clearance']) => {
    setProcesses(prev => prev.map(p => {
      if (p.id === processId) {
        const newClearance = { ...p.clearance, [field]: !p.clearance[field] };
        const allComplete = Object.values(newClearance).every(v => v);
        return {
          ...p,
          clearance: newClearance,
          status: allComplete && p.settlement.paid ? 'completed' as const : 'in_process' as const,
        };
      }
      return p;
    }));
    toast.success('Clearance actualizado');
  };

  const handleCalculateSettlement = (processId: string) => {
    setProcesses(prev => prev.map(p => 
      p.id === processId ? {
        ...p,
        settlement: { ...p.settlement, calculated: true, amount: 5000 + Math.random() * 3000 },
        status: 'in_process' as const,
      } : p
    ));
    toast.success('Liquidación calculada');
  };

  const getTypeLabel = (type: TerminationProcess['terminationType']) => {
    switch (type) {
      case 'voluntary': return 'Renuncia Voluntaria';
      case 'dismissal': return 'Despido';
      case 'contract_end': return 'Fin de Contrato';
      case 'mutual_agreement': return 'Mutuo Acuerdo';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Retiro de Personal</h1>
            <p className="text-muted-foreground">Gestión de procesos de desvinculación</p>
          </div>
          <Dialog open={isNewProcessOpen} onOpenChange={setIsNewProcessOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="destructive">
                <UserMinus className="w-4 h-4" />
                Iniciar Retiro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar Proceso de Retiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Empleado *</Label>
                  <Select value={newProcess.employeeId} onValueChange={(v) => setNewProcess({...newProcess, employeeId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empleado" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeEmployees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tipo de Retiro *</Label>
                  <Select value={newProcess.terminationType} onValueChange={(v) => setNewProcess({...newProcess, terminationType: v as TerminationProcess['terminationType']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voluntary">Renuncia Voluntaria</SelectItem>
                      <SelectItem value="dismissal">Despido</SelectItem>
                      <SelectItem value="contract_end">Fin de Contrato</SelectItem>
                      <SelectItem value="mutual_agreement">Mutuo Acuerdo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fecha Efectiva *</Label>
                  <Input 
                    type="date"
                    value={newProcess.effectiveDate}
                    onChange={(e) => setNewProcess({...newProcess, effectiveDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Motivo *</Label>
                  <Textarea 
                    value={newProcess.reason}
                    onChange={(e) => setNewProcess({...newProcess, reason: e.target.value})}
                    placeholder="Describe el motivo del retiro..."
                  />
                </div>
                <Button className="w-full" variant="destructive" onClick={handleCreateProcess}>
                  Iniciar Proceso
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{processes.filter(p => p.status === 'pending').length}</p>
                  <p className="text-sm text-muted-foreground">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <FileText className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{processes.filter(p => p.status === 'in_process').length}</p>
                  <p className="text-sm text-muted-foreground">En Proceso</p>
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
                  <p className="text-2xl font-bold">{processes.filter(p => p.status === 'completed').length}</p>
                  <p className="text-sm text-muted-foreground">Completados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Procesos de Retiro</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha Efectiva</TableHead>
                  <TableHead>Clearance</TableHead>
                  <TableHead>Liquidación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => {
                  const clearanceProgress = Object.values(process.clearance).filter(v => v).length;
                  return (
                    <TableRow key={process.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-destructive/10 text-destructive text-sm">
                              {process.employeeName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{process.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{process.position}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{DEPARTMENTS[process.department as keyof typeof DEPARTMENTS]?.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeLabel(process.terminationType)}</Badge>
                      </TableCell>
                      <TableCell>{process.effectiveDate}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{clearanceProgress}/4</Badge>
                      </TableCell>
                      <TableCell>
                        {process.settlement.calculated ? (
                          <Badge className={process.settlement.paid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                            {process.settlement.paid ? 'Pagada' : `S/. ${process.settlement.amount?.toFixed(0)}`}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendiente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          process.status === 'completed' ? 'bg-success/10 text-success' :
                          process.status === 'in_process' ? 'bg-info/10 text-info' :
                          'bg-warning/10 text-warning'
                        }>
                          {process.status === 'completed' && 'Completado'}
                          {process.status === 'in_process' && 'En Proceso'}
                          {process.status === 'pending' && 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProcess(process)}>
                          <FileText className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog Detail */}
        <Dialog open={!!selectedProcess} onOpenChange={() => setSelectedProcess(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Proceso de Retiro</DialogTitle>
            </DialogHeader>
            {selectedProcess && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-destructive/10 text-destructive text-xl">
                      {selectedProcess.employeeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedProcess.employeeName}</h3>
                    <p className="text-muted-foreground">{selectedProcess.position}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{DEPARTMENTS[selectedProcess.department as keyof typeof DEPARTMENTS]?.name}</Badge>
                      <Badge variant="outline">{getTypeLabel(selectedProcess.terminationType)}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Solicitud</Label>
                    <p className="font-medium">{selectedProcess.requestedDate}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha Efectiva</Label>
                    <p className="font-medium">{selectedProcess.effectiveDate}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Motivo</Label>
                  <p className="p-3 rounded-lg bg-muted/50">{selectedProcess.reason}</p>
                </div>

                {/* Clearance Checklist */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Checklist de Clearance</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'equipment', label: 'Entrega de Equipos' },
                      { key: 'documents', label: 'Entrega de Documentos' },
                      { key: 'access', label: 'Cancelación de Accesos' },
                      { key: 'exit_interview', label: 'Entrevista de Salida' },
                    ].map(item => (
                      <Button
                        key={item.key}
                        variant="outline"
                        className={`justify-start gap-2 h-auto py-3 ${selectedProcess.clearance[item.key as keyof typeof selectedProcess.clearance] ? 'border-success bg-success/5' : ''}`}
                        onClick={() => handleUpdateClearance(selectedProcess.id, item.key as keyof TerminationProcess['clearance'])}
                      >
                        <CheckCircle className={`w-5 h-5 ${selectedProcess.clearance[item.key as keyof typeof selectedProcess.clearance] ? 'text-success' : 'text-muted-foreground'}`} />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Settlement */}
                <div className="space-y-3">
                  <Label className="text-lg font-semibold">Liquidación</Label>
                  {selectedProcess.settlement.calculated ? (
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Monto Calculado</span>
                        <span className="text-2xl font-bold text-primary">S/. {selectedProcess.settlement.amount?.toFixed(2)}</span>
                      </div>
                      {!selectedProcess.settlement.paid && (
                        <Button className="w-full mt-4" variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Generar Documento de Liquidación
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button className="w-full gap-2" onClick={() => handleCalculateSettlement(selectedProcess.id)}>
                      <Calculator className="w-4 h-4" />
                      Calcular Liquidación
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
