import { motion } from 'framer-motion';
import { Users, UserX, Clock, Timer, TrendingUp, Calendar, AlertTriangle, FileText, MessageSquare } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentOverview } from '@/components/dashboard/DepartmentOverview';
import { RecentUploads } from '@/components/dashboard/RecentUploads';
import { AttendanceCharts } from '@/components/dashboard/AttendanceCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDepartmentStats, mockUploadedReports } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function AdminDashboard() {
  const navigate = useNavigate();

  const totalEmployees = mockDepartmentStats.reduce((acc, stat) => acc + stat.totalEmployees, 0);
  const presentToday = mockDepartmentStats.reduce((acc, stat) => acc + stat.presentToday, 0);
  const totalAbsences = mockDepartmentStats.reduce((acc, stat) => acc + stat.absences, 0);
  const totalTardies = mockDepartmentStats.reduce((acc, stat) => acc + stat.tardies, 0);
  const totalOvertime = mockDepartmentStats.reduce((acc, stat) => acc + stat.overtimeHours, 0);
  const avgAttendance = Math.round(mockDepartmentStats.reduce((acc, stat) => acc + stat.attendanceRate, 0) / mockDepartmentStats.length);

  const alerts = [
    { type: 'error', icon: FileText, message: '3 contratos vencen en 7 días', action: '/contracts' },
    { type: 'warning', icon: Clock, message: '8 tardanzas de hoy sin justificar', action: '/attendance' },
    { type: 'info', icon: MessageSquare, message: '5 justificaciones pendientes de revisar', action: '/messages' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido al panel de administración de RRHH</p>
        </div>
        <Button onClick={() => navigate('/upload')} className="gradient-primary text-white">
          Cargar Reporte
        </Button>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-warning/10">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-2">Alertas pendientes</h3>
                  <div className="flex flex-wrap gap-3">
                    {alerts.map((alert, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(alert.action)}
                        className="h-auto py-2"
                      >
                        <alert.icon className="w-4 h-4 mr-2" />
                        {alert.message}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Empleados"
          value={totalEmployees}
          icon={Users}
          variant="primary"
          delay={0.1}
        />
        <StatCard
          title="Presentes Hoy"
          value={presentToday}
          icon={Users}
          variant="success"
          trend={{ value: 2, isPositive: true }}
          delay={0.15}
        />
        <StatCard
          title="Ausencias"
          value={totalAbsences}
          icon={UserX}
          variant="destructive"
          delay={0.2}
        />
        <StatCard
          title="Tardanzas"
          value={totalTardies}
          icon={Clock}
          variant="warning"
          delay={0.25}
        />
        <StatCard
          title="Horas Extra"
          value={`${totalOvertime}h`}
          icon={Timer}
          variant="primary"
          delay={0.3}
        />
        <StatCard
          title="% Asistencia"
          value={`${avgAttendance}%`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 1.5, isPositive: true }}
          delay={0.35}
        />
      </div>

      {/* Charts & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceCharts />
        </div>
        <div className="space-y-6">
          <DepartmentOverview stats={mockDepartmentStats} />
          <RecentUploads reports={mockUploadedReports} />
        </div>
      </div>
    </div>
  );
}
