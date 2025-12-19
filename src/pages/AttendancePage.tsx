import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Clock, Calendar, Filter, Download, LayoutGrid, List } from 'lucide-react';
import { mockAttendanceRecords, mockEmployees } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendanceCalendar } from '@/components/attendance/AttendanceCalendar';

const AttendancePage = () => {
  const [selectedDept, setSelectedDept] = useState('all');
  
  const records = mockAttendanceRecords.slice(0, 50).map(record => {
    const employee = mockEmployees.find(e => e.id === record.employeeId);
    return { ...record, employee };
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      validated: 'bg-success/10 text-success',
      pending: 'bg-warning/10 text-warning',
      rejected: 'bg-destructive/10 text-destructive',
      justified: 'bg-primary/10 text-primary',
    };
    const labels = {
      validated: 'Validado',
      pending: 'Pendiente',
      rejected: 'Rechazado',
      justified: 'Justificado',
    };
    return (
      <Badge className={styles[status as keyof typeof styles]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

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
                      <SelectItem value="comercial">Comercial</SelectItem>
                      <SelectItem value="ti">TI</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="soporte">Soporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
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
                      {records.map((record, index) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-muted/30"
                        >
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.employee?.name}</p>
                              <p className="text-xs text-muted-foreground">{record.employee?.position}</p>
                            </div>
                          </TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            <span className={record.workedHours < 8 ? 'text-destructive' : ''}>
                              {Math.round(record.workedHours * 10) / 10}h
                            </span>
                          </TableCell>
                          <TableCell>
                            {record.tardyMinutes > 0 ? (
                              <span className="text-warning">{record.tardyMinutes} min</span>
                            ) : (
                              <span className="text-success">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record.overtimeWeekday > 0 ? (
                              <span className="text-primary">{Math.round(record.overtimeWeekday * 10) / 10}h</span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </motion.tr>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AttendancePage;
