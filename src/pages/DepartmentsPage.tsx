import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Building2, Users, TrendingUp, Settings } from 'lucide-react';
import { mockDepartmentStats } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';

const DepartmentsPage = () => {
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
                      <Button variant="ghost" size="icon">
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
      </div>
    </MainLayout>
  );
};

export default DepartmentsPage;
