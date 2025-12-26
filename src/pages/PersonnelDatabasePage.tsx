import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useApplicants, Applicant } from '@/hooks/useApplicants';
import { useTerminations } from '@/hooks/useTerminations';
import { useEmployees } from '@/hooks/useEmployees';
import { DEPARTMENTS } from '@/types/attendance';
import { Users, UserPlus, UserMinus, Search, Eye, CheckCircle, XCircle, Plus, Mail, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const STATUS_LABELS: Record<string, { name: string; className: string }> = {
  pending: { name: 'Pendiente', className: 'bg-warning/10 text-warning' },
  interviewing: { name: 'En Entrevista', className: 'bg-info/10 text-info' },
  selected: { name: 'Seleccionado', className: 'bg-success/10 text-success' },
  rejected: { name: 'Rechazado', className: 'bg-destructive/10 text-destructive' },
  hired: { name: 'Contratado', className: 'bg-success/10 text-success' },
};

export default function PersonnelDatabasePage() {
  const { applicants, loading: loadingApplicants, createApplicant, updateApplicant } = useApplicants();
  const { terminations, loading: loadingTerminations } = useTerminations();
  const { employees, loading: loadingEmployees } = useEmployees();
  const [search, setSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isNewApplicantOpen, setIsNewApplicantOpen] = useState(false);
  const [newApplicant, setNewApplicant] = useState({ name: '', email: '', phone: '', position: '', department: '', experience_years: 0, salary_expectation: '' });

  const activeEmployees = employees.filter(e => e.status === 'active' && (e.name.toLowerCase().includes(search.toLowerCase()) || e.document_id?.includes(search)));
  const filteredApplicants = applicants.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()));
  const filteredTerminated = terminations.filter(t => t.employee_name.toLowerCase().includes(search.toLowerCase()));

  const handleApproveApplicant = async (id: string) => {
    await updateApplicant(id, { status: 'selected' });
    setSelectedApplicant(null);
  };

  const handleRejectApplicant = async (id: string) => {
    await updateApplicant(id, { status: 'rejected' });
    setSelectedApplicant(null);
  };

  const handleCreateApplicant = async () => {
    if (!newApplicant.name || !newApplicant.email || !newApplicant.position || !newApplicant.department) return;
    await createApplicant({
      ...newApplicant,
      salary_expectation: newApplicant.salary_expectation ? Number(newApplicant.salary_expectation) : undefined,
    });
    setIsNewApplicantOpen(false);
    setNewApplicant({ name: '', email: '', phone: '', position: '', department: '', experience_years: 0, salary_expectation: '' });
  };

  const loading = loadingApplicants || loadingTerminations || loadingEmployees;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Base de Datos de Personal</h1>
            <p className="text-muted-foreground">Gestiona empleados activos, postulantes y personal de baja</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar personal..." className="pl-9 w-64" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Dialog open={isNewApplicantOpen} onOpenChange={setIsNewApplicantOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="w-4 h-4" />Nuevo Postulante</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Registrar Postulante</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Nombre *</Label><Input value={newApplicant.name} onChange={(e) => setNewApplicant({...newApplicant, name: e.target.value})} /></div>
                    <div><Label>Email *</Label><Input type="email" value={newApplicant.email} onChange={(e) => setNewApplicant({...newApplicant, email: e.target.value})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Teléfono</Label><Input value={newApplicant.phone} onChange={(e) => setNewApplicant({...newApplicant, phone: e.target.value})} /></div>
                    <div><Label>Años de Experiencia</Label><Input type="number" value={newApplicant.experience_years} onChange={(e) => setNewApplicant({...newApplicant, experience_years: Number(e.target.value)})} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Cargo Postulado *</Label><Input value={newApplicant.position} onChange={(e) => setNewApplicant({...newApplicant, position: e.target.value})} /></div>
                    <div><Label>Departamento *</Label>
                      <Select value={newApplicant.department} onValueChange={(v) => setNewApplicant({...newApplicant, department: v})}>
                        <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>{Object.entries(DEPARTMENTS).map(([key, dept]) => (<SelectItem key={key} value={key}>{dept.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div><Label>Expectativa Salarial</Label><Input type="number" value={newApplicant.salary_expectation} onChange={(e) => setNewApplicant({...newApplicant, salary_expectation: e.target.value})} /></div>
                  <Button className="w-full" onClick={handleCreateApplicant}>Registrar Postulante</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-success/10"><Users className="w-6 h-6 text-success" /></div><div>{loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{activeEmployees.length}</p>}<p className="text-sm text-muted-foreground">Personal Activo</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-info/10"><UserPlus className="w-6 h-6 text-info" /></div><div>{loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{applicants.filter(a => a.status !== 'rejected').length}</p>}<p className="text-sm text-muted-foreground">Postulantes</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-xl bg-muted"><UserMinus className="w-6 h-6 text-muted-foreground" /></div><div>{loading ? <Skeleton className="h-8 w-12" /> : <p className="text-2xl font-bold">{terminations.length}</p>}<p className="text-sm text-muted-foreground">Personal de Baja</p></div></div></CardContent></Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active" className="gap-2"><Users className="w-4 h-4" />Personal Activo</TabsTrigger>
            <TabsTrigger value="applicants" className="gap-2"><UserPlus className="w-4 h-4" />Postulantes</TabsTrigger>
            <TabsTrigger value="terminated" className="gap-2"><UserMinus className="w-4 h-4" />Personal de Baja</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <Card><CardContent className="pt-6">
              {loadingEmployees ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> : (
                <Table><TableHeader><TableRow><TableHead>Empleado</TableHead><TableHead>DNI</TableHead><TableHead>Departamento</TableHead><TableHead>Cargo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>{activeEmployees.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay empleados</TableCell></TableRow> : activeEmployees.map((emp) => (
                    <TableRow key={emp.id}><TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/10 text-primary text-sm">{emp.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{emp.name}</p><p className="text-xs text-muted-foreground">{emp.email}</p></div></div></TableCell><TableCell>{emp.document_id}</TableCell><TableCell><Badge variant="outline">{DEPARTMENTS[emp.department]?.name || emp.department}</Badge></TableCell><TableCell>{emp.position}</TableCell><TableCell><Badge className="bg-success/10 text-success">Activo</Badge></TableCell></TableRow>
                  ))}</TableBody></Table>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="applicants">
            <Card><CardContent className="pt-6">
              {loadingApplicants ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> : (
                <Table><TableHeader><TableRow><TableHead>Postulante</TableHead><TableHead>Cargo</TableHead><TableHead>Departamento</TableHead><TableHead>Experiencia</TableHead><TableHead>Estado</TableHead><TableHead></TableHead></TableRow></TableHeader>
                  <TableBody>{filteredApplicants.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay postulantes</TableCell></TableRow> : filteredApplicants.map((app) => (
                    <TableRow key={app.id}><TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-info/10 text-info text-sm">{app.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><div><p className="font-medium">{app.name}</p><p className="text-xs text-muted-foreground">{app.email}</p></div></div></TableCell><TableCell>{app.position}</TableCell><TableCell><Badge variant="outline">{DEPARTMENTS[app.department]?.name || app.department}</Badge></TableCell><TableCell>{app.experience_years} años</TableCell><TableCell><Badge className={STATUS_LABELS[app.status]?.className}>{STATUS_LABELS[app.status]?.name}</Badge></TableCell><TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedApplicant(app)}><Eye className="w-4 h-4" /></Button></TableCell></TableRow>
                  ))}</TableBody></Table>
              )}
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="terminated">
            <Card><CardContent className="pt-6">
              {loadingTerminations ? <div className="space-y-2">{Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-12 w-full"/>)}</div> : (
                <Table><TableHeader><TableRow><TableHead>Empleado</TableHead><TableHead>Departamento</TableHead><TableHead>Cargo</TableHead><TableHead>Tipo</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredTerminated.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay registros</TableCell></TableRow> : filteredTerminated.map((term) => (
                    <TableRow key={term.id}><TableCell><div className="flex items-center gap-3"><Avatar className="h-9 w-9"><AvatarFallback className="bg-muted text-muted-foreground text-sm">{term.employee_name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar><p className="font-medium">{term.employee_name}</p></div></TableCell><TableCell><Badge variant="outline">{DEPARTMENTS[term.department]?.name || term.department}</Badge></TableCell><TableCell>{term.position}</TableCell><TableCell><Badge variant="outline">{term.termination_type === 'voluntary' ? 'Renuncia' : term.termination_type === 'dismissal' ? 'Despido' : term.termination_type === 'contract_end' ? 'Fin contrato' : term.termination_type}</Badge></TableCell><TableCell><Badge className={term.status === 'completed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{term.status === 'completed' ? 'Completado' : 'En proceso'}</Badge></TableCell></TableRow>
                  ))}</TableBody></Table>
              )}
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedApplicant} onOpenChange={() => setSelectedApplicant(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>Detalle del Postulante</DialogTitle></DialogHeader>
            {selectedApplicant && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16"><AvatarFallback className="bg-info/10 text-info text-xl">{selectedApplicant.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{selectedApplicant.name}</h3>
                    <p className="text-muted-foreground">{selectedApplicant.position}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="w-4 h-4" />{selectedApplicant.email}</span>
                      {selectedApplicant.phone && <span className="flex items-center gap-1 text-sm text-muted-foreground"><Phone className="w-4 h-4" />{selectedApplicant.phone}</span>}
                    </div>
                  </div>
                  <Badge className={STATUS_LABELS[selectedApplicant.status]?.className}>{STATUS_LABELS[selectedApplicant.status]?.name}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-muted-foreground">Departamento</Label><p className="font-medium">{DEPARTMENTS[selectedApplicant.department]?.name}</p></div>
                  <div><Label className="text-muted-foreground">Expectativa Salarial</Label><p className="font-medium">S/. {selectedApplicant.salary_expectation?.toLocaleString() || '-'}</p></div>
                  <div><Label className="text-muted-foreground">Experiencia</Label><p className="font-medium">{selectedApplicant.experience_years} años</p></div>
                  <div><Label className="text-muted-foreground">Fecha Postulación</Label><p className="font-medium">{format(parseISO(selectedApplicant.applied_at), 'PPP', { locale: es })}</p></div>
                </div>
                {selectedApplicant.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" variant="outline" onClick={() => updateApplicant(selectedApplicant.id, { status: 'interviewing' })}><Users className="w-4 h-4 mr-2" />Programar Entrevista</Button>
                    <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => handleApproveApplicant(selectedApplicant.id)}><CheckCircle className="w-4 h-4 mr-2" />Seleccionar</Button>
                    <Button variant="destructive" className="flex-1" onClick={() => handleRejectApplicant(selectedApplicant.id)}><XCircle className="w-4 h-4 mr-2" />Rechazar</Button>
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
