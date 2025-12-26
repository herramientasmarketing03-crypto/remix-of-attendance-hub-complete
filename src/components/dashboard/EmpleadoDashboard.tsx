import { motion } from 'framer-motion';
import { Clock, Calendar, Timer, FileText, TrendingUp, Wallet, CalendarDays, Award, Loader2 } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendance } from '@/hooks/useAttendance';

export function EmpleadoDashboard() {
  const navigate = useNavigate();
  const { userRole, profile } = useAuth();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { records: attendanceRecords, loading: loadingAttendance } = useAttendance();
  
  const loading = loadingEmployees || loadingAttendance;
  
  // Get the linked employee based on userRole.employeeId
  const employeeId = userRole?.employeeId;
  const employee = employees.find(e => e.id === employeeId) || employees[0];
  
  // Get attendance records for this employee
  const myRecords = attendanceRecords.filter(r => r.employee_id === employee?.id);
  
  const totalWorkedHours = myRecords.reduce((acc, r) => acc + Number(r.worked_hours || 0), 0);
  const totalTardies = myRecords.reduce((acc, r) => acc + (r.tardy_count || 0), 0);
  const totalTardyMinutes = myRecords.reduce((acc, r) => acc + (r.tardy_minutes || 0), 0);
  const totalAbsences = myRecords.reduce((acc, r) => acc + (r.absences || 0), 0);
  const avgAttendance = myRecords.length > 0 
    ? Math.round((myRecords.filter(r => r.days_attended > 0).length / myRecords.length) * 100)
    : 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayName = employee?.name?.split(' ')[0] || profile?.nombres || 'Usuario';

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Hola, {displayName}</h1>
        <p className="text-muted-foreground">Revisa tu registro de asistencia y boletas</p>
      </motion.div>

      {/* Profile Card */}
      {employee && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="glass-card overflow-hidden">
            <div className="gradient-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{employee.name}</h3>
                  <p className="text-sm opacity-90">{employee.position}</p>
                  <Badge variant="secondary" className="mt-1 bg-white/20 text-white border-none">
                    {employee.department.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Horas Trabajadas"
          value={`${Math.round(totalWorkedHours)}h`}
          subtitle="Este mes"
          icon={Timer}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Tardanzas"
          value={totalTardies}
          subtitle={`${totalTardyMinutes} min total`}
          icon={Clock}
          variant={totalTardies > 0 ? "warning" : "success"}
          delay={0.15}
        />
        <StatCard
          title="Ausencias"
          value={totalAbsences}
          subtitle="Este mes"
          icon={Calendar}
          variant={totalAbsences > 0 ? "destructive" : "success"}
          delay={0.2}
        />
        <StatCard
          title="% Asistencia"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          variant="success"
          delay={0.25}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Registro Reciente
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/attendance')}>
              Ver todo
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myRecords.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No hay registros de asistencia</p>
              ) : (
                myRecords.slice(0, 5).map((record, index) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{record.date}</p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(Number(record.worked_hours))}h trabajadas
                        {record.tardy_minutes > 0 && ` · ${record.tardy_minutes} min tarde`}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={
                        record.absences > 0 ? "bg-destructive/10 text-destructive" : 
                        record.tardy_count > 0 ? "bg-warning/10 text-warning" :
                        "bg-success/10 text-success"
                      }
                    >
                      {record.absences > 0 ? 'Ausencia' : record.tardy_count > 0 ? 'Tardanza' : 'Presente'}
                    </Badge>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Acciones Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/payroll')}>
              <Wallet className="w-4 h-4 mr-2" />
              Ver mis boletas de pago
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/leave-requests')}>
              <CalendarDays className="w-4 h-4 mr-2" />
              Solicitar permiso/vacaciones
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/performance')}>
              <Award className="w-4 h-4 mr-2" />
              Ver mi evaluación
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/regulations')}>
              <FileText className="w-4 h-4 mr-2" />
              Consultar reglamento
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
