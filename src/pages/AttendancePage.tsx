import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, Filter, Download, LayoutGrid, List, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';
import { useAttendance } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { DEPARTMENTS } from '@/types/attendance';

const AttendancePage = () => {
  const [selectedDept, setSelectedDept] = useState('all');
  const { records, loading: loadingRecords } = useAttendance();
  const { employees, loading: loadingEmployees } = useEmployees();

  const loading = loadingRecords || loadingEmployees;

  const filteredRecords = records
    .filter(record => {
      if (selectedDept === 'all') return true;
      const employee = employees.find(e => e.id === record.employee_id);
      return employee?.department === selectedDept;
    })
    .slice(0, 50)
    .map(record => {
      const employee = employees.find(e => e.id === record.employee_id);
      return { ...record, employee };
    });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      validated: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
      justified: 'bg-primary/10 text-primary',
    };
    const labels: Record<string, string> = {
      validated: 'Validado',
      pending: 'Pendiente',
      rejected: 'Rechazado',
      justified: 'Justificado',
    };
    return (
      <Badge className={styles[status] || 'bg-muted text-muted-foreground'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold">Control de Asistencia</h1>
            <p className="text-muted-foreground">Registro detallado de asistencia del personal</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </motion.div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <AttendanceCalendar />
          </TabsContent>

          <TabsContent value="list">
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Registros de Asistencia
                  </CardTitle>
                  <Select value={selectedDept} onValueChange={setSelectedDept}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                        <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay registros de asistencia
                  </div>
                ) : (
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Empleado</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Horas</TableHead>
                          <TableHead>Tardanza</TableHead>
                          <TableHead>H. Extra</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecords.map((record, index) => (
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-muted/30"
                          >
                            <TableCell>
                              <div>
                                <p className="font-medium">{record.employee?.name || 'Desconocido'}</p>
                                <p className="text-xs text-muted-foreground">{record.employee?.position}</p>
                              </div>
                            </TableCell>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>
                              <span className={Number(record.worked_hours) < 8 ? 'text-destructive' : ''}>
                                {Math.round(Number(record.worked_hours) * 10) / 10}h
                              </span>
                            </TableCell>
                            <TableCell>
                              {record.tardy_minutes > 0 ? (
                                <span className="text-warning">{record.tardy_minutes} min</span>
                              ) : (
                                <span className="text-success">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {Number(record.overtime_weekday) > 0 ? (
                                <span className="text-primary">{Math.round(Number(record.overtime_weekday) * 10) / 10}h</span>
                              ) : '-'}
                            </TableCell>
                            <TableCell>{getStatusBadge(record.status)}</TableCell>
                          </motion.tr>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AttendancePage;
