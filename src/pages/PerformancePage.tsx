import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEmployeePerformance, CLASSIFICATION_COLORS } from '@/data/hrmData';
import { mockEmployees } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { EmployeePerformance } from '@/types/hrm';
import { 
  TrendingUp, 
  Search, 
  Star,
  Award,
  Target,
  Eye,
  BarChart3,
  Users,
  DollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PerformancePage() {
  const [performances] = useState<EmployeePerformance[]>(mockEmployeePerformance);
  const [search, setSearch] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [selectedPerformance, setSelectedPerformance] = useState<EmployeePerformance | null>(null);

  const getEmployee = (employeeId: string) => mockEmployees.find(e => e.id === employeeId);

  const filteredPerformances = performances.filter(p => {
    const employee = getEmployee(p.employeeId);
    const matchesSearch = employee?.name.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesClassification = filterClassification === 'all' || p.classification === filterClassification;
    return matchesSearch && matchesClassification;
  });

  const classACount = performances.filter(p => p.classification === 'A').length;
  const classBCount = performances.filter(p => p.classification === 'B').length;
  const classCCount = performances.filter(p => p.classification === 'C').length;
  const eligibleForBonus = performances.filter(p => p.bonusCondition === 'eligible').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clasificación y Rendimiento</h1>
            <p className="text-muted-foreground">Evaluación de desempeño y clasificación de empleados</p>
          </div>
          <Button className="gap-2">
            <Star className="w-4 h-4" />
            Nueva Evaluación
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <Award className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classACount}</p>
                  <p className="text-sm text-muted-foreground">Clase A</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-info/10">
                  <TrendingUp className="w-6 h-6 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classBCount}</p>
                  <p className="text-sm text-muted-foreground">Clase B</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <Users className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{classCCount}</p>
                  <p className="text-sm text-muted-foreground">Clase C</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{eligibleForBonus}</p>
                  <p className="text-sm text-muted-foreground">Elegibles Bono</p>
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
                  placeholder="Buscar empleado..." 
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={filterClassification} onValueChange={setFilterClassification}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Clasificación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las clases</SelectItem>
                  <SelectItem value="A">Clase A - Excepcional</SelectItem>
                  <SelectItem value="B">Clase B - Bueno</SelectItem>
                  <SelectItem value="C">Clase C - Regular</SelectItem>
                  <SelectItem value="D">Clase D - Requiere Mejora</SelectItem>
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
                  <TableHead>Departamento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Clasificación</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Bono</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerformances.map((performance) => {
                  const employee = getEmployee(performance.employeeId);
                  if (!employee) return null;

                  return (
                    <TableRow key={performance.id}>
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
                        <Badge variant="outline">{DEPARTMENTS[employee.department].name}</Badge>
                      </TableCell>
                      <TableCell>{performance.period}</TableCell>
                      <TableCell>
                        <Badge className={CLASSIFICATION_COLORS[performance.classification].className}>
                          {CLASSIFICATION_COLORS[performance.classification].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={performance.overallScore} className="w-20 h-2" />
                          <span className="text-sm font-medium">{performance.overallScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          performance.bonusCondition === 'eligible' ? 'bg-success/10 text-success' :
                          performance.bonusCondition === 'pending_review' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }>
                          {performance.bonusCondition === 'eligible' && 'Elegible'}
                          {performance.bonusCondition === 'pending_review' && 'En Revisión'}
                          {performance.bonusCondition === 'not_eligible' && 'No Elegible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedPerformance(performance)}>
                          <Eye className="w-4 h-4" />
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
        <Dialog open={!!selectedPerformance} onOpenChange={() => setSelectedPerformance(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Evaluación</DialogTitle>
            </DialogHeader>
            {selectedPerformance && (
              <div className="space-y-6">
                {(() => {
                  const employee = getEmployee(selectedPerformance.employeeId);
                  if (!employee) return null;

                  return (
                    <>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {employee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{employee.name}</h3>
                          <p className="text-muted-foreground">{employee.position}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{DEPARTMENTS[employee.department].name}</Badge>
                            <Badge className={CLASSIFICATION_COLORS[selectedPerformance.classification].className}>
                              {CLASSIFICATION_COLORS[selectedPerformance.classification].label}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{selectedPerformance.overallScore}%</p>
                          <p className="text-sm text-muted-foreground">Puntuación General</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Período</Label>
                          <p className="font-medium">{selectedPerformance.period}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Evaluado por</Label>
                          <p className="font-medium">{selectedPerformance.evaluatedBy}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Fecha de Evaluación</Label>
                          <p className="font-medium">{format(parseISO(selectedPerformance.evaluatedAt), 'PPP', { locale: es })}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Condición de Bono</Label>
                          <Badge className={
                            selectedPerformance.bonusCondition === 'eligible' ? 'bg-success/10 text-success' :
                            selectedPerformance.bonusCondition === 'pending_review' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }>
                            {selectedPerformance.bonusCondition === 'eligible' && 'Elegible'}
                            {selectedPerformance.bonusCondition === 'pending_review' && 'En Revisión'}
                            {selectedPerformance.bonusCondition === 'not_eligible' && 'No Elegible'}
                          </Badge>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Indicadores de Desempeño (KPIs)
                        </Label>
                        <div className="space-y-3">
                          {selectedPerformance.kpis.map((kpi, index) => {
                            const achievement = (kpi.actual / kpi.target) * 100;
                            return (
                              <div key={index} className="p-4 rounded-xl bg-muted/50">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium">{kpi.name}</span>
                                  <span className="text-sm text-muted-foreground">Peso: {kpi.weight}%</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <Progress value={Math.min(achievement, 100)} className="flex-1 h-2" />
                                  <div className="text-right min-w-24">
                                    <span className="font-bold">{kpi.actual}</span>
                                    <span className="text-muted-foreground"> / {kpi.target}</span>
                                  </div>
                                </div>
                                <p className={`text-sm mt-1 ${achievement >= 100 ? 'text-success' : achievement >= 80 ? 'text-warning' : 'text-destructive'}`}>
                                  {achievement.toFixed(0)}% de cumplimiento
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {selectedPerformance.observations && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Observaciones</Label>
                          <p className="p-3 rounded-lg bg-muted/50">{selectedPerformance.observations}</p>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">{CLASSIFICATION_COLORS[selectedPerformance.classification].description}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
