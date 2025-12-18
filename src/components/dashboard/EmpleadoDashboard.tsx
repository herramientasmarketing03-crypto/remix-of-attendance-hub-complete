import { motion } from 'framer-motion';
import { Clock, Calendar, Timer, FileText, TrendingUp, Wallet } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { mockAttendanceRecords, mockEmployees } from '@/data/mockData';

export function EmpleadoDashboard() {
  const navigate = useNavigate();
  
  // Mock current employee data
  const employee = mockEmployees[0];
  const myRecords = mockAttendanceRecords.filter(r => r.employeeId === employee.id).slice(0, 10);
  
  const totalWorkedHours = myRecords.reduce((acc, r) => acc + r.workedHours, 0);
  const totalTardies = myRecords.reduce((acc, r) => acc + r.tardyCount, 0);
  const totalAbsences = myRecords.reduce((acc, r) => acc + r.absences, 0);
  const avgAttendance = myRecords.length > 0 
    ? Math.round((myRecords.filter(r => r.daysAttended > 0).length / myRecords.length) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold">Mi Asistencia</h1>
        <p className="text-muted-foreground">Revisa tu registro de asistencia y boletas</p>
      </motion.div>

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
          subtitle="Este mes"
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
              {myRecords.slice(0, 5).map((record, index) => (
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
                      {Math.round(record.workedHours)}h trabajadas
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={record.absences > 0 ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}
                  >
                    {record.absences > 0 ? 'Ausencia' : 'Presente'}
                  </Badge>
                </motion.div>
              ))}
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
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/attendance')}>
              <Clock className="w-4 h-4 mr-2" />
              Ver mi asistencia completa
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
