import { motion } from 'framer-motion';
import { Users, UserX, Clock, Timer, TrendingUp, AlertTriangle, FileText, MessageSquare, FileCheck } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DepartmentOverview } from '@/components/dashboard/DepartmentOverview';
import { RecentUploads } from '@/components/dashboard/RecentUploads';
import { AttendanceCharts } from '@/components/dashboard/AttendanceCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDepartmentStats, mockUploadedReports, mockContracts, mockEmployees } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { getContractAlerts, groupAlertsByLevel } from '@/services/contractAlerts';

export function AdminDashboard() {
  const navigate = useNavigate();

  const totalEmployees = mockDepartmentStats.reduce((acc, stat) => acc + stat.totalEmployees, 0);
  const presentToday = mockDepartmentStats.reduce((acc, stat) => acc + stat.presentToday, 0);
  const totalAbsences = mockDepartmentStats.reduce((acc, stat) => acc + stat.absences, 0);
  const totalTardies = mockDepartmentStats.reduce((acc, stat) => acc + stat.tardies, 0);
  const totalOvertime = mockDepartmentStats.reduce((acc, stat) => acc + stat.overtimeHours, 0);
  const avgAttendance = Math.round(mockDepartmentStats.reduce((acc, stat) => acc + stat.attendanceRate, 0) / mockDepartmentStats.length);

  // Contract alerts calculation
  const contractAlerts = getContractAlerts(mockContracts);
  const alertsByLevel = groupAlertsByLevel(contractAlerts);
  const criticalCount = alertsByLevel.critical.length;
  const warningCount = alertsByLevel.warning.length;
  const infoCount = alertsByLevel.info.length;
  const totalExpiringContracts = criticalCount + warningCount + infoCount;

  const alerts = [
    ...(criticalCount > 0 ? [{ type: 'error', icon: FileCheck, message: `${criticalCount} contratos vencen en 7 días o menos`, action: '/contracts' }] : []),
    ...(warningCount > 0 ? [{ type: 'warning', icon: FileCheck, message: `${warningCount} contratos vencen en 15 días`, action: '/contracts' }] : []),
    { type: 'warning', icon: Clock, message: `${totalTardies} tardanzas de hoy sin justificar`, action: '/attendance' },
    { type: 'info', icon: MessageSquare, message: '5 justificaciones pendientes de revisar', action: '/justifications' },
  ].filter(a => a.message);

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

      {/* Contract Alerts Card */}
      {totalExpiringContracts > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                Contratos por Vencer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {criticalCount > 0 && (
                  <Badge variant="destructive" className="text-sm py-1 px-3 cursor-pointer" onClick={() => navigate('/contracts')}>
                    🔴 {criticalCount} críticos (≤7 días)
                  </Badge>
                )}
                {warningCount > 0 && (
                  <Badge variant="warning" className="text-sm py-1 px-3 cursor-pointer" onClick={() => navigate('/contracts')}>
                    🟠 {warningCount} próximos (≤15 días)
                  </Badge>
                )}
                {infoCount > 0 && (
                  <Badge variant="secondary" className="text-sm py-1 px-3 cursor-pointer" onClick={() => navigate('/contracts')}>
                    🟡 {infoCount} aviso (≤30 días)
                  </Badge>
                )}
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {contractAlerts.slice(0, 3).map(alert => {
                  const employee = mockEmployees.find(e => e.id === alert.contract.employeeId);
                  return (
                    <div key={alert.contract.id} className="flex items-center gap-2">
                      <span>•</span>
                      <span>{employee?.name}: {alert.message}</span>
                    </div>
                  );
                })}
                {contractAlerts.length > 3 && (
                  <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/contracts')}>
                    Ver todos ({contractAlerts.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
