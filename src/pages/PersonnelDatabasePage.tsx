import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockApplicants, mockTerminatedEmployees, APPLICANT_STATUS } from '@/data/hrmData';
import { mockEmployees } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Applicant, TerminatedEmployee } from '@/types/hrm';
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  FileText,
  Download,
  Plus,
  Mail,
  Phone
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function PersonnelDatabasePage() {
  const [search, setSearch] = useState('');
  const [applicants, setApplicants] = useState<Applicant[]>(mockApplicants);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [selectedTerminated, setSelectedTerminated] = useState<TerminatedEmployee | null>(null);
  const [isNewApplicantOpen, setIsNewApplicantOpen] = useState(false);

  // Filtrar empleados activos
  const activeEmployees = mockEmployees.filter(e => 
    e.status === 'active' && 
    (e.name.toLowerCase().includes(search.toLowerCase()) ||
     e.documentId.includes(search))
  );

  // Filtrar postulantes
  const filteredApplicants = applicants.filter(a => 
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  // Filtrar personal de baja
  const filteredTerminated = mockTerminatedEmployees.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleApproveApplicant = (id: string) => {
    setApplicants(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'approved' as const } : a
    ));
    toast.success('Postulante aprobado');
    setSelectedApplicant(null);
  };

  const handleRejectApplicant = (id: string) => {
    setApplicants(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'rejected' as const } : a
    ));
    toast.info('Postulante rechazado');
    setSelectedApplicant(null);
  };

  const handleScheduleInterview = (id: string) => {
    setApplicants(prev => prev.map(a => 
      a.id === id ? { ...a, status: 'interview' as const } : a
    ));
    toast.success('Entrevista programada');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Base de Datos de Personal</h1>
            <p className="text-muted-foreground">Gestiona empleados activos, postulantes y personal de baja</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar personal..." 
                className="pl-9 w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={() => setIsNewApplicantOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Postulante
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Users className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockEmployees.filter(e => e.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Personal Activo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <UserPlus className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{applicants.filter(a => a.status !== 'rejected').length}</p>
                  <p className="text-sm text-muted-foreground">Postulantes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-muted">
                  <UserMinus className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockTerminatedEmployees.length}</p>
                  <p className="text-sm text-muted-foreground">Personal de Baja</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <Users className="w-4 h-4" />
              Personal Activo
            </TabsTrigger>
            <TabsTrigger value="applicants" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Postulantes
            </TabsTrigger>
            <TabsTrigger value="terminated" className="gap-2">
              <UserMinus className="w-4 h-4" />
              Personal de Baja
            </TabsTrigger>
          </TabsList>

          {/* Personal Activo */}
          <TabsContent value="active">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>DNI</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Fecha Ingreso</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.documentId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEPARTMENTS[employee.department].name}</Badge>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.hireDate}</TableCell>
                        <TableCell>
                          <Badge className="bg-success/10 text-success">Activo</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Postulantes */}
          <TabsContent value="applicants">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Postulante</TableHead>
                      <TableHead>Cargo Postulado</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Experiencia</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplicants.map((applicant) => (
                      <TableRow key={applicant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-info/10 text-info text-sm">
                                {applicant.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{applicant.name}</p>
                              <p className="text-xs text-muted-foreground">{applicant.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{applicant.position}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEPARTMENTS[applicant.department].name}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{applicant.experience}</TableCell>
                        <TableCell>{format(parseISO(applicant.appliedAt), 'dd MMM yyyy', { locale: es })}</TableCell>
                        <TableCell>
                          <Badge className={APPLICANT_STATUS[applicant.status].className}>
                            {APPLICANT_STATUS[applicant.status].name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(applicant)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal de Baja */}
          <TabsContent value="terminated">
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empleado</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Fecha Baja</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Liquidación</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTerminated.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{employee.name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEPARTMENTS[employee.department].name}</Badge>
                        </TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.terminationDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {employee.terminationType === 'voluntary' && 'Renuncia'}
                            {employee.terminationType === 'dismissal' && 'Despido'}
                            {employee.terminationType === 'contract_end' && 'Fin de contrato'}
                            {employee.terminationType === 'mutual_agreement' && 'Mutuo acuerdo'}
                            {employee.terminationType === 'retirement' && 'Jubilación'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={employee.finalSettlementPaid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>
                            {employee.finalSettlementPaid ? 'Pagada' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedTerminated(employee)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Postulante */}
        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle del Postulante</DialogTitle>
            </DialogHeader>
            {selectedApplicant && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-info/10 text-info text-xl">
                      {selectedApplicant.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedApplicant.name}</h3>
                    <p className="text-muted-foreground">{selectedApplicant.position}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {selectedApplicant.email}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {selectedApplicant.phone}
                      </span>
                    </div>
                  </div>
                  <Badge className={APPLICANT_STATUS[selectedApplicant.status].className}>
                    {APPLICANT_STATUS[selectedApplicant.status].name}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Departamento</Label>
                    <p className="font-medium">{DEPARTMENTS[selectedApplicant.department].name}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Expectativa Salarial</Label>
                    <p className="font-medium">S/. {selectedApplicant.salary_expectation?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fuente</Label>
                    <p className="font-medium capitalize">{selectedApplicant.source}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Postulación</Label>
                    <p className="font-medium">{format(parseISO(selectedApplicant.appliedAt), 'PPP', { locale: es })}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Experiencia</Label>
                  <p className="font-medium">{selectedApplicant.experience}</p>
                </div>

                {selectedApplicant.notes && (
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Notas</Label>
                    <p className="font-medium">{selectedApplicant.notes}</p>
                  </div>
                )}

                {selectedApplicant.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2" 
                      onClick={() => handleScheduleInterview(selectedApplicant.id)}
                    >
                      <Users className="w-4 h-4" />
                      Programar Entrevista
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleRejectApplicant(selectedApplicant.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}

                {selectedApplicant.status === 'interview' && (
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 gap-2 bg-success hover:bg-success/90"
                      onClick={() => handleApproveApplicant(selectedApplicant.id)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Aprobar Ingreso
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="gap-2"
                      onClick={() => handleRejectApplicant(selectedApplicant.id)}
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Terminated */}
        <Dialog open={!!selectedTerminated} onOpenChange={() => setSelectedTerminated(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Baja</DialogTitle>
            </DialogHeader>
            {selectedTerminated && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                      {selectedTerminated.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedTerminated.name}</h3>
                    <p className="text-muted-foreground">{selectedTerminated.position}</p>
                    <Badge variant="outline" className="mt-2">{DEPARTMENTS[selectedTerminated.department].name}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Ingreso</Label>
                    <p className="font-medium">{selectedTerminated.hireDate}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Fecha de Baja</Label>
                    <p className="font-medium">{selectedTerminated.terminationDate}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Tipo de Baja</Label>
                    <Badge variant="outline">
                      {selectedTerminated.terminationType === 'voluntary' && 'Renuncia Voluntaria'}
                      {selectedTerminated.terminationType === 'dismissal' && 'Despido'}
                      {selectedTerminated.terminationType === 'contract_end' && 'Fin de Contrato'}
                      {selectedTerminated.terminationType === 'mutual_agreement' && 'Mutuo Acuerdo'}
                      {selectedTerminated.terminationType === 'retirement' && 'Jubilación'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Procesado por</Label>
                    <p className="font-medium">{selectedTerminated.processedBy}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-muted-foreground">Motivo</Label>
                  <p className="font-medium">{selectedTerminated.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${selectedTerminated.clearanceComplete ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Proceso de Clearance</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTerminated.clearanceComplete ? 'Completado' : 'Pendiente'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`w-5 h-5 ${selectedTerminated.finalSettlementPaid ? 'text-success' : 'text-warning'}`} />
                      <span className="font-medium">Liquidación</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTerminated.finalSettlementPaid ? 'Pagada' : 'Pendiente de pago'}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Descargar Documentos
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog Nuevo Postulante */}
        <Dialog open={isNewApplicantOpen} onOpenChange={setIsNewApplicantOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Postulante</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre Completo *</Label>
                  <Input placeholder="Nombre completo" />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono *</Label>
                  <Input placeholder="987654321" />
                </div>
                <div>
                  <Label>Cargo Postulado *</Label>
                  <Input placeholder="Cargo" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Departamento *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DEPARTMENTS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Expectativa Salarial</Label>
                  <Input type="number" placeholder="S/." />
                </div>
              </div>
              <div>
                <Label>Experiencia</Label>
                <Textarea placeholder="Descripción breve de la experiencia laboral" />
              </div>
              <div>
                <Label>Fuente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Cómo llegó el postulante?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Página Web</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="referral">Referido</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={() => {
                toast.success('Postulante registrado');
                setIsNewApplicantOpen(false);
              }}>
                Registrar Postulante
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
