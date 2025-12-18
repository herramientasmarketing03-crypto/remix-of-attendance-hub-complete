import { motion } from 'framer-motion';
import { DEPARTMENTS, Department } from '@/types/attendance';
import { DepartmentStats } from '@/types/attendance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, UserCheck, UserX, Clock, Timer } from 'lucide-react';

interface DepartmentOverviewProps {
  stats: DepartmentStats[];
}

export function DepartmentOverview({ stats }: DepartmentOverviewProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Resumen por Departamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const deptInfo = DEPARTMENTS[stat.department];
            return (
              <motion.div
                key={stat.department}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: deptInfo.color }}
                    />
                    <span className="font-medium">{deptInfo.name}</span>
                  </div>
                  <Badge variant="outline" className="font-medium">
                    {stat.attendanceRate}% asistencia
                  </Badge>
                </div>
                
                <Progress value={stat.attendanceRate} className="h-2 mb-3" />
                
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-medium">{stat.totalEmployees}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-success" />
                    <span className="text-muted-foreground">Presentes:</span>
                    <span className="font-medium text-success">{stat.presentToday}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-destructive" />
                    <span className="text-muted-foreground">Ausentes:</span>
                    <span className="font-medium text-destructive">{stat.absences}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-warning" />
                    <span className="text-muted-foreground">Tardanzas:</span>
                    <span className="font-medium text-warning">{stat.tardies}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
