import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle, Clock, Coffee } from 'lucide-react';
import { DEPARTMENTS } from '@/types/attendance';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AttendanceRecord } from '@/hooks/useAttendance';

interface Employee {
  id: string;
  name: string;
  department: string;
  position?: string | null;
}

interface AttendanceCalendarProps {
  employeeId?: string;
  records?: AttendanceRecord[];
  employees?: Employee[];
}

export function AttendanceCalendar({ employeeId, records = [], employees = [] }: AttendanceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDept, setSelectedDept] = useState('all');

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const recordsByDate = useMemo(() => {
    const map: Record<string, { present: number; absent: number; tardy: number; total: number; breakMinutes: number }> = {};
    
    const filteredRecords = records.filter(record => {
      if (employeeId && record.employee_id !== employeeId) return false;
      const employee = employees.find(e => e.id === record.employee_id);
      if (selectedDept !== 'all' && employee?.department !== selectedDept) return false;
      return true;
    });

    filteredRecords.forEach(record => {
      if (!map[record.date]) {
        map[record.date] = { present: 0, absent: 0, tardy: 0, total: 0, breakMinutes: 0 };
      }
      map[record.date].total++;
      if (record.days_attended > 0) {
        map[record.date].present++;
        if (record.tardy_minutes > 0) {
          map[record.date].tardy++;
        }
      } else if (record.absences > 0) {
        map[record.date].absent++;
      }
      // Track break minutes
      if (record.break_minutes) {
        map[record.date].breakMinutes += record.break_minutes;
      }
    });

    return map;
  }, [employeeId, selectedDept, records, employees]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = recordsByDate[dateStr];
    
    if (!record || record.total === 0) return 'empty';
    
    const attendanceRate = (record.present / record.total) * 100;
    if (attendanceRate >= 90) return 'excellent';
    if (attendanceRate >= 70) return 'good';
    if (attendanceRate >= 50) return 'warning';
    return 'critical';
  };

  const getDayStyles = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-success/20 border-success/30 text-success';
      case 'good':
        return 'bg-primary/20 border-primary/30 text-primary';
      case 'warning':
        return 'bg-warning/20 border-warning/30 text-warning';
      case 'critical':
        return 'bg-destructive/20 border-destructive/30 text-destructive';
      default:
        return 'bg-muted/30 border-muted text-muted-foreground';
    }
  };

  const startPadding = getDay(startOfMonth(currentMonth));
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const workDays = days.filter(d => getDay(d) !== 0 && getDay(d) !== 6).length;
    const totalPresent = Object.values(recordsByDate).reduce((sum, r) => sum + r.present, 0);
    const totalRecords = Object.values(recordsByDate).reduce((sum, r) => sum + r.total, 0);
    const avgAttendance = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
    const totalTardies = Object.values(recordsByDate).reduce((sum, r) => sum + r.tardy, 0);
    const totalAbsences = Object.values(recordsByDate).reduce((sum, r) => sum + r.absent, 0);

    return { workDays, avgAttendance, totalTardies, totalAbsences };
  }, [days, recordsByDate]);

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Calendario de Asistencia
          </CardTitle>
          <div className="flex items-center gap-2">
            {!employeeId && (
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Departamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(DEPARTMENTS).map(([key, dept]) => (
                    <SelectItem key={key} value={key}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 font-medium capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-success/30 border border-success/50" />
            <span className="text-muted-foreground">Excelente (90%+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/30 border border-primary/50" />
            <span className="text-muted-foreground">Bueno (70-89%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-warning/30 border border-warning/50" />
            <span className="text-muted-foreground">Regular (50-69%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-destructive/30 border border-destructive/50" />
            <span className="text-muted-foreground">Crítico (&lt;50%)</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}

          {/* Empty cells for padding */}
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map((day, index) => {
            const status = getDayStatus(day);
            const dateStr = format(day, 'yyyy-MM-dd');
            const record = recordsByDate[dateStr];
            const isWeekend = getDay(day) === 0 || getDay(day) === 6;

            return (
              <motion.div
                key={dateStr}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  aspect-square rounded-lg border p-1 cursor-pointer transition-all hover:scale-105
                  ${isToday(day) ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isWeekend ? 'opacity-50' : ''}
                  ${getDayStyles(status)}
                `}
              >
                <div className="h-full flex flex-col">
                  <span className="text-xs font-medium">{format(day, 'd')}</span>
                  {record && record.total > 0 && !isWeekend && (
                    <div className="flex-1 flex items-end justify-center gap-0.5 pb-0.5">
                      {record.present > 0 && (
                        <CheckCircle className="w-3 h-3 text-success" />
                      )}
                      {record.absent > 0 && (
                        <XCircle className="w-3 h-3 text-destructive" />
                      )}
                      {record.tardy > 0 && (
                        <Clock className="w-3 h-3 text-warning" />
                      )}
                      {record.breakMinutes > 0 && (
                        <Coffee className="w-3 h-3 text-info" />
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t">
          {[
            { label: 'Días Laborables', value: monthlyStats.workDays, icon: Calendar, color: 'text-primary' },
            { label: 'Asistencia Promedio', value: `${monthlyStats.avgAttendance}%`, icon: CheckCircle, color: 'text-success' },
            { label: 'Tardanzas', value: monthlyStats.totalTardies, icon: Clock, color: 'text-warning' },
            { label: 'Ausencias', value: monthlyStats.totalAbsences, icon: XCircle, color: 'text-destructive' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
