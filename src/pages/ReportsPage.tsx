import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileSpreadsheet, Calendar, Users, Clock, TrendingUp, PieChart, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { mockEmployees, mockAttendanceRecords } from '@/data/mockData';
import { DEPARTMENTS } from '@/types/attendance';
import { exportToExcel, exportToPDF, AttendanceReportRow, PayrollReportRow } from '@/services/exportService';

const reportTypes = [
  { id: 'attendance', name: 'Reporte de Asistencia', description: 'Resumen de asistencia por departamento', icon: Clock },
  { id: 'tardies', name: 'Reporte de Tardanzas', description: 'Análisis de tardanzas y minutos perdidos', icon: Clock },
  { id: 'overtime', name: 'Reporte de Horas Extra', description: 'Horas extra trabajadas por empleado', icon: TrendingUp },
  { id: 'absences', name: 'Reporte de Ausencias', description: 'Faltas justificadas e injustificadas', icon: Users },
  { id: 'department', name: 'Reporte por Departamento', description: 'Estadísticas agrupadas por área', icon: PieChart },
  { id: 'payroll', name: 'Reporte de Planilla', description: 'Resumen para cálculo de nómina', icon: FileSpreadsheet },
];

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('mes');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('attendance');
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate real data from mock records
  const generateAttendanceData = (): AttendanceReportRow[] => {
    const employeeStats = mockEmployees.map(emp => {
      const records = mockAttendanceRecords.filter(r => r.employeeId === emp.id);
      const totalDays = records.filter(r => r.daysAttended > 0).length;
      const totalTardies = records.reduce((sum, r) => sum + r.tardyCount, 0);
      const totalTardyMinutes = records.reduce((sum, r) => sum + r.tardyMinutes, 0);
      const totalAbsences = records.reduce((sum, r) => sum + r.absences, 0);
      const totalOvertime = records.reduce((sum, r) => sum + r.overtimeWeekday + r.overtimeHoliday, 0);

      return {
        empleado: emp.name,
        departamento: DEPARTMENTS[emp.department]?.name || emp.department,
        diasTrabajados: totalDays,
        tardanzas: totalTardies,
        minutosTardanza: totalTardyMinutes,
        ausencias: totalAbsences,
        horasExtra: Math.round(totalOvertime * 10) / 10,
      };
    });

    // Filter by department if specified
    if (selectedDepartment !== 'all') {
      return employeeStats.filter(e => 
        e.departamento === DEPARTMENTS[selectedDepartment]?.name
      );
    }

    return employeeStats;
  };

  const generatePayrollData = (): PayrollReportRow[] => {
    return mockEmployees.map(emp => {
      const records = mockAttendanceRecords.filter(r => r.employeeId === emp.id);
      const totalTardyMinutes = records.reduce((sum, r) => sum + r.tardyMinutes, 0);
      const baseSalary = 4500;
      const hourlyRate = baseSalary / 240;
      const deduction = (totalTardyMinutes / 60) * hourlyRate;
      
      return {
        empleado: emp.name,
        cargo: emp.position,
        sueldoBruto: baseSalary,
        descuentos: Math.round(deduction * 100) / 100,
        sueldoNeto: Math.round((baseSalary - deduction) * 100) / 100,
        tardanzas: totalTardyMinutes,
      };
    });
  };

  const handleDownload = (reportId: string, format: 'excel' | 'pdf' = 'excel') => {
    setIsGenerating(true);
    const periodLabel = selectedPeriod === 'mes' ? 'diciembre-2024' : selectedPeriod;
    
    try {
      if (reportId === 'attendance' || reportId === 'tardies' || reportId === 'absences' || reportId === 'department') {
        const data = generateAttendanceData();
        const fileName = `reporte-asistencia-${periodLabel}`;
        
        if (format === 'excel') {
          exportToExcel(data, fileName, 'Asistencia');
        } else {
          exportToPDF(data, fileName, `Reporte de Asistencia - ${periodLabel}`, [
            { header: 'Empleado', dataKey: 'empleado' },
            { header: 'Departamento', dataKey: 'departamento' },
            { header: 'Días Trabajados', dataKey: 'diasTrabajados' },
            { header: 'Tardanzas', dataKey: 'tardanzas' },
            { header: 'Min. Tardanza', dataKey: 'minutosTardanza' },
            { header: 'Ausencias', dataKey: 'ausencias' },
            { header: 'Horas Extra', dataKey: 'horasExtra' },
          ]);
        }
        toast.success(`Reporte descargado: ${fileName}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      } else if (reportId === 'payroll' || reportId === 'overtime') {
        const data = generatePayrollData();
        const fileName = `reporte-nomina-${periodLabel}`;
        
        if (format === 'excel') {
          exportToExcel(data, fileName, 'Nómina');
        } else {
          exportToPDF(data, fileName, `Reporte de Nómina - ${periodLabel}`, [
            { header: 'Empleado', dataKey: 'empleado' },
            { header: 'Cargo', dataKey: 'cargo' },
            { header: 'Sueldo Bruto', dataKey: 'sueldoBruto' },
            { header: 'Descuentos', dataKey: 'descuentos' },
            { header: 'Sueldo Neto', dataKey: 'sueldoNeto' },
            { header: 'Min. Tardanza', dataKey: 'tardanzas' },
          ]);
        }
        toast.success(`Reporte descargado: ${fileName}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      }
    } catch (error) {
      toast.error('Error al generar el reporte');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomReport = (format: 'excel' | 'pdf') => {
    handleDownload(selectedReportType, format);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-muted-foreground">Genera y descarga reportes del sistema</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="anio">Este Año</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover:shadow-lg transition-all h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <report.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex gap-1">
                      <Badge variant="secondary">Excel</Badge>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg mt-3">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleDownload(report.id, 'excel')}
                      disabled={isGenerating}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Excel
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1" 
                      onClick={() => handleDownload(report.id, 'pdf')}
                      disabled={isGenerating}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Reportes Personalizados
            </CardTitle>
            <CardDescription>Genera reportes con filtros específicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                    <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger><SelectValue placeholder="Tipo de Reporte" /></SelectTrigger>
                <SelectContent>
                  {reportTypes.map(rt => (
                    <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Fecha Inicio" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="01-12">01 Dic 2024</SelectItem>
                  <SelectItem value="01-11">01 Nov 2024</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Fecha Fin" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="31-12">31 Dic 2024</SelectItem>
                  <SelectItem value="30-11">30 Nov 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="gradient-primary" onClick={() => handleCustomReport('excel')} disabled={isGenerating}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Generar Excel
              </Button>
              <Button variant="outline" onClick={() => handleCustomReport('pdf')} disabled={isGenerating}>
                <FileText className="w-4 h-4 mr-2" />
                Generar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
