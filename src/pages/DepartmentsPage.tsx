import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Building2, Users, Eye, GitBranch, Briefcase, AlertCircle } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartmentPositions } from '@/hooks/useDepartmentPositions';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RealOrgChart } from '@/components/departments/RealOrgChart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const DepartmentsPage = () => {
  const { employees, loading: loadingEmployees } = useEmployees();
  const { positions, loading: loadingPositions, getPositionsByDepartment } = useDepartmentPositions();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'departamentos' | 'organigrama'>('departamentos');

  const handleOpenDept = (deptKey: string) => {
    setSelectedDept(deptKey);
    setDialogOpen(true);
  };

  const getDeptEmployees = (deptKey: string) => {
    return employees.filter(e => e.department === deptKey);
  };

  const getDeptStats = (deptKey: string) => {
    const deptEmployees = getDeptEmployees(deptKey);
    const deptPositions = getPositionsByDepartment(deptKey);
    const totalPositions = deptPositions.reduce((acc, p) => acc + p.max_positions, 0);
    const vacancies = totalPositions - deptEmployees.length;
    
    return {
      employees: deptEmployees.length,
      positions: deptPositions,
      totalPositions,
      vacancies: Math.max(0, vacancies),
      attendanceRate: Math.round(85 + Math.random() * 15), // Simulated for now
    };
  };

  const getTotalVacancies = () => {
    return Object.keys(DEPARTMENTS).reduce((acc, deptKey) => {
      return acc + getDeptStats(deptKey).vacancies;
    }, 0);
  };

  const loading = loadingEmployees || loadingPositions;

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold">Departamentos</h1>
            <p className="text-muted-foreground">Gestión organizacional, puestos y estructura por área</p>
          </div>
          <div className="flex items-center gap-3">
            {!loading && getTotalVacancies() > 0 && (
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20 px-3 py-1.5">
                <AlertCircle className="w-4 h-4 mr-2" />
                {getTotalVacancies()} vacantes disponibles
              </Badge>
            )}
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'departamentos' | 'organigrama')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="departamentos" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="organigrama" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Organigrama General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departamentos" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(DEPARTMENTS).map(([deptKey, deptInfo], index) => {
                  const stats = getDeptStats(deptKey);
                  
                  return (
                    <motion.div
                      key={deptKey}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="glass-card hover:shadow-xl transition-all duration-300 h-full">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${deptInfo.color}20` }}
                              >
                                <Building2 className="w-6 h-6" style={{ color: deptInfo.color }} />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{deptInfo.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{stats.employees} empleados</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleOpenDept(deptKey)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Ocupación</span>
                                <span className="font-bold" style={{ color: deptInfo.color }}>
                                  {stats.totalPositions > 0 ? Math.round((stats.employees / stats.totalPositions) * 100) : 0}%
                                </span>
                              </div>
                              <Progress 
                                value={stats.totalPositions > 0 ? (stats.employees / stats.totalPositions) * 100 : 0} 
                                className="h-2" 
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="p-2.5 rounded-lg bg-success/10">
                                <p className="text-xs text-muted-foreground">Empleados</p>
                                <p className="text-lg font-bold text-success">{stats.employees}</p>
                              </div>
                              <div className="p-2.5 rounded-lg bg-muted">
                                <p className="text-xs text-muted-foreground">Puestos</p>
                                <p className="text-lg font-bold text-muted-foreground">{stats.totalPositions}</p>
                              </div>
                            </div>

                            {stats.vacancies > 0 && (
                              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10">
                                <Briefcase className="w-4 h-4 text-warning" />
                                <span className="text-sm text-warning font-medium">
                                  {stats.vacancies} vacante{stats.vacancies > 1 ? 's' : ''} disponible{stats.vacancies > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}

                            {stats.positions.length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground mb-1.5">Puestos en el área:</p>
                                <div className="flex flex-wrap gap-1">
                                  {stats.positions.slice(0, 3).map(pos => (
                                    <Badge 
                                      key={pos.id} 
                                      variant="outline" 
                                      className="text-xs"
                                      style={{ borderColor: `${deptInfo.color}40` }}
                                    >
                                      {pos.position_name}
                                    </Badge>
                                  ))}
                                  {stats.positions.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{stats.positions.length - 3} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="organigrama" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Organigrama con Empleados Vinculados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RealOrgChart 
                  employees={employees}
                  positions={positions}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Department Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedDept && (
                  <>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${DEPARTMENTS[selectedDept]?.color}20` }}>
                      <Building2 className="w-5 h-5" style={{ color: DEPARTMENTS[selectedDept]?.color }} />
                    </div>
                    {DEPARTMENTS[selectedDept]?.name}
                  </>
                )}
              </DialogTitle>
            </DialogHeader>
            {selectedDept && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{getDeptStats(selectedDept).employees}</p>
                        <p className="text-sm text-muted-foreground">Empleados</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{getDeptStats(selectedDept).positions.length}</p>
                        <p className="text-sm text-muted-foreground">Puestos</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-warning">{getDeptStats(selectedDept).vacancies}</p>
                        <p className="text-sm text-muted-foreground">Vacantes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Positions */}
                <div>
                  <h3 className="font-semibold mb-3">Puestos del Departamento</h3>
                  <div className="space-y-2">
                    {getPositionsByDepartment(selectedDept).map(pos => (
                      <div key={pos.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <p className="font-medium">{pos.position_name}</p>
                          {pos.description && (
                            <p className="text-sm text-muted-foreground">{pos.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={pos.is_leadership ? 'default' : 'outline'}>
                            {pos.is_leadership ? 'Liderazgo' : 'Operativo'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pos.current_count} / {pos.max_positions} ocupados
                          </p>
                        </div>
                      </div>
                    ))}
                    {getPositionsByDepartment(selectedDept).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No hay puestos definidos</p>
                    )}
                  </div>
                </div>

                {/* Employees */}
                <div>
                  <h3 className="font-semibold mb-3">Empleados</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDeptEmployees(selectedDept).map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {emp.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              {emp.name}
                            </div>
                          </TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell className="text-muted-foreground">{emp.email}</TableCell>
                          <TableCell>
                            <Badge className={emp.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted'}>
                              {emp.status === 'active' ? 'Activo' : emp.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {getDeptEmployees(selectedDept).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                            No hay empleados en este departamento
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
