import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { BarChart3, Download, FileSpreadsheet, Calendar, Users, Clock, TrendingUp, PieChart } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { toast } from 'sonner';

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

  const handleDownload = (reportName: string) => {
    toast.success(`Generando ${reportName}...`);
    setTimeout(() => toast.success('Reporte descargado'), 1500);
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
                    <Badge variant="secondary">Excel</Badge>
                  </div>
                  <CardTitle className="text-lg mt-3">{report.name}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" onClick={() => handleDownload(report.name)}>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
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
              <Select>
                <SelectTrigger><SelectValue placeholder="Departamento" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ti">TI</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger><SelectValue placeholder="Tipo de Reporte" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">Asistencia</SelectItem>
                  <SelectItem value="tardies">Tardanzas</SelectItem>
                  <SelectItem value="overtime">Horas Extra</SelectItem>
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
            <Button className="gradient-primary">
              <Download className="w-4 h-4 mr-2" />
              Generar Reporte Personalizado
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
