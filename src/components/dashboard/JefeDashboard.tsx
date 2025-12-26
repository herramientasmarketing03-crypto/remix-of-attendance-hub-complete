import { motion } from 'framer-motion';
import { Users, Clock, TrendingUp, MessageSquare, AlertTriangle, Gavel, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';
import { DEPARTMENTS, Department } from '@/types/attendance';

export function JefeDashboard() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { records: attendanceRecords, loading: loadingAttendance } = useAttendance();
  
  const loading = loadingEmployees || loadingAttendance;
  
  // Dynamic area based on user's area_id
  const areaId = (userRole?.area_id || 'ti') as Department;
  const areaName = DEPARTMENTS[areaId]?.name || 'Mi Departamento';
  
  // Filter employees by department
  const deptEmployees = employees.filter(e => e.department === areaId && e.status === 'active');
  
  // Get today's records for the department
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendanceRecords.filter(
    r => deptEmployees.some(e => e.id === r.employee_id) && r.date === today
  );
  
  const presentCount = todayRecords.filter(r => r.days_attended > 0).length;
  const tardiesCount = todayRecords.filter(r => r.tardy_count > 0).length;
  const totalTardies = todayRecords.reduce((acc, r) => acc + r.tardy_count, 0);
  const attendanceRate = deptEmployees.length > 0 
    ? Math.round((presentCount / deptEmployees.length) * 100) 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (deptEmployees.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No hay empleados en tu departamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Mi Departamento - {areaName}</h1>
        <p className="text-muted-foreground">Gestiona la asistencia de tu equipo</p>
      </motion.div>

      {/* Tardies alert for today */}
      {tardiesCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tardiesCount} empleado(s) con tardanza hoy</p>
                  <p className="text-sm text-muted-foreground">Revisa los registros de asistencia</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/attendance')}>
                  Ver detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Empleados"
          value={deptEmployees.length}
          icon={Users}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Presentes Hoy"
          value={presentCount}
          icon={Users}
          variant="success"
          delay={0.15}
        />
        <StatCard
          title="Tardanzas"
          value={totalTardies}
          icon={Clock}
          variant="warning"
          delay={0.2}
        />
        <StatCard
          title="% Asistencia"
          value={`${attendanceRate}%`}
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
              {deptEmployees.slice(0, 5).map((employee, index) => {
                const empRecord = todayRecords.find(r => r.employee_id === employee.id);
                const isPresent = empRecord && empRecord.days_attended > 0;
                const hasTardy = empRecord && empRecord.tardy_count > 0;
                
                return (
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
                          {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className={
                      hasTardy ? 'bg-warning/10 text-warning' :
                      isPresent ? 'bg-success/10 text-success' :
                      'bg-muted text-muted-foreground'
                    }>
                      {hasTardy ? 'Tardanza' : isPresent ? 'Presente' : 'Sin registro'}
                    </Badge>
                  </motion.div>
                );
              })}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/justifications')}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Revisar justificaciones
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/sanctions')}>
              <Gavel className="w-4 h-4 mr-2" />
              Solicitar sanción
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
