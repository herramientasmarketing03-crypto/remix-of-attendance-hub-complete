import { motion } from 'framer-motion';
import { Users, Clock, Timer, TrendingUp, MessageSquare } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockDepartmentStats, mockEmployees, mockAttendanceRecords } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function JefeDashboard() {
  const navigate = useNavigate();
  
  // Mock: assume jefe is from TI department
  const deptStats = mockDepartmentStats.find(s => s.department === 'ti')!;
  const deptEmployees = mockEmployees.filter(e => e.department === 'ti');

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Mi Departamento - TI</h1>
        <p className="text-muted-foreground">Gestiona la asistencia de tu equipo</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Empleados"
          value={deptStats.totalEmployees}
          icon={Users}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Presentes Hoy"
          value={deptStats.presentToday}
          icon={Users}
          variant="success"
          delay={0.15}
        />
        <StatCard
          title="Tardanzas"
          value={deptStats.tardies}
          icon={Clock}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="% Asistencia"
          value={`${deptStats.attendanceRate}%`}
          icon={TrendingUp}
          variant="success"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Mi Equipo</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/employees')}>
              Ver todos
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {deptEmployees.slice(0, 5).map((employee, index) => (
                <motion.div
                  key={employee.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.position}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-success/10 text-success">
                    Presente
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/attendance')}>
              <Clock className="w-4 h-4 mr-2" />
              Ver asistencia del equipo
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/messages')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar justificación
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/requirements')}>
              <Users className="w-4 h-4 mr-2" />
              Solicitar nuevo personal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
