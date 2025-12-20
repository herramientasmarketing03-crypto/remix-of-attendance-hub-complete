import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Eye, GitBranch, Briefcase, AlertCircle } from 'lucide-react';
import { mockDepartmentStats, mockEmployees } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { DEPARTMENT_INFO, COMPANY_ORG_CHART } from '@/data/organizationData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CompanyOrgChart } from '@/components/departments/OrgChart';
import { DepartmentDetail } from '@/components/departments/DepartmentDetail';

const DepartmentsPage = () => {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'departamentos' | 'organigrama'>('departamentos');

  const handleOpenDept = (deptKey: string) => {
    setSelectedDept(deptKey);
    setDialogOpen(true);
  };

  const getDeptEmployees = (deptKey: string) => {
    return mockEmployees.filter(e => e.department === deptKey);
  };

  const getSelectedDeptInfo = () => {
    return DEPARTMENT_INFO.find(d => d.department === selectedDept);
  };

  const getTotalVacancies = () => {
    return DEPARTMENT_INFO.reduce((acc, dept) => {
      return acc + dept.positions.reduce((posAcc, pos) => posAcc + pos.vacant, 0);
    }, 0);
  };

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
            {getTotalVacancies() > 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockDepartmentStats.map((stat, index) => {
                const deptInfo = DEPARTMENTS[stat.department];
                const fullDeptInfo = DEPARTMENT_INFO.find(d => d.department === stat.department);
                const totalVacant = fullDeptInfo?.positions.reduce((acc, p) => acc + p.vacant, 0) || 0;
                
                return (
                  <motion.div
                    key={stat.department}
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
                              <p className="text-sm text-muted-foreground">{stat.totalEmployees} empleados</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDept(stat.department)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {fullDeptInfo && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {fullDeptInfo.description}
                            </p>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Tasa de asistencia</span>
                              <span className="font-bold" style={{ color: deptInfo.color }}>
                                {stat.attendanceRate}%
                              </span>
                            </div>
                            <Progress value={stat.attendanceRate} className="h-2" />
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-2.5 rounded-lg bg-success/10">
                              <p className="text-xs text-muted-foreground">Presentes</p>
                              <p className="text-lg font-bold text-success">{stat.presentToday}</p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-destructive/10">
                              <p className="text-xs text-muted-foreground">Ausentes</p>
                              <p className="text-lg font-bold text-destructive">{stat.absences}</p>
                            </div>
                          </div>

                          {totalVacant > 0 && (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10">
                              <Briefcase className="w-4 h-4 text-warning" />
                              <span className="text-sm text-warning font-medium">
                                {totalVacant} vacante{totalVacant > 1 ? 's' : ''} disponible{totalVacant > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}

                          {fullDeptInfo && (
                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground mb-1.5">Puestos en el área:</p>
                              <div className="flex flex-wrap gap-1">
                                {fullDeptInfo.positions.slice(0, 3).map(pos => (
                                  <Badge 
                                    key={pos.positionId} 
                                    variant="outline" 
                                    className="text-xs"
                                    style={{ borderColor: `${deptInfo.color}40` }}
                                  >
                                    {pos.position.name}
                                  </Badge>
                                ))}
                                {fullDeptInfo.positions.length > 3 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{fullDeptInfo.positions.length - 3} más
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
          </TabsContent>

          <TabsContent value="organigrama" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Organigrama General - {COMPANY_ORG_CHART.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CompanyOrgChart 
                  rootNode={COMPANY_ORG_CHART.ceo} 
                  title="Estructura Organizacional"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Department Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
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
            {selectedDept && getSelectedDeptInfo() && (
              <DepartmentDetail 
                department={getSelectedDeptInfo()!}
                employees={getDeptEmployees(selectedDept)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
