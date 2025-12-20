import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { FileCheck, Search, Plus, AlertTriangle, DollarSign, User, Eye, RefreshCw, FileText } from 'lucide-react';
import { mockContracts, mockEmployees, CONTRACT_TYPES } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ContractsPage = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [newContractOpen, setNewContractOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const handleCreateContract = () => {
    toast.success('Contrato creado correctamente');
    setNewContractOpen(false);
  };

  const handleRenewContract = (contract: any) => {
    toast.success(`Contrato de ${contract.employee?.name} renovado`);
    setDetailOpen(false);
  };

  const contractsWithEmployee = mockContracts.map(contract => {
    const employee = mockEmployees.find(e => e.id === contract.employeeId);
    return { ...contract, employee };
  });

  const filteredContracts = contractsWithEmployee.filter(c => {
    const matchesSearch = c.employee?.name.toLowerCase().includes(search.toLowerCase()) ||
      c.position.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const config = {
      active: { label: 'Activo', variant: 'success' as const },
      expired: { label: 'Vencido', variant: 'destructive' as const },
      pending_renewal: { label: 'Por Renovar', variant: 'warning' as const },
    };
    const { label, variant } = config[status as keyof typeof config] || { label: status, variant: 'secondary' as const };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const expiringContracts = contractsWithEmployee.filter(c => c.status === 'pending_renewal');

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">Gestión de contratos laborales</p>
          </div>
          <Dialog open={newContractOpen} onOpenChange={setNewContractOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Contrato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Contrato</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Empleado</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Seleccionar empleado" /></SelectTrigger>
                    <SelectContent>
                      {mockEmployees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input placeholder="Ej: Desarrollador Senior" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Salario (S/.)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <Button className="w-full gradient-primary text-primary-foreground" onClick={handleCreateContract}>
                  Crear Contrato
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Contract Detail Dialog */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalle del Contrato</DialogTitle>
              </DialogHeader>
              {selectedContract && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedContract.employee?.name}</h3>
                      <p className="text-muted-foreground">{selectedContract.position}</p>
                    </div>
                    {getStatusBadge(selectedContract.status)}
                  </div>

                  <Tabs defaultValue="info" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Información</TabsTrigger>
                      <TabsTrigger value="actions">Acciones</TabsTrigger>
                    </TabsList>
                    <TabsContent value="info" className="space-y-4 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Tipo de Contrato</p>
                          <p className="font-medium">{CONTRACT_TYPES[selectedContract.type]?.name}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Departamento</p>
                          <p className="font-medium">{DEPARTMENTS[selectedContract.department]?.name}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Fecha de Inicio</p>
                          <p className="font-medium">{selectedContract.startDate}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Fecha de Fin</p>
                          <p className="font-medium">{selectedContract.endDate || 'Indefinido'}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50 col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Salario Mensual</p>
                          <p className="text-2xl font-bold text-primary">S/. {selectedContract.salary.toLocaleString()}</p>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="actions" className="space-y-4 pt-4">
                      <div className="grid gap-3">
                        <Button variant="outline" className="w-full justify-start" onClick={() => handleRenewContract(selectedContract)}>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renovar Contrato
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Generar Adenda
                        </Button>
                        <Button variant="destructive" className="w-full justify-start">
                          Finalizar Contrato
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </motion.div>

        {expiringContracts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-warning/20 bg-warning/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-warning/10">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Contratos por vencer</h3>
                    <div className="flex flex-wrap gap-2">
                      {expiringContracts.map(c => (
                        <Badge key={c.id} variant="warning">
                          {c.employee?.name} - Vence: {c.endDate}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre o cargo..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="pending_renewal">Por Renovar</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
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
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Salario</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract, index) => (
                    <motion.tr key={contract.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedContract(contract); setDetailOpen(true); }}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{contract.employee?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={CONTRACT_TYPES[contract.type]?.variant || 'secondary'}>
                          {CONTRACT_TYPES[contract.type]?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>{contract.position}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{DEPARTMENTS[contract.department]?.name}</Badge>
                      </TableCell>
                      <TableCell>{contract.startDate}</TableCell>
                      <TableCell>{contract.endDate || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          <span>S/. {contract.salary.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ContractsPage;
