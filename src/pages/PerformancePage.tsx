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
import { usePerformance, KPI } from '@/hooks/usePerformance';
import { useEmployees } from '@/hooks/useEmployees';
import { DEPARTMENTS } from '@/types/attendance';
import { 
  TrendingUp, 
  Search, 
  Star,
  Award,
  Target,
  Eye,
  Users,
  DollarSign,
  Loader2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const CLASSIFICATION_COLORS: Record<string, { label: string; className: string; description: string }> = {
  A: { label: 'Clase A - Excepcional', className: 'bg-success/10 text-success', description: 'Rendimiento excepcional, supera las expectativas en todas las áreas.' },
  B: { label: 'Clase B - Bueno', className: 'bg-info/10 text-info', description: 'Buen rendimiento, cumple y ocasionalmente supera las expectativas.' },
  C: { label: 'Clase C - Regular', className: 'bg-warning/10 text-warning', description: 'Rendimiento regular, cumple con lo mínimo esperado.' },
  D: { label: 'Clase D - Requiere Mejora', className: 'bg-destructive/10 text-destructive', description: 'Rendimiento por debajo de lo esperado, requiere plan de mejora.' },
};

export default function PerformancePage() {
  const { evaluations, loading: loadingEvaluations } = usePerformance();
  const { employees, loading: loadingEmployees } = useEmployees();
  const [search, setSearch] = useState('');
  const [filterClassification, setFilterClassification] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<typeof evaluations[0] | null>(null);

  const loading = loadingEvaluations || loadingEmployees;

  const getEmployee = (employeeId: string) => employees.find(e => e.id === employeeId);

  const filteredEvaluations = evaluations.filter(e => {
    const employee = getEmployee(e.employee_id);
    const matchesSearch = employee?.name.toLowerCase().includes(search.toLowerCase()) ?? false;
    const matchesClassification = filterClassification === 'all' || e.classification === filterClassification;
    return matchesSearch && matchesClassification;
  });

  const classACount = evaluations.filter(e => e.classification === 'A').length;
  const classBCount = evaluations.filter(e => e.classification === 'B').length;
  const classCCount = evaluations.filter(e => e.classification === 'C').length;
  const eligibleForBonus = evaluations.filter(e => e.bonus_condition === 'eligible').length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

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
            {filteredEvaluations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay evaluaciones de desempeño
              </div>
            ) : (
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
                  {filteredEvaluations.map((evaluation) => {
                    const employee = getEmployee(evaluation.employee_id);
                    if (!employee) return null;

                    return (
                      <TableRow key={evaluation.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.position}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{DEPARTMENTS[employee.department as keyof typeof DEPARTMENTS]?.name || employee.department}</Badge>
                        </TableCell>
                        <TableCell>{evaluation.period}</TableCell>
                        <TableCell>
                          <Badge className={CLASSIFICATION_COLORS[evaluation.classification]?.className || ''}>
                            {CLASSIFICATION_COLORS[evaluation.classification]?.label || evaluation.classification}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={evaluation.overall_score} className="w-20 h-2" />
                            <span className="text-sm font-medium">{evaluation.overall_score}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            evaluation.bonus_condition === 'eligible' ? 'bg-success/10 text-success' :
                            evaluation.bonus_condition === 'pending_review' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }>
                            {evaluation.bonus_condition === 'eligible' && 'Elegible'}
                            {evaluation.bonus_condition === 'pending_review' && 'En Revisión'}
                            {evaluation.bonus_condition === 'not_eligible' && 'No Elegible'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedEvaluation(evaluation)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Dialog Detail */}
        <Dialog open={!!selectedEvaluation} onOpenChange={() => setSelectedEvaluation(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Evaluación</DialogTitle>
            </DialogHeader>
            {selectedEvaluation && (
              <div className="space-y-6">
                {(() => {
                  const employee = getEmployee(selectedEvaluation.employee_id);
                  if (!employee) return null;

                  return (
                    <>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold">{employee.name}</h3>
                          <p className="text-muted-foreground">{employee.position}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{DEPARTMENTS[employee.department as keyof typeof DEPARTMENTS]?.name || employee.department}</Badge>
                            <Badge className={CLASSIFICATION_COLORS[selectedEvaluation.classification]?.className || ''}>
                              {CLASSIFICATION_COLORS[selectedEvaluation.classification]?.label || selectedEvaluation.classification}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-primary">{selectedEvaluation.overall_score}%</p>
                          <p className="text-sm text-muted-foreground">Puntuación General</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Período</Label>
                          <p className="font-medium">{selectedEvaluation.period}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Evaluado por</Label>
                          <p className="font-medium">{selectedEvaluation.evaluated_by || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Fecha de Evaluación</Label>
                          <p className="font-medium">{format(parseISO(selectedEvaluation.evaluated_at), 'PPP', { locale: es })}</p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Condición de Bono</Label>
                          <Badge className={
                            selectedEvaluation.bonus_condition === 'eligible' ? 'bg-success/10 text-success' :
                            selectedEvaluation.bonus_condition === 'pending_review' ? 'bg-warning/10 text-warning' :
                            'bg-muted text-muted-foreground'
                          }>
                            {selectedEvaluation.bonus_condition === 'eligible' && 'Elegible'}
                            {selectedEvaluation.bonus_condition === 'pending_review' && 'En Revisión'}
                            {selectedEvaluation.bonus_condition === 'not_eligible' && 'No Elegible'}
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
                          {(selectedEvaluation.kpis as KPI[]).map((kpi, index) => {
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

                      {selectedEvaluation.observations && (
                        <div className="space-y-1">
                          <Label className="text-muted-foreground">Observaciones</Label>
                          <p className="p-3 rounded-lg bg-muted/50">{selectedEvaluation.observations}</p>
                        </div>
                      )}

                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                        <p className="text-sm text-muted-foreground">{CLASSIFICATION_COLORS[selectedEvaluation.classification]?.description}</p>
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
