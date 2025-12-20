import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Settings, UserPlus, Clock, Calendar } from 'lucide-react';
import { mockDepartmentStats, mockEmployees } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const DepartmentsPage = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDept = (deptKey: string) => {
    setSelectedDept(deptKey);
    setDialogOpen(true);
  };

  const getDeptEmployees = (deptKey: string) => {
    return mockEmployees.filter(e => e.department === deptKey);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">Departamentos</h1>
          <p className="text-muted-foreground">Gestión y estadísticas por área</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockDepartmentStats.map((stat, index) => {
            const deptInfo = DEPARTMENTS[stat.department];
            return (
              <motion.div
                key={stat.department}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card hover:shadow-xl transition-all duration-300">
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
                          <p className="text-sm text-muted-foreground">{stat.totalEmployees} empleados</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDept(stat.department)}>
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Tasa de asistencia</span>
                          <span className="font-bold" style={{ color: deptInfo.color }}>
                            {stat.attendanceRate}%
                          </span>
                        </div>
                        <Progress value={stat.attendanceRate} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 rounded-lg bg-success/10">
                          <p className="text-xs text-muted-foreground">Presentes</p>
                          <p className="text-xl font-bold text-success">{stat.presentToday}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-destructive/10">
                          <p className="text-xs text-muted-foreground">Ausentes</p>
                          <p className="text-xl font-bold text-destructive">{stat.absences}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-warning/10">
                          <p className="text-xs text-muted-foreground">Tardanzas</p>
                          <p className="text-xl font-bold text-warning">{stat.tardies}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10">
                          <p className="text-xs text-muted-foreground">H. Extra</p>
                          <p className="text-xl font-bold text-primary">{stat.overtimeHours}h</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Department Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
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
              <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="employees">Empleados</TabsTrigger>
                  <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                  <TabsTrigger value="schedule">Horarios</TabsTrigger>
                </TabsList>
                <TabsContent value="employees" className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getDeptEmployees(selectedDept).map(emp => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-medium">{emp.name}</TableCell>
                          <TableCell>{emp.position}</TableCell>
                          <TableCell>
                            <Badge variant={emp.status === 'active' ? 'success' : 'secondary'}>
                              {emp.status === 'active' ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="stats" className="pt-4">
                  {(() => {
                    const stat = mockDepartmentStats.find(s => s.department === selectedDept);
                    if (!stat) return null;
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Total Empleados</span>
                          </div>
                          <p className="text-2xl font-bold">{stat.totalEmployees}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Tasa Asistencia</span>
                          </div>
                          <p className="text-2xl font-bold text-success">{stat.attendanceRate}%</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Horas Extra</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">{stat.overtimeHours}h</p>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Ausencias del Mes</span>
                          </div>
                          <p className="text-2xl font-bold text-destructive">{stat.absences}</p>
                        </div>
                      </div>
                    );
                  })()}
                </TabsContent>
                <TabsContent value="schedule" className="pt-4">
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Horario Regular</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Lunes a Viernes:</span>
                          <p className="font-medium">08:00 - 17:00</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Sábados:</span>
                          <p className="font-medium">08:00 - 12:00</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-2">Tolerancia</h4>
                      <p className="text-sm text-muted-foreground">10 minutos de tolerancia para entrada</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
